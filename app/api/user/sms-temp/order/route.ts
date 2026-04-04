import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { createAdminNotification } from '@/lib/admin-notifications';

// Generate invoice number for SMS orders
function generateSmsInvoice(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `SMS${year}${month}${day}${random}`;
}

export async function POST(req: Request) {
    try {
        // Auth check
        const userId = await getUserIdFromAuth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Get product with country info
        const product = await prisma.productSms.findUnique({
            where: { id: parseInt(productId) },
            include: { country: true }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Get user with balance
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const salePrice = Number(product.cost_sale);

        // Check balance
        if (Number(user.balance) < salePrice) {
            return NextResponse.json({
                error: 'Insufficient balance',
                required: salePrice,
                current: Number(user.balance)
            }, { status: 400 });
        }

        // Get SMS API config
        const smsApi = await prisma.smsApi.findFirst();
        if (!smsApi) {
            return NextResponse.json({ error: 'SMS API not configured' }, { status: 500 });
        }

        // Call external SMS API to get number
        const apiUrl = `${smsApi.url}/get/number?token=${smsApi.token}&country_id=${product.country.pid}&project_id=${product.project_id}`;

        const apiResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {}
        });

        const apiData = await apiResponse.json();

        if (apiData.code !== 200 || !apiData.data) {
            return NextResponse.json({
                error: apiData.message || 'Failed to get number from SMS provider'
            }, { status: 400 });
        }

        const { request_id, number } = apiData.data;

        // Generate invoice
        const invoice = generateSmsInvoice();

        // Create order in database & deduct balance in a transaction
        const [order] = await prisma.$transaction([
            prisma.orderSms.create({
                data: {
                    id_user: userId,
                    id_country_sms: product.country_id,
                    id_product_sms: product.id,
                    price_api_sms: product.cost,
                    price_sale: product.cost_sale,
                    invoice: invoice,
                    request_id: String(request_id),
                    number: String(number),
                    status_order: 'PENDING',
                },
                include: {
                    country: true,
                    product: true
                }
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        decrement: salePrice
                    }
                }
            })
        ]);

        // Create notifications
        await createNotification(
            userId,
            'SMS Number Ordered',
            `Your SMS order #${invoice} has been placed. Number: ${number}`,
            'ORDER',
            order.id
        );

        await createAdminNotification(
            'New SMS Order',
            `SMS Order #${invoice} placed by user #${userId}. Number: ${number}`,
            'NEW_ORDER',
            order.id
        );

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                invoice: order.invoice,
                request_id: order.request_id,
                number: order.number,
                status_order: order.status_order,
                price_sale: Number(order.price_sale),
                country: order.country.title,
                product: order.product.title
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating SMS order:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create SMS order' },
            { status: 500 }
        );
    }
}
