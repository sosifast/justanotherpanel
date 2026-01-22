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
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status: status as OrderStatus },
            include: {
                user: {
                    select: { username: true }
                },
                service: {
                    select: { name: true }
                }
            }
        });

        // Convert Decimal to Number for frontend
        const serializedOrder = {
            ...order,
            price_api: Number(order.price_api),
            price_sale: Number(order.price_sale),
            price_seller: Number(order.price_seller),
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
