import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET)
        );
        const userId = (decoded.payload as any).id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { reseller: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isReseller = (user as any).reseller?.status === 'ACTIVE';

        // Fetch first active service for sample
        const service = await prisma.service.findFirst({
            where: { status: 'ACTIVE' },
            include: { category: true }
        });

        // Fetch latest order for sample
        const order = await prisma.order.findFirst({
            where: { id_user: userId },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({
            service: service ? {
                service: service.id,
                name: service.name,
                type: service.type,
                category: service.category.name,
                rate: isReseller ? Number(service.price_reseller) : Number(service.price_sale),
                min: service.min,
                max: service.max,
                note: service.note,
                refill: service.refill,
                cancel: false
            } : null,
            order: order ? {
                order: order.id,
                charge: Number(isReseller ? order.price_seller : order.price_sale) * order.quantity / 1000,
                start_count: order.start_count || 0,
                status: order.status,
                remains: order.remains || 0,
                currency: 'USD'
            } : null,
            balance: {
                balance: Number(user.balance).toFixed(2),
                currency: 'USD'
            }
        });

    } catch (error) {
        console.error('API Docs Sample Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
