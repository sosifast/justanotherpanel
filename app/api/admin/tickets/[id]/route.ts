import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

// GET - Get ticket detail with messages (admin)
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
        const role = payload.role as string;

        if (role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const ticketId = parseInt(id);

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        email: true
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
        console.error('Get admin ticket detail error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Update ticket status/priority (admin)
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
        const role = payload.role as string;

        if (role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const ticketId = parseInt(id);
        const body = await req.json();

        const updateData: any = {};
        if (body.status) {
            updateData.status = body.status.toUpperCase();
        }
        if (body.priority) {
            updateData.priority = body.priority.toUpperCase();
        }

        const ticket = await prisma.ticket.update({
            where: { id: ticketId },
            data: updateData
        });

        return NextResponse.json({ ticket }, { status: 200 });
    } catch (error: any) {
        console.error('Update admin ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
