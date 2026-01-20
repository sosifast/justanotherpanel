import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

// POST - Register as reseller
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

        // Check if user already a reseller
        const existingReseller = await prisma.reseller.findUnique({
            where: { id_user: userId }
        });

        if (existingReseller) {
            return NextResponse.json(
                { error: 'You are already a reseller' },
                { status: 400 }
            );
        }

        // Get reseller fee from settings
        const settings = await prisma.setting.findFirst();
        const resellerFee = settings?.reseller_fee || 100000;

        // Get user balance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user has sufficient balance
        const userBalance = parseFloat(user.balance.toString());
        const feeAmount = parseFloat(resellerFee.toString());

        if (userBalance < feeAmount) {
            return NextResponse.json(
                {
                    error: 'Insufficient balance',
                    required: feeAmount,
                    current: userBalance
                },
                { status: 400 }
            );
        }

        // Execute transaction: deduct balance and create reseller
        const result = await prisma.$transaction(async (tx) => {
            // Deduct balance
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        decrement: resellerFee
                    }
                },
                select: { balance: true }
            });

            // Create reseller record
            const reseller = await tx.reseller.create({
                data: {
                    id_user: userId,
                    status: 'ACTIVE'
                }
            });

            return { reseller, newBalance: updatedUser.balance };
        });

        return NextResponse.json(
            {
                message: 'Successfully registered as reseller',
                reseller: result.reseller,
                new_balance: result.newBalance,
                fee_paid: resellerFee
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Reseller registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - Get reseller status and fee
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

        // Get reseller status
        const reseller = await prisma.reseller.findUnique({
            where: { id_user: userId }
        });

        // Get reseller fee from settings
        const settings = await prisma.setting.findFirst();
        const resellerFee = settings?.reseller_fee || 100000;

        // Get user balance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        });

        return NextResponse.json(
            {
                is_reseller: !!reseller,
                reseller: reseller,
                reseller_fee: resellerFee,
                user_balance: user?.balance || 0
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get reseller status error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
