
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    try {
        const { full_name, username, email, password } = await req.json();

        // Basic validation
        if (!full_name || !username || !email || !password) {
            return errorResponse('Missing required fields', 400);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return errorResponse('Email already exists', 400);
            }
            return errorResponse('Username already exists', 400);
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                full_name,
                username,
                email,
                password: hashedPassword,
                role: 'MEMBER',
                status: 'ACTIVE',
                balance: 0
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return successResponse(userWithoutPassword, 'User created successfully', 201);

    } catch (error: any) {
        console.error('Mobile Registration error:', error);
        return errorResponse('Internal server error', 500);
    }
}
