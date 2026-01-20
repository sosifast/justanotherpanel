import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateNewsSchema = z.object({
    subject: z.string().min(1, 'Subject is required').optional(),
    content: z.string().min(1, 'Content is required').optional(),
    status: z.enum(['ACTIVE', 'NOT_ACTIVE']).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const result = updateNewsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const { subject, content, status } = result.data;

        const news = await prisma.news.update({
            where: { id: parseInt(id) },
            data: {
                subject,
                content,
                status: status as any,
            },
        });

        return NextResponse.json(news);
    } catch (error) {
        console.error('Error updating news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.news.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting news:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
