import { prisma } from '@/lib/prisma';
import PricelistClient from './PricelistClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Virtual Number Pricelist",
    description: "Manage virtual number SMS pricelist."
};

export default async function VirtualNumberPricelistPage() {
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
        cost: Number(product.cost),
        cost_sale: Number(product.cost_sale)
    }));

    return <PricelistClient initialProducts={serializedProducts as any} />;
}
