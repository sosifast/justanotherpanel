import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import FormData from 'form-data';
import { updateOrderStatus } from '@/lib/order-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const authHeader = request.headers.get('authorization');

        const isValidKey = key === process.env.CRON_SECRET;
        const isValidHeader = authHeader === `Bearer ${process.env.CRON_SECRET}`;

        if (!isValidKey && !isValidHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch active orders that need syncing
        const activeOrders = await prisma.order.findMany({
            where: {
                status: {
                    in: ['PENDING', 'IN_PROGRESS', 'PROCESSING', 'PARTIAL']
                },
                id_api_provider: { not: null },
                pid: { not: null }
            },
            include: {
                api_provider: true
            }
        });

        if (activeOrders.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active orders to sync',
                count: 0
            });
        }

        // 2. Group by provider
        const ordersByProvider: Record<number, typeof activeOrders> = {};
        activeOrders.forEach(order => {
            const providerId = order.id_api_provider!;
            if (!ordersByProvider[providerId]) {
                ordersByProvider[providerId] = [];
            }
            ordersByProvider[providerId].push(order);
        });

        let updatedCount = 0;
        const details: any[] = [];

        // 3. Process per provider
        for (const providerId in ordersByProvider) {
            const orders = ordersByProvider[providerId];
            const provider = orders[0].api_provider!;

            try {
                // Prepare request
                const pids = orders.map(o => o.pid).join(',');
                const formData = new FormData();
                formData.append('key', provider.api_key);
                formData.append('action', 'status');
                formData.append('orders', pids);

                const response = await axios.post(provider.url, formData, {
                    headers: formData.getHeaders()
                });

                const data = response.data;

                for (const order of orders) {
                    if (!order.pid) continue;

                    const statusInfo = data[order.pid];
                    if (!statusInfo || statusInfo.error) continue;

                    let newStatus = order.status;
                    const providerStatus = statusInfo.status?.toUpperCase() || '';

                    if (['COMPLETED', 'SUCCESS', 'COMPLETE'].includes(providerStatus)) newStatus = 'COMPLETED';
                    else if (['PROCESSING', 'IN_PROGRESS', 'ACTIVE'].includes(providerStatus)) newStatus = 'PROCESSING';
                    else if (['PENDING'].includes(providerStatus)) newStatus = 'PENDING';
                    else if (['PARTIAL', 'PARTIALLY_COMPLETED'].includes(providerStatus)) newStatus = 'PARTIAL';
                    else if (['CANCELED', 'CANCELLED'].includes(providerStatus)) newStatus = 'CANCELED';
                    else if (['REFUNDED'].includes(providerStatus)) newStatus = 'CANCELED';
                    else if (['FAIL', 'FAILED', 'ERROR'].includes(providerStatus)) newStatus = 'ERROR';

                    const startCount = statusInfo.start_count !== undefined ? parseInt(statusInfo.start_count) : order.start_count;
                    const remains = statusInfo.remains !== undefined ? parseInt(statusInfo.remains) : order.remains;

                    if (newStatus !== order.status || startCount !== order.start_count || remains !== order.remains) {
                        try {
                            await updateOrderStatus({
                                orderId: order.id,
                                newStatus: newStatus as any,
                                newRemains: remains || 0,
                                newStartCount: startCount || 0
                            });
                            updatedCount++;
                            details.push({ id: order.id, old: order.status, new: newStatus });
                        } catch (updateErr: any) {
                            console.error(`Error updating order #${order.id}:`, updateErr.message);
                        }
                    }
                }

            } catch (err: any) {
                console.error(`Error syncing provider ${provider.name}:`, err.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${activeOrders.length} orders`,
            updated_count: updatedCount,
            details
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
