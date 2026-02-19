import React from 'react';
import { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next";
import RegisterView from './RegisterView';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const siteName = settings?.site_name || "JustAnotherPanel";
    return {
        title: `Register | ${siteName}`,
        description: `Create an account on ${siteName}.`,
    };
}

export default function Page() {
    return (
        <>
            <RegisterView />
            <Analytics />
        </>
    );
}
