import { prisma } from "@/lib/prisma";
import ServicesView from "./view";

export default async function ServicesPage() {
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

    return <ServicesView initialServices={services} />;
}
