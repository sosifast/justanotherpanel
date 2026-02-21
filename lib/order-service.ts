import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { sendOrderWebhook } from './webhook';

type UpdateOrderParams = {
    orderId: number;
    newStatus: OrderStatus;
    newRemains?: number;
    newStartCount?: number;
};

export async function updateOrderStatus({ orderId, newStatus, newRemains, newStartCount }: UpdateOrderParams) {
    const order = await prisma.$transaction(async (tx) => {
        // ... (existing logic)
        // 1. Fetch current order with user details for balance update
        const currentOrder = await tx.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!currentOrder) {
            throw new Error(`Order #${orderId} not found`);
        }

        // 2. Determine if refund is needed
        const refundStatuses = ['ERROR', 'CANCELED', 'PARTIAL'];
        const activeStatuses = ['PENDING', 'IN_PROGRESS', 'PROCESSING'];

        let refundAmount = 0;
        let shouldRefund = false;

        // Check if we are moving from an active status to a refund status
        if (activeStatuses.includes(currentOrder.status) && refundStatuses.includes(newStatus)) {
            shouldRefund = true;
        }

        if (shouldRefund) {
            const pricePerItem = Number(currentOrder.price_sale) / currentOrder.quantity;

            if (newStatus === 'ERROR' || newStatus === 'CANCELED') {
                // Full Refund
                refundAmount = Number(currentOrder.price_sale);
            } else if (newStatus === 'PARTIAL') {
                // Partial Refund
                const remainsToRefund = newRemains !== undefined ? newRemains : currentOrder.remains || 0;
                refundAmount = remainsToRefund * pricePerItem;
            }
        }

        // 3. Update Order
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                remains: newRemains !== undefined ? newRemains : currentOrder.remains,
                start_count: newStartCount !== undefined ? newStartCount : currentOrder.start_count,
            },
            include: {
                user: {
                    select: { username: true, email: true, balance: true }
                },
                service: {
                    select: { id: true, name: true }
                }
            }
        });

        // 4. Process Refund if applicable
        if (shouldRefund && refundAmount > 0) {
            await tx.user.update({
                where: { id: currentOrder.id_user },
                data: {
                    balance: {
                        increment: refundAmount
                    }
                }
            });

            console.log(`[AutoRefund] Order #${orderId} refunded: $${refundAmount} (Status: ${newStatus})`);
        }

        return updatedOrder;
    });

    // 5. Trigger Webhook and Notifications after transaction committed
    // This is handled by sendOrderWebhook which also creates a user notification
    try {
        await sendOrderWebhook(orderId);
    } catch (err: any) {
        console.error(`Error sending webhook for order #${orderId}:`, err.message);
    }

    return order;
}
