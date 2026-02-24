import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import crypto from 'crypto';
import axios from 'axios';
import paypal from '@paypal/checkout-server-sdk';

// Helper function to check PayPal payment status
async function checkPayPalStatus(gateway: any, paymentId: string) {
    const config = gateway.api_config as any;

    const Environment = config.mode === 'live'
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment;

    const client = new paypal.core.PayPalHttpClient(
        new Environment(config.clientId, config.clientSecret)
    );

    const request = new paypal.orders.OrdersGetRequest(paymentId);
    const response = await client.execute(request);

    const status = response.result.status;
    let newStatus = 'PENDING';

    if (status === 'COMPLETED') {
        newStatus = 'PAYMENT';
    } else if (status === 'CANCELLED' || status === 'VOIDED') {
        newStatus = 'CANCELED';
    } else if (status === 'APPROVED') {
        newStatus = 'PENDING';
    }

    return {
        status: newStatus,
        raw_status: status,
        amount: response.result.purchase_units?.[0]?.amount?.value
    };
}

// Helper function to check Cryptomus payment status
async function checkCryptomusStatus(gateway: any, paymentId: string) {
    const config = gateway.api_config as any;

    const payload = {
        uuid: paymentId
    };

    const jsonPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(jsonPayload).toString('base64');
    const sign = crypto.createHash('md5').update(base64Payload + config.paymentKey).digest('hex');

    const response = await axios.post('https://api.cryptomus.com/v1/payment/info', payload, {
        headers: {
            merchant: config.merchantId,
            sign: sign,
            'Content-Type': 'application/json'
        }
    });

    const result = response.data;
    const cryptoStatus = result.result.status;

    let newStatus = 'PENDING';

    if (['paid', 'paid_over'].includes(cryptoStatus)) {
        newStatus = 'PAYMENT';
    } else if (['cancel', 'system_fail', 'fail', 'refund'].includes(cryptoStatus)) {
        newStatus = 'CANCELED';
    } else if (['process', 'confirm_check', 'check'].includes(cryptoStatus)) {
        newStatus = 'PENDING';
    }

    return {
        status: newStatus,
        raw_status: cryptoStatus,
        amount: result.result.amount
    };
}

export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const body = await req.json();
        const { deposit_id } = body;

        if (!deposit_id) {
            return errorResponse('Deposit ID is required');
        }

        // Get deposit details
        const deposit = await prisma.deposits.findUnique({
            where: {
                id: Number(deposit_id),
                id_user: user.id // Ensure deposit belongs to user
            }
        });

        if (!deposit) {
            return errorResponse('Deposit not found');
        }

        // Skip if already completed or canceled
        if (deposit.status === 'PAYMENT' || deposit.status === 'CANCELED' || deposit.status === 'ERROR') {
            return successResponse({
                deposit: deposit,
                status: deposit.status,
                message: 'Deposit status is final'
            });
        }

        const details = deposit.detail_transaction as any;
        const provider = details?.provider;
        const paymentId = details?.payment_id;

        if (!provider || !paymentId) {
            return errorResponse('Payment details incomplete');
        }

        // Get gateway configuration
        const gateway = await prisma.paymentGateway.findFirst({
            where: {
                provider: provider,
                status: 'ACTIVE'
            }
        });

        if (!gateway) {
            return errorResponse('Payment gateway not found');
        }

        let statusResult;

        // Check status based on provider
        if (provider === 'PAYPAL') {
            statusResult = await checkPayPalStatus(gateway, paymentId);
        } else if (provider === 'CRYPTOMUS') {
            statusResult = await checkCryptomusStatus(gateway, paymentId);
        } else {
            return errorResponse('Unsupported payment provider');
        }

        // Update deposit status if changed
        let updatedDeposit = deposit;
        if (statusResult.status !== deposit.status) {
            updatedDeposit = await prisma.$transaction(async (tx) => {
                // Update deposit status
                const updated = await tx.deposits.update({
                    where: { id: deposit.id },
                    data: { status: statusResult.status as any }
                });

                // Update user balance if payment completed
                if (statusResult.status === 'PAYMENT') {
                    await tx.user.update({
                        where: { id: user.id },
                        data: {
                            balance: { increment: deposit.amount }
                        }
                    });
                }

                return updated;
            });
        }

        return successResponse({
            deposit: updatedDeposit,
            status: statusResult.status,
            raw_status: statusResult.raw_status,
            message: 'Deposit status updated successfully'
        });

    } catch (error) {
        console.error('Check Status Error:', error);
        return errorResponse('Failed to check payment status');
    }
}