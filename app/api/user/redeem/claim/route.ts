import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

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

        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Redeem code is required' }, { status: 400 });
        }

        // 1. Find the code
        const redeemCode = await prisma.redeemCode.findFirst({
            where: { name_code: code }
        });

        if (!redeemCode) {
            return NextResponse.json({ error: 'Invalid redeem code' }, { status: 404 });
        }

        // 2. Check if active
        if (redeemCode.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'This code is no longer active' }, { status: 400 });
        }

        // 3. Check expiry
        if (new Date(redeemCode.expired_date) < new Date()) {
            return NextResponse.json({ error: 'This code has expired' }, { status: 400 });
        }

        // 4. Check quota
        const usedCount = await prisma.redeemUsed.count({
            where: { id_redeem_code: redeemCode.id }
        });

        if (usedCount >= redeemCode.quota) {
            return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 });
        }

        // 5. Check if user already used it
        const userUsed = await prisma.redeemUsed.findFirst({
            where: {
                id_user: userId,
                id_redeem_code: redeemCode.id
            }
        });

        if (userUsed) {
            return NextResponse.json({ error: 'You have already claimed this code' }, { status: 400 });
        }

        // 6. Transaction: Claim code and update balance
        const result = await prisma.$transaction(async (tx) => {
            // Create usage record
            await tx.redeemUsed.create({
                data: {
                    id_user: userId,
                    id_redeem_code: redeemCode.id
                }
            });

            // Update user balance
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        increment: redeemCode.get_balance
                    }
                }
            });

            return updatedUser;
        });

        return NextResponse.json({
            message: 'Code claimed successfully',
            amount: Number(redeemCode.get_balance),
            new_balance: Number(result.balance)
        }, { status: 200 });

    } catch (error: any) {
        console.error('Claim redeem error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
