
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api-mobile/slider-image
 * 
 * Fetches all active slider images for the mobile app home screen.
 * 
 * Auth: Required — Bearer token in Authorization header.
 * 
 * Response (200):
 *   Slider[] // array of slider objects (id, name, slug, imagekit_url_banner, created_at)
 * 
 * Errors:
 *   401 — Unauthorized
 *   500 — Internal Server Error
 */
export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const sliders = await prisma.slider.findMany({
            orderBy: { created_at: 'desc' }
        });

        return successResponse(sliders, "Sliders fetched successfully");
    } catch (error) {
        console.error('Slider Image Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
