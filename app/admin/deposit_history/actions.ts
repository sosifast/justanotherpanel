'use server';

import { prisma } from '@/lib/prisma';
import axios from 'axios';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import paypal from '@paypal/checkout-server-sdk';

export async function checkCryptomusStatus(depositId: number) {
    try {
        const deposit = await prisma.deposits.findUnique({
            where: { id: depositId },
            include: {
                user: true
            }
        });

        if (!deposit) {
            return { success: false, message: 'Deposit not found' };
        }

        const detail = deposit.detail_transaction as any;
        if (detail?.provider !== 'CRYPTOMUS') {
            return { success: false, message: 'Not a Cryptomus deposit' };
        }

        // Try to find by ID from transaction if possible, or just any Cryptomus gateway
        let targetGateway = null;
        if (detail.gateway_id) {
            targetGateway = await prisma.paymentGateway.findUnique({ where: { id: detail.gateway_id } });
        }

        if (!targetGateway) {
            targetGateway = await prisma.paymentGateway.findFirst({ where: { provider: 'CRYPTOMUS' } });
        }

        if (!targetGateway) {
            return { success: false, message: 'Cryptomus gateway configuration not found' };
        }

        const config = targetGateway.api_config as any;
        if (!config.merchantId || !config.paymentKey) {
            return { success: false, message: 'Invalid Cryptomus configuration' };
        }

        const payload = {
            order_id: detail.order_id,
            uuid: detail.cryptomus_uuid
        };

        // Remove undefined/null values
        if (!payload.order_id) delete (payload as any).order_id;
        if (!payload.uuid) delete (payload as any).uuid;

        if (Object.keys(payload).length === 0) {
            return { success: false, message: 'No order_id or uuid found in transaction details' };
        }

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
        /*
          Cryptomus statuses:
          paid, paid_over, wrong_amount_waiting, process, confirm_check, wrong_amount, fail, cancel, system_fail, refund_process, refund_fail, refund_paid
        */

        let newStatus = deposit.status;
        const status = result.result.status;
        const isPaid = ['paid', 'paid_over'].includes(status);
        const isError = ['fail', 'system_fail'].includes(status);
        const isCanceled = ['cancel'].includes(status);

        if (isPaid && deposit.status !== 'PAYMENT') {
            newStatus = 'PAYMENT';

            await prisma.$transaction(async (tx) => {
                await tx.deposits.update({
                    where: { id: deposit.id },
                    data: { status: 'PAYMENT' }
                });

                await tx.user.update({
                    where: { id: deposit.id_user },
                    data: {
                        balance: { increment: deposit.amount }
                    }
                });
            });

        } else if (isError && deposit.status !== 'ERROR') {
            newStatus = 'ERROR';
            await prisma.deposits.update({
                where: { id: deposit.id },
                data: { status: 'ERROR' }
            });
        } else if (isCanceled && deposit.status !== 'CANCELED') {
            newStatus = 'CANCELED';
            await prisma.deposits.update({
                where: { id: deposit.id },
                data: { status: 'CANCELED' }
            });
        }

        revalidatePath('/admin/deposit_history');
        return { success: true, message: `Status updated to ${newStatus} (${status})`, status: newStatus };

    } catch (error: any) {
        console.error('Check Cryptomus Status Error:', error);
        return { success: false, message: error.message || 'Failed to check status' };
    }
}

export async function checkPaypalStatus(depositId: number) {
    try {
        const deposit = await prisma.deposits.findUnique({
            where: { id: depositId },
            include: { user: true }
        });

        if (!deposit) return { success: false, message: 'Deposit not found' };

        const detail = deposit.detail_transaction as any;
        if (detail?.provider !== 'PAYPAL') {
            return { success: false, message: 'Not a PayPal deposit' };
        }

        if (!detail.paypal_order_id) {
            return { success: false, message: 'No PayPal order ID found' };
        }

        let gateway = null;
        if (detail.gateway_id) {
            gateway = await prisma.paymentGateway.findUnique({ where: { id: detail.gateway_id } });
        }
        if (!gateway) {
            gateway = await prisma.paymentGateway.findFirst({ where: { provider: 'PAYPAL' } });
        }
        if (!gateway) return { success: false, message: 'PayPal gateway configuration not found' };

        const config = gateway.api_config as any;
        if (!config.clientId || !config.clientSecret) {
            return { success: false, message: 'Invalid PayPal configuration' };
        }

        const Environment = config.mode === 'live'
            ? paypal.core.LiveEnvironment
            : paypal.core.SandboxEnvironment;

        const client = new paypal.core.PayPalHttpClient(
            new Environment(config.clientId, config.clientSecret)
        );

        const request = new paypal.orders.OrdersGetRequest(detail.paypal_order_id);
        const order = await client.execute(request);
        const ppStatus = order.result.status;

        let newStatus = deposit.status;
        if (ppStatus === 'COMPLETED') newStatus = 'PAYMENT';
        else if (ppStatus === 'VOIDED') newStatus = 'CANCELED';

        if (newStatus !== deposit.status) {
            await prisma.$transaction(async (tx) => {
                await tx.deposits.update({
                    where: { id: deposit.id },
                    data: { status: newStatus as any }
                });
                if (newStatus === 'PAYMENT') {
                    await tx.user.update({
                        where: { id: deposit.id_user },
                        data: { balance: { increment: deposit.amount } }
                    });
                }
            });
        }

        revalidatePath('/admin/deposit_history');
        return { success: true, message: `PayPal status: ${ppStatus} -> ${newStatus}`, status: newStatus };

    } catch (error: any) {
        console.error('Check PayPal Status Error:', error);
        return { success: false, message: error.message || 'Failed to check PayPal status' };
    }
}

export async function checkDepositStatus(depositId: number) {
    const deposit = await prisma.deposits.findUnique({ where: { id: depositId } });
    if (!deposit) return { success: false, message: 'Deposit not found' };
    const provider = (deposit.detail_transaction as any)?.provider;
    if (provider === 'PAYPAL') return checkPaypalStatus(depositId);
    if (provider === 'CRYPTOMUS') return checkCryptomusStatus(depositId);
    return { success: false, message: 'No auto-check available for this payment method' };
}
