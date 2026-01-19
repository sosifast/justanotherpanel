import { prisma } from '@/lib/prisma';
import ApiProvidersClient from './ApiProvidersClient';

export default async function ApiProviderPage() {
    const providers = await prisma.apiProvider.findMany({
        orderBy: { id: 'asc' }
    });

    // Convert Decimal to number for Client Component
    const serializedProviders = providers.map(provider => ({
        ...provider,
        balance: Number(provider.balance)
    }));

    return <ApiProvidersClient initialProviders={serializedProviders} />;
}
