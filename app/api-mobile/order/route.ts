import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createNotification } from '@/lib/notifications';
import { createAdminNotification } from '@/lib/admin-notifications';
import { orderSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/security';

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `INV-${year}-${random}`;
}

async function isReseller(userId: number): Promise<boolean> {
    const record = await prisma.reseller.findFirst({
        where: { id_user: userId, status: 'ACTIVE' }
    });
    return !!record;
}

interface DiscountResult {
    id: number;
    code: string;
    discountAmount: number;
    finalPrice: number;
}

async function applyDiscount(
    discountCode: string,
    userId: number,
    subtotal: number
): Promise<DiscountResult | null> {
    const discount = await prisma.discount.findFirst({
        where: {
            name_discount: discountCode,
            status: 'ACTIVE',
            expired_date: { gte: new Date() }
        },
        include: {
            _count: { select: { discount_usages: true } }
        }
    });

    if (!discount) return null;
    if (discount._count.discount_usages >= discount.max_used) return null;

    const minTx = Number(discount.min_transaction);
    const maxTx = Number(discount.max_transaction);

    if (subtotal < minTx) return null;
    if (maxTx > 0 && subtotal > maxTx) return null;

    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
        discountAmount = (subtotal * Number(discount.amount)) / 100;
    } else {
        discountAmount = Number(discount.amount);
    }

    const maxGet = Number(discount.discount_max_get || 0);
    if (maxGet > 0 && discountAmount > maxGet) discountAmount = maxGet;
    if (discountAmount > subtotal) discountAmount = subtotal;

    return {
        id: discount.id,
        code: discount.name_discount,
        discountAmount,
        finalPrice: Math.max(0, subtotal - discountAmount)
    };
}

/**
 * GET /api-mobile/order
 * 
 * Returns a complex hierarchical list of all active platforms -> categories -> services.
 * This is the primary endpoint for the mobile app to populate the "New Order" discovery UI.
 * Services include pricing for both normal users (price_sale) and resellers (price_reseller).
 * 
 * Auth: Required (Bearer Token)
 * 
 * Response (200):
 * Array<Platform & { 
 *   categories: Array<Category & { 
 *     services: ServiceSummary[] 
 *   }> 
 * }>
 * 
 * Errors:
 * 401 - Unauthorized
 * 500 - Internal Server Error
 */
