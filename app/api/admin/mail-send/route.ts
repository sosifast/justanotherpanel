import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sendEmail } from '@/lib/brevo';

export async function POST(req: Request) {
    try {
        // 1. Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;
        if (role !== 'ADMIN' && role !== 'STAFF') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // 2. Parse Body
        const { target, subject, content, selectedUserIds } = await req.json();

        if (!subject || !content) {
            return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
        }

        // 3. Get Recipients
        let recipients: { email: string; full_name: string | null; username: string }[] = [];

        if (target === 'ALL_MEMBERS') {
            recipients = await prisma.user.findMany({
                where: { role: 'MEMBER', status: 'ACTIVE' },
                select: { email: true, full_name: true, username: true }
            });
        } else if (target === 'SELECTED_USERS' && Array.isArray(selectedUserIds)) {
            recipients = await prisma.user.findMany({
                where: { id: { in: selectedUserIds } },
                select: { email: true, full_name: true, username: true }
            });
        } else {
            return NextResponse.json({ error: 'Invalid target or no users selected' }, { status: 400 });
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
        }

        // 4. Send Emails (Sequential to avoid rate limits, or use Brevo batch if possible)
        // Note: For large lists, a queue system is better, but for now we'll do promise.all or sequential
        // Brevo v3 has batch, v4 also supports it. But our sendEmail helper is single.

        let successCount = 0;
        let failCount = 0;

        for (const user of recipients) {
            // Personalize content if needed
            const personalizedContent = content
                .replace(/{name}/g, user.full_name || user.username)
                .replace(/{username}/g, user.username);

            const result = await sendEmail({
                to: user.email,
                subject: subject,
                htmlContent: personalizedContent
            });

            if (result.success) successCount++;
            else failCount++;
        }

        return NextResponse.json({
            message: `Broadcast complete. Sent: ${successCount}, Failed: ${failCount}`,
            successCount,
            failCount
        });

    } catch (error: any) {
        console.error('Broadcast Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helper to search users for the multiple selector
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query } },
                    { username: { contains: query } },
                    { full_name: { contains: query } }
                ]
            },
            take: 20,
            select: {
                id: true,
                email: true,
                username: true,
                full_name: true
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
