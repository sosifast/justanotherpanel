import Pusher from 'pusher';
import { prisma } from '@/lib/prisma';

export async function getPusherClient() {
    const settings = await prisma.setting.findFirst();

    return new Pusher({
        appId: settings?.pusher_app_id || process.env.PUSHER_APP_ID || '',
        key: settings?.pusher_app_key || process.env.PUSHER_APP_KEY || '',
        secret: settings?.pusher_app_secret || process.env.PUSHER_APP_SECRET || '',
        cluster: settings?.pusher_app_cluster || process.env.PUSHER_APP_CLUSTER || 'us2',
        useTLS: true,
    });
}

/**
 * Fire-and-forget Pusher trigger — never throws, so caller doesn't break if Pusher isn't configured.
 */
export async function triggerPusher(channel: string, event: string, data: object) {
    try {
        const settings = await prisma.setting.findFirst();
        const appId = settings?.pusher_app_id || process.env.PUSHER_APP_ID;
        const key = settings?.pusher_app_key || process.env.PUSHER_APP_KEY;
        const secret = settings?.pusher_app_secret || process.env.PUSHER_APP_SECRET;
        
        if (!appId || !key || !secret) return;

        const pusher = new Pusher({
            appId,
            key,
            secret,
            cluster: settings?.pusher_app_cluster || process.env.PUSHER_APP_CLUSTER || 'us2',
            useTLS: true,
        });

        await pusher.trigger(channel, event, data);
    } catch (err) {
        console.warn(`[Pusher] Failed to trigger ${event} on ${channel}:`, err);
    }
}
