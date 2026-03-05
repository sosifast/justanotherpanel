import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api-mobile/blog/categories
 *
 * Returns all active blog categories along with article count per category.
 *
 * Auth: NOT required — publicly accessible.
 */
export async function GET(req: NextRequest) {
    try {
        const categories = await prisma.articleCategory.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                desc_seo: true,
                _count: {
                    select: {
                        posts: {
                            where: { status: 'ACTIVE' },
                        },
                    },
                },
            },
        });

        const result = categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.desc_seo ?? null,
            article_count: cat._count.posts,
        }));

        return successResponse(result);

    } catch (error) {
        console.error('GET /api-mobile/blog/categories error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
