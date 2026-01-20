import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

type TicketMessage = {
    sender: string;
    content: string;
    created_at: string;
};

// GET - List all tickets (admin view)
export async function GET(req: Request) {
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

        // Parse query params
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }
        if (priority && priority !== 'all') {
            where.priority = priority.toUpperCase();
        }
        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { user: { username: { contains: search, mode: 'insensitive' } } },
                { user: { full_name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        // Get tickets with user info
        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            full_name: true,
                            email: true
                        }
                    }
                },
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
        console.error('Get admin tickets error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
