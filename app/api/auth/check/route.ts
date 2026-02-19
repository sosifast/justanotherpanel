import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/auth';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ isAuthenticated: false }, { status: 200 });
        }

        try {
            const { payload } = await jwtVerify(token, getJwtSecret());

            return NextResponse.json({
                isAuthenticated: true,
                user: {
                    id: payload.sub,
                    username: payload.username,
                    role: payload.role
                }
            }, { status: 200 });
        } catch (error) {
            // Invalid token
            return NextResponse.json({ isAuthenticated: false }, { status: 200 });
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
}
