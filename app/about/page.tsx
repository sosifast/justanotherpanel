import React from 'react';
import { Metadata } from 'next';
import AboutView from './AboutView';

import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "About",
    description: "Learn more about JustAnotherPanel and our mission.",
};

export default async function Page() {
    const settings = await getSettings();
    return <AboutView settings={settings} />;
}
