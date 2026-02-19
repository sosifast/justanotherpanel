import React from 'react';
import { Metadata } from 'next';
import TermsView from './TermsView';
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
        title: seo?.term_title || `Terms of Service | ${siteName}`,
        description: seo?.term_desc || `Terms of Service for ${siteName}.`,
        openGraph: {
            title: seo?.term_title || `Terms of Service | ${siteName}`,
            description: seo?.term_desc || `Terms of Service for ${siteName}.`,
            siteName
        }
    };
}

export default async function Page() {
    const settings = await getSettings();
    return <TermsView settings={settings} />;
}
