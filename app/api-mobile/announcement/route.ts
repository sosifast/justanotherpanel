
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const news = await prisma.news.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { created_at: 'desc' },
            take: 20
        });

        return successResponse(news);

    } catch (error) {
        console.error('Announcement Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