export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const platforms = await prisma.platform.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' },
            include: {
                categories: {
                    where: { status: 'ACTIVE' },
                    orderBy: { name: 'asc' },
                    include: {
                        services: {
                            where: { status: 'ACTIVE' },
                            orderBy: { name: 'asc' },
                            select: {
                                id: true,
                                name: true,
                                min: true,
                                max: true,
                                price_sale: true,
                                price_reseller: true,
                                type: true,
                                refill: true,
                                note: true,
                            }
                        }
                    }
                }
            }
        });

        // Filter out platforms with no active services
        const result = platforms
            .map(p => ({
                ...p,
                categories: p.categories
                    .filter(c => c.services.length > 0)
                    .map(c => ({
                        id: c.id,
                        name: c.name,
                        services: c.services.map(s => ({
                            id: s.id,
                            name: s.name,
                            min: s.min,
                            max: s.max,
                            price_sale: s.price_sale,
                            price_reseller: s.price_reseller,
                            type: s.type,
                            refill: s.refill,
                            note: s.note,
                        }))
                    }))
            }))
            .filter(p => p.categories.length > 0);

        return successResponse(result);
    } catch (error) {
        console.error('GET /api-mobile/order error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}

/**
 * POST /api-mobile/order
 * 
 * Places a new SMM order. Performs the following steps:
 * 1. Validates inputs and service status.
 * 2. Calculates price based on user type (Reseller vs Member).
 * 3. Applies discount code if provided.
 * 4. Checks user balance.
 * 5. Dispatches to API Provider (if Sid/Sid exists).
 * 6. Records transaction and deducts balance atomically.
 * 7. Triggers real-time notifications for user and admin.
 * 
 * Auth: Required (Bearer Token)
 * 
 * Request Body:
 * {
 *   "service_id": number,    // required
 *   "link": string,          // required - target URL for the service
 *   "quantity": number,      // required (unless CUSTOM_COMMENTS)
 *   "comments": string,      // required for CUSTOM_COMMENTS type
 *   "runs": number,          // optional - for drip-feed
 *   "interval": number,      // optional - for drip-feed
 *   "discount_code": string  // optional
 * }
 * 
 * Response (200):
 * {
 *   "order": { id, invoice_number, status, service_name, total_price, ... },
 *   "message": "Order placed successfully"
 * }
 * 
 * Errors:
 * 400 - Validation errors (missing fields, invalid quantity, provider error)
 * 400 - Insufficient balance
 * 401 - Unauthorized
 * 500 - Internal Server Error
 */

export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    // Rate limiting: 10 orders per minute per user
    const limiter = await rateLimit(`order-${user.id}`, 10, 60);
    if (!limiter.success) {
        return errorResponse('Too many orders. Please wait a minute before placing another order.', 429);
    }

    try {
        const body = await req.json();

        // Prevent exact duplicate orders within 30 seconds
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
        const existingOrder = await prisma.order.findFirst({
            where: {
                id_user: user.id,
                id_service: Number(body.service_id),
                link: body.link,
                quantity: Number(body.quantity),
                created_at: { gte: thirtySecondsAgo }
            }
        });

        if (existingOrder) {
            return errorResponse('Duplicate order detected. Please wait a moment.', 400);
        }

        const validation = orderSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const {
            service_id,
            link,
            quantity,
            comments,
            runs,
            interval,
            discount_code
        } = validation.data;

        // ── Fetch service ───────────────────────────────────────────────────
        const service = await prisma.service.findUnique({
            where: { id: Number(service_id) },
            include: {
                api_provider: true,
                category: {
                    include: {
                        platform: { select: { name: true } }
                    }
                }
            }
        });

        if (!service || service.status !== 'ACTIVE') {
            return errorResponse('Service not found or inactive');
        }

        // ── Determine quantity ──────────────────────────────────────────────
        let orderQuantity: number;

        if (service.type === 'CUSTOM_COMMENTS') {
            if (!comments || !comments.trim()) {
                return errorResponse('comments is required for CUSTOM_COMMENTS service');
            }
            const commentLines = (comments as string)
                .split(/\r?\n/)
                .filter((c: string) => c.trim() !== '');
            if (commentLines.length === 0) {
                return errorResponse('Please provide at least one comment');
            }
            orderQuantity = commentLines.length;
        } else {
            if (!quantity) return errorResponse('quantity is required');
            orderQuantity = Number(quantity);
            if (isNaN(orderQuantity) || orderQuantity < service.min || orderQuantity > service.max) {
                return errorResponse(`Quantity must be between ${service.min} and ${service.max}`);
            }
        }

        // ── Detect reseller & calculate subtotal ────────────────────────────
        const userIsReseller = await isReseller(user.id);
        const pricePerUnit = userIsReseller
            ? Number(service.price_reseller)
            : Number(service.price_sale);

        const subtotal = (pricePerUnit / 1000) * orderQuantity;

        // ── Apply discount (optional) ────────────────────────────────────────
        let finalPrice = subtotal;
        let discountResult: DiscountResult | null = null;

        if (discount_code) {
            discountResult = await applyDiscount(discount_code, user.id, subtotal);
            if (discountResult) {
                finalPrice = discountResult.finalPrice;
            }
            // if code is provided but invalid, we silently ignore it
            // (or you could return an error — see validate-discount endpoint)
        }

        // ── Check balance ────────────────────────────────────────────────────
        const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!freshUser || Number(freshUser.balance) < finalPrice) {
            return errorResponse('Insufficient balance', 400);
        }

        // ── Dispatch to API provider (if configured) ─────────────────────────
        let pid: string | null = null;
        let orderStatus: string = 'PENDING';

        if (service.api_provider && service.sid) {
            try {
                const formData = new FormData();
                formData.append('key', service.api_provider.api_key);
                formData.append('action', 'add');
                formData.append('service', service.sid);
                formData.append('link', link.trim());

                if (service.type === 'CUSTOM_COMMENTS') {
                    formData.append('comments', comments);
                } else {
                    formData.append('quantity', orderQuantity.toString());
                    if (runs) formData.append('runs', parseInt(runs).toString());
                    if (interval) formData.append('interval', parseInt(interval).toString());
                }

                const apiResponse = await fetch(service.api_provider.url, {
                    method: 'POST',
                    body: formData
                });
                const apiResult = await apiResponse.json();

                if (apiResult.order) {
                    pid = apiResult.order.toString();
                    orderStatus = 'PROCESSING';
                } else if (apiResult.error) {
                    return errorResponse(`Provider error: ${apiResult.error}`, 400);
                }
            } catch (apiError) {
                console.error('API Provider dispatch error:', apiError);
                // Keep status as PENDING — admin can re-process
            }
        }

        // ── Snapshot prices for the record ───────────────────────────────────
        const totalPriceApi = (Number(service.price_api) / 1000) * orderQuantity;
        const totalPriceSale = (Number(service.price_sale) / 1000) * orderQuantity;
        const totalPriceSeller = (Number(service.price_reseller) / 1000) * orderQuantity;

        // ── Persist order + discount + deduct balance (in transaction) ────────
        const invoiceNumber = generateInvoiceNumber();

        const result = await prisma.$transaction(async (tx) => {
            // Create order
            const order = await tx.order.create({
                data: {
                    invoice_number: invoiceNumber,
                    id_user: user.id,
                    id_service: service.id,
                    id_api_provider: service.api_provider?.id ?? null,
                    pid,
                    link: link.trim(),
                    quantity: orderQuantity,
                    price_api: totalPriceApi,
                    price_sale: finalPrice,     // actual amount paid (post-discount)
                    price_seller: totalPriceSeller,
                    status: orderStatus as any,
                    refill: service.refill,
                    runs: runs ? parseInt(runs) : null,
                    interval: interval ? parseInt(interval) : null,
                }
            });

            // Record discount usage
            if (discountResult) {
                await tx.discountUsage.create({
                    data: {
                        id_discount: discountResult.id,
                        id_users: user.id,
                        id_order: order.id
                    }
                });
            }

            // Deduct balance
            await tx.user.update({
                where: { id: user.id },
                data: { balance: { decrement: finalPrice } }
            });

            return order;
        });

        // Notify user + admin (realtime via Pusher)
        await Promise.all([
            createNotification(
                user.id,
                'Order Placed Successfully',
                `Your order #${result.invoice_number} for "${service.name}" has been placed. Status: ${result.status}.`,
                'ORDER',
                result.id,
                { related_id: String(result.id), screen: 'order_detail' }
            ),
            createAdminNotification(
                'New Mobile Order',
                `Order #${result.id} placed by user #${user.id} via mobile app.`,
                'NEW_ORDER',
                result.id
            ),
        ]);

        return successResponse(
            {
                order: {
                    id: result.id,
                    invoice_number: result.invoice_number,
                    status: result.status,
                    service_name: service.name,
                    platform: service.category.platform.name,
                    category: service.category.name,
                    link: result.link,
                    quantity: result.quantity,
                    subtotal: subtotal.toFixed(4),
                    discount_code: discountResult?.code ?? null,
                    discount_amount: discountResult ? discountResult.discountAmount.toFixed(4) : '0.0000',
                    total_price: finalPrice.toFixed(4),
                    refill: result.refill,
                    pid: result.pid ?? null,
                }
            },
            'Order placed successfully'
        );

    } catch (error) {
        console.error('POST /api-mobile/order error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
