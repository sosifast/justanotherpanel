import { NextResponse } from 'next/server';
import { getUserIdFromAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await cookies();
        const userId = await getUserIdFromAuth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [orderCount, user] = await Promise.all([
            prisma.order.count({ where: { id_user: userId } }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { balance: true }
            })
        ]);

        return NextResponse.json({
            order_count: orderCount,
            balance: user?.balance ?? 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
