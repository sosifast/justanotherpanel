
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'orders'; // 'orders' or 'deposits'
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    try {
        if (type === 'deposits') {
            const deposits = await prisma.deposits.findMany({
                where: { id_user: user.id },
                orderBy: { created_at: 'desc' },
                skip: offset,
                take: limit,
            });

            const total = await prisma.deposits.count({ where: { id_user: user.id } });

            return successResponse({
                list: deposits,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                }
            });
        } else {
            // Orders
            const orders = await prisma.order.findMany({
                where: { id_user: user.id },
                orderBy: { created_at: 'desc' },
                include: {
                    service: {
                        select: { name: true }
                    }
                },
                skip: offset,
                take: limit,
            });

            const total = await prisma.order.count({ where: { id_user: user.id } });

            return successResponse({
                list: orders.map(o => ({
                    ...o,
                    service_name: o.service.name
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                }
            });
        }

    } catch (error) {
        console.error('History Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
