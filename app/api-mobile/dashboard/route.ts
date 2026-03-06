
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { subDays, startOfDay, format } from 'date-fns';

/**
 * GET /api-mobile/dashboard
 * 
 * Retrieves summary statistics, analysis charts, and recommendations for the user.
 */
export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);

    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    try {
        const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

        // 1. Basic Stats Aggregation
        const [
            totalSpentAggregate,
            totalDepositAggregate,
            activeTicketsCount,
            activeOrdersCount,
            successOrdersCount,
            news
        ] = await Promise.all([
            prisma.order.aggregate({
                _sum: { price_sale: true },
                where: { id_user: user.id, status: { not: 'CANCELED' } }
            }),
            prisma.deposits.aggregate({
                _sum: { amount: true },
                where: { id_user: user.id, status: 'PAYMENT' }
            }),
            prisma.ticket.count({
                where: { id_user: user.id, status: { in: ['OPEN', 'PENDING', 'ANSWERED'] } }
            }),
            prisma.order.count({
                where: { id_user: user.id, status: { in: ['PENDING', 'IN_PROGRESS', 'PROCESSING'] } }
            }),
            prisma.order.count({
                where: { id_user: user.id, status: { in: ['SUCCESS', 'COMPLETED'] } }
            }),
            prisma.news.findMany({
                where: { status: 'ACTIVE' },
                orderBy: { created_at: 'desc' },
                take: 5
            })
        ]);

        // 2. Chart Data: Orders & Deposits (Last 30 Days)
        const [recentOrders, recentDeposits] = await Promise.all([
            prisma.order.findMany({
                where: { id_user: user.id, created_at: { gte: thirtyDaysAgo }, status: { not: 'CANCELED' } },
                select: { created_at: true, price_sale: true }
            }),
            prisma.deposits.findMany({
                where: { id_user: user.id, created_at: { gte: thirtyDaysAgo }, status: 'PAYMENT' },
                select: { created_at: true, amount: true }
            })
        ]);

        // Process charts into daily buckets
        const orderChart: Record<string, number> = {};
        const depositChart: Record<string, number> = {};

        // Initialize last 30 days with 0s
        for (let i = 0; i < 30; i++) {
            const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
            orderChart[dateStr] = 0;
            depositChart[dateStr] = 0;
        }

        recentOrders.forEach(o => {
            const day = format(o.created_at, 'yyyy-MM-dd');
            if (orderChart[day] !== undefined) orderChart[day] += Number(o.price_sale);
        });

        recentDeposits.forEach(d => {
            const day = format(d.created_at, 'yyyy-MM-dd');
            if (depositChart[day] !== undefined) depositChart[day] += Number(d.amount);
        });

        // 3. User Analysis: Top Platform
        const topPlatformStats = await prisma.order.groupBy({
            by: ['id_service'],
            _count: { id_service: true },
            where: { id_user: user.id },
            orderBy: { _count: { id_service: 'desc' } },
            take: 1
        });

        let recommendedPlatformId = null;
        if (topPlatformStats.length > 0) {
            const svc = await prisma.service.findUnique({
                where: { id: topPlatformStats[0].id_service },
                select: { category: { select: { id_platform: true } } }
            });
            recommendedPlatformId = svc?.category.id_platform;
        }

        // 4. Popular Services Recommendations
        // We recommend active services that are popular globally or in user's favorite platform
        const popularServices = await prisma.service.findMany({
            where: {
                status: 'ACTIVE',
                ...(recommendedPlatformId ? { category: { id_platform: recommendedPlatformId } } : {})
            },
            take: 6,
            orderBy: { orders: { _count: 'desc' } },
            select: {
                id: true,
                name: true,
                min: true,
                max: true,
                price_sale: true,
                price_reseller: true,
                type: true,
                note: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        platform: { select: { id: true, name: true } }
                    }
                }
            }
        });

        return successResponse({
            user: {
                username: user.username,
                full_name: user.full_name,
                balance: user.balance,
                profile_image: user.profile_imagekit_url
            },
            stats: {
                total_spent: totalSpentAggregate._sum.price_sale || 0,
                total_deposit: totalDepositAggregate._sum.amount || 0,
                active_tickets: activeTicketsCount,
                active_orders: activeOrdersCount,
                success_orders: successOrdersCount,
            },
            analytics: {
                order_history_30d: Object.entries(orderChart).map(([date, value]) => ({ date, value })).reverse(),
                deposit_history_30d: Object.entries(depositChart).map(([date, value]) => ({ date, value })).reverse(),
            },
            recommendations: popularServices.map(s => ({
                service_id: s.id,
                name: s.name,
                category_name: s.category.name,
                platform_name: s.category.platform.name,
                price: user.role === 'ADMIN' || user.role === 'STAFF' ? s.price_reseller : s.price_sale,
                min: s.min,
                max: s.max,
                type: s.type,
                note: s.note,
                // Direct order pre-fill data
                prefill: {
                    service_id: s.id,
                    category_id: s.category.id,
                    platform_id: s.category.platform.id
                }
            })),
            news,
        });

    } catch (error) {
        console.error('Dashboard Analytics Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
