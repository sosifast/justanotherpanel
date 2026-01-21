import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getPusherClient } from '@/lib/pusher';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-it'
        );
        const { payload } = await jwtVerify(token, secret);
        const userId = parseInt(payload.sub as string);

        const formData = await req.formData();
        const socketId = formData.get('socket_id') as string;
        const channelName = formData.get('channel_name') as string;

        // Verify channel access
        // logic: only allow private-user-{userId}
        const expectedChannel = `private-user-${userId}`;
        if (channelName !== expectedChannel) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const pusher = await getPusherClient();
        const authResponse = pusher.authenticate(socketId, channelName);
        return NextResponse.json(authResponse);

    } catch (error) {
        // Pusher auth expects 403 on failure usually, or just error
        console.error("Pusher auth error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
