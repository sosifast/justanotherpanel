import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HistoryOrderSmsClient from './HistoryOrderSmsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Order History SMS - Temporary Numbers',
    description: 'Check your previous SMS orders and received codes.',
};

export default async function HistoryOrderSmsPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.id },
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

    // Fetch all SMS orders for this user
    const orders = await prisma.orderSms.findMany({
        where: {
            id_user: session.id
        },
        include: {
            country: true,
            product: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return (
        <HistoryOrderSmsClient
            user={{
                full_name: user?.full_name || 'Member',
                role: user?.role || 'MEMBER',
                profile_imagekit_url: user?.profile_imagekit_url || null,
                balance: Number(user?.balance || 0)
            }}
            orders={orders.map(o => ({
                id: o.id,
                invoice: o.invoice,
                number: o.number,
                status_order: o.status_order,
                sms_otp_code: o.sms_otp_code,
                price_sale: Number(o.price_sale),
                created_at: o.created_at.toISOString(),
                country: o.country.title,
                product: o.product.title
            }))}
        />
    );
}
