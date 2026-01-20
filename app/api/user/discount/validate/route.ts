import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { code, userId, totalPrice, serviceId } = await req.json();

        if (!code || !userId) {
            return NextResponse.json({ error: 'Code and User ID are required' }, { status: 400 });
        }

        const discount = await prisma.discount.findFirst({
            where: {
                name_discount: code,
                status: 'ACTIVE',
                expired_date: {
                    gte: new Date()
                }
            },
            include: {
                _count: {
                    select: { discount_usages: true }
                }
            }
        });

        if (!discount) {
            return NextResponse.json({ error: 'Invalid or expired discount code' }, { status: 404 });
        }

        // Check global usage limit
        if (discount._count.discount_usages >= discount.max_used) {
            return NextResponse.json({ error: 'Discount usage limit reached' }, { status: 400 });
        }

        // Check per-user limit? (Not strictly requested properly "pastikan diskon bisa digunakan sesuai max_used". 
        // This likely means global max_used. But checking internal per-user usage is often good practice, 
        // though not explicitly asked "once per user".)
        // Let's stick to the requested "max_used" from schema which is usually total max uses.

        // Check transactions limits
        const price = Number(totalPrice);
        if (price < Number(discount.min_transaction)) {
            return NextResponse.json({ error: `Minimum transaction is $${discount.min_transaction}` }, { status: 400 });
        }
        if (Number(discount.max_transaction) > 0 && price > Number(discount.max_transaction)) {
            return NextResponse.json({ error: `Maximum transaction is $${discount.max_transaction}` }, { status: 400 });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.type === 'PERCENTAGE') {
            discountAmount = (price * Number(discount.amount)) / 100;
        } else {
            discountAmount = Number(discount.amount);
        }

        // Check max discount get
        const maxGet = Number((discount as any).discount_max_get || 0);
        if (maxGet > 0 && discountAmount > maxGet) {
            discountAmount = maxGet;
        }

        // Ensure discount doesn't exceed total price (free is fine, negative is not)
        if (discountAmount > price) {
            discountAmount = price;
        }

        return NextResponse.json({
            valid: true,
            discount: {
                id: discount.id,
                code: discount.name_discount,
                amount: discountAmount,
                type: discount.type, // 'PERCENTAGE' | 'FIXED'
                original_value: Number(discount.amount)
            }
        });

    } catch (error) {
        console.error('Error validating discount:', error);
        return NextResponse.json({ error: 'Failed to validate discount' }, { status: 500 });
    }
}
