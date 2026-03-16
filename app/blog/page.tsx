import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { Metadata } from 'next';
import BlogView from './BlogView';

export const dynamic = 'force-dynamic';

async function getArticles() {
    return await prisma.articlePost.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
        include: { category: true }
    });
}

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const siteName = settings?.site_name || "JustAnotherPanel";
    return {
        title: `Blog & Insights | ${siteName}`,
        description: `Stay updated with the latest news and insights from ${siteName}.`,
    };
}

export default async function BlogPage() {
    const [allArticles, settings] = await Promise.all([
        getArticles(),
        getSettings()
    ]);

    return <BlogView allArticles={allArticles} settings={settings} />;
}
