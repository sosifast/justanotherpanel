import React from 'react';
import { Metadata } from 'next';
import AboutView from './AboutView';

import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const siteName = settings?.site_name || 'JustAnotherPanel';
    return {
        title: `About | ${siteName}`,
        description: `Learn more about ${siteName} and our mission to revolutionize social media marketing.`,
    };
}

export default async function Page() {
    const settings = await getSettings();
    return <AboutView settings={settings} />;
}
