import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const discountId = parseInt(id);
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

        const discount = await prisma.discount.update({
            where: { id: discountId },
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

        return NextResponse.json(serializedDiscount);
    } catch (error: any) {
        console.error('Error updating discount:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const discountId = parseInt(id);

        await prisma.discount.delete({
            where: { id: discountId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting discount:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
