import { prisma } from "@/lib/prisma";
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import HistoryHubClient from './HistoryHubClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "History Hub",
    description: "View your order and transaction history.",
};

export default async function HistoryPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    const userId = session.id;

    // 1. Fetch User Data
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            full_name: true,
            role: true,
            profile_imagekit_url: true,
            balance: true
        }
    });

    if (!user) {
        redirect('/auth/login');
    }

    // 2. Fetch SMM Orders
    const smmOrders = await prisma.order.findMany({
        where: { id_user: userId },
        include: {
            service: true,
            reffil_orders: true
        },
        orderBy: { created_at: 'desc' }
    });

    // 3. Fetch SMS Orders (Virtual Number)
    const smsOrders = await prisma.orderSms.findMany({
        where: { id_user: userId },
        include: {
            country: true,
            product: true
        },
        orderBy: { created_at: 'desc' }
    });

    // 4. Fetch Deposits
    const deposits = await prisma.deposits.findMany({
        where: { id_user: userId },
        orderBy: { created_at: 'desc' }
    });

    // --- SERIALIZATION ---

    const serializedSmmOrders = smmOrders.map((order: any) => ({
        ...order,
        price_api: Number(order.price_api || 0),
        price_sale: Number(order.price_sale || 0),
        price_seller: Number(order.price_seller || 0),
        service: order.service ? {
            ...order.service,
            price_api: Number(order.service.price_api || 0),
            price_sale: Number(order.service.price_sale || 0),
            price_reseller: Number(order.service.price_reseller || 0),
        } : null,
        reffil_orders: order.reffil_orders || [],
        created_at: order.created_at.toISOString(),
        updated_at: order.updated_at.toISOString()
    }));

    const serializedSmsOrders = smsOrders.map((o: any) => ({
        id: o.id,
        invoice: o.invoice,
        number: o.number,
        status_order: o.status_order,
        sms_otp_code: o.sms_otp_code,
        price_sale: Number(o.price_sale),
        created_at: o.created_at.toISOString(),
        country: o.country.title,
        product: o.product.title
    }));

    const serializedDeposits = deposits.map((d: any) => ({
        ...d,
        amount: Number(d.amount),
        created_at: d.created_at.toISOString(),
        updated_at: d.updated_at.toISOString()
    }));

    return (
        <HistoryHubClient 
            user={{
                ...user,
                balance: Number(user.balance)
            }}
            smmOrders={serializedSmmOrders}
            smsOrders={serializedSmsOrders}
            deposits={serializedDeposits}
        />
    );
}
