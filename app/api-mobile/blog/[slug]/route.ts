import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api-mobile/blog/[slug]
 *
 * Returns the full detail of a single article by its slug.
 * Also increments the view_count atomically.
 * Returns 3 recommended articles from the same category (excluding current).
 *
 * Content Format:
 *   The `content` field is stored as JSON in the DB.
 *   - If content is { html: "..." }  → render the `html` property as HTML
 *   - If content is a plain string   → render directly as HTML
 *
 * Auth: NOT required — publicly accessible.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return errorResponse('Slug is required', 400);
        }

        // Find article
        const article = await prisma.articlePost.findUnique({
            where: { slug, status: 'ACTIVE' },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (!article) {
            return errorResponse('Article not found', 404);
        }

        // Increment view count (fire-and-forget, non-blocking)
        prisma.articlePost.update({
            where: { id: article.id },
            data: { view_count: { increment: 1 } },
        }).catch((err) => console.error('view_count increment error:', err));

        // Recommended articles: same category, active, excluding current (max 3)
        const recommended = await prisma.articlePost.findMany({
            where: {
                status: 'ACTIVE',
                id_article_category: article.id_article_category,
                id: { not: article.id },
            },
            orderBy: { view_count: 'desc' },
            take: 3,
            select: {
                id: true,
                name: true,
                slug: true,
                banner_imagekit_upload_url: true,
                desc_seo: true,
                view_count: true,
                created_at: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        // Parse content for mobile rendering
        let parsedContent: string | null = null;
        if (article.content) {
            if (typeof article.content === 'string') {
                parsedContent = article.content;
            } else if (
                typeof article.content === 'object' &&
                'html' in (article.content as object)
            ) {
                parsedContent = (article.content as { html: string }).html;
            }
        }

        return successResponse({
            article: {
                id: article.id,
                name: article.name,
                slug: article.slug,
                banner_url: article.banner_imagekit_upload_url ?? null,
                content_html: parsedContent,
                desc_seo: article.desc_seo ?? null,
                seo_title: article.seo_title ?? null,
                keywords: article.keyword
                    ? article.keyword.split(',').map((k) => k.trim()).filter(Boolean)
                    : [],
                view_count: article.view_count + 1, // return post-increment value
                created_at: article.created_at,
                updated_at: article.updated_at,
                category: article.category,
            },
            recommended,
        });

    } catch (error) {
        console.error('GET /api-mobile/blog/[slug] error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
