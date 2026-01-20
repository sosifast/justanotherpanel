import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ImageKit from 'imagekit';

export async function GET() {
    try {
        // Get ImageKit credentials from settings
        const settings = await prisma.setting.findFirst();

        if (!settings?.imagekit_publickey || !settings?.imagekit_privatekey || !settings?.imagekit_url) {
            return NextResponse.json(
                { error: 'ImageKit not configured. Please set up ImageKit credentials in Settings.' },
                { status: 400 }
            );
        }

        const imagekit = new ImageKit({
            publicKey: settings.imagekit_publickey,
            privateKey: settings.imagekit_privatekey,
            urlEndpoint: settings.imagekit_url,
        });

        const authenticationParameters = imagekit.getAuthenticationParameters();

        return NextResponse.json(authenticationParameters);
    } catch (error) {
        console.error('Error generating ImageKit auth:', error);
        return NextResponse.json({ error: 'Failed to generate authentication' }, { status: 500 });
    }
}
