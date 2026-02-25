import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getPusherClient } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = () => new TextEncoder().encode(
    process.env.JWT_SECRET || 'default-secret-key-change-it'
);

/** Verify JWT from cookie (web) or Bearer header (mobile). Returns payload or null. */
async function verifyToken(req: Request) {
    try {
        // 1. Try cookie first (web)
        const cookieStore = await cookies();
        let token = cookieStore.get('token')?.value;

        // 2. Fallback to Bearer header (mobile)
        if (!token) {
            const authHeader = req.headers.get('authorization') || '';
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7);
            }
        }

        if (!token) return null;
        const { payload } = await jwtVerify(token, JWT_SECRET());
        return payload;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const payload = await verifyToken(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(payload.sub as string);
        const role = payload.role as string;

        const formData = await req.formData();
        const socketId = formData.get('socket_id') as string;
        const channelName = formData.get('channel_name') as string;

        const pusher = await getPusherClient();

        // ── Channel Authorization Rules ──────────────────────────────────────

        // 1. private-user-{id}  → only the user themselves
        if (channelName === `private-user-${userId}`) {
            const auth = pusher.authenticate(socketId, channelName);
            return NextResponse.json(auth);
        }

        // 2. private-admin → only ADMIN role
        if (channelName === 'private-admin') {
            if (role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            const auth = pusher.authenticate(socketId, channelName);
            return NextResponse.json(auth);
        }

        // 3. private-staff → ADMIN or STAFF
        if (channelName === 'private-staff') {
            if (role !== 'ADMIN' && role !== 'STAFF') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            const auth = pusher.authenticate(socketId, channelName);
            return NextResponse.json(auth);
        }

        // 4. private-ticket-{ticketId} → ticket owner, ADMIN or STAFF
        const ticketMatch = channelName.match(/^private-ticket-(\d+)$/);
        if (ticketMatch) {
            const ticketId = parseInt(ticketMatch[1]);

            if (role === 'ADMIN' || role === 'STAFF') {
                const auth = pusher.authenticate(socketId, channelName);
                return NextResponse.json(auth);
            }

            // Verify ticket ownership for regular users
            const ticket = await prisma.ticket.findFirst({
                where: { id: ticketId, id_user: userId }
            });

            if (!ticket) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const auth = pusher.authenticate(socketId, channelName);
            return NextResponse.json(auth);
        }

        // All other channels denied
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    } catch (error) {
        console.error('Pusher auth error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
