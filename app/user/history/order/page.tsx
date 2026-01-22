import { prisma } from "@/lib/prisma";
import OrderHistoryView from "./view";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Order History",
    description: "View and track your previous SMM orders.",
};

export default async function OrderHistoryPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return <div>Unauthorized</div>;
    }

    const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'default-secret-key-change-it'
    );

    let userId: number;
    try {
        const { payload } = await jwtVerify(token, secret);
        userId = parseInt(payload.sub as string);
    } catch (error) {
        return <div>Invalid session</div>;
    }

    const orders = await prisma.order.findMany({
        where: {
            id_user: userId
        },
        include: {
            service: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    // Convert Decimal fields to numbers for serialization
    const serializedOrders = orders.map(order => ({
        ...order,
        price_api: order.price_api ? parseFloat(order.price_api.toString()) : 0,
        price_sale: order.price_sale ? parseFloat(order.price_sale.toString()) : 0,
        price_seller: order.price_seller ? parseFloat(order.price_seller.toString()) : 0,
        // Also handle potential Decimal fields in related service
        service: order.service ? {
            ...order.service,
            price_api: order.service.price_api ? parseFloat((order.service.price_api as any).toString()) : 0,
            price_sale: order.service.price_sale ? parseFloat((order.service.price_sale as any).toString()) : 0,
            price_reseller: order.service.price_reseller ? parseFloat((order.service.price_reseller as any).toString()) : 0,
            min: typeof order.service.min === 'number' ? order.service.min : parseInt((order.service.min as any)?.toString() || '0'),
            max: typeof order.service.max === 'number' ? order.service.max : parseInt((order.service.max as any)?.toString() || '0'),
        } : null
    }));

    // @ts-ignore - Ignore the complex type mismatch for initialOrders as we've serialized it for client use
    return <OrderHistoryView initialOrders={serializedOrders} />;
}
