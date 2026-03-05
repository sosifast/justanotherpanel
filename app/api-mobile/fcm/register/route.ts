import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * POST /api-mobile/fcm/register
 *
 * Registers or updates the Firebase Cloud Messaging (FCM) device token
 * for the current user session. Call this after the user logs in and
 * every time the FCM token is refreshed by the mobile SDK.
 *
 * The token is stored on the UserSession record identified by the
 * Bearer JWT token in the Authorization header.
 *
 * Request Body:
 *   {
 *     "fcm_token": "exxxxxx:APA91bHxx..."
 *   }
 */
export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const body = await req.json();
        const { fcm_token } = body;

        if (!fcm_token || typeof fcm_token !== 'string' || !fcm_token.trim()) {
            return errorResponse('fcm_token is required', 400);
        }

        // Find the session by the JWT token in the Authorization header
        const authHeader = req.headers.get('Authorization') ?? '';
        const jwtToken = authHeader.replace('Bearer ', '').trim();

        if (!jwtToken) {
            return errorResponse('Unable to identify session', 400);
        }

        // Update the FCM token on the matching session
        const session = await prisma.userSession.updateMany({
            where: {
                token: jwtToken,
                id_user: user.id,
            },
            data: {
                fcm_token: fcm_token.trim(),
                last_active: new Date(),
            },
        });

        if (session.count === 0) {
            // Session not found — still save token by associating with user's latest session
            await prisma.userSession.updateMany({
                where: { id_user: user.id },
                data: { fcm_token: fcm_token.trim() },
            });
        }

        return successResponse(
            { registered: true },
            'FCM token registered successfully'
        );

    } catch (error) {
        console.error('POST /api-mobile/fcm/register error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}

/**
 * DELETE /api-mobile/fcm/register
 *
 * Removes the FCM token from the current session.
 * Call this on logout to stop receiving push notifications on this device.
 */
export async function DELETE(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const authHeader = req.headers.get('Authorization') ?? '';
        const jwtToken = authHeader.replace('Bearer ', '').trim();

        await prisma.userSession.updateMany({
            where: {
                id_user: user.id,
                ...(jwtToken ? { token: jwtToken } : {}),
            },
            data: { fcm_token: null },
        });

        return successResponse({ unregistered: true }, 'FCM token removed');

    } catch (error) {
        console.error('DELETE /api-mobile/fcm/register error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
