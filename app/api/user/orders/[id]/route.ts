import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await cookies();
        const userId = await getUserIdFromAuth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const orderId = parseInt(id);

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                id_user: userId
            },
            include: {
                service: {
                    include: {
                        category: {
                            include: {
                                platform: true
                            }
                        }
                    }
                },
                api_provider: {
                    select: { id: true, name: true }
                },
                discount_usages: {
                    include: {
                        discount: {
                            select: { name_discount: true, type: true, amount: true }
                        }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
