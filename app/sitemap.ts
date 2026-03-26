import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://apkey.net'

    // Static pages
    const routes = [
        '',
        '/about',
        '/terms',
        '/services',
        '/auth/login',
        '/auth/register',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic blog posts
    // NOTE: During Vercel build/export, DB connectivity may be temporarily unavailable.
    // Don't hard-fail the whole build just because sitemap can't load dynamic posts.
    let posts: MetadataRoute.Sitemap = []
    try {
        const articles = await prisma.articlePost.findMany({
            where: { status: 'ACTIVE' },
            select: { slug: true, updated_at: true },
        })

        posts = articles.map((article) => ({
            url: `${baseUrl}/blog/${article.slug}`,
            lastModified: article.updated_at,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    } catch (e) {
        console.error('Failed to generate dynamic sitemap posts:', e)
    }

    return [...routes, ...posts]
}
