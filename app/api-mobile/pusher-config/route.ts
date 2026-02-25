import { NextRequest } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api-mobile/pusher-config
 *
 * Returns Pusher client-side configuration (key + cluster) so the mobile app
 * can initialise the Pusher client. The app_secret is never exposed.
 *
 * After connecting, the mobile app should authenticate private channels via:
 *   POST /api/pusher/auth
 *   Authorization: Bearer <token>
 *   Body: socket_id=...&channel_name=private-user-{id}
 */
export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const settings = await prisma.setting.findFirst({
            select: {
                pusher_app_key: true,
                pusher_app_cluster: true,
            }
        });

        const key = settings?.pusher_app_key || process.env.PUSHER_APP_KEY || null;
        const cluster = settings?.pusher_app_cluster || process.env.PUSHER_APP_CLUSTER || null;

        if (!key || !cluster) {
            return errorResponse('Pusher not configured', 503);
        }

        return successResponse({
            key,
            cluster,
            auth_endpoint: '/api/pusher/auth',
            channels: {
                user: `private-user-${user.id}`,
            }
        }, 'Pusher config retrieved');

    } catch (err) {
        console.error('GET /api-mobile/pusher-config error:', err);
        return errorResponse('Internal Server Error', 500);
    }
}
