import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

type UpdateOrderParams = {
    orderId: number;
    newStatus: OrderStatus;
    newRemains?: number;
    newStartCount?: number;
};

export async function updateOrderStatus({ orderId, newStatus, newRemains, newStartCount }: UpdateOrderParams) {
    return await prisma.$transaction(async (tx) => {
        // 1. Fetch current order with user details for balance update
        const currentOrder = await tx.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!currentOrder) {
            throw new Error(`Order #${orderId} not found`);
        }

        // 2. Determine if refund is needed
        // Only refund if transitioning TO a refunded state AND not already in a refunded state
        // This is a basic idempotency check. A more robust one would check a 'Refund' record, but we don't have one in the schema yet for orders.
        // We assume if status is ALREADY 'ERROR'/'CANCELED'/'PARTIAL', we probably already processed it.
        // However, admins might correct a mistake, so we should be careful. 
        // For 'PARTIAL', the remains might change, triggering more refund? 
        // For simplicity: Only refund if previous status was NOT a final/refunded status.
        // OR: Calculate refund based on *difference*? That's complex without audit logs.
        // Strategy: Only refund if moving from [PENDING, IN_PROGRESS, PROCESSING] -> [ERROR, CANCELED, PARTIAL]

        const refundStatuses = ['ERROR', 'CANCELED', 'PARTIAL'];
        const activeStatuses = ['PENDING', 'IN_PROGRESS', 'PROCESSING'];

        let refundAmount = 0;
        let shouldRefund = false;

        // Check if we are moving from an active status to a refund status
        if (activeStatuses.includes(currentOrder.status) && refundStatuses.includes(newStatus)) {
            shouldRefund = true;
        }

        // Special case: If already PARTIAL, and updating remains? 
        // Complex to handle without more data. Safe bet for now: strictly handle strict transitions for auto-refunds.
        // If an admin manually sets ERROR -> ERROR, no refund.

        if (shouldRefund) {
            const pricePerItem = Number(currentOrder.price_sale) / currentOrder.quantity;

            if (newStatus === 'ERROR' || newStatus === 'CANCELED') {
                // Full Refund
                refundAmount = Number(currentOrder.price_sale);
            } else if (newStatus === 'PARTIAL') {
                // Partial Refund
                // Valid remains is required for partial
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

            // Optional: Log this action if we had a logs table
            console.log(`[AutoRefund] Order #${orderId} refunded: $${refundAmount} (Status: ${newStatus})`);
        }

        return updatedOrder;
    });
}
