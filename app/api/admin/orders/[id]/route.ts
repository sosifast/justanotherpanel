import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, link, quantity, remains, start_count } = body;

        // If status is being updated, use the transactional service
        if (status) {
            const updateParams: any = {
                orderId: parseInt(id),
                newStatus: status as OrderStatus
            };
            if (remains !== undefined) updateParams.newRemains = parseInt(remains.toString());
            if (start_count !== undefined) updateParams.newStartCount = parseInt(start_count.toString());

            // Note: Service doesn't support updating link/quantity yet as that doesn't trigger refunds usually
            // If those are needed, we might need to separate them or update service.
            // For now, let's update status via service, and others via direct update if needed?
            // Actually, the prompt was about *status updates* triggering refunds.

            // Let's use the service for status updates.
            const updatedOrder = await import('@/lib/order-service').then(m => m.updateOrderStatus(updateParams));

            // If other fields are present (link, quantity), update them separately (rare case in same req?)
            // The frontend usually sends only changed fields or all.
            // Let's keep it simple: The service handles status/remains/start_count.
            // Link/Quantity updates are separate or non-transactional for refund logic.

            if (link !== undefined || quantity !== undefined) {
                await prisma.order.update({
                    where: { id: parseInt(id) },
                    data: {
                        link: link,
                        quantity: quantity ? parseInt(quantity.toString()) : undefined
                    }
                });
            }

            // Convert Decimal to Number for frontend
            const serializedOrder = {
                ...updatedOrder,
                price_api: Number(updatedOrder.price_api),
                price_sale: Number(updatedOrder.price_sale),
                price_seller: Number(updatedOrder.price_seller),
                user: {
                    ...updatedOrder.user,
                    balance: Number(updatedOrder.user.balance)
                }
            };
            return NextResponse.json({ message: 'Order updated successfully', order: serializedOrder });
        }

        // If NO status update, just simple update
        const updateData: any = {};
        if (link !== undefined) updateData.link = link;
        if (quantity !== undefined) updateData.quantity = parseInt(quantity.toString());
        if (remains !== undefined) updateData.remains = parseInt(remains.toString());
        if (start_count !== undefined) updateData.start_count = parseInt(start_count.toString());

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                user: {
                    select: { username: true, email: true, balance: true }
                },
                service: {
                    select: { id: true, name: true }
                }
            }
        });

        // Convert Decimal to Number for frontend
        const serializedOrder = {
            ...order,
            price_api: Number(order.price_api),
            price_sale: Number(order.price_sale),
            price_seller: Number(order.price_seller),
            user: {
                ...order.user,
                balance: Number(order.user.balance)
            }
        };

        return NextResponse.json({ message: 'Order updated successfully', order: serializedOrder });
    } catch (error: any) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if order exists
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await prisma.order.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 });
    }
}
