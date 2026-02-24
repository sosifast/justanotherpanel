import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token'); // PayPal
        const orderId = searchParams.get('order_id'); // Cryptomus
        const uuid = searchParams.get('uuid'); // Cryptomus

        // Handle PayPal cancellation
        if (token) {
            const deposit = await prisma.deposits.findFirst({
                where: {
                    status: 'PENDING'
                }
            });

            if (deposit) {
                const details = deposit.detail_transaction as any;
                if (details?.paypal_order_id === token) {
                    // Update deposit status to canceled
                    await prisma.deposits.update({
                        where: { id: deposit.id },
                        data: { status: 'CANCELED' }
                    });

                    return NextResponse.json({
                        success: true,
                        message: 'Payment canceled successfully',
                        deposit_id: deposit.id,
                        status: 'CANCELED'
                    });
                }
            }
        }

        // Handle Cryptomus cancellation
        if (orderId || uuid) {
            const deposit = await prisma.deposits.findFirst({
                where: {
                    status: 'PENDING'
                }
            });

            if (deposit) {
                const details = deposit.detail_transaction as any;
                if ((orderId && details?.order_id === orderId) || (uuid && details?.cryptomus_uuid === uuid)) {
                    // Update deposit status to canceled
                    await prisma.deposits.update({
                        where: { id: deposit.id },
                        data: { status: 'CANCELED' }
                    });

                    return NextResponse.json({
                        success: true,
                        message: 'Payment canceled successfully',
                        deposit_id: deposit.id,
                        status: 'CANCELED'
                    });
                }
            }
        }

        return NextResponse.json({
            success: false,
            message: 'Payment not found or already processed'
        }, { status: 404 });

    } catch (error) {
        console.error('Deposit cancel error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}