import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name_discount,
            min_transaction,
            max_transaction,
            discount_max_get,
            type,
            amount,
            expired_date,
            max_used,
            status
        } = body;

        const discount = await prisma.discount.create({
            data: {
                name_discount,
                min_transaction: min_transaction,
                max_transaction: max_transaction,
                discount_max_get: discount_max_get,
                type,
                amount: amount,
                expired_date: new Date(expired_date),
                max_used: parseInt(max_used),
                status
            }
        });

        // Serialize decimals
        const serializedDiscount = {
            ...discount,
            min_transaction: Number(discount.min_transaction),
            max_transaction: Number(discount.max_transaction),
            amount: Number(discount.amount)
        };

        return NextResponse.json(serializedDiscount, { status: 201 });
    } catch (error: any) {
        console.error('Error creating discount:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
