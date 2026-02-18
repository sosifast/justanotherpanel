
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const searchParams = req.nextUrl.searchParams;
    const platformId = searchParams.get('platform_id');
    const categoryId = searchParams.get('category_id');

    try {
        if (platformId) {
            // Get categories for a specific platform
            const categories = await prisma.category.findMany({
                where: {
                    id_platform: Number(platformId),
                    status: 'ACTIVE',
                },
                include: {
                    services: {
                        where: { status: 'ACTIVE' },
                        select: {
                            id: true,
                            name: true,
                            min: true,
                            max: true,
                            price_sale: true,
                            note: true,
                            type: true,
                        },
                    },
                },
            });
            return successResponse(categories);
        }

        if (categoryId) {
            // Get services for a specific category
            const services = await prisma.service.findMany({
                where: {
                    id_category: Number(categoryId),
                    status: 'ACTIVE',
                },
                select: {
                    id: true,
                    name: true,
                    min: true,
                    max: true,
                    price_sale: true,
                    note: true,
                    type: true,
                },
            });
            return successResponse(services);
        }

        // Default: List all active platforms
        const platforms = await prisma.platform.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                slug: true,
                icon_imagekit_url: true,
            },
        });

        return successResponse(platforms);

    } catch (error) {
        console.error('Platform Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
