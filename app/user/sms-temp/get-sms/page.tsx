import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import GetSmsClient from './GetSmsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Get SMS - Waiting for Code',
    description: 'View your temporary SMS number and wait for the verification code.',
};

type SearchParams = {
    orderId?: string;
};

export default async function GetSmsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    const params = await searchParams;
    const orderId = params.orderId;

    if (!orderId) {
        redirect('/user/sms-temp/service');
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

    const order = await prisma.orderSms.findFirst({
        where: {
            id: parseInt(orderId),
            id_user: session.id
        },
        include: {
            country: true,
            product: true
        }
    });

    if (!order) {
        redirect('/user/sms-temp/service');
    }

    return (
        <GetSmsClient
            user={{
                full_name: user.full_name,
                role: user.role,
                profile_imagekit_url: user.profile_imagekit_url || null,
                balance: Number(user.balance)
            }}
            order={{
                id: order.id,
                invoice: order.invoice,
                request_id: order.request_id,
                number: order.number,
                status_order: order.status_order,
                sms_otp_code: order.sms_otp_code,
                price_sale: Number(order.price_sale),
                created_at: order.created_at.toISOString(),
                country: order.country.title,
                product: order.product.title,
            }}
        />
    );
}
