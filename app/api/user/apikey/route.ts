import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// GET - Get current API key (masked)
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

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { apikey: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Mask API key if exists
        let maskedKey = null;
        if (user.apikey) {
            const keyLength = user.apikey.length;
            maskedKey = user.apikey.substring(0, 3) + '•'.repeat(keyLength - 7) + user.apikey.substring(keyLength - 4);
        }

        return NextResponse.json({
            apikey: user.apikey,
            masked_apikey: maskedKey,
            has_apikey: !!user.apikey
        }, { status: 200 });
    } catch (error: any) {
        console.error('Get API key error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Generate new API key
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

        // Generate new API key
        const prefix = 'sk_';
        const randomBytes = crypto.randomBytes(32).toString('hex');
        const newApiKey = prefix + randomBytes;

        // Update user with new API key
        const user = await prisma.user.update({
            where: { id: userId },
            data: { apikey: newApiKey },
            select: { apikey: true }
        });

        return NextResponse.json({
            apikey: user.apikey,
            message: 'API key generated successfully'
        }, { status: 200 });
    } catch (error: any) {
        console.error('Generate API key error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Revoke API key
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

        // Revoke API key
        await prisma.user.update({
            where: { id: userId },
            data: { apikey: null }
        });

        return NextResponse.json(
            { message: 'API key revoked successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Revoke API key error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
