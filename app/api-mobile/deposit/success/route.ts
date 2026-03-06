import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api-mobile/deposit/success
 * 
 * Client-side callback URL for when a user completes payment on the provider page.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token'); // PayPal
        const uuid = searchParams.get('uuid'); // Cryptomus
        const orderId = searchParams.get('order_id'); // Cryptomus internal

        const identifier = uuid || token || orderId;

        if (!identifier) {
            return NextResponse.json({ success: false, message: 'Missing payment identifier' }, { status: 400 });
        }

        // Search for the deposit by checking the JSON field. 
        // We use findMany and filter manually to ensure compatibility with all Prisma/DB versions 
        // if JSON path queries are not perfectly mapped, though for Postgres it usually works.
        const pendingDeposits = await prisma.deposits.findMany({
            where: { status: 'PENDING' },
            orderBy: { created_at: 'desc' },
            take: 50 // Limit search to recent pending deposits
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
                message: `Deposit not found for identifier: ${identifier}`
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment reference found',
            deposit_id: deposit.id,
            status: 'PENDING',
            next_action: token ? 'capture_payment' : 'check_status'
        });

    } catch (error) {
        console.error('Deposit success error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}