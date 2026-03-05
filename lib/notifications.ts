import { prisma } from '@/lib/prisma';
import { getPusherClient } from '@/lib/pusher';
import { sendPushToUser } from '@/lib/firebase';

type NotificationType = 'ORDER' | 'DEPOSIT' | 'TICKET' | 'SYSTEM';

export interface NotificationPayload {
    userId: number;
    title: string;
    message: string;
    type: NotificationType;
    relatedId?: number;
    /** Optional extra data attached to the push notification (key-value strings) */
    pushData?: Record<string, string>;
    /** Optional image URL to show in the push notification */
    pushImageUrl?: string;
}

/**
 * Creates a notification record in the DB,
 * triggers a Pusher real-time event,
 * and sends a Firebase FCM push notification to all user devices.
 *
 * All three operations are non-blocking — failures are logged but never thrown.
 */
export async function createNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationType,
    relatedId?: number,
    pushData?: Record<string, string>,
    pushImageUrl?: string
) {
    try {
        // 1. Save to Database
        const notification = await prisma.notification.create({
            data: {
                id_user: userId,
                title,
                message,
                type,
                related_id: relatedId,
                is_read: false,
            },
        });

        // 2. Trigger Pusher real-time event (non-blocking)
        getPusherClient()
            .then((pusher) =>
                pusher.trigger(`private-user-${userId}`, 'notification', {
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    created_at: notification.created_at,
                })
            )
            .catch((err) => console.error('[Pusher] trigger error:', err));

        // 3. Send Firebase FCM push notification (non-blocking)
        sendPushToUser(userId, {
            title,
            body: message,
            imageUrl: pushImageUrl,
            data: {
                type,
                ...(relatedId ? { related_id: String(relatedId) } : {}),
                ...(pushData ?? {}),
            },
        }).catch((err) => console.error('[Firebase] push error:', err));

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
}
