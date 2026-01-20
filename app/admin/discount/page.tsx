import { prisma } from '@/lib/prisma';
import DiscountClient from './DiscountClient';

export default async function DiscountPage() {
    const discounts = await prisma.discount.findMany({
        orderBy: { created_at: 'desc' }
    });

    const serializedDiscounts = discounts.map(d => ({
        ...d,
        min_transaction: Number(d.min_transaction),
        max_transaction: Number(d.max_transaction),
        discount_max_get: Number((d as any).discount_max_get || 0),
        amount: Number(d.amount)
    }));

    return <DiscountClient initialDiscounts={serializedDiscounts} />;
}
