import { prisma } from '@/lib/prisma';
import HistoryOrderClient from './HistoryOrderClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Virtual Number Orders History",
    description: "Manage virtual number SMS order history."
};

export default async function VirtualNumberHistoryOrderPage() {
    // Fetch all orders with relations
    const orders = await prisma.orderSms.findMany({
        include: {
            user: true,
            country: true,
            product: true
        },
        orderBy: { id: 'desc' }
    });

    // Serialize Decimals for Client Component
    const serializedOrders = orders.map(order => ({
        ...order,
        price_api_sms: Number(order.price_api_sms),
        price_sale: Number(order.price_sale)
    }));

    return <HistoryOrderClient initialOrders={serializedOrders as any} />;
}
