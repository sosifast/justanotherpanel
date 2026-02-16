import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAdminNotification } from '@/lib/admin-notifications';
import paypal from '@paypal/checkout-server-sdk';

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

        if (!gateway || gateway.status !== 'ACTIVE' || gateway.provider !== 'PAYPAL') {
            return NextResponse.json({ error: 'Invalid gateway' }, { status: 400 });
        }

        if (amount < Number(gateway.min_deposit)) {
            return NextResponse.json({ error: `Minimum deposit is $${gateway.min_deposit}` }, { status: 400 });
        }

        const config = gateway.api_config as any;
        if (!config.clientId || !config.clientSecret) {
            return NextResponse.json({ error: 'PayPal configuration invalid' }, { status: 500 });
        }

        // Setup PayPal Environment
        const Environment = config.mode === 'live'
            ? paypal.core.LiveEnvironment
            : paypal.core.SandboxEnvironment;

        const client = new paypal.core.PayPalHttpClient(
            new Environment(config.clientId, config.clientSecret)
        );

        // Determine base URL dynamically
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount.toString()
                }
            }],
            application_context: {
                return_url: `${baseUrl}/user/add-funds/success`,
                cancel_url: `${baseUrl}/user/add-funds/cancel`
            }
        });

        const order = await client.execute(request);
        const approveLink = order.result.links.find((link: any) => link.rel === 'approve')?.href;

        if (!approveLink) {
            throw new Error('No approve link found');
        }

        // Create deposit record
        const deposit = await prisma.deposits.create({
            data: {
                id_user: userId,
                amount: amount,
                status: 'PENDING',
                detail_transaction: {
                    gateway_id: gateway.id,
                    provider: 'PAYPAL',
                    paypal_order_id: order.result.id,
                    type: 'AUTOMATIC'
                }
            }
        });

        // Notify Admin
        await createAdminNotification(
            'New Deposit Initiated',
            `User #${userId} initiated a $${amount} deposit via PayPal.`,
            'NEW_DEPOSIT',
            deposit.id
        );

        return NextResponse.json({ url: approveLink });

    } catch (error: any) {
        console.error('PayPal create error:', error);
        return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
    }
}
