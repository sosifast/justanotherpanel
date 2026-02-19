import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/auth';

type TicketMessage = {
    sender: string;
    content: string;
    image_url?: string | null;
    created_at: string;
};

// GET - List all tickets for authenticated user
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, getJwtSecret());
        const userId = parseInt(payload.sub as string);

        // Parse query params
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = { id_user: userId };
        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }

        // Get tickets
        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                orderBy: { updated_at: 'desc' },
                skip,
                take: limit
            }),
            prisma.ticket.count({ where })
        ]);

        // Add message count to each ticket
        const ticketsWithCount = tickets.map(ticket => ({
            ...ticket,
            _count: {
                messages: Array.isArray(ticket.messages) ? (ticket.messages as TicketMessage[]).length : 0
            }
        }));

        return NextResponse.json({
            tickets: ticketsWithCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error('Get tickets error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new ticket
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, getJwtSecret());
        const userId = parseInt(payload.sub as string);

        const { subject, category, message, image_url } = await req.json();

        if (!subject || !category || (!message && !image_url)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create ticket with initial message in JSON
        const initialMessage: TicketMessage = {
            sender: 'user',
            content: message || '',
            image_url: image_url || null,
            created_at: new Date().toISOString()
        };

        const ticket = await prisma.ticket.create({
            data: {
                id_user: userId,
                subject,
                category,
                status: 'OPEN',
                priority: 'MEDIUM',
                messages: [initialMessage]
            }
        });

        return NextResponse.json({ ticket }, { status: 201 });
    } catch (error: any) {
        console.error('Create ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
