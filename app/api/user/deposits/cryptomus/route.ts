import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import crypto from 'crypto'; // Node crypto is sufficient, no need for crypto-js if we just use md5

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { gatewayId, amount } = body;
        const userId = 1; // TODO: Session

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
            await prisma.deposits.create({
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

            return NextResponse.json({ url: result.result.url });
        } else {
            console.error('Cryptomus response:', result);
            return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Cryptomus create error:', error?.response?.data || error);
        return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
    }
}
