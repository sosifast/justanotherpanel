
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

interface TransactionDetail {
    fee?: number;
    method?: string;
    provider?: string;
    transactionId?: string;
    paypal_order_id?: string;
    cryptomus_uuid?: string;
    order_id?: string;
}

/**
 * GET /api-mobile/history
 * 
 * Retrieves a paginated history of either 'orders' or 'deposits' for the authenticated user.
 * 
 * Auth: Required (Bearer Token)
 * 
 * Query Params:
 * - type (optional): 'orders' (default) or 'deposits'.
 * - page (optional): Page number for pagination (default: 1).
 * - limit (optional): Items per page (default: 20).
 * 
 * Response (200):
 * {
 *   "list": Array<Order|Deposit>, // Mapped to a clean mobile-friendly format
 *   "pagination": {
 *     "page": number,
 *     "limit": number,
 *     "total": number,
 *     "pages": number
 *   }
 * }
 * 
 * Errors:
 * 401 - Unauthorized
 * 500 - Internal Server Error
 */
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
                list: deposits.map(deposit => {
                    const details = deposit.detail_transaction as unknown as TransactionDetail;
                    const provider = details?.provider || details?.method || 'Manual';
                    const transactionId = details?.transactionId ||
                        details?.paypal_order_id ||
                        details?.cryptomus_uuid ||
                        details?.order_id || '-';
                    const fee = details?.fee || 0;

                    return {
                        id: deposit.id,
                        amount: deposit.amount.toString(),
                        status: deposit.status,
                        provider: provider,
                        transaction_id: transactionId,
                        fee: fee.toString(),
                        created_at: deposit.created_at,
                        updated_at: deposit.updated_at
                    };
                }),
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
                        select: {
                            name: true,
                            category: {
                                select: {
                                    platform: {
                                        select: { name: true }
                                    }
                                }
                            }
                        }
                    }
                },
                skip: offset,
                take: limit,
            });

            const total = await prisma.order.count({ where: { id_user: user.id } });

            return successResponse({
                list: orders.map(order => ({
                    id: order.id,
                    invoice_number: order.invoice_number,
                    service_name: order.service.name,
                    platform_name: order.service.category?.platform?.name || 'Unknown',
                    link: order.link,
                    quantity: order.quantity,
                    price: order.price_sale.toString(),
                    start_count: order.start_count || 0,
                    remains: order.remains || 0,
                    status: order.status,
                    refill: order.refill,
                    runs: order.runs || 0,
                    interval: order.interval || 0,
                    pid: order.pid || '-',
                    created_at: order.created_at,
                    updated_at: order.updated_at
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
