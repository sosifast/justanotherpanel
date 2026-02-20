import { prisma } from '@/lib/prisma';
import SmsApiSettingsClient from './SmsApiSettingsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Virtual Number API Settings",
    description: "Manage Virtual Number SMS API credentials."
};

export default async function VirtualNumberApiPage() {
    // We only expect one API config, so we use findFirst. 
    // If it doesn't exist, the client component will handle creating it or showing an empty form.
    const smsApiConfig = await prisma.smsApi.findFirst();

    // Convert Decimals to numbers for Client Component
    let serializedConfig = null;
    if (smsApiConfig) {
        serializedConfig = {
            ...smsApiConfig,
            balance: Number(smsApiConfig.balance),
            markup_price_pecentase: Number(smsApiConfig.markup_price_pecentase)
        };
    }

    return <SmsApiSettingsClient initialConfig={serializedConfig as any} />;
}
