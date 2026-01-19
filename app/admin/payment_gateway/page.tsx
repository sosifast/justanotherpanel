import { prisma } from '@/lib/prisma';
import PaymentGatewaysClient from './PaymentGatewaysClient';

export default async function PaymentGatewayPage() {
    const gateways = await prisma.paymentGateway.findMany({
        orderBy: { id: 'asc' }
    });

    return <PaymentGatewaysClient initialGateways={gateways} />;
}
