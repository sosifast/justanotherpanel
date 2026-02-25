import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { createNotification } from '@/lib/notifications';
import { createAdminNotification } from '@/lib/admin-notifications';
import { triggerPusher } from '@/lib/pusher';

// Helper function to verify Cryptomus webhook signature
function verifyCryptomusSignature(payload: any, signature: string, paymentKey: string): boolean {
    const jsonPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(jsonPayload).toString('base64');
    const expectedSign = crypto.createHash('md5').update(base64Payload + paymentKey).digest('hex');
    return signature === expectedSign;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const signature = req.headers.get('sign') || '';

        // Extract data from webhook
        const { uuid, order_id, status, amount, currency } = body;

        if (!uuid || !order_id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find deposit by order_id
        const deposit = await prisma.deposits.findFirst({
            where: {
                detail_transaction: {
                    path: ['order_id'],
                    equals: order_id
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

        // Get gateway configuration for signature verification
        const details = deposit.detail_transaction as any;
        const gateway = await prisma.paymentGateway.findFirst({
            where: {
                provider: 'CRYPTOMUS',
                status: 'ACTIVE'
            }
        });

        if (!gateway) {
            return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
        }

        const config = gateway.api_config as any;

        // Verify signature
        if (!verifyCryptomusSignature(body, signature, config.paymentKey)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Determine new status
        let newStatus = deposit.status as any;
        if (['paid', 'paid_over'].includes(status)) {
            newStatus = 'PAYMENT';
        } else if (['cancel', 'system_fail', 'fail', 'refund'].includes(status)) {
            newStatus = 'CANCELED';
        } else if (['process', 'confirm_check', 'check'].includes(status)) {
            newStatus = 'PENDING';
        }

        // Update deposit and user balance if payment completed
        if (newStatus !== deposit.status) {
            await prisma.$transaction(async (tx) => {
                // Update deposit status
                await tx.deposits.update({
                    where: { id: deposit.id },
                    data: { status: newStatus }
                });

                // Update user balance if payment completed
                if (newStatus === 'PAYMENT') {
                    await tx.user.update({
                        where: { id: deposit.id_user },
                        data: {
                            balance: { increment: deposit.amount }
                        }
                    });
                }
            });

            // Notify user
            if (newStatus === 'PAYMENT') {
                await createNotification(
                    deposit.id_user,
                    'Deposit Confirmed',
                    `Your deposit of $${deposit.amount} has been confirmed and added to your balance.`,
                    'DEPOSIT',
                    deposit.id
                );
                await createAdminNotification(
                    'Deposit Confirmed',
                    `Deposit #${deposit.id} ($${deposit.amount}) by user #${deposit.id_user} has been confirmed.`,
                    'DEPOSIT_UPDATE',
                    deposit.id
                );
                // Realtime: push deposit status update to user
                await triggerPusher(`private-user-${deposit.id_user}`, 'deposit-update', {
                    depositId: deposit.id,
                    status: 'PAYMENT',
                    amount: deposit.amount
                });
            } else if (newStatus === 'CANCELED') {
                await createNotification(
                    deposit.id_user,
                    'Deposit Cancelled',
                    `Your deposit of $${deposit.amount} has been cancelled.`,
                    'DEPOSIT',
                    deposit.id
                );
            }
        }

        return NextResponse.json({ success: true, status: newStatus });

    } catch (error) {
        console.error('Cryptomus webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}