import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { createAdminNotification } from '@/lib/admin-notifications';
import axios from 'axios';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const authHeader = request.headers.get('authorization');

        const isValidKey = key === process.env.CRON_SECRET;
        const isValidHeader = authHeader === `Bearer ${process.env.CRON_SECRET}`;

        if (!isValidKey && !isValidHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch pending Cryptomus deposits
        // We'll look into detail_transaction which is JSON
        // Since we can't easily filter JSON in Prisma findMany without raw query or specific setup, 
        // we'll fetch all PENDING deposits and filter in JS for now, assuming volume is manageable.
        // A better way would be a specific metadata field or raw SQL.
        const pendingDeposits = await prisma.deposits.findMany({
            where: {
                status: 'PENDING'
            }
        });

        const cryptomusDeposits = pendingDeposits.filter(d => {
            const details = d.detail_transaction as any;
            return details?.provider === 'CRYPTOMUS' && details?.cryptomus_uuid;
        });

        if (cryptomusDeposits.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No pending Cryptomus deposits to sync',
                count: 0
            });
        }

        let updatedCount = 0;
        const details: any[] = [];

        // 2. Process each deposit
        for (const deposit of cryptomusDeposits) {
            const transactionDetails = deposit.detail_transaction as any;
            const gatewayId = transactionDetails.gateway_id;

            if (!gatewayId) continue;

            const gateway = await prisma.paymentGateway.findUnique({
                where: { id: gatewayId }
            });

            if (!gateway) continue;

            const config = gateway.api_config as any;
            if (!config.merchantId || !config.paymentKey) continue;

            try {
                const payload = {
                    uuid: transactionDetails.cryptomus_uuid,
                    order_id: transactionDetails.order_id
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
                const cryptoStatus = result.result?.status;

                let newStatus = 'PENDING';
                if (['paid', 'paid_over'].includes(cryptoStatus)) {
                    newStatus = 'PAYMENT';
                } else if (['cancel', 'system_fail', 'fail', 'refund'].includes(cryptoStatus)) {
                    newStatus = 'CANCELED';
                } else if (['process', 'confirm_check', 'check'].includes(cryptoStatus)) {
                    newStatus = 'PENDING';
                }

                if (newStatus !== 'PENDING' && newStatus !== deposit.status) {
                    await prisma.$transaction(async (tx) => {
                        await tx.deposits.update({
                            where: { id: deposit.id },
                            data: { status: newStatus as any }
                        });

                        if (newStatus === 'PAYMENT') {
                            await tx.user.update({
                                where: { id: deposit.id_user },
                                data: {
                                    balance: { increment: deposit.amount }
                                }
                            });
                        }
                    });

                    // Create Notifications outside transaction to avoid blocking it
                    if (newStatus === 'PAYMENT') {
                        await createNotification(
                            deposit.id_user,
                            `Deposit Successful`,
                            `Your deposit of $${deposit.amount} is now successful.`,
                            'DEPOSIT',
                            deposit.id
                        );
                        await createAdminNotification(
                            'Deposit Successful',
                            `Deposit #${deposit.id} status updated to PAYMENT.`,
                            'NEW_DEPOSIT',
                            deposit.id
                        );
                    } else if (newStatus === 'CANCELED') {
                        await createNotification(
                            deposit.id_user,
                            `Deposit Canceled`,
                            `Your deposit of $${deposit.amount} was canceled.`,
                            'DEPOSIT',
                            deposit.id
                        );
                        await createAdminNotification(
                            'Deposit Canceled',
                            `Deposit #${deposit.id} status updated to CANCELED.`,
                            'DEPOSIT_UPDATE',
                            deposit.id
                        );
                    }

                    updatedCount++;
                    details.push({ id: deposit.id, old: deposit.status, new: newStatus });
                }

            } catch (err: any) {
                console.error(`Error checking Cryptomus deposit #${deposit.id}:`, err?.response?.data || err.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${cryptomusDeposits.length} Cryptomus deposits`,
            updated_count: updatedCount,
            details
        });

    } catch (error: any) {
        console.error('Cryptomus cron error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
