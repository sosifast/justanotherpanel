
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);

    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    try {
        // 1. Get total spent (Sum of all orders price_sale)
        const totalSpentAggregate = await prisma.order.aggregate({
            _sum: {
                price_sale: true,
            },
            where: {
                id_user: user.id,
                status: {
                    not: 'CANCELED',
                },
            },
        });
        const totalSpent = totalSpentAggregate._sum.price_sale || 0;

        // 2. Get total deposits (Sum of PAYMENT/Confirmed deposits)
        const totalDepositAggregate = await prisma.deposits.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                id_user: user.id,
                status: 'PAYMENT',
            },
        });
        const totalDeposit = totalDepositAggregate._sum.amount || 0;

        // 3. Get recent news (Limit 5)
        const news = await prisma.news.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { created_at: 'desc' },
            take: 5,
        });

        // 4. Get active tickets count (OPEN, PENDING, ANSWERED)
        const activeTicketsCount = await prisma.ticket.count({
            where: {
                id_user: user.id,
                status: {
                    in: ['OPEN', 'PENDING', 'ANSWERED'],
                },
            },
        });

        // 5. User Balance
        const balance = user.balance;

        return successResponse({
            user: {
                username: user.username,
                full_name: user.full_name,
                balance,
                profile_image: user.profile_imagekit_url
            },
            stats: {
                total_spent: totalSpent,
                total_deposit: totalDeposit,
                active_tickets: activeTicketsCount,
            },
            news,
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
