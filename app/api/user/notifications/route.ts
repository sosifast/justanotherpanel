import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

// GET - Get notification preferences
export async function GET(req: Request) {
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

        // Get or create notification preferences
        let preferences = await prisma.notificationPreferences.findUnique({
            where: { id_user: userId }
        });

        if (!preferences) {
            // Create default preferences
            preferences = await prisma.notificationPreferences.create({
                data: {
                    id_user: userId,
                    email_order_updates: true,
                    email_deposit_updates: true,
                    email_ticket_updates: true,
                    email_marketing: false
                }
            });
        }

        return NextResponse.json({ preferences }, { status: 200 });
    } catch (error: any) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Update notification preferences
export async function PATCH(req: Request) {
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

        const body = await req.json();

        // Update preferences
        const updateData: any = {};
        if (body.email_order_updates !== undefined) updateData.email_order_updates = body.email_order_updates;
        if (body.email_deposit_updates !== undefined) updateData.email_deposit_updates = body.email_deposit_updates;
        if (body.email_ticket_updates !== undefined) updateData.email_ticket_updates = body.email_ticket_updates;
        if (body.email_marketing !== undefined) updateData.email_marketing = body.email_marketing;

        const preferences = await prisma.notificationPreferences.upsert({
            where: { id_user: userId },
            update: updateData,
            create: {
                id_user: userId,
                ...updateData
            }
        });

        return NextResponse.json({ preferences }, { status: 200 });
    } catch (error: any) {
        console.error('Update notifications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
