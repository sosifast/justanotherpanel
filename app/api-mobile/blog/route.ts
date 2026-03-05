import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api-mobile/blog
 *
 * Returns a paginated list of active blog articles.
 *
 * Query Params:
 *   - page        : Page number (default: 1)
 *   - limit       : Items per page (default: 10, max: 50)
 *   - category_id : Filter by category ID (optional)
 *   - category_slug : Filter by category slug (optional)
 *   - search      : Search by article title (optional)
 *
 * Auth: NOT required — publicly accessible.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
        const skip = (page - 1) * limit;
        const categoryId = searchParams.get('category_id');
        const categorySlug = searchParams.get('category_slug');
        const search = searchParams.get('search')?.trim();

        // Build dynamic where clause
        const where: any = { status: 'ACTIVE' };

        if (categoryId) {
            where.id_article_category = parseInt(categoryId);
        } else if (categorySlug) {
            where.category = { slug: categorySlug };
        }

        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        const [articles, total] = await Promise.all([
            prisma.articlePost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    banner_imagekit_upload_url: true,
                    desc_seo: true,
                    keyword: true,
                    view_count: true,
                    created_at: true,
                    updated_at: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            }),
            prisma.articlePost.count({ where }),
        ]);

        return successResponse({
            list: articles,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('GET /api-mobile/blog error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
