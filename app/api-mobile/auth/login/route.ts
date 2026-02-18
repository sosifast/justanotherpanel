
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { successResponse, errorResponse } from '@/lib/api-response';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-it';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return errorResponse('Missing required fields', 400);
        }

        // Find user by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        });

        if (!user) {
            return errorResponse('Invalid credentials', 401);
        }

        // Check password
        const isValid = await compare(password, user.password);

        if (!isValid) {
            return errorResponse('Invalid credentials', 401);
        }

        if (user.status !== 'ACTIVE') {
            return errorResponse('Account is not active', 403);
        }

        // Create JWT
        const secret = new TextEncoder().encode(JWT_SECRET);

        const token = await new SignJWT({
            sub: user.id.toString(),
            username: user.username,
            role: user.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return successResponse({
            token,
            user: userWithoutPassword
        }, 'Login successful');

    } catch (error: any) {
        console.error('Mobile Login error:', error);
        return errorResponse('Internal server error', 500);
    }
}
