import { prisma } from '@/lib/prisma';
import { getPusherClient } from '@/lib/pusher';

type AdminNotificationType = 'NEW_USER' | 'NEW_ORDER' | 'ORDER_UPDATE' | 'NEW_DEPOSIT' | 'DEPOSIT_UPDATE' | 'NEW_TICKET' | 'TICKET_UPDATE' | 'SYSTEM';

export async function createAdminNotification(
    title: string,
    message: string,
    type: AdminNotificationType,
    relatedId?: number
) {
    try {
        // 1. Save to Database
        const notification = await prisma.adminNotification.create({
            data: {
                title,
                message,
                type,
                related_id: relatedId,
                is_read: false
            }
        });

        // 2. Trigger Pusher
        const pusher = await getPusherClient();
        // Channel: private-admin
        // Event: admin-notification
        await pusher.trigger('private-admin', 'admin-notification', {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            created_at: notification.created_at
        });

        return notification;
    } catch (error) {
        console.error('Failed to create admin notification:', error);
        return null;
    }
}
