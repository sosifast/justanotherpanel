import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * POST /api-mobile/reedem
 *
 * Endpoint untuk meredeem BALANCE TOP-UP CODE yang di-generate oleh admin
 * melalui panel Admin → Redeem → Generate Code.
 *
 * BUKAN untuk kode diskon order (discount coupon). Kode diskon order
 * digunakan melalui field `discount_code` di POST /order.
 *
 * Request Body:
 *   { "code": "TOPUP2026" }
 *
 * Validations (in order):
 *   1. code field must be provided
 *   2. Code must exist (RedeemCode table)
 *   3. Code status must be ACTIVE
 *   4. Code must not be expired (expired_date > now)
 *   5. Code quota must be > 0
 *   6. User must not have already redeemed this code
 *
 * On success, atomically:
 *   - Creates a RedeemUsed record
 *   - Decrements the code quota by 1
 *   - Increments the user's balance by get_balance amount
 */
export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const body = await req.json();
        const { code } = body;

        if (!code || typeof code !== 'string' || !code.trim()) {
            return errorResponse('Code is required', 400);
        }

        const trimmedCode = code.trim().toUpperCase();

        // Fetch the redeem code along with this user's usage record (if any)
        const redeemCode = await prisma.redeemCode.findUnique({
            where: { name_code: trimmedCode },
            include: {
                used_by: {
                    where: { id_user: user.id },
                },
                _count: {
                    select: { used_by: true },
                },
            },
        });

        // --- Validation ---
        if (!redeemCode) {
            return errorResponse('Invalid redeem code', 400);
        }

        if (redeemCode.status !== 'ACTIVE') {
            return errorResponse('This redeem code is no longer active', 400);
        }

        if (new Date() > new Date(redeemCode.expired_date)) {
            return errorResponse('This redeem code has expired', 400);
        }

        if (redeemCode.quota <= 0) {
            return errorResponse('This redeem code quota has been fully used', 400);
        }

        if (redeemCode.used_by.length > 0) {
            return errorResponse('You have already redeemed this code', 400);
        }

        // --- Atomic transaction ---
        await prisma.$transaction(async (tx) => {
            // 1. Record usage
            await tx.redeemUsed.create({
                data: {
                    id_user: user.id,
                    id_redeem_code: redeemCode.id,
                },
            });

            // 2. Decrement quota
            await tx.redeemCode.update({
                where: { id: redeemCode.id },
                data: {
                    quota: { decrement: 1 },
                },
            });

            // 3. Credit user balance
            await tx.user.update({
                where: { id: user.id },
                data: {
                    balance: { increment: redeemCode.get_balance },
                },
            });
        });

        const balanceAdded = Number(redeemCode.get_balance);

        return successResponse(
            {
                amount: balanceAdded.toFixed(2),
                message: `Successfully redeemed $${balanceAdded.toFixed(2)} to your balance`,
            },
            'Redeem code applied successfully',
            200
        );

    } catch (error) {
        console.error('POST /api-mobile/reedem error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
