
import { Metadata } from 'next';
import LoginClient from './LoginClient';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const [seo, settings] = await Promise.all([
        prisma.seoPage.findFirst(),
        getSettings()
    ]);
    const siteName = settings?.site_name || "JustAnotherPanel";

    const title = seo?.login_title || `Login | ${siteName}`;
    const description = seo?.login_desc || `Login to ${siteName}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            siteName
        }
    };
}

export default function Page() {
    return <LoginClient />;
}
