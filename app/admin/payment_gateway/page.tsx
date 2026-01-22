import { prisma } from '@/lib/prisma';
import PaymentGatewaysClient from './PaymentGatewaysClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Gateways",
    description: "Manage payment gateways."
};

export default async function PaymentGatewayPage() {
    const gateways = await prisma.paymentGateway.findMany({
        orderBy: { id: 'asc' }
    });

    const serializedGateways = gateways.map((gateway) => ({
        ...gateway,
        min_deposit: Number(gateway.min_deposit)
    }));

    return <PaymentGatewaysClient initialGateways={serializedGateways} />;
}
