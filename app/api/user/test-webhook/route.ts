import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { sendOrderWebhook } from '@/lib/webhook';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-it'
        );
        const { payload } = await jwtVerify(token, secret);
        const userId = parseInt(payload.sub as string);

        // Find last order for this user
        const order = await prisma.order.findFirst({
            where: { id_user: userId },
            orderBy: { created_at: 'desc' }
        });

        if (!order) {
            return NextResponse.json({ error: 'No orders found to test webhook' }, { status: 404 });
        }

        // Send webhook
        const result = await sendOrderWebhook(order.id);

        if (result.sent) {
            return NextResponse.json({ message: 'Webhook sent successfully', orderId: order.id });
        } else {
            return NextResponse.json({ error: 'Failed to send webhook', details: result }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Test webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
