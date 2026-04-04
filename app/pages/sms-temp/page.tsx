import { Metadata } from 'next';
import SmsTempClient from './SmsTempClient';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
    title: 'Instant SMS Verification - Receive SMS Online | JustAnotherPanel',
    description: 'Get high-speed temporary phone numbers for SMS verification on social networks, chat services, and global platforms. Over 30 countries and 1 million+ numbers available 24/7.',
    keywords: ['sms verification', 'receive sms online', 'temporary phone number', 'virtual number', 'otp bypass', 'social media verification'],
    openGraph: {
        title: 'Instant SMS Verification - Receive SMS Online | JustAnotherPanel',
        description: 'Unlock accounts instantly with 1 million+ virtual numbers across 30+ countries. Reliable & secure.',
        type: 'website',
        locale: 'en_US',
    },
    alternates: {
        canonical: '/pages/sms-temp',
    }
};

export default async function SmsTempLandingPage() {
    const settings = await getSettings();
    return <SmsTempClient settings={settings} />;
}
