import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { successResponse, errorResponse } from '@/lib/api-response';
import { loginSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/security';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-it';

/**
 * POST /api-mobile/auth/login
 *
 * Mengautentikasi user dan mengembalikan JWT token.
 * Email atau username keduanya dapat digunakan sebagai identifier login.
 *
 * Auth: NOT required — public endpoint.
 *
 * Request Body:
 *   {
 *     "email"    : string  // required — bisa berupa email atau username
 *     "password" : string  // required
 *   }
 *
 * Response (200):
 *   {
 *     "token" : string  // JWT token, valid 24 jam (алгоритм HS256)
 *     "user"  : User    // data user tanpa field password
 *   }
 *
 * Errors:
 *   400 — Missing required fields / Validation failed
 *   401 — Invalid credentials (email/password salah)
 *   403 — Account is not active
 *   500 — Internal Server Error
 */
export async function POST(req: NextRequest) {
    try {
        // Rate limiting: 5 login attempts per minute per IP
        const ip = req.headers.get('x-forwarded-for') || 'anon';
        const limiter = await rateLimit(`login-${ip}`, 5, 60);
        if (!limiter.success) {
            return errorResponse('Too many login attempts. Please try again in a minute.', 429);
        }

        const body = await req.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { email, password } = validation.data;

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
