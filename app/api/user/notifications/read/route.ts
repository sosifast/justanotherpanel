import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { SeverityNumber } from '@opentelemetry/api-logs'
import { after } from 'next/server'
import { loggerProvider } from '@/instrumentation'

const logger = loggerProvider.getLogger('justanotherpanel')

export async function POST(req: Request) {
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

        const body = await req.json();
        const id = body.id;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        if (id === 'all') {
            await prisma.notification.updateMany({
                where: { id_user: userId, is_read: false },
                data: { is_read: true }
            });
        } else {
            await prisma.notification.update({
                where: { id: parseInt(id), id_user: userId },
                data: { is_read: true }
            });
        }

        // Log successful operation
        after(async () => {
            logger.emit({
                body: `Notification read: ${id}`,
                severityNumber: SeverityNumber.INFO,
                attributes: {
                    userId: userId,
                    notificationId: id,
                    endpoint: '/api/user/notifications/read',
                    method: 'POST',
                },
            });
            await loggerProvider.forceFlush();
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        // Log error
        after(async () => {
            logger.emit({
                body: `Error reading notification: ${error.message}`,
                severityNumber: SeverityNumber.ERROR,
                attributes: {
                    endpoint: '/api/user/notifications/read',
                    method: 'POST',
                },
            });
            await loggerProvider.forceFlush();
        });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
