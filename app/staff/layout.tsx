import React from 'react';
import { getSettings } from '@/lib/settings';
import StaffLayoutClient from './StaffLayoutClient';

// Prevent Next.js from statically prerendering staff routes at build time.
export const dynamic = 'force-dynamic';

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  const initialSettings = settings
    ? {
      key: settings.pusher_app_key || process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
      cluster: settings.pusher_app_cluster || process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || '',
      site_name: settings.site_name,
      logo_imagekit_url: settings.logo_imagekit_url ?? undefined,
    }
    : null;

  return (
    <StaffLayoutClient initialSettings={initialSettings}>
      {children}
    </StaffLayoutClient>
  );
}
