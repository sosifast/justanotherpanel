import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const event_type = body.event_type;
        const resource = body.resource;

        // Handle PayPal webhook events
        if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const orderId = resource.invoice_id || resource.id;
            const amount = resource.amount?.value;
            const currency = resource.amount?.currency_code;

            if (!orderId) {
                return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
            }

            // Find deposit by PayPal order ID
            const deposit = await prisma.deposits.findFirst({
                where: {
                    detail_transaction: {
                        path: ['paypal_order_id'],
                        equals: orderId
                    }
                }
            });

            if (!deposit) {
                return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
            }

            // Skip if already processed
            if (deposit.status === 'PAYMENT' || deposit.status === 'CANCELED' || deposit.status === 'ERROR') {
                return NextResponse.json({ message: 'Deposit already processed' });
            }

            // Update deposit and user balance
            await prisma.$transaction(async (tx) => {
                // Update deposit status
                await tx.deposits.update({
                    where: { id: deposit.id },
                    data: { status: 'PAYMENT' }
                });

                // Update user balance
                await tx.user.update({
                    where: { id: deposit.id_user },
                    data: {
                        balance: { increment: deposit.amount }
                    }
                });
            });

            // Create notification
            await createNotification(
                deposit.id_user,
                `Deposit Successful`,
                `Your deposit of $${deposit.amount} has been confirmed via PayPal.`,
                'DEPOSIT',
                deposit.id
            );

            return NextResponse.json({ success: true, status: 'PAYMENT' });

        } else if (event_type === 'PAYMENT.CAPTURE.DENIED' || event_type === 'PAYMENT.CAPTURE.VOIDED') {
            const orderId = resource.invoice_id || resource.id;

            if (!orderId) {
                return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
            }

            // Find deposit by PayPal order ID
            const deposit = await prisma.deposits.findFirst({
                where: {
                    detail_transaction: {
                        path: ['paypal_order_id'],
                        equals: orderId
                    }
                }
            });

            if (!deposit) {
                return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
            }

            // Update deposit status to canceled
            if (deposit.status !== 'PAYMENT') {
                await prisma.deposits.update({
                    where: { id: deposit.id },
                    data: { status: 'CANCELED' }
                });

                await createNotification(
                    deposit.id_user,
                    `Deposit Failed`,
                    `Your deposit of $${deposit.amount} via PayPal was unsuccessful.`,
                    'DEPOSIT',
                    deposit.id
                );
            }

            return NextResponse.json({ success: true, status: 'CANCELED' });
        }

        return NextResponse.json({ message: 'Event not handled' });

    } catch (error) {
        console.error('PayPal webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to create notifications (simplified version)
async function createNotification(userId: number, title: string, message: string, type: string, referenceId?: number) {
    try {
        await prisma.notification.create({
            data: {
                id_user: userId,
                title,
                message,
                type: type as any,
                related_id: referenceId,
                is_read: false
            }
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}