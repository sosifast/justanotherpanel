import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from './auth';

export async function verifyMobileToken(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const { payload } = await jwtVerify(token, getJwtSecret());

        // Check if user still exists and is active
        // Supporting both 'sub' (from existing login) and 'id'
        const userId = Number(payload.sub || payload.id);
        if (isNaN(userId)) return null;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.status !== 'ACTIVE') {
            return null;
        }

        return user;
    } catch (error) {
        return null;
    }
}
