import { prisma } from '@/lib/prisma';
import ProductClient from './ProductClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Virtual Number Products",
    description: "Manage virtual number SMS products."
};

export default async function VirtualNumberProductPage() {
    // Fetch all products with their country relation
    const products = await prisma.productSms.findMany({
        include: {
            country: true
        },
        orderBy: { id: 'desc' }
    });

    // Serialize Decimals for Client Component
    const serializedProducts = products.map(product => ({
        ...product,
        cost: Number(product.cost)
    }));

    return <ProductClient initialProducts={serializedProducts as any} />;
}
