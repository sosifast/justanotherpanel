import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export default async function AdminSettingsPage() {
    const settings = await prisma.setting.findFirst();

    // Map to frontend format (already snake_case in DB)
    const mappedSettings = settings ? {
        id: settings.id,
        site_name: settings.site_name,
        favicon_imagekit_url: settings.favicon_imagekit_url,
        logo_imagekit_url: settings.logo_imagekit_url,
        instagram_url: settings.instagram_url,
        facebook_url: settings.facebook_url,
        email: settings.email,
        phone: settings.phone,
        telegram: settings.telegram,
        imagekit_url: settings.imagekit_url,
        imagekit_publickey: settings.imagekit_publickey,
        imagekit_privatekey: settings.imagekit_privatekey,
        google_analytic_code: settings.google_analytic_code,
        google_search_code: settings.google_search_code,
        reseller_fee: (settings as any).reseller_fee ? parseFloat((settings as any).reseller_fee.toString()) : 100000,
    } : null;

    return <SettingsClient initialSettings={mappedSettings} />;
}
