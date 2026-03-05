import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushToUser, sendFcmNotification, FcmPayload } from '@/lib/firebase';

/**
 * POST /api/admin/push-notification/send
 *
 * Admin endpoint to manually send a push notification.
 * Supports:
 *   - Broadcast to ALL users
 *   - Send to a specific user by user_id
 *   - Send to a specific FCM token directly
 *
 * Request Body:
 *   {
 *     "target": "all" | "user" | "token",
 *     "user_id": 7,                         // required if target = "user"
 *     "fcm_token": "exxxxxxx...",           // required if target = "token"
 *     "title": "System Maintenance",
 *     "body": "We will be down from 2am-4am.",
 *     "data": { "screen": "home" },         // optional deep-link data
 *     "image_url": "https://..."            // optional image
 *   }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { target, user_id, fcm_token, title, body: msgBody, data, image_url } = body;

        if (!title || !msgBody) {
            return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
        }

        const payload: FcmPayload = {
            title,
            body: msgBody,
            data: data ?? {},
            imageUrl: image_url ?? undefined,
        };

        let sent = 0;
        let failed = 0;

        if (target === 'token') {
            // Send to a single FCM token
            if (!fcm_token) {
                return NextResponse.json({ error: 'fcm_token is required for target=token' }, { status: 400 });
            }
            const ok = await sendFcmNotification(fcm_token, payload);
            ok ? sent++ : failed++;

        } else if (target === 'user') {
            // Send to a specific user
            if (!user_id) {
                return NextResponse.json({ error: 'user_id is required for target=user' }, { status: 400 });
            }
            await sendPushToUser(Number(user_id), payload);
            sent++;

        } else if (target === 'all') {
            // Broadcast to all users with FCM tokens
            const sessions = await prisma.userSession.findMany({
                where: { fcm_token: { not: null } },
                select: { id_user: true, fcm_token: true },
                distinct: ['id_user'],
            });

            const results = await Promise.allSettled(
                sessions.map((s) => sendFcmNotification(s.fcm_token!, payload))
            );

            results.forEach((r) => {
                if (r.status === 'fulfilled' && r.value) sent++;
                else failed++;
            });

        } else {
            return NextResponse.json(
                { error: 'target must be "all", "user", or "token"' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Push notification sent. Delivered: ${sent}, Failed: ${failed}`,
            sent,
            failed,
        });

    } catch (error) {
        console.error('POST /api/admin/push-notification/send error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
