import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { fullName, username, email, password } = await req.json();

    // Basic validation
    if (!fullName || !username || !email || !password) {
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
        if (existingUser.email === email) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Username already exists' },
            { status: 400 }
        );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        full_name: fullName,
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

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
