import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');
        const PayerID = searchParams.get('PayerID');
        const orderId = searchParams.get('order_id');
        const uuid = searchParams.get('uuid');

        // Handle PayPal success
        if (token) {
            // Find deposit by PayPal token/order ID
            const deposit = await prisma.deposits.findFirst({
                where: {
                    status: 'PENDING'
                }
            });

            if (deposit) {
                const details = deposit.detail_transaction as any;
                if (details?.paypal_order_id === token) {
                    return NextResponse.json({
                        success: true,
                        message: 'Payment authorized successfully',
                        deposit_id: deposit.id,
                        status: 'PENDING',
                        next_action: 'capture_payment'
                    });
                }
            }
        }

        // Handle Cryptomus success
        if (orderId || uuid) {
            const deposit = await prisma.deposits.findFirst({
                where: {
                    status: 'PENDING'
                }
            });

            if (deposit) {
                const details = deposit.detail_transaction as any;
                if ((orderId && details?.order_id === orderId) || (uuid && details?.cryptomus_uuid === uuid)) {
                    return NextResponse.json({
                        success: true,
                        message: 'Payment processed successfully',
                        deposit_id: deposit.id,
                        status: 'PENDING',
                        next_action: 'check_status'
                    });
                }
            }
        }

        return NextResponse.json({
            success: false,
            message: 'Payment not found or already processed'
        }, { status: 404 });

    } catch (error) {
        console.error('Deposit success error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}