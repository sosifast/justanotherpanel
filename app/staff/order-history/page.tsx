import React from 'react';
import { prisma } from '@/lib/prisma';
import StaffOrdersClient from './StaffOrdersClient';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Order Management | Staff Area",
    description: "Manage and review user SMM orders."
};

export default async function StaffOrdersPage() {
    const session = await getCurrentUser();

    if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        redirect('/auth/login');
    }

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
        created_at: order.created_at.toISOString(),
        service: {
            id: order.service.id,
            name: order.service.name,
            price_api: Number(order.service.price_api),
            price_sale: Number(order.service.price_sale),
            price_reseller: Number(order.service.price_reseller),
        },
        user: {
            username: order.user.username,
            email: order.user.email,
            balance: Number(order.user.balance)
        }
    }));

    return <StaffOrdersClient initialOrders={serializedOrders as any} />;
}
