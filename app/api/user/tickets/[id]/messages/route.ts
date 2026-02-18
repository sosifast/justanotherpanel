import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

type TicketMessage = {
    sender: string;
    content: string;
    image_url?: string | null;
    created_at: string;
};

// POST - Send message to ticket
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const ticketId = parseInt(id);
        const { content, image_url } = await req.json();

        if (!content && !image_url) {
            return NextResponse.json(
                { error: 'Message content or image is required' },
                { status: 400 }
            );
        }

        // Verify ownership and ticket is not closed
        const ticket = await prisma.ticket.findFirst({
            where: {
                id: ticketId,
                id_user: userId
            }
        });

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        if (ticket.status === 'CLOSED') {
            return NextResponse.json(
                { error: 'Cannot send message to closed ticket' },
                { status: 403 }
            );
        }

        // Get existing messages and append new one
        const existingMessages = Array.isArray(ticket.messages)
            ? (ticket.messages as TicketMessage[])
            : [];

        const newMessage: TicketMessage = {
            sender: 'user',
            content: content || '',
            image_url: image_url || null,
            created_at: new Date().toISOString()
        };

        const updatedMessages = [...existingMessages, newMessage];

        // Update ticket with new messages and status
        await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                messages: updatedMessages,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ message: newMessage }, { status: 201 });
    } catch (error: any) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
