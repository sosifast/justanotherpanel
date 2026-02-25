import { getSettings } from '@/lib/settings';
import UserLayoutClient from './UserLayoutClient';

// Prevent static prerendering — user pages need auth at request time.
export const dynamic = 'force-dynamic';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  // Map to the shape needed by UserLayoutClient
  const initialSettings = settings
    ? {
      key: settings.pusher_app_key || process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'app-key',
      cluster: settings.pusher_app_cluster || process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'us2',
      site_name: settings.site_name ?? undefined,
      logo_imagekit_url: settings.logo_imagekit_url ?? undefined,
    }
    : null;

  return (
    <UserLayoutClient initialSettings={initialSettings}>
      {children}
    </UserLayoutClient>
  );
}
