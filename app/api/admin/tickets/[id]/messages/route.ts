import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

type TicketMessage = {
    sender: string;
    content: string;
    created_at: string;
};

// POST - Send reply as support (admin)
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
        const role = payload.role as string;

        if (role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const ticketId = parseInt(id);
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            );
        }

        // Verify ticket exists
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // Get existing messages and append new one
        const existingMessages = Array.isArray(ticket.messages)
            ? (ticket.messages as TicketMessage[])
            : [];

        const newMessage: TicketMessage = {
            sender: 'support',
            content,
            created_at: new Date().toISOString()
        };

        const updatedMessages = [...existingMessages, newMessage];

        // Update ticket with new messages and status
        await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                messages: updatedMessages as any,
                status: 'ANSWERED'
            }
        });

        // Notify user
        await createNotification(
            ticket.id_user,
            `Ticket #${ticket.id} Updated`,
            `Support has replied to your ticket: "${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}"`,
            'TICKET',
            ticket.id
        );

        return NextResponse.json({ message: newMessage }, { status: 201 });
    } catch (error: any) {
        console.error('Send admin reply error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
