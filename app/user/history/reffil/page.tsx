import { prisma } from "@/lib/prisma";
import RefillHistoryView from "./view";
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Refill History",
    description: "View and track your service refill requests.",
};

export default async function RefillHistoryPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    const userId = session.id;

    const refillOrders = await (prisma as any).reffilOrder.findMany({
        where: {
            id_user: userId
        },
        include: {
            order: {
                include: {
                    service: true
                }
            },
            api_provider: true
        },
        orderBy: {
            create_at: 'desc'
        }
    });

    // Serialize data for client use
    const serializedRefills = refillOrders.map((refill: any) => ({
        ...refill,
        order: refill.order ? {
            ...refill.order,
            price_api: refill.order.price_api ? parseFloat(refill.order.price_api.toString()) : 0,
            price_sale: refill.order.price_sale ? parseFloat(refill.order.price_sale.toString()) : 0,
            price_seller: refill.order.price_seller ? parseFloat(refill.order.price_seller.toString()) : 0,
            service: refill.order.service ? {
                ...refill.order.service,
                price_api: refill.order.service.price_api ? parseFloat(refill.order.service.price_api.toString()) : 0,
                price_sale: refill.order.service.price_sale ? parseFloat(refill.order.service.price_sale.toString()) : 0,
                price_reseller: refill.order.service.price_reseller ? parseFloat(refill.order.service.price_reseller.toString()) : 0,
                min: typeof refill.order.service.min === 'number' ? refill.order.service.min : parseInt((refill.order.service.min as any)?.toString() || '0'),
                max: typeof refill.order.service.max === 'number' ? refill.order.service.max : parseInt((refill.order.service.max as any)?.toString() || '0'),
            } : null
        } : null,
        api_provider: refill.api_provider ? {
            id: refill.api_provider.id,
            name: refill.api_provider.name
        } : null
    }));

    // @ts-ignore - Ignore type differences for simplified serialized data
    return <RefillHistoryView initialRefills={serializedRefills} />;
}
