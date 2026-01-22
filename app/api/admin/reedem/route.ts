import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RedeemStatus } from '@prisma/client';

export async function GET() {
    try {
        const codes = await prisma.redeemCode.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: { used_by: true }
                }
            }
        });

        // Convert Decimal to Number
        const serializedCodes = codes.map((code: any) => ({
            ...code,
            get_balance: Number(code.get_balance)
        }));

        return NextResponse.json(serializedCodes);
    } catch (error: any) {
        console.error('Error fetching redeem codes:', error);
        return NextResponse.json({ error: 'Failed to fetch redeem codes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name_code, quota, expired_date, get_balance, status, total_info } = body;

        if (!name_code || !quota || !expired_date || !get_balance) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newCode = await prisma.redeemCode.create({
            data: {
                name_code,
                quota: parseInt(quota),
                expired_date: new Date(expired_date),
                get_balance: parseFloat(get_balance),
                status: (status as RedeemStatus) || 'ACTIVE',
                total_info,
            },
            include: {
                _count: {
                    select: { used_by: true }
                }
            }
        });

        return NextResponse.json({
            ...newCode,
            get_balance: Number(newCode.get_balance)
        });
    } catch (error: any) {
        console.error('Error creating redeem code:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Code name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create redeem code' }, { status: 500 });
    }
}
