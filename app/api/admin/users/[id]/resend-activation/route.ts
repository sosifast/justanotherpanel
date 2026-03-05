import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import crypto from 'crypto';
import { sendEmail } from '@/lib/brevo';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
        }

        // 1. Auth Check (Admin/Staff only)
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;
        if (role !== 'ADMIN' && role !== 'STAFF') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // 2. Fetch User
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Allowed for INACTIVE or NOT_ACTIVE (if any legacy data exists)
        if (user.status !== 'INACTIVE') {
            return NextResponse.json({ error: 'Only inactive users can receive activation links' }, { status: 400 });
        }

        // 3. Generate or Refresh Activation Token
        const activationToken = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({
            where: { id: userId },
            data: { activation_token: activationToken }
        });

        // 4. Send Email via Brevo
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const activationLink = `${baseUrl}/auth/activate/${activationToken}`;

        await sendEmail({
            to: user.email,
            subject: 'Activate Your Account',
            htmlContent: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #333;">Account Activation</h2>
                  <p>Hello ${user.full_name || user.username},</p>
                  <p>An administrator has requested to resend your account activation link. Please click the button below to activate your account:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${activationLink}" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activate Account</a>
                  </div>
                  <p>Or copy and paste this link in your browser:</p>
                  <p style="color: #666; font-size: 13px;">${activationLink}</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                  <p style="font-size: 12px; color: #999;">If you didn't expect this email, you can safely ignore it.</p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: 'Activation link resent successfully' });

    } catch (error: any) {
        console.error('Resend Activation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
