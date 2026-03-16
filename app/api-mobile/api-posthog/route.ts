import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api-mobile/api-posthog
 *
 * Mengembalikan konfigurasi PostHog untuk mobile app.
 * Digunakan oleh mobile app untuk inisialisasi PostHog secara dinamis.
 *
 * Auth: Public
 */
export async function GET() {
    try {
        const posthogConfig = {
            posthog_key: process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_KEY || null,
            posthog_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
            is_enabled: !!(process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_KEY)
        };

        return successResponse(posthogConfig, 'PostHog configuration retrieved successfully');
    } catch (error) {
        console.error('PostHog Config Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
