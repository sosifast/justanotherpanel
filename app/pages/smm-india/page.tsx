import React from 'react';
import { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import SmmIndiaClient from './SmmIndiaClient';

export const metadata: Metadata = {
    title: 'SMM India — #1 Indian Social Media Promotion Provider',
    description: 'Skyrocket your brand with organic strategies: more followers, real engagement, and viral visibility in India. Instagram, YouTube, LinkedIn services.',
    keywords: ['SMM Panel India', 'Social Media Marketing India', 'Buy Followers India', 'YouTube Growth India', 'Instagram Promotion India'],
    openGraph: {
        title: 'SMM India — #1 Indian Social Media Promotion Provider',
        description: 'Dominate Indian social media with real engagement and organic growth strategies.',
        url: 'https://www.apkey.net/pages/smm-india',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'SMM India Promotion',
            }
        ]
    },
    alternates: {
        canonical: 'https://www.apkey.net/pages/smm-india',
    }
};

export default async function SmmIndiaPage() {
    const settings = await getSettings();
    return <SmmIndiaClient settings={settings} />;
}
