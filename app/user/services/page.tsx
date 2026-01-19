import { prisma } from "@/lib/prisma";
import ServicesView from "./view";

export default async function ServicesPage() {
    const services = await prisma.service.findMany({
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

    return <ServicesView initialServices={services} />;
}
