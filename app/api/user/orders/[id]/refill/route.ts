import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromAuth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const orderId = parseInt(id);

        if (isNaN(orderId)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                id_user: userId
            },
            include: {
                service: true,
                api_provider: true,
                reffil_orders: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if service provides refill
        if (!order.service.refill) {
            return NextResponse.json({ error: 'This service does not provide refill.' }, { status: 400 });
        }

        // Check if there's already a pending or successful refill request
        const hasActiveRefill = order.reffil_orders.some((r: any) => 
            ['PENDING', 'SUCCESS', 'COMPLETED', 'FINISH'].includes(r.status)
        );

        if (hasActiveRefill) {
            return NextResponse.json({ error: 'Refill has already been requested for this order.' }, { status: 400 });
        }

        if (!order.api_provider || !order.pid) {
           return NextResponse.json({ error: 'Provider information missing for this order.' }, { status: 400 });
        }

        // Process request to provider
        try {
            const data = new FormData();
            data.append('key', order.api_provider.api_key);
            data.append('action', 'refill');
            data.append('order', order.pid);

            const config = {
              method: 'post',
              maxBodyLength: Infinity,
              url: order.api_provider.url,
              headers: { 
                ...data.getHeaders()
              },
              data : data
            };

            const response = await axios.request(config);

            if (response.data?.error) {
                return NextResponse.json({ error: response.data.error }, { status: 400 });
            }

            if (response.data && response.data.refill) {
                // Insert into reffil_order table
                await (prisma as any).reffilOrder.create({
                    data: {
                        id_user: userId,
                        id_api_provider: order.api_provider.id,
                        id_order: order.id,
                        pid_reffil: response.data.refill.toString(),
                        status: 'PENDING',
                    }
                });

                return NextResponse.json({ success: true, message: 'Refill requested successfully!', refill_id: response.data.refill });
            } else {
                return NextResponse.json({ error: 'Provider did not return a refill ID.', raw: response.data }, { status: 400 });
            }
        } catch (apiError: any) {
            console.error('API Provider Error:', apiError.response?.data || apiError.message);
            return NextResponse.json({ error: 'Error communicating with provider API.' }, { status: 502 });
        }

    } catch (error) {
        console.error('Refill Request Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred while processing the refill request.' }, { status: 500 });
    }
}
