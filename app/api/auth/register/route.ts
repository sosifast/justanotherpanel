import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { createAdminNotification } from '@/lib/admin-notifications';

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

    // Email Domain Validation
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      return NextResponse.json(
        { error: 'Registration is only allowed using Gmail, Yahoo, or Outlook emails.' },
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

    // Generate activation token
    const crypto = await import('crypto');
    const activationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        full_name: fullName,
        username,
        email,
        password: hashedPassword,
        role: 'MEMBER',
        status: 'INACTIVE', // Set to INACTIVE as requested
        balance: 0,
        activation_token: activationToken
      }
    });

    // Send Activation Email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const activationLink = `${baseUrl}/auth/activate/${activationToken}`;

    const { sendEmail } = await import('@/lib/brevo');
    await sendEmail({
      to: email,
      subject: 'Activate Your Account',
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Welcome to JustAnotherPanel!</h2>
          <p>Thank you for registering. Please activate your account by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationLink}" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activate Account</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; font-size: 13px;">${activationLink}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `
    }).catch(err => console.error('Failed to send activation email:', err));

    // Notify Admin
    await createAdminNotification(
      'New User Registered',
      `User ${username} has registered (Pending Activation).`,
      'NEW_USER',
      user.id
    );

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
