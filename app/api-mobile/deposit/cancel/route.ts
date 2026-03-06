import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api-mobile/deposit/cancel
 * 
 * Client-side callback URL for when a user cancels a payment on the provider page.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token'); // PayPal
        const uuid = searchParams.get('uuid'); // Cryptomus
        const orderId = searchParams.get('order_id'); // Cryptomus

        const identifier = uuid || token || orderId;

        if (!identifier) {
            return NextResponse.json({ success: false, message: 'Missing payment identifier' }, { status: 400 });
        }

        const pendingDeposits = await prisma.deposits.findMany({
            where: { status: 'PENDING' },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        const deposit = pendingDeposits.find(d => {
            const details = d.detail_transaction as any;
            return (
                details?.payment_id === identifier ||
                details?.paypal_order_id === identifier ||
                details?.cryptomus_uuid === identifier ||
                details?.order_id === identifier
            );
        });

        if (!deposit) {
            return NextResponse.json({
                success: false,
                message: `Deposit not found for cancellation identifier: ${identifier}`
            }, { status: 404 });
        }

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

    } catch (error) {
        console.error('Deposit cancel error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}