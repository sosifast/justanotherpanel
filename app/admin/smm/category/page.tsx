import { prisma } from '@/lib/prisma';
import CategoriesClient from './CategoriesClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
    title: "Categories",
    description: "Manage service categories."
};

export default async function SmmCategoryPage() {
    const categories = await prisma.category.findMany({
        orderBy: { id: 'asc' },
        include: {
            platform: {
                select: {
                    id: true,
                    name: true,
                    icon_imagekit_url: true
                }
            },
            _count: {
                select: { services: true }
            }
        }
    });

    const platforms = await prisma.platform.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            icon_imagekit_url: true
        }
    });

    return <CategoriesClient initialCategories={categories} platforms={platforms} />;
}
