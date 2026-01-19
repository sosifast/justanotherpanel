import { prisma } from '@/lib/prisma';
import PlatformsClient from './PlatformsClient';

export default async function SmmPlatformPage() {
    const platforms = await prisma.platform.findMany({
        orderBy: { id: 'asc' }
    });

    return <PlatformsClient initialPlatforms={platforms} />;
}
