import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { triggerPusher } from '@/lib/pusher';

type TicketMessage = {
    sender: string;
    content: string;
    image_url?: string | null;
    created_at: string;
};

const getSecret = () => new TextEncoder().encode(
    process.env.JWT_SECRET || 'default-secret-key-change-it'
);

// GET - Get ticket detail with messages (admin)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(token, getSecret());
        if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id } = await params;
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: { user: { select: { id: true, username: true, full_name: true, email: true } } }
        });

        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        return NextResponse.json({ ticket }, { status: 200 });
    } catch (error: any) {
        console.error('Get admin ticket detail error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update ticket status / send admin reply
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(token, getSecret());
        if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id } = await params;
        const ticketId = parseInt(id);
        const body = await req.json();

        // Load current ticket (to get owner id and existing messages)
        const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!existing) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        const updateData: any = {};

        // ── Admin Reply ──────────────────────────────────────────────────────
        if (body.message || body.image_url) {
            const existingMessages = Array.isArray(existing.messages)
                ? (existing.messages as TicketMessage[])
                : [];

            const newMessage: TicketMessage = {
                sender: 'admin',
                content: body.message || '',
                image_url: body.image_url || null,
                created_at: new Date().toISOString()
            };

            updateData.messages = [...existingMessages, newMessage];
            updateData.status = 'ANSWERED';

            const ticket = await prisma.ticket.update({ where: { id: ticketId }, data: updateData });

            // Realtime: push new message to ticket channel (user sees it immediately)
            await triggerPusher(`private-ticket-${ticketId}`, 'new-message', {
                ticketId,
                sender: 'admin',
                message: newMessage
            });

            // Notify ticket owner
            await createNotification(
                existing.id_user,
                'Ticket Replied',
                `Your ticket "${existing.subject}" has been answered by support.`,
                'TICKET',
                ticketId
            );

            return NextResponse.json({ ticket, message: newMessage }, { status: 200 });
        }

        // ── Status / Priority Update ─────────────────────────────────────────
        if (body.status) updateData.status = body.status.toUpperCase();
        if (body.priority) updateData.priority = body.priority.toUpperCase();

        const ticket = await prisma.ticket.update({ where: { id: ticketId }, data: updateData });

        // Notify user about status change
        if (body.status) {
            await createNotification(
                existing.id_user,
                'Ticket Status Updated',
                `Your ticket "${existing.subject}" status changed to ${body.status.toUpperCase()}.`,
                'TICKET',
                ticketId
            );

            // Realtime: notify ticket channel
            await triggerPusher(`private-ticket-${ticketId}`, 'status-changed', {
                ticketId,
                status: ticket.status
            });
        }

        return NextResponse.json({ ticket }, { status: 200 });
    } catch (error: any) {
        console.error('Update admin ticket error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
