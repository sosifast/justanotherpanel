import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const usageHistory = await prisma.redeemUsed.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    select: { username: true, email: true }
                },
                redeem_code: {
                    select: { name_code: true, get_balance: true }
                }
            }
        });

        const serializedHistory = usageHistory.map((usage: any) => ({
            ...usage,
            redeem_code: {
                ...usage.redeem_code,
                get_balance: Number(usage.redeem_code.get_balance)
            }
        }));

        return NextResponse.json(serializedHistory);
    } catch (error: any) {
        console.error('Error fetching usage history:', error);
        return NextResponse.json({ error: 'Failed to fetch usage history' }, { status: 500 });
    }
}
