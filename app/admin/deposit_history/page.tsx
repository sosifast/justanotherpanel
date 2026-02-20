import { prisma } from '@/lib/prisma';
import DepositsClient from './DepositsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
    title: "Deposits",
    description: "View deposit history."
};

export default async function DepositHistoryPage() {
    const deposits = await prisma.deposits.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            user: {
                select: {
                    username: true
                }
            }
        }
    });

    const serializedDeposits = deposits.map(d => ({
        ...d,
        amount: Number(d.amount)
    }));

    return <DepositsClient initialDeposits={serializedDeposits} />;
}
