
import { Metadata } from 'next';
import ForgetClient from './ForgetClient';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([
    prisma.seoPage.findFirst(),
    getSettings()
  ]);
  const siteName = settings?.site_name || "JustAnotherPanel";

  const title = seo?.forget_title || `Forgot Password | ${siteName}`;
  const description = seo?.forget_desc || `Reset your password at ${siteName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName
    }
  };
}

export default function Page() {
  return <ForgetClient />;
}
