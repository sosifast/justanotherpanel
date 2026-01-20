import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET - Get all users
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                full_name: true,
                username: true,
                email: true,
                balance: true,
                role: true,
                status: true,
                created_at: true,
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// POST - Create new user
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { full_name, username, email, password, role, status, balance } = body;

        // Validate required fields
        if (!full_name || !username || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or username already exists' },
                { status: 409 }
            );
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
                role: role || 'MEMBER',
                status: status || 'ACTIVE',
                balance: balance || 0,
            },
            select: {
                id: true,
                full_name: true,
                username: true,
                email: true,
                balance: true,
                role: true,
                status: true,
                created_at: true,
            }
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
