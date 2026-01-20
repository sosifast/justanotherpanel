import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createNewsSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    content: z.string().min(1, 'Content is required'),
    status: z.enum(['ACTIVE', 'NOT_ACTIVE']).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = createNewsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const { subject, content, status } = result.data;

        const news = await prisma.news.create({
            data: {
                subject,
                content,
                status: status as any || 'ACTIVE',
            },
        });

        return NextResponse.json(news, { status: 201 });
    } catch (error) {
        console.error('Error creating news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
