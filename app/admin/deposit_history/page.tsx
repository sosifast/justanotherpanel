import { prisma } from '@/lib/prisma';
import DepositsClient from './DepositsClient';

export default async function DepositHistoryPage() {
    const deposits = await prisma.deposits.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            user: true
        }
    });

    return <DepositsClient initialDeposits={deposits} />;
}
