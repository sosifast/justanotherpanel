import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let body: any = {};

        try {
            if (contentType.includes('application/x-www-form-urlencoded')) {
                const formData = await req.formData();
                body = Object.fromEntries(formData.entries());
            } else if (contentType.includes('application/json')) {
                body = await req.json();
            } else {
                // Try form data first as fallback for standard SMM clients
                try {
                    const formData = await req.formData();
                    body = Object.fromEntries(formData.entries());
                } catch {
                    // Fallback to JSON if form data fails
                    try {
                        body = await req.json();
                    } catch {
                        body = {};
                    }
                }
            }
        } catch (e) {
            console.error('Body parsing error:', e);
            body = {};
        }

        const { key, action } = body;

        if (!key) {
            return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 });
        }

        // 1. Authenticate user by API Key
        const user = await prisma.user.findFirst({
            where: { apikey: key },
        });

        if (!user) {
            return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 });
        }

        const reseller = await (prisma as any).reseller.findFirst({
            where: { id_user: user.id, status: 'ACTIVE' }
        });

        const isReseller = !!reseller;

        // 2. Handle Actions
        switch (action) {
            case 'services': {
                const services = await prisma.service.findMany({
                    where: { status: 'ACTIVE' },
                    include: { category: true }
                });

                const formattedServices = services.map(s => ({
                    service: s.id,
                    name: s.name,
                    type: s.type,
                    category: s.category.name,
                    rate: isReseller ? Number(s.price_reseller) : Number(s.price_sale),
                    min: s.min,
                    max: s.max,
                    note: s.note,
                    refill: s.refill,
                    cancel: false // Placeholder as per documentation
                }));

                return NextResponse.json(formattedServices);
            }

            case 'add': {
                const { service: serviceIdStr, link, quantity: quantityStr } = body;

                if (!serviceIdStr || !link || !quantityStr) {
                    return NextResponse.json({ error: 'invalid_parameters' }, { status: 400 });
                }

                const serviceId = parseInt(serviceIdStr);
                const qty = parseInt(quantityStr);

                if (isNaN(serviceId) || isNaN(qty)) {
                    return NextResponse.json({ error: 'invalid_parameters' }, { status: 400 });
                }

                const service = await prisma.service.findUnique({
                    where: { id: serviceId }
                });

                if (!service || service.status !== 'ACTIVE') {
                    return NextResponse.json({ error: 'invalid_service' }, { status: 400 });
                }

                if (qty < service.min || qty > service.max) {
                    return NextResponse.json({ error: 'invalid_quantity' }, { status: 400 });
                }

                // Calculate cost
                const rate = isReseller ? service.price_reseller : service.price_sale;
                const cost = new Decimal(rate as any).mul(qty).div(1000);

                if (new Decimal(user.balance).lt(cost)) {
                    return NextResponse.json({ error: 'insufficient_balance' }, { status: 400 });
                }

                // Create Order and Deduct Balance atomically
                const order = await prisma.$transaction(async (tx) => {
                    const updatedUser = await tx.user.update({
                        where: { id: user.id },
                        data: { balance: { decrement: cost } }
                    });

                    return await tx.order.create({
                        data: {
                            invoice_number: `API-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                            id_user: user.id,
                            id_service: service.id,
                            link: link,
                            quantity: qty,
                            price_api: service.price_api,
                            price_sale: service.price_sale,
                            price_seller: service.price_reseller, // Corresponds to price_seller in schema
                            status: 'PENDING'
                        } as any
                    });
                });

                return NextResponse.json({ status: 'success', order: order.id });
            }

            case 'status': {
                const { order: orderId } = body;
                if (!orderId) return NextResponse.json({ error: 'invalid_order' }, { status: 400 });

                const order = await prisma.order.findUnique({
                    where: { id: parseInt(orderId), id_user: user.id }
                });

                if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

                return NextResponse.json({
                    charge: Number(isReseller ? order.price_seller : order.price_sale) * order.quantity / 1000,
                    start_count: order.start_count || 0,
                    status: order.status,
                    remains: order.remains || 0,
                    currency: 'USD'
                });
            }

            case 'balance': {
                return NextResponse.json({
                    status: 'success',
                    balance: Number(user.balance).toFixed(2),
                    currency: 'USD'
                });
            }

            default:
                return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('API v2 Error:', error);
        return NextResponse.json({ error: 'internal_server_error' }, { status: 500 });
    }
}
