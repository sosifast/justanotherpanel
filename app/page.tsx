import React from 'react';
import { Metadata } from 'next';
import App from './LandingView';
import { getSettings } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const siteName = settings?.site_name || "JustAnotherPanel";
    const title = `${siteName} - #1 SMM Panel in the World`;
    const description = "The #1 SMM Panel in the World. We lead, they follow. Get instant social media marketing services with the best prices and fastest delivery.";

    return {
        title,
        description,
        keywords: ["SMM Panel", "Social Media Marketing", "Instagram followers", "YouTube views", "TikTok likes", "Facebook engagement", "Twitter followers", "social media services", "SMM reseller panel"],
        authors: [{ name: siteName }],
        creator: siteName,
        publisher: siteName,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://justanotherpanel.online',
            siteName: siteName,
            title,
            description,
            images: [
                {
                    url: '/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: `${siteName} - SMM Panel`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.jpg'],
            creator: '@justanotherpanel',
        },
        alternates: {
            canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://justanotherpanel.online',
        },
        category: 'technology',
    };
}

export const dynamic = "force-dynamic";

export default async function Page() {
    const settings = await getSettings();
    return <App settings={settings} />;
}
