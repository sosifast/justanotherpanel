import { prisma } from '@/lib/prisma';
import NewOrderClient from './NewOrderClient';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: "New Order",
    description: "Place a new SMM order."
};

type Props = {
    searchParams: Promise<{
        platform?: string;
        service?: string;
    }>;
};

export default async function NewOrderPage({ searchParams }: Props) {
    const params = await searchParams;
    const platformSlug = params.platform;
    const serviceId = params.service ? parseInt(params.service) : undefined;

    // Get all active platforms with categories and services
    const platforms = await prisma.platform.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
        include: {
            categories: {
                where: { status: 'ACTIVE' },
                orderBy: { name: 'asc' },
                include: {
                    services: {
                        where: { status: 'ACTIVE' },
                        orderBy: { name: 'asc' },
                        select: {
                            id: true,
                            name: true,
                            min: true,
                            max: true,
                            price_sale: true,
                            price_reseller: true,
                            refill: true,
                            type: true,
                            note: true
                        }
                    }
                }
            }
        }
    });

    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            id: true,
            balance: true,
            role: true
        }
    });

    // Serialize data
    const serializedPlatforms = platforms.map(p => ({
        ...p,
        categories: p.categories.map(c => ({
            ...c,
            services: c.services.map(s => ({
                ...s,
                price_sale: Number(s.price_sale),
                price_reseller: Number(s.price_reseller)
            }))
        }))
    }));

    const serializedUser = user ? {
        ...user,
        balance: Number(user.balance)
    } : null;

    return (
        <NewOrderClient
            platforms={serializedPlatforms}
            selectedPlatformSlug={platformSlug || null}
            selectedServiceId={serviceId}
            user={serializedUser}
        />
    );
}
