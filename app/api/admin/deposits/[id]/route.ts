import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerPusher } from '@/lib/pusher';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const VALID_STATUSES = ['PENDING', 'PAYMENT', 'ERROR', 'CANCELED'];

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-it'
        );
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        if (role !== 'ADMIN' && role !== 'STAFF') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const depositId = parseInt(id);
        if (isNaN(depositId)) {
            return NextResponse.json({ error: 'Invalid deposit ID' }, { status: 400 });
        }

        const body = await req.json();
        const { status } = body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const deposit = await prisma.deposits.findUnique({
            where: { id: depositId },
            include: { user: { select: { username: true } } }
        });
        if (!deposit) {
            return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
        }

        const prevStatus = deposit.status;

        const updated = await prisma.$transaction(async (tx) => {
            const dep = await tx.deposits.update({
                where: { id: depositId },
                data: { status: status as any }
            });

            // If changing TO PAYMENT from non-PAYMENT, credit balance
            if (status === 'PAYMENT' && prevStatus !== 'PAYMENT') {
                await tx.user.update({
                    where: { id: deposit.id_user },
                    data: { balance: { increment: deposit.amount } }
                });
            }

            // If changing FROM PAYMENT to something else, deduct balance
            if (prevStatus === 'PAYMENT' && status !== 'PAYMENT') {
                await tx.user.update({
                    where: { id: deposit.id_user },
                    data: { balance: { decrement: deposit.amount } }
                });
            }

            return dep;
        });

        // Trigger real-time update for staff channel
        await triggerPusher('private-staff', 'deposit-update', {
            depositId: updated.id,
            status: updated.status,
            amount: Number(updated.amount),
            username: deposit.user?.username || 'System'
        });

        return NextResponse.json({ success: true, deposit: updated });
    } catch (error: any) {
        console.error('Admin deposit PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
