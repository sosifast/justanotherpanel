import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAdminNotification } from '@/lib/admin-notifications';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { gatewayId, amount } = body;
        const userId = 1; // TODO: Session

        // Validate gateway
        const gateway = await prisma.paymentGateway.findUnique({
            where: { id: gatewayId }
        });

        if (!gateway || gateway.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Invalid gateway' }, { status: 400 });
        }

        if (amount < Number(gateway.min_deposit)) {
            return NextResponse.json({ error: `Minimum deposit is $${gateway.min_deposit}` }, { status: 400 });
        }

        // Create deposit record
        const deposit = await prisma.deposits.create({
            data: {
                id_user: userId,
                amount: amount,
                status: 'PENDING',
                detail_transaction: {
                    gateway_id: gateway.id,
                    provider: gateway.provider,
                    type: 'MANUAL',
                    request_time: new Date().toISOString()
                }
            }
        });

        // Notify Admin
        await createAdminNotification(
            'New Manual Deposit Request',
            `User #${userId} requested a $${amount} manual deposit.`,
            'NEW_DEPOSIT',
            deposit.id
        );

        return NextResponse.json({ success: true, id: deposit.id });
    } catch (error) {
        console.error('Manual deposit error:', error);
        return NextResponse.json({ error: 'Method not allowed' }, { status: 500 });
    }
}
