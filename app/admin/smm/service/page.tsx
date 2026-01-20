import { prisma } from '@/lib/prisma';
import ServicesClient from './ServicesClient';

export default async function ServicesPage() {
    const services = await prisma.service.findMany({
        orderBy: { id: 'asc' },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    platform: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            api_provider: {
                select: {
                    id: true,
                    name: true,
                    code: true
                }
            },
            _count: {
                select: { orders: true }
            }
        }
    });

    const categories = await prisma.category.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            platform: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    const apiProviders = await prisma.apiProvider.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            code: true
        }
    });

    return (
        <ServicesClient
            initialServices={services}
            categories={categories}
            apiProviders={apiProviders}
        />
    );
}
