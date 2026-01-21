import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

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

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        if (!q || q.length < 2) {
            return NextResponse.json({ results: [] });
        }

        // Parallel searches
        const [users, orders, tickets, services] = await Promise.all([
            // Search Users
            prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: q } },
                        { email: { contains: q as string } }, // cast to string, prisma expects string filter
                        { full_name: { contains: q as string } }
                    ]
                },
                take: 5,
                select: { id: true, username: true, email: true, full_name: true }
            }),
            // Search Orders
            prisma.order.findMany({
                where: {
                    OR: [
                        { id: parseInt(q) ? parseInt(q) : undefined }, // Only ID if query is number
                        { link: { contains: q, } }
                        // prisma doesn't support contains on int fields natively like string.
                    ]
                },
                take: 5,
                include: { service: { select: { name: true } } }
            }),
            // Search Tickets
            prisma.ticket.findMany({
                where: {
                    OR: [
                        { id: parseInt(q) ? parseInt(q) : undefined },
                        { subject: { contains: q } }
                    ]
                },
                take: 5
            }),
            // Search Services
            prisma.service.findMany({
                where: {
                    name: { contains: q }
                },
                take: 5
            })
        ]);

        const results = [
            ...users.map(u => ({
                id: u.id,
                type: 'USER',
                title: u.username,
                subtitle: u.email,
                url: `/admin/user?search=${u.username}`
            })),
            ...orders.map(o => ({
                id: o.id,
                type: 'ORDER',
                title: `Order #${o.id}`,
                subtitle: `${o.service.name} - ${o.link}`,
                url: `/admin/smm/history_order?search=${o.id}`
            })),
            ...tickets.map(t => ({
                id: t.id,
                type: 'TICKET',
                title: t.subject,
                subtitle: `Ticket #${t.id} - ${t.status}`,
                url: `/admin/tickets?search=${t.id}` // Ideally tickets page should support ID search or we just navigate
            })),
            ...services.map(s => ({
                id: s.id,
                type: 'SERVICE',
                title: s.name,
                subtitle: `Service #${s.id}`,
                url: `/admin/smm/service?search=${s.name}`
            }))
        ];

        return NextResponse.json({ results });

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
