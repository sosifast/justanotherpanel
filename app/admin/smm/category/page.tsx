import { prisma } from '@/lib/prisma';
import CategoriesClient from './CategoriesClient';

export default async function SmmCategoryPage() {
    const categories = await prisma.category.findMany({
        orderBy: { id: 'asc' }
    });

    return <CategoriesClient initialCategories={categories} />;
}
