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
