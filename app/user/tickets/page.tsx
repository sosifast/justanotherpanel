import { Metadata } from 'next';
import TicketsView from "./view";
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const siteName = settings?.site_name || 'JustAnotherPanel';
    return {
        title: `Tickets | ${siteName}`,
        description: 'View and manage your support tickets.',
    };
}

export default function TicketsPage() {
    return <TicketsView />;
}
