import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://justanotherpanel.online'

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
    const articles = await prisma.articlePost.findMany({
        where: { status: 'ACTIVE' },
        select: { slug: true, updated_at: true },
    })

    const posts = articles.map((article) => ({
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: article.updated_at,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...routes, ...posts]
}
