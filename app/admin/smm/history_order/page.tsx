import { prisma } from '@/lib/prisma';
import OrdersClient from './OrdersClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Order History",
    description: "Manage SMM orders."
};

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            user: true,
            service: true
        }
    });

    const serializedOrders = orders.map(order => ({
        ...order,
        price_api: Number(order.price_api),
        price_sale: Number(order.price_sale),
        price_seller: Number(order.price_seller),
        remains: order.remains || 0,
        refill: order.refill || false,
        service: {
            ...order.service,
            price_api: Number(order.service.price_api),
            price_sale: Number(order.service.price_sale),
            price_reseller: Number(order.service.price_reseller),
        },
        user: {
            ...order.user,
            balance: Number(order.user.balance)
        }
    }));

    return <OrdersClient initialOrders={serializedOrders} />;
}
