import { prisma } from '@/lib/prisma';
import VoucherClient from './VoucherClient';

export default async function VoucherPage() {
    // 1. Fetch discounts
    const discounts = await prisma.discount.findMany({
        where: {
            status: 'ACTIVE'
        },
        orderBy: {
            created_at: 'desc'
        },
        include: {
            _count: {
                select: { discount_usages: true }
            }
        }
    });

    // 2. Serialize and format
    const serializedDiscounts = discounts.map(d => ({
        ...d,
        min_transaction: Number(d.min_transaction),
        max_transaction: Number(d.max_transaction),
        amount: Number(d.amount),
        usage_count: d._count.discount_usages
    }));

    return <VoucherClient discounts={serializedDiscounts} />;
}
