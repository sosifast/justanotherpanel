import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { createAdminNotification } from '@/lib/admin-notifications';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import axios from 'axios';
import crypto from 'crypto';
import paypal from '@paypal/checkout-server-sdk';

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

        let userId: number;
        try {
            const { payload } = await jwtVerify(token, secret);
            userId = parseInt(payload.sub as string);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const { depositId } = await req.json();

        if (!depositId) {
            return NextResponse.json({ error: 'Deposit ID is required' }, { status: 400 });
        }

        const deposit = await prisma.deposits.findUnique({
            where: { id: parseInt(depositId) }
        });

        if (!deposit) {
            return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
        }

        if (deposit.id_user !== userId) {
            return NextResponse.json({ error: 'Unauthorized access to this deposit' }, { status: 403 });
        }

        // If not pending, just return the current status
        if (deposit.status !== 'PENDING') {
            return NextResponse.json({ status: deposit.status, message: 'Transaction is already finalized' });
        }

        const details = deposit.detail_transaction as any;
        const provider = details.provider;
        const gatewayId = details.gateway_id;

        if (!provider || !gatewayId) {
            return NextResponse.json({ error: 'Transaction details incomplete' }, { status: 400 });
        }

        const gateway = await prisma.paymentGateway.findUnique({
            where: { id: gatewayId }
        });

        if (!gateway) {
            return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
        }

        const config = gateway.api_config as any;

        let newStatus = 'PENDING';

        if (provider === 'CRYPTOMUS') {
            if (!config.merchantId || !config.paymentKey) {
                return NextResponse.json({ error: 'Cryptomus config missing' }, { status: 500 });
            }

            const payload = {
                uuid: details.cryptomus_uuid,
                order_id: details.order_id
            };

            const jsonPayload = JSON.stringify(payload);
            const base64Payload = Buffer.from(jsonPayload).toString('base64');
            const sign = crypto.createHash('md5').update(base64Payload + config.paymentKey).digest('hex');

            try {
                const response = await axios.post('https://api.cryptomus.com/v1/payment/info', payload, {
                    headers: {
                        merchant: config.merchantId,
                        sign: sign,
                        'Content-Type': 'application/json'
                    }
                });

                const result = response.data;
                // Cryptomus status: paid, paid_over, wrong_amount, process, confirm_check, cancel, system_fail, refund, fail
                const cryptoStatus = result.result.status;
                const paidAmount = Number(result.result.amount);
                // Note: result.result.amount might be string.

                if (['paid', 'paid_over'].includes(cryptoStatus)) {
                    newStatus = 'PAYMENT';
                } else if (['cancel', 'system_fail', 'fail', 'refund'].includes(cryptoStatus)) {
                    newStatus = 'CANCELED'; // or ERROR
                } else if (['process', 'confirm_check', 'check'].includes(cryptoStatus)) {
                    newStatus = 'PENDING';
                } else {
                    newStatus = 'ERROR'; // wrong_amount etc
                }
            } catch (err: any) {
                console.error("Cryptomus check error", err?.response?.data || err);
                // Don't error out, just keep pending if check fails? Or maybe it's expired?
                // If 404, maybe expired.
            }

        } else if (provider === 'PAYPAL') {
            if (!config.clientId || !config.clientSecret) {
                return NextResponse.json({ error: 'PayPal config missing' }, { status: 500 });
            }

            const Environment = config.mode === 'live'
                ? paypal.core.LiveEnvironment
                : paypal.core.SandboxEnvironment;

            const client = new paypal.core.PayPalHttpClient(
                new Environment(config.clientId, config.clientSecret)
            );

            const request = new paypal.orders.OrdersGetRequest(details.paypal_order_id);

            try {
                const order = await client.execute(request);
                const ppStatus = order.result.status;
                // PayPal statuses: CREATED, SAVED, APPROVED, VOIDED, COMPLETED, PAYER_ACTION_REQUIRED

                if (ppStatus === 'COMPLETED') newStatus = 'PAYMENT';
                else if (ppStatus === 'VOIDED') newStatus = 'CANCELED';
                else newStatus = 'PENDING';

            } catch (err: any) {
                console.error("PayPal check error for ID:", details.paypal_order_id, err);
                if (err.statusCode === 404) {
                    // Order not found in this environment
                    newStatus = 'ERROR';
                }
            }
        }

        if (newStatus !== 'PENDING' && newStatus !== deposit.status) {
            await prisma.deposits.update({
                where: { id: deposit.id },
                data: { status: newStatus as any }
            });

            if (newStatus === 'PAYMENT') {
                // Add balance
                await prisma.user.update({
                    where: { id: deposit.id_user },
                    data: {
                        balance: { increment: deposit.amount }
                    }
                });
            }

            // Create Notification
            await createNotification(
                deposit.id_user,
                `Deposit ${newStatus === 'PAYMENT' ? 'Successful' : newStatus}`,
                `Your deposit of $${deposit.amount} is now ${newStatus}.`,
                'DEPOSIT',
                deposit.id
            );

            // Notify Admin
            if (newStatus === 'PAYMENT' || newStatus === 'ERROR' || newStatus === 'CANCELED') {
                const adminMsg = newStatus === 'PAYMENT' ? 'Deposit Successful' : `Deposit ${newStatus}`;
                await createAdminNotification(
                    adminMsg,
                    `Deposit #${deposit.id} status updated to ${newStatus}.`,
                    newStatus === 'PAYMENT' ? 'NEW_DEPOSIT' : 'DEPOSIT_UPDATE', // Using NEW_DEPOSIT for success as "New successful deposit"
                    deposit.id
                );
            }
        }

        return NextResponse.json({ status: newStatus });

    } catch (error) {
        console.error('Check status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
