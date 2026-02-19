import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, getJwtSecret());
        const role = payload.role as string;

        if (role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const notifications = await prisma.adminNotification.findMany({
            orderBy: { created_at: 'desc' },
            take: 20
        });

        const unreadCount = await prisma.adminNotification.count({
            where: { is_read: false }
        });

        return NextResponse.json({ notifications, unread_count: unreadCount });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
