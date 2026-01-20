import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

// GET - List all active sessions
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
        const userId = parseInt(payload.sub as string);

        const sessions = await prisma.userSession.findMany({
            where: { id_user: userId },
            orderBy: { last_active: 'desc' },
            select: {
                id: true,
                token: true,
                ip_address: true,
                user_agent: true,
                device: true,
                location: true,
                last_active: true,
                created_at: true
            }
        });

        // Mark current session
        const sessionsWithCurrent = sessions.map(session => ({
            ...session,
            is_current: session.token === token
        }));

        return NextResponse.json({ sessions: sessionsWithCurrent }, { status: 200 });
    } catch (error: any) {
        console.error('Get sessions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Revoke all sessions except current
export async function DELETE(req: Request) {
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

        // Delete all sessions except current
        await prisma.userSession.deleteMany({
            where: {
                id_user: userId,
                NOT: { token }
            }
        });

        return NextResponse.json(
            { message: 'All other sessions revoked successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Revoke sessions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
