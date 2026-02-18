
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    return successResponse({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        balance: user.balance,
        role: user.role,
        profile_image: user.profile_imagekit_url,
        created_at: user.created_at,
        notification_preferences: await prisma.notificationPreferences.findUnique({
            where: { id_user: user.id }
        })
    });
}

export async function PUT(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const body = await req.json();
        const { full_name, password, new_password } = body;

        const updateData: any = {};

        if (full_name) {
            updateData.full_name = full_name;
        }

        if (new_password) {
            if (!password) {
                return errorResponse('Current password is required to set new password');
            }

            // Verify current password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return errorResponse('Incorrect current password');
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            updateData.password = hashedPassword;
        }

        if (Object.keys(updateData).length === 0) {
            return errorResponse('No data to update');
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                balance: true,
                profile_imagekit_url: true
            }
        });

        return successResponse({
            user: updatedUser,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Account Update Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
