import React from 'react';
import { Metadata } from 'next';
import App from './LandingView';

export const metadata: Metadata = {
    title: "JustAnotherPanel - #1 SMM Panel in the World",
    description: "The #1 SMM Panel in the World. We lead, they follow. Get instant social media marketing services with the best prices and fastest delivery.",
    keywords: ["SMM Panel", "Social Media Marketing", "Instagram followers", "YouTube views", "TikTok likes", "Facebook engagement", "Twitter followers", "social media services", "SMM reseller panel"],
    authors: [{ name: "JustAnotherPanel" }],
    creator: "JustAnotherPanel",
    publisher: "JustAnotherPanel",
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
        url: 'https://justanotherpanel.online',
        siteName: 'JustAnotherPanel',
        title: 'JustAnotherPanel - #1 SMM Panel in the World',
        description: 'The #1 SMM Panel in the World. We lead, they follow. Get instant social media marketing services with the best prices and fastest delivery.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'JustAnotherPanel - SMM Panel',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'JustAnotherPanel - #1 SMM Panel in the World',
        description: 'The #1 SMM Panel in the World. We lead, they follow. Get instant social media marketing services with the best prices and fastest delivery.',
        images: ['/og-image.jpg'],
        creator: '@justanotherpanel',
    },
    alternates: {
        canonical: 'https://justanotherpanel.online',
    },
    verification: {
        google: 'your-google-verification-code',
        // yandex: 'your-yandex-verification-code',
        // bing: 'your-bing-verification-code',
    },
    category: 'technology',
};

export default function Page() {
    return <App />;
}
