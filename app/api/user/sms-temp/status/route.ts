import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromAuth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const userId = await getUserIdFromAuth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Get the order
        const order = await prisma.orderSms.findFirst({
            where: {
                id: parseInt(orderId),
                id_user: userId
            },
            include: {
                country: true,
                product: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // If still pending, check SMS API for status
        if (order.status_order === 'PENDING' || order.status_order === 'PROCESSING') {
            const smsApi = await prisma.smsApi.findFirst();
            if (smsApi) {
                try {
                    const apiUrl = `${smsApi.url}/get/sms?token=${smsApi.token}&request_id=${order.request_id}`;
                    const apiResponse = await fetch(apiUrl, {
                        method: 'GET',
                        headers: {}
                    });
                    const apiData = await apiResponse.json();

                    // Handle special error code 50102 (Timeout/Released)
                    if (apiData.code === 50102 || apiData.code === '50102') {
                        const updatedOrder = await prisma.$transaction(async (tx) => {
                            // Double check status within transaction
                            const currentOrder = await tx.orderSms.findUnique({
                                where: { id: order.id }
                            });
                            
                            if (currentOrder && (currentOrder.status_order === 'PENDING' || currentOrder.status_order === 'PROCESSING')) {
                                // Refund user
                                await tx.user.update({
                                    where: { id: userId },
                                    data: { balance: { increment: Number(currentOrder.price_sale) } }
                                });
                                
                                // Update order to CANCELED
                                return await tx.orderSms.update({
                                    where: { id: order.id },
                                    data: { status_order: 'CANCELED' }
                                });
                            }
                            return currentOrder;
                        });

                        return NextResponse.json({
                            order: {
                                ...updatedOrder,
                                price_sale: Number(updatedOrder!.price_sale),
                                created_at: updatedOrder!.created_at.toISOString(),
                                country: order.country.title,
                                product: order.product.title,
                            }
                        });
                    }

                    // Check if we got an SMS code
                    // apiData.data can be an object or a string directly
                    let smsCode = null;
                    let apiStatus = null;

                    if (apiData.code === 200 && apiData.data) {
                        if (typeof apiData.data === 'string') {
                            smsCode = apiData.data;
                        } else {
                            smsCode = apiData.data.sms_code || apiData.data.sms || apiData.data.code || null;
                            apiStatus = apiData.data.status || null;
                        }
                    }

                    if (smsCode) {
                        // Update order with SMS code
                        const updatedOrder = await prisma.orderSms.update({
                            where: { id: order.id },
                            data: {
                                sms_otp_code: String(smsCode),
                                status_order: 'SUCCESS'
                            }
                        });

                        return NextResponse.json({
                            order: {
                                ...updatedOrder,
                                price_sale: Number(updatedOrder.price_sale),
                                created_at: updatedOrder.created_at.toISOString(),
                                country: order.country.title,
                                product: order.product.title,
                            }
                        });
                    }

                    // Update status if changed (CANCELED/ERROR)
                    if (apiStatus === 'CANCELED' || apiStatus === 'ERROR') {
                        await prisma.orderSms.update({
                            where: { id: order.id },
                            data: { status_order: apiStatus as any }
                        });
                        order.status_order = apiStatus as any; // Update local for final response
                    }
                } catch (apiErr) {
                    console.error('Error checking SMS status:', apiErr);
                }
            }
        }

        // Automatic Server-Side Timeout (5 minutes)
        const isTimedOut = (Date.now() - new Date(order.created_at).getTime()) > 300000;
        if (isTimedOut && (order.status_order === 'PENDING' || order.status_order === 'PROCESSING')) {
             const updatedOrder = await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { increment: Number(order.price_sale) } }
                });
                return await tx.orderSms.update({
                    where: { id: order.id },
                    data: { status_order: 'CANCELED' }
                });
            });
            return NextResponse.json({
                order: {
                    ...updatedOrder,
                    price_sale: Number(updatedOrder.price_sale),
                    created_at: updatedOrder.created_at.toISOString(),
                    country: order.country.title,
                    product: order.product.title,
                }
            });
        }

        return NextResponse.json({
            order: {
                id: order.id,
                invoice: order.invoice,
                request_id: order.request_id,
                number: order.number,
                status_order: order.status_order,
                sms_otp_code: order.sms_otp_code,
                price_sale: Number(order.price_sale),
                created_at: order.created_at.toISOString(),
                country: order.country.title,
                product: order.product.title,
            }
        });

    } catch (error: any) {
        console.error('Error checking SMS status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check SMS status' },
            { status: 500 }
        );
    }
}
