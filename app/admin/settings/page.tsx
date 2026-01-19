import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export default async function AdminSettingsPage() {
    const settings = await prisma.setting.findFirst();

    return <SettingsClient initialSettings={settings} />;
}
