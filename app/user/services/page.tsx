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

    const [rawServices, avgTimeRows] = await Promise.all([
        prisma.service.findMany({
            where: { status: 'ACTIVE' },
            include: {
                category: {
                    include: { platform: true }
                }
            },
            orderBy: { id: 'asc' }
        }),
        // Calculate average completion time (in minutes) per service
        // from orders that have reached a terminal status (COMPLETED / SUCCESS / PARTIAL)
        prisma.$queryRaw<{ id_service: number; avg_minutes: number }[]>`
            SELECT
                id_service,
                ROUND(
                    AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60)
                )::int AS avg_minutes
            FROM "order"
            WHERE status IN ('COMPLETED', 'SUCCESS', 'PARTIAL')
            GROUP BY id_service
        `
    ]);

    // Build a lookup map: serviceId → avg minutes
    const avgTimeMap: Record<number, number> = {};
    for (const row of avgTimeRows) {
        avgTimeMap[Number(row.id_service)] = Number(row.avg_minutes);
    }

    const services = rawServices.map(service => ({
        ...service,
        price_api: service.price_api.toNumber(),
        price_sale: service.price_sale.toNumber(),
        price_reseller: service.price_reseller.toNumber(),
    }));

    return <ServicesView initialServices={services} avgTimeMap={avgTimeMap} userRole={session.role} />;
}
