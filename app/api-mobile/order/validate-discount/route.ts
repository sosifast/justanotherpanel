import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * POST /api-mobile/order/validate-discount
 *
 * Preview the discount amount for a given service + quantity + discount code,
 * WITHOUT placing an order. Use this for real-time UI feedback in the mobile app.
 *
 * Body: { service_id, quantity, discount_code }
 */
export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const body = await req.json();
        const { service_id, quantity, discount_code } = body;

        if (!service_id) return errorResponse('service_id is required');
        if (!quantity) return errorResponse('quantity is required');
        if (!discount_code || !discount_code.trim()) return errorResponse('discount_code is required');

        // Fetch service
        const service = await prisma.service.findUnique({
            where: { id: Number(service_id) }
        });

        if (!service || service.status !== 'ACTIVE') {
            return errorResponse('Service not found or inactive');
        }

        const orderQuantity = parseInt(quantity);
        if (isNaN(orderQuantity) || orderQuantity < service.min || orderQuantity > service.max) {
            return errorResponse(`Quantity must be between ${service.min} and ${service.max}`);
        }

        // Detect reseller
        const resellerRecord = await prisma.reseller.findFirst({
            where: { id_user: user.id, status: 'ACTIVE' }
        });
        const userIsReseller = !!resellerRecord;
        const pricePerUnit = userIsReseller
            ? Number(service.price_reseller)
            : Number(service.price_sale);

        const subtotal = (pricePerUnit / 1000) * orderQuantity;

        // Validate discount
        const discount = await prisma.discount.findFirst({
            where: {
                name_discount: discount_code.trim(),
                status: 'ACTIVE',
                expired_date: { gte: new Date() }
            },
            include: {
                _count: { select: { discount_usages: true } }
            }
        });

        if (!discount) {
            return errorResponse('Discount code not found or expired', 400);
        }
        if (discount._count.discount_usages >= discount.max_used) {
            return errorResponse('Discount code has reached its usage limit', 400);
        }

        const minTx = Number(discount.min_transaction);
        const maxTx = Number(discount.max_transaction);
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

        // Compute discount amount
        let discountAmount = 0;
        if (discount.type === 'PERCENTAGE') {
            discountAmount = (subtotal * Number(discount.amount)) / 100;
        } else {
            discountAmount = Number(discount.amount);
        }

        const maxGet = Number(discount.discount_max_get || 0);
        if (maxGet > 0 && discountAmount > maxGet) discountAmount = maxGet;
        if (discountAmount > subtotal) discountAmount = subtotal;

        const finalPrice = Math.max(0, subtotal - discountAmount);

        return successResponse({
            valid: true,
            discount_code: discount.name_discount,
            discount_type: discount.type,
            discount_amount: discountAmount.toFixed(4),
            subtotal: subtotal.toFixed(4),
            final_price: finalPrice.toFixed(4),
        });

    } catch (error) {
        console.error('POST /api-mobile/order/validate-discount error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
