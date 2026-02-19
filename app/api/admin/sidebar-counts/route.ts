import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, getJwtSecret());
        const role = payload.role as string;

        if (role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch counts
        const [pendingOrders, openTickets] = await Promise.all([
            prisma.order.count({
                where: {
                    status: {
                        in: ['PENDING', 'PROCESSING']
                    }
                }
            }),
            prisma.ticket.count({
                where: {
                    status: {
                        in: ['OPEN', 'PENDING']
                    }
                }
            })
        ]);

        return NextResponse.json({
            pending_orders: pendingOrders,
            open_tickets: openTickets
        });

    } catch (error) {
        console.error('Counts error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
