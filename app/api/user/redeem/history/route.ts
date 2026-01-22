import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

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

        const history = await prisma.redeemUsed.findMany({
            where: { id_user: userId },
            include: {
                redeem_code: {
                    select: {
                        name_code: true,
                        get_balance: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json({ history }, { status: 200 });

    } catch (error: any) {
        console.error('Fetch redeem history error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
