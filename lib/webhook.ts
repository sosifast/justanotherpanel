import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { createNotification } from '@/lib/notifications';

export async function sendOrderWebhook(orderId: number) {
    try {
        // 1. Fetch order and user with webhook_url
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        id: true,
                        webhook_url: true
                    }
                }
            }
        }) as any;

        if (!order) {
            return { sent: false, reason: 'Order not found' };
        }

        // 2. Send Internal Notification (Realtime + Push FCM)
        // This should always happen regardless of webhook_url
        await createNotification(
            order.user.id,
            `Order #${order.id} Updated`,
            `Your order status for order #${order.id} is now ${order.status}.`,
            'ORDER',
            order.id,
            { related_id: String(order.id), screen: 'order_detail' }
        );

        if (!order.user.webhook_url) {
            return { sent: false, reason: 'No webhook URL configured' };
        }

        // 3. Prepare payload (Standard SMM Format)
        const payload = {
            order: order.id,
            status: order.status,
            charge: order.price_sale,
            start_count: order.start_count || 0,
            remains: order.remains || 0,
            currency: 'USD'
        };

        // 4. Send webhook (External)
        await axios.post(order.user.webhook_url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'JAP-Webhook-System/1.0'
            },
            timeout: 5000
        });

        return { sent: true };

    } catch (error: any) {
        console.error(`Failed to send webhook for order ${orderId}:`, error.message);
        return { sent: false, error: error.message };
    }
}
