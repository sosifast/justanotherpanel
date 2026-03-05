import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * POST /api-mobile/coupon
 *
 * Validates a DISCOUNT COUPON CODE (from Admin → Discount panel).
 * This is NOT for balance top-up codes — use POST /api-mobile/reedem for that.
 *
 * Discount codes are used to reduce the price of an SMM order.
 * They reference the `Discount` table (not `RedeemCode`).
 *
 * Use this endpoint to validate a coupon code and preview the discount
 * before placing an order. To apply the discount to an actual order,
 * pass `discount_code` in the POST /order request body.
 *
 * Request Body:
 *   {
 *     "discount_code": "PROMO10",
 *     "service_id": 101,    // optional — required to calculate exact discount
 *     "quantity": 1000       // optional — required to calculate exact discount
 *   }
 *
 * If service_id & quantity are omitted, only returns the discount metadata
 * (type, amount, min/max transaction) without calculating final price.
 */
export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const body = await req.json();
        const { discount_code, service_id, quantity } = body;

        if (!discount_code || typeof discount_code !== 'string' || !discount_code.trim()) {
            return errorResponse('discount_code is required', 400);
        }

        const trimmedCode = discount_code.trim();

        // ── Find the discount in Discount table ─────────────────────────────
        const discount = await prisma.discount.findFirst({
            where: {
                name_discount: trimmedCode,
                status: 'ACTIVE',
                expired_date: { gte: new Date() },
            },
            include: {
                _count: { select: { discount_usages: true } },
            },
        });

        if (!discount) {
            return errorResponse('Discount code not found or expired', 400);
        }

        if (discount._count.discount_usages >= discount.max_used) {
            return errorResponse('Discount code has reached its usage limit', 400);
        }

        const minTx = Number(discount.min_transaction);
        const maxTx = Number(discount.max_transaction);
        const discountAmount = Number(discount.amount);
        const maxGet = Number(discount.discount_max_get || 0);

        // ── If service_id + quantity provided, calculate exact discount ──────
        if (service_id && quantity) {
            const service = await prisma.service.findUnique({
                where: { id: Number(service_id) },
            });

            if (!service || service.status !== 'ACTIVE') {
                return errorResponse('Service not found or inactive', 400);
            }

            const orderQuantity = parseInt(quantity);
            if (isNaN(orderQuantity) || orderQuantity < service.min || orderQuantity > service.max) {
                return errorResponse(`Quantity must be between ${service.min} and ${service.max}`, 400);
            }

            // Detect reseller for correct price
            const resellerRecord = await prisma.reseller.findFirst({
                where: { id_user: user.id, status: 'ACTIVE' },
            });
            const userIsReseller = !!resellerRecord;
            const pricePerUnit = userIsReseller
                ? Number(service.price_reseller)
                : Number(service.price_sale);

            const subtotal = (pricePerUnit / 1000) * orderQuantity;

            if (subtotal < minTx) {
                return errorResponse(
                    `Minimum order subtotal for this discount is $${minTx.toFixed(2)}`,
                    400
                );
            }
            if (maxTx > 0 && subtotal > maxTx) {
                return errorResponse(
                    `Maximum order subtotal for this discount is $${maxTx.toFixed(2)}`,
                    400
                );
            }

            let computedDiscount = 0;
            if (discount.type === 'PERCENTAGE') {
                computedDiscount = (subtotal * discountAmount) / 100;
            } else {
                computedDiscount = discountAmount;
            }

            if (maxGet > 0 && computedDiscount > maxGet) computedDiscount = maxGet;
            if (computedDiscount > subtotal) computedDiscount = subtotal;

            const finalPrice = Math.max(0, subtotal - computedDiscount);

            return successResponse(
                {
                    valid: true,
                    discount_code: discount.name_discount,
                    discount_type: discount.type,
                    discount_amount: computedDiscount.toFixed(4),
                    discount_max_get: maxGet > 0 ? maxGet.toFixed(2) : null,
                    subtotal: subtotal.toFixed(4),
                    final_price: finalPrice.toFixed(4),
                },
                'Discount code is valid'
            );
        }

        // ── Without service_id + quantity: return discount metadata only ─────
        return successResponse(
            {
                valid: true,
                discount_code: discount.name_discount,
                discount_type: discount.type,
                discount_amount: discountAmount.toFixed(4),
                discount_max_get: maxGet > 0 ? maxGet.toFixed(2) : null,
                min_transaction: minTx.toFixed(2),
                max_transaction: maxTx > 0 ? maxTx.toFixed(2) : null,
                expired_date: discount.expired_date,
            },
            'Discount code is valid'
        );

    } catch (error) {
        console.error('POST /api-mobile/coupon error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
