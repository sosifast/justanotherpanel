import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import FormData from 'form-data';

export async function POST() {
    try {
        // Fetch all active orders that have a provider and a PID
        const activeOrders = await prisma.order.findMany({
            where: {
                pid: { not: null },
                id_api_provider: { not: null },
                status: {
                    in: ['PENDING', 'IN_PROGRESS', 'PROCESSING', 'PARTIAL']
                }
            },
            include: { api_provider: true }
        });

        if (activeOrders.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active orders to sync',
                updated_count: 0
            });
        }

        // Group orders by provider
        const ordersByProvider: Record<number, typeof activeOrders> = {};
        activeOrders.forEach(order => {
            const providerId = order.id_api_provider!;
            if (!ordersByProvider[providerId]) ordersByProvider[providerId] = [];
            ordersByProvider[providerId].push(order);
        });

        let updatedCount = 0;

        for (const providerId in ordersByProvider) {
            const orders = ordersByProvider[providerId];
            const provider = orders[0].api_provider!;

            try {
                const formData = new FormData();
                formData.append('key', provider.api_key);
                formData.append('action', 'status');

                if (orders.length === 1) {
                    formData.append('order', orders[0].pid);
                } else {
                    formData.append('orders', orders.map(o => o.pid).join(','));
                }

                const response = await axios.post(provider.url, formData, {
                    headers: formData.getHeaders()
                });

                const data = response.data;
                const updates = orders.length === 1 ? { [orders[0].pid!]: data } : data;

                for (const order of orders) {
                    const statusInfo = updates[order.pid!];
                    if (!statusInfo || statusInfo.error) continue;

                    let newStatus = order.status;
                    const ps = statusInfo.status?.toUpperCase() || '';

                    if (['COMPLETED', 'SUCCESS', 'COMPLETE'].includes(ps)) newStatus = 'COMPLETED';
                    else if (['PROCESSING', 'IN_PROGRESS', 'ACTIVE'].includes(ps)) newStatus = 'PROCESSING';
                    else if (['PENDING'].includes(ps)) newStatus = 'PENDING';
                    else if (['PARTIAL', 'PARTIALLY_COMPLETED'].includes(ps)) newStatus = 'PARTIAL';
                    else if (['CANCELED', 'CANCELLED', 'REFUNDED'].includes(ps)) newStatus = 'CANCELED';
                    else if (['FAIL', 'FAILED', 'ERROR'].includes(ps)) newStatus = 'ERROR';

                    const startCount = statusInfo.start_count !== undefined ? parseInt(statusInfo.start_count) : order.start_count;
                    const remains = statusInfo.remains !== undefined ? parseInt(statusInfo.remains) : order.remains;

                    if (newStatus !== order.status || startCount !== order.start_count || remains !== order.remains) {
                        try {
                            const { updateOrderStatus } = await import('@/lib/order-service');
                            await updateOrderStatus({
                                orderId: order.id,
                                newStatus: newStatus as any,
                                newRemains: remains ?? undefined,
                                newStartCount: startCount ?? undefined
                            });
                            updatedCount++;
                        } catch (e) {
                            console.error(`Failed to update order ${order.id}`, e);
                        }
                    }
                }
            } catch (err) {
                console.error(`Error syncing provider ${providerId}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${activeOrders.length} orders. ${updatedCount} updated.`,
            updated_count: updatedCount
        });

    } catch (error) {
        console.error('Admin sync-all error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
