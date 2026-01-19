import { prisma } from '@/lib/prisma';
import OrdersClient from './OrdersClient';

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            user: true,
            service: true
        }
    });

    return <OrdersClient initialOrders={orders} />;
}
