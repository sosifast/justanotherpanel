import { prisma } from '@/lib/prisma';
import ServicesClient from './ServicesClient';

export default async function ServicesPage() {
    const services = await prisma.service.findMany({
        orderBy: { id: 'asc' },
        include: {
            category: true
        }
    });

    return <ServicesClient initialServices={services} />;
}
