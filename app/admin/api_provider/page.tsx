import { prisma } from '@/lib/prisma';
import ApiProvidersClient from './ApiProvidersClient';

export default async function ApiProviderPage() {
    const providers = await prisma.apiProvider.findMany({
        orderBy: { id: 'asc' }
    });

    return <ApiProvidersClient initialProviders={providers} />;
}
