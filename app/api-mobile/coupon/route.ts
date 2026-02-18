
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const { code } = await req.json();

        if (!code) {
            return errorResponse('Code is required');
        }

        const redeemCode = await prisma.redeemCode.findUnique({
            where: { name_code: code },
            include: {
                used_by: {
                    where: { id_user: user.id }
                }
            }
        });

        if (!redeemCode) {
            return errorResponse('Invalid code');
        }

        if (redeemCode.status !== 'ACTIVE') {
            return errorResponse('Code is inactive');
        }

        if (new Date() > redeemCode.expired_date) {
            return errorResponse('Code has expired');
        }

        if (redeemCode.quota <= 0) {
            return errorResponse('Code quota exceeded');
        }

        if (redeemCode.used_by.length > 0) {
            return errorResponse('You have already used this code');
        }

        // Process redemption transaction
        await prisma.$transaction(async (tx) => {
            // 1. Create RedeemUsed record
            await tx.redeemUsed.create({
                data: {
                    id_user: user.id,
                    id_redeem_code: redeemCode.id,
                }
            });

            // 2. Decrement quota
            await tx.redeemCode.update({
                where: { id: redeemCode.id },
                data: {
                    quota: { decrement: 1 }
                }
            });

            // 3. Add balance to user
            await tx.user.update({
                where: { id: user.id },
                data: {
                    balance: { increment: redeemCode.get_balance }
                }
            });

            // 4. Create a Deposit record to log this transaction in history? 
            // Usually redeem codes are just balance adjustments or special deposit types.
            // Looking at schema, `Deposits` table seems unrelated to Redeem.
            // But user balance is updated.
        });

        return successResponse({
            success: true,
            message: `Successfully redeemed ${redeemCode.get_balance} balance`,
            amount: redeemCode.get_balance
        });

    } catch (error) {
        console.error('Coupon Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
