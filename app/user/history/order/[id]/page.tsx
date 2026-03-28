import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getUserIdFromAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import OrderDetailClient from './OrderDetailClient';

export const metadata: Metadata = {
    title: 'Order Detail',
    description: 'Detailed information about your SMM order.'
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
    await cookies();
    const userId = await getUserIdFromAuth();
    if (!userId) redirect('/auth/login');

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) notFound();

    const order = await prisma.order.findFirst({
        where: { id: orderId, id_user: userId },
        include: {
            service: {
                include: {
                    category: {
                        include: { platform: true }
                    }
                }
            },
            api_provider: { select: { name: true } }
        }
    });

    if (!order) notFound();

    // Serialize Prisma data explicitly for Client Component (Converting Decimal and Date objects)
    const serializedOrder: any = {
        ...order,
        price_api: Number(order.price_api),
        price_sale: Number(order.price_sale),
        price_seller: Number(order.price_seller),
        remains: order.remains !== null ? Number(order.remains) : null,
        start_count: order.start_count !== null ? Number(order.start_count) : null,
        created_at: order.created_at.toISOString(),
        updated_at: order.updated_at.toISOString(),
        service: order.service ? {
            ...order.service,
            price_api: Number(order.service.price_api),
            price_sale: Number(order.service.price_sale),
            price_reseller: Number(order.service.price_reseller),
            min: Number(order.service.min),
            max: Number(order.service.max),
            created_at: order.service.created_at.toISOString(),
            updated_at: order.service.updated_at.toISOString(),
        } : null,
    };

    return <OrderDetailClient order={serializedOrder} />;
}
