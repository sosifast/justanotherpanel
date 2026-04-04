import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(req: Request) {
    try {
        // 1. Auth Check (Admin only)
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;
        if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // 2. Logic: Users inactive for more than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find them first to inform user how many found/deleted (optional but nice)
        const toDeleteCount = await prisma.user.count({
            where: {
                status: 'INACTIVE',
                created_at: {
                  lte: thirtyDaysAgo
                }
            }
        });

        if (toDeleteCount === 0) {
            return NextResponse.json({ success: true, message: 'No inactive users found to clean up', deletedCount: 0 });
        }

        const deleted = await prisma.user.deleteMany({
            where: {
                status: 'INACTIVE',
                created_at: {
                  lte: thirtyDaysAgo
                }
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Successfully cleaned up ${deleted.count} inactive user(s)`, 
            deletedCount: deleted.count 
        });

    } catch (error: any) {
        console.error('Cleanup Inactive Users Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
