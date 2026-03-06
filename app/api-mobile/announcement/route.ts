
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api-mobile/announcement
 *
 * Mengembalikan daftar pengumuman/berita yang sedang aktif.
 * Maksimal 20 item, diurutkan dari yang terbaru.
 *
 * Auth: Required — Bearer token di Authorization header.
 *
 * Response (200):
 *   News[]  // array of news/announcement objects, order: created_at DESC, max 20
 *
 * Errors:
 *   401 — Unauthorized
 *   500 — Internal Server Error
 */
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
