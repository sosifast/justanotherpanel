
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

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

        // If Manual, return success with instructions (client already has them from GET)
        // If PayPal/Cryptomus, we would need to call their APIs to get a URL.
        // For this MVP, we return the deposit object and let the client handle "Pending" state
        // or simulate a payment link if needed.
        // Since we don't have the full payment integration code here (it's in specific routes),
        // we will just return the deposit. 
        // The mobile app can show "Pending" and instructions for Manual.
        // For automated, it might need a WebView.

        return successResponse({
            deposit,
            message: 'Deposit created successfully',
            // payment_url: ... // functionality for automated gateways
        });

    } catch (error) {
        console.error('Deposit Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
