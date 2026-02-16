import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAdminNotification } from '@/lib/admin-notifications';
import axios from 'axios';
import crypto from 'crypto'; // Node crypto is sufficient, no need for crypto-js if we just use md5

import { getUserIdFromAuth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { gatewayId, amount } = body;

        const userId = await getUserIdFromAuth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate gateway
        const gateway = await prisma.paymentGateway.findUnique({
            where: { id: gatewayId }
        });

        if (!gateway || gateway.status !== 'ACTIVE' || gateway.provider !== 'CRYPTOMUS') {
            return NextResponse.json({ error: 'Invalid gateway' }, { status: 400 });
        }

        if (amount < Number(gateway.min_deposit)) {
            return NextResponse.json({ error: `Minimum deposit is $${gateway.min_deposit}` }, { status: 400 });
        }

        const config = gateway.api_config as any;
        if (!config.merchantId || !config.paymentKey) {
            return NextResponse.json({ error: 'Cryptomus configuration invalid' }, { status: 500 });
        }

        // Create a unique order ID
        const orderId = `DEP-${userId}-${Date.now()}`;

        const payload = {
            amount: amount.toString(),
            currency: 'USD',
            order_id: orderId,
            url_return: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/add-funds/success`,
            url_callback: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/cryptomus`,
            is_payment_multiple: true,
            lifetime: '3600'
        };

        // Generate Signature
        const jsonPayload = JSON.stringify(payload);
        const base64Payload = Buffer.from(jsonPayload).toString('base64');
        const sign = crypto.createHash('md5').update(base64Payload + config.paymentKey).digest('hex');

        const response = await axios.post('https://api.cryptomus.com/v1/payment', payload, {
            headers: {
                merchant: config.merchantId,
                sign: sign,
                'Content-Type': 'application/json'
            }
        });

        const result = response.data;

        if (result.state === 0 && result.result?.url) {
            // Create deposit record
            const deposit = await prisma.deposits.create({
                data: {
                    id_user: userId,
                    amount: amount,
                    status: 'PENDING',
                    detail_transaction: {
                        gateway_id: gateway.id,
                        provider: 'CRYPTOMUS',
                        cryptomus_uuid: result.result.uuid,
                        order_id: orderId,
                        type: 'AUTOMATIC'
                    }
                }
            });

            // Notify Admin
            await createAdminNotification(
                'New Deposit Initiated',
                `User #${userId} initiated a $${amount} deposit via Cryptomus.`,
                'NEW_DEPOSIT',
                deposit.id
            );

            return NextResponse.json({ url: result.result.url });
        } else {
            return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Cryptomus create error:', error?.response?.data || error);
        return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
    }
}
