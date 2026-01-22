import { prisma } from '@/lib/prisma';
import AddFundsClient from './AddFundsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Add Funds",
    description: "Add balance to your account using various payment gateways."
};

export default async function AddFundsPage() {
    const gateways = await prisma.paymentGateway.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { id: 'asc' }
    });

    // Get user (TODO: from session)
    const userId = 1;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            balance: true
        }
    });

    const serializedGateways = gateways.map(g => ({
        id: g.id,
        provider: g.provider,
        min_deposit: Number(g.min_deposit),
        api_config: g.api_config
    }));

    return (
        <AddFundsClient
            gateways={serializedGateways}
            userBalance={user ? Number(user.balance) : 0}
        />
    );
}
