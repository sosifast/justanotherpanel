import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate invoice number
function generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `INV${year}${month}${day}${random}`;
}

// POST - Create new order
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            userId,
            serviceId,
            link,
            quantity,
            comments,
            runs,
            interval
        } = body;

        // Validate required fields
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        if (!serviceId) {
            return NextResponse.json({ error: 'Service is required' }, { status: 400 });
        }

        if (!link) {
            return NextResponse.json({ error: 'Link/Target is required' }, { status: 400 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get service with api_provider
        const service = await prisma.service.findUnique({
            where: { id: parseInt(serviceId) },
            include: {
                api_provider: true,
                category: {
                    include: {
                        platform: true
                    }
                }
            }
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Determine quantity based on service type
        let orderQuantity = 0;
        if (service.type === 'CUSTOM_COMMENTS') {
            // Count comments (split by newline)
            const commentsList = comments?.split(/\r?\n/).filter((c: string) => c.trim() !== '') || [];
            orderQuantity = commentsList.length;
        } else {
            orderQuantity = parseInt(quantity) || 0;
        }

        // Validate quantity
        if (orderQuantity < service.min || orderQuantity > service.max) {
            return NextResponse.json({
                error: `Quantity must be between ${service.min} and ${service.max}`
            }, { status: 400 });
        }

        // Calculate price based on user role
        const pricePerUnit = user.role === 'MEMBER'
            ? Number(service.price_sale)
            : Number(service.price_reseller);

        const totalPrice = (pricePerUnit / 1000) * orderQuantity;

        // Check user balance
        if (Number(user.balance) < totalPrice) {
            return NextResponse.json({
                error: 'Insufficient balance',
                required: totalPrice,
                current: Number(user.balance)
            }, { status: 400 });
        }

        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber();

        // Initialize pid as null
        let pid: string | null = null;
        let orderStatus = 'PENDING';

        // If service has API provider, send order to provider
        if (service.api_provider && service.sid) {
            try {
                const formData = new FormData();
                formData.append('key', service.api_provider.api_key);
                formData.append('action', 'add');
                formData.append('service', service.sid);
                formData.append('link', link);

                if (service.type === 'CUSTOM_COMMENTS') {
                    formData.append('comments', comments);
                } else {
                    formData.append('quantity', orderQuantity.toString());
                    if (runs) formData.append('runs', runs.toString());
                    if (interval) formData.append('interval', interval.toString());
                }

                const response = await fetch(service.api_provider.url, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.order) {
                    pid = result.order.toString();
                    orderStatus = 'PROCESSING';
                } else if (result.error) {
                    return NextResponse.json({
                        error: `Provider error: ${result.error}`
                    }, { status: 400 });
                }
            } catch (apiError) {
                console.error('API Provider error:', apiError);
                // Continue with order creation but mark as pending
                orderStatus = 'PENDING';
            }
        }

        // Create order in database
        const order = await prisma.order.create({
            data: {
                invoice_number: invoiceNumber,
                id_user: parseInt(userId),
                id_service: parseInt(serviceId),
                id_api_provider: service.id_api_provider,
                pid: pid,
                link: link,
                quantity: orderQuantity,
                price_api: service.price_api,
                price_sale: service.price_sale,
                price_seller: service.price_reseller,
                status: orderStatus as any,
                refill: service.refill,
                runs: runs ? parseInt(runs) : null,
                interval: interval ? parseInt(interval) : null
            },
            include: {
                service: {
                    select: {
                        name: true,
                        category: {
                            select: {
                                name: true,
                                platform: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Deduct user balance
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                balance: {
                    decrement: totalPrice
                }
            }
        });

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                invoice_number: order.invoice_number,
                pid: order.pid,
                status: order.status,
                quantity: order.quantity,
                total_price: totalPrice,
                service: order.service.name
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
