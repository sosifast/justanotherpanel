import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-it'
        );
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        if (role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const orderId = parseInt(id);

        // Fetch Order and Provider
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                api_provider: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (!order.api_provider) {
            return NextResponse.json({ error: 'Order has no API provider' }, { status: 400 });
        }

        if (!order.id_api_provider || !order.pid) {
            return NextResponse.json({ error: 'Order missing provider details' }, { status: 400 });
        }

        // Prepare External API Request
        const formData = new FormData();
        formData.append('key', order.api_provider.api_key);
        formData.append('action', 'status');
        formData.append('order', order.pid);

        // Note: axios needs specific headers for form-data
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: order.api_provider.url,
            headers: {
                ...formData.getHeaders()
            },
            data: formData
        };

        // Execute Request
        try {
            const response = await axios.request(config);
            const data = response.data;

            // Map Provider Status to Local Status
            // Expected: charge, start_count, status, remains, currency
            // Statuses often vary, need to normalize. assuming typical SMM pane statuses
            let newStatus = order.status;

            // Normalize status string 
            const providerStatus = data.status?.toUpperCase() || '';

            if (['COMPLETED', 'SUCCESS', 'COMPLETE'].includes(providerStatus)) newStatus = 'COMPLETED';
            else if (['PROCESSING', 'IN_PROGRESS', 'ACTIVE'].includes(providerStatus)) newStatus = 'PROCESSING';
            else if (['PENDING'].includes(providerStatus)) newStatus = 'PENDING';
            else if (['PARTIAL', 'PARTIALLY_COMPLETED'].includes(providerStatus)) newStatus = 'PARTIAL';
            else if (['CANCELED', 'CANCELLED'].includes(providerStatus)) newStatus = 'CANCELED';
            else if (['REFUNDED'].includes(providerStatus)) newStatus = 'CANCELED'; // Treat refunded as cancelled
            else if (['FAIL', 'FAILED', 'ERROR'].includes(providerStatus)) newStatus = 'ERROR';

            // Check if charge changed -> maybe update cost? 
            // For now, let's just update status and execution details

            const startCount = data.start_count ? parseInt(data.start_count) : order.start_count;
            const remains = data.remains ? parseInt(data.remains) : order.remains;

            // Update Order in DB via Service (handles refunds)
            const updatedOrder = await import('@/lib/order-service').then(m => m.updateOrderStatus({
                orderId: orderId,
                newStatus: newStatus as any,
                newRemains: remains ?? undefined,
                newStartCount: startCount ?? undefined
            }));

            return NextResponse.json({
                success: true,
                order: updatedOrder,
                provider_response: data
            });

        } catch (apiError: any) {
            console.error('External API Error:', apiError.response?.data || apiError.message);
            return NextResponse.json({
                error: 'Failed to fetch status from provider',
                details: apiError.message
            }, { status: 502 });
        }

    } catch (error) {
        console.error('Update Status Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
