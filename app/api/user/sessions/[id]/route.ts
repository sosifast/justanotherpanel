import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

// DELETE - Revoke specific session
export async function DELETE(
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
        const sessionId = parseInt(id);

        // Verify session belongs to user
        const session = await prisma.userSession.findFirst({
            where: {
                id: sessionId,
                id_user: userId
            }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Prevent revoking current session
        if (session.token === token) {
            return NextResponse.json(
                { error: 'Cannot revoke current session' },
                { status: 403 }
            );
        }

        // Delete session
        await prisma.userSession.delete({
            where: { id: sessionId }
        });

        return NextResponse.json(
            { message: 'Session revoked successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Revoke session error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
