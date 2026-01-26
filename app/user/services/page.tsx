import { prisma } from "@/lib/prisma";
import ServicesView from "./view";
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: "Services",
    description: "Browse our available SMM services and pricing."
};

export default async function ServicesPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    const rawServices = await prisma.service.findMany({
        where: {
            status: 'ACTIVE'
        },
        include: {
            category: {
                include: {
                    platform: true
                }
            }
        },
        orderBy: {
            id: 'asc'
        }
    });

    const services = rawServices.map(service => ({
        ...service,
        price_api: service.price_api.toNumber(),
        price_sale: service.price_sale.toNumber(),
        price_reseller: service.price_reseller.toNumber(),
    }));

    return <ServicesView initialServices={services} userRole={session.role} />;
}
