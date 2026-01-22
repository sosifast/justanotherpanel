import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-it'
        );
        const { payload } = await jwtVerify(token, secret);
        const userId = parseInt(payload.sub as string);

        // Fetch active orders for this user that have a provider and a PID
        const activeOrders = await prisma.order.findMany({
            where: {
                id_user: userId,
                pid: { not: null },
                id_api_provider: { not: null },
                status: {
                    in: ['PENDING', 'IN_PROGRESS', 'PROCESSING', 'PARTIAL']
                }
            },
            include: {
                api_provider: true
            }
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
            if (!ordersByProvider[providerId]) {
                ordersByProvider[providerId] = [];
            }
            ordersByProvider[providerId].push(order);
        });

        let updatedCount = 0;

        // Process each provider
        for (const providerId in ordersByProvider) {
            const orders = ordersByProvider[providerId];
            const provider = orders[0].api_provider!;

            try {
                const pids = orders.map(o => o.pid).join(',');

                const formData = new FormData();
                formData.append('key', provider.api_key);
                formData.append('action', 'status');

                if (orders.length === 1) {
                    formData.append('order', orders[0].pid);
                } else {
                    formData.append('orders', pids);
                }

                const response = await axios.post(provider.url, formData, {
                    headers: formData.getHeaders()
                });

                const data = response.data;

                // Provider might return a single object or an array/object of objects
                // If single order requested, it's often a single object.
                // If multiple orders requested, it's often an object keyed by PID.

                const updates = orders.length === 1 ? { [orders[0].pid!]: data } : data;

                for (const order of orders) {
                    const statusInfo = updates[order.pid!];
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
                        await prisma.order.update({
                            where: { id: order.id },
                            data: {
                                status: newStatus as any,
                                start_count: startCount,
                                remains: remains
                            }
                        });
                        updatedCount++;
                    }
                }
            } catch (providerError) {
                console.error(`Error syncing with provider ${providerId}:`, providerError);
                // Continue with other providers
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully synced ${activeOrders.length} orders. ${updatedCount} orders updated.`,
            updated_count: updatedCount
        });

    } catch (error) {
        console.error('Sync orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
