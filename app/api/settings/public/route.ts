import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const settings = await prisma.setting.findFirst();

        return NextResponse.json({
            key: settings?.pusher_app_key || process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'app-key',
            cluster: settings?.pusher_app_cluster || process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'us2',
            site_name: settings?.site_name || "JustAnotherPanel",
            logo_imagekit_url: settings?.logo_imagekit_url,
            imagekit_publickey: settings?.imagekit_publickey,
            imagekit_url: settings?.imagekit_url,
        });
    } catch (error) {
        // Fallback to minimal default to prevent crash, though client won't work
        return NextResponse.json({
            key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'app-key',
            cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'us2',
        });
    }
}
