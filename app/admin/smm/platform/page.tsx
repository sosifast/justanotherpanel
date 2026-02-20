import { prisma } from '@/lib/prisma';
import PlatformsClient from './PlatformsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
    title: "Platforms",
    description: "Manage social media platforms."
};

export default async function SmmPlatformPage() {
    const platforms = await prisma.platform.findMany({
        orderBy: { id: 'asc' },
        include: {
            _count: {
                select: { categories: true }
            }
        }
    });

    return <PlatformsClient initialPlatforms={platforms} />;
}
