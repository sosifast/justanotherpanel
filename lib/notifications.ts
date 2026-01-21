import { prisma } from '@/lib/prisma';
import { getPusherClient } from '@/lib/pusher';

type NotificationType = 'ORDER' | 'DEPOSIT' | 'TICKET' | 'SYSTEM';

export async function createNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationType,
    relatedId?: number
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
                is_read: false
            }
        });

        // 2. Trigger Pusher
        const pusher = await getPusherClient();
        // Channel: private-user-{userId}
        // Event: notification
        await pusher.trigger(`private-user-${userId}`, 'notification', {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            created_at: notification.created_at
        });

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        // Don't throw, just return null so the main process doesn't fail
        return null;
    }
}
