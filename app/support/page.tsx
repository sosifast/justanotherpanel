import React from 'react';
import { Metadata } from 'next';
import SupportClient from './SupportClient';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const siteName = settings?.site_name || "JustAnotherPanel";
    return {
        title: `Help Center | ${siteName}`,
        description: `Get support and find answers to your questions about ${siteName} services.`,
        openGraph: {
            title: `Help Center | ${siteName}`,
            description: `Get support and find answers to your questions about ${siteName} services.`,
            siteName
        }
    };
}

export default async function SupportPage() {
    const settings = await getSettings();
    const siteName = settings?.site_name || "JustAnotherPanel";
    
    return <SupportClient settings={settings} siteName={siteName} />;
}
