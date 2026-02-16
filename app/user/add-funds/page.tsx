import { prisma } from '@/lib/prisma';
import AddFundsClient from './AddFundsClient';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getUserIdFromAuth } from '@/lib/auth';

export const metadata: Metadata = {
    title: "Add Funds",
    description: "Add balance to your account using various payment gateways."
};

export default async function AddFundsPage() {
    await cookies();
    const userId = await getUserIdFromAuth();
    if (!userId) return <div>Unauthorized</div>;

    const gateways = await prisma.paymentGateway.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { id: 'asc' }
    });

    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
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
