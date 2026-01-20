import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

// GET - Get ticket detail with messages
export async function GET(
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

        // Get ticket and verify ownership
        const ticket = await prisma.ticket.findFirst({
            where: {
                id: ticketId,
                id_user: userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ ticket }, { status: 200 });
    } catch (error: any) {
        console.error('Get ticket detail error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Update ticket (close only)
export async function PATCH(
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
        const { status } = await req.json();

        // Verify ownership
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

        // Users can only close tickets
        if (status !== 'CLOSED') {
            return NextResponse.json(
                { error: 'Users can only close tickets' },
                { status: 403 }
            );
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'CLOSED' }
        });

        return NextResponse.json({ ticket: updatedTicket }, { status: 200 });
    } catch (error: any) {
        console.error('Update ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
