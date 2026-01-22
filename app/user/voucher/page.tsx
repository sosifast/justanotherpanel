import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import VoucherClient from './VoucherClient';

export const metadata: Metadata = {
    title: 'Vouchers',
    description: 'View available discount vouchers and coupons.',
};

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
        discount_max_get: Number(d.discount_max_get),
        amount: Number(d.amount),
        usage_count: d._count.discount_usages,
        created_at: d.created_at.toISOString(),
        updated_at: d.updated_at.toISOString(),
        expired_date: d.expired_date.toISOString()
    }));

    return <VoucherClient discounts={serializedDiscounts} />;
}
