import React from 'react';
import { Metadata } from 'next';
import PrivacyView from './PrivacyView';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const [seo, settings] = await Promise.all([
        prisma.seoPage.findFirst(),
        getSettings()
    ]);
    const siteName = settings?.site_name || "JustAnotherPanel";
    return {
        title: seo?.privacy_title || `Privacy Policy | ${siteName}`,
        description: seo?.privacy_desc || `Privacy Policy for ${siteName}.`,
        openGraph: {
            title: seo?.privacy_title || `Privacy Policy | ${siteName}`,
            description: seo?.privacy_desc || `Privacy Policy for ${siteName}.`,
            siteName
        }
    };
}

export default async function Page() {
    const settings = await getSettings();
    return <PrivacyView settings={settings} />;
}
