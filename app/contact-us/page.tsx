import { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import ContactClient from './ContactClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const siteName = settings?.site_name || 'JustAnotherPanel';
    return {
        title: `Contact Expert Support | ${siteName}`,
        description: `Get real-time assistance from ${siteName} support. Contact us via WhatsApp, Telegram, or Email for SMM solutions and strategic growth tips.`,
        keywords: 'contact smm panel, support, whatsapp, telegram, customer service',
        openGraph: {
            title: `Contact Expert Support | ${siteName}`,
            description: `Connect with our growth specialists for high-speed SMM assistance.`,
            siteName: siteName,
        }
    };
}

export default async function ContactPage() {
    const settings = await getSettings();
    const siteName = settings?.site_name || 'JustAnotherPanel';
    
    return (
        <ContactClient 
            settings={settings}
            siteName={siteName}
        />
    );
}