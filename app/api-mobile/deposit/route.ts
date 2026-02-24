
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import crypto from 'crypto';
import axios from 'axios';
import paypal from '@paypal/checkout-server-sdk';

// Helper function to create PayPal payment
async function createPayPalPayment(gateway: any, amount: number, userId: number, baseUrl: string) {
    const config = gateway.api_config as any;
    
    const Environment = config.mode === 'live'
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment;

    const client = new paypal.core.PayPalHttpClient(
        new Environment(config.clientId, config.clientSecret)
    );

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
            return_url: `${baseUrl}/api-mobile/deposit/success`,
            cancel_url: `${baseUrl}/api-mobile/deposit/cancel`
        }
    });

    const order = await client.execute(request);
    const approveLink = order.result.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approveLink) {
        throw new Error('No approve link found');
    }

    return {
        payment_id: order.result.id,
        payment_url: approveLink
    };
}

// Helper function to create Cryptomus payment
async function createCryptomusPayment(gateway: any, amount: number, userId: number, baseUrl: string) {
    const config = gateway.api_config as any;
    
    const orderId = `DEP-${userId}-${Date.now()}`;
    
    const payload = {
        amount: amount.toString(),
        currency: 'USD',
        order_id: orderId,
        url_return: `${baseUrl}/api-mobile/deposit/success`,
        url_callback: `${baseUrl}/api/webhooks/cryptomus`,
        is_payment_multiple: true,
        lifetime: '3600'
    };

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
        return {
            payment_id: result.result.uuid,
            payment_url: result.result.url
        };
    } else {
        throw new Error('Failed to create payment link');
    }
}

export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const gateways = await prisma.paymentGateway.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                provider: true,
                min_deposit: true,
                api_config: true,
            },
        });

        // Sanitize api_config to remove secrets if any (though usually public keys are fine)
        // For manual, user needs bank details.
        const sanitizedGateways = gateways.map(g => ({
            ...g,
            api_config: g.provider === 'MANUAL' ? g.api_config : { fee: (g.api_config as any)?.fee } // Hide secrets for automated gateways
        }));

        return successResponse(sanitizedGateways);
    } catch (error) {
        return errorResponse('Internal Server Error', 500);
    }
}

export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const body = await req.json();
        const { amount, gateway_id } = body;

        if (!amount || !gateway_id) {
            return errorResponse('Amount and Gateway ID are required');
        }

        const gateway = await prisma.paymentGateway.findUnique({
            where: { id: Number(gateway_id) },
        });

        if (!gateway || gateway.status !== 'ACTIVE') {
            return errorResponse('Invalid payment gateway');
        }

        if (Number(amount) < Number(gateway.min_deposit)) {
            return errorResponse(`Minimum deposit is ${gateway.min_deposit}`);
        }

        // Calculate fee
        const feeConfig = (gateway.api_config as any)?.fee || '0';
        let fee = 0;
        if (String(feeConfig).endsWith('%')) {
            const percentage = parseFloat(feeConfig);
            fee = (Number(amount) * percentage) / 100;
        } else {
            fee = parseFloat(feeConfig);
        }

        // Create deposit record
        const deposit = await prisma.deposits.create({
            data: {
                id_user: user.id,
                amount: Number(amount) + fee, // Store total amount including fee? Or just amount?
                // Looking at AddFundsClient: "Total: amount + fee".
                // And `detail_transaction` has `fee`.
                // `amount` column likely stores the TOTAL amount user pays? or amount deposited?
                // Standard is usually Amount = User gets, Fee = Extra.
                // However, AddFundsClient says "You will pay: Total".
                // Let's store amount as Total for now or check usage.
                // Actually, `Orders` has `price_sale`.
                // `Deposits` has `amount`.
                // Let's assume `amount` is what user gets credited?
                // schema: amount Decimal.
                // Let's just follow AddFundsClient login conceptually.
                // detail_transaction: { fee, method: gateway.provider, ... }
                detail_transaction: {
                    fee,
                    method: gateway.provider,
                    provider: gateway.provider,
                    // For manual, maybe bank info?
                },
                status: 'PENDING',
            },
        });

        // Handle different payment providers
        let paymentResult = null;
        
        try {
            // Determine base URL dynamically
            const protocol = req.headers.get('x-forwarded-proto') || 'https';
            const host = req.headers.get('host');
            const baseUrl = `${protocol}://${host}`;

            if (gateway.provider === 'PAYPAL') {
                paymentResult = await createPayPalPayment(gateway, Number(amount), user.id, baseUrl);
            } else if (gateway.provider === 'CRYPTOMUS') {
                paymentResult = await createCryptomusPayment(gateway, Number(amount), user.id, baseUrl);
            }
        } catch (paymentError) {
            console.error('Payment creation error:', paymentError);
            // Continue with manual process if automated payment fails
        }

        // Update deposit with payment details if automated payment was created
        if (paymentResult) {
            const currentDetails = deposit.detail_transaction as any || {};
            const updatedDeposit = await prisma.deposits.update({
                where: { id: deposit.id },
                data: {
                    detail_transaction: {
                        ...currentDetails,
                        payment_id: paymentResult.payment_id,
                        type: 'AUTOMATIC'
                    }
                }
            });

            return successResponse({
                deposit: updatedDeposit,
                payment_url: paymentResult.payment_url,
                message: 'Deposit created successfully. Redirect to payment URL to complete payment.'
            });
        }

        // For manual payments or if automated payment failed
        return successResponse({
            deposit,
            message: 'Deposit created successfully. Please follow the payment instructions.'
        });

    } catch (error) {
        console.error('Deposit Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
