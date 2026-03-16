import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import ArticleDetailClient from './ArticleDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const article = await prisma.articlePost.findUnique({
        where: { slug: params.slug },
        include: { category: true }
    });

    if (!article) return { title: 'Article Not Found' };

    const settings = await getSettings();
    const siteName = settings?.site_name || "JustAnotherPanel";

    return {
        title: `${article.seo_title || article.name} | ${siteName}`,
        description: article.desc_seo || 'Read the full story here.',
    };
}

async function getArticle(slug: string) {
    return await prisma.articlePost.findUnique({
        where: { slug: slug, status: 'ACTIVE' },
        include: { category: true }
    });
}

async function getSidebarArticles(currentArticleId: number, categoryId: number) {
    const [latest, popular, recommended] = await Promise.all([
        // Latest Articles
        prisma.articlePost.findMany({
            where: { id: { not: currentArticleId }, status: 'ACTIVE' },
            orderBy: { created_at: 'desc' },
            take: 5,
            include: { category: true }
        }),
        // Popular Articles
        prisma.articlePost.findMany({
            where: { id: { not: currentArticleId }, status: 'ACTIVE' },
            orderBy: { view_count: 'desc' },
            take: 5,
            include: { category: true }
        }),
        // Recommended (Same Category)
        prisma.articlePost.findMany({
            where: { 
                id: { not: currentArticleId }, 
                id_article_category: categoryId,
                status: 'ACTIVE' 
            },
            take: 5,
            include: { category: true }
        })
    ]);

    return { latest, popular, recommended };
}

export default async function BlogPostPage(props: Props) {
    const params = await props.params;
    const [article, settings] = await Promise.all([
        getArticle(params.slug),
        getSettings(),
    ]);

    if (!article) {
        notFound();
    }

    // Increment view count (simple implementation)
    await prisma.articlePost.update({
        where: { id: article.id },
        data: { view_count: { increment: 1 } }
    });

    const sidebarContent = await getSidebarArticles(article.id, article.id_article_category);
    const siteName = settings?.site_name || 'JustAnotherPanel';

    return (
        <ArticleDetailClient 
            article={article} 
            settings={settings} 
            siteName={siteName} 
            sidebarContent={sidebarContent}
        />
    );
}
