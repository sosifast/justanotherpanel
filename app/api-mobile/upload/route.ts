import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ImageKit from 'imagekit';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { errorResponse, successResponse } from '@/lib/api-response';

export const maxDuration = 60; // Allow 60s for image upload

/**
 * POST /api-mobile/upload
 * 
 * Uploads an image file to ImageKit for storage. 
 * Used primarily for profile pictures or support ticket attachments.
 * 
 * Auth: Required (Bearer Token)
 * 
 * Request Body: Multipart/Form-Data
 * - file: The image binary to upload (max 5MB).
 * 
 * Response (201):
 * {
 *   "url": string,    // The public URL of the uploaded image
 *   "fileId": string  // ImageKit file reference ID
 * }
 * 
 * Errors:
 * 400 - No file uploaded or invalid file type (non-image)
 * 401 - Unauthorized
 * 500 - ImageKit configuration missing or upload failure
 */
export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return errorResponse('No file uploaded', 400);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return errorResponse('Valid image file is required', 400);
        }

        // Check file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return errorResponse('File size should not exceed 5MB', 400);
        }

        // Get ImageKit credentials from Setting model
        const settings = await prisma.setting.findFirst();

        if (!settings?.imagekit_publickey || !settings?.imagekit_privatekey || !settings?.imagekit_url) {
            return errorResponse('ImageKit is not configured securely on server', 500);
        }

        const imagekit = new ImageKit({
            publicKey: settings.imagekit_publickey,
            privateKey: settings.imagekit_privatekey,
            urlEndpoint: settings.imagekit_url,
        });

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResponse = await new Promise((resolve, reject) => {
            imagekit.upload({
                file: buffer,
                fileName: file.name || `mobile_upload_${Date.now()}.jpg`,
                folder: '/mobile_uploads',
            }, function (error, result) {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return successResponse({
            url: (uploadResponse as any).url,
            fileId: (uploadResponse as any).fileId,
        }, 'Image uploaded successfully', 201);

    } catch (error) {
        console.error('Mobile Image Upload Error:', error);
        return errorResponse('Failed to upload image', 500);
    }
}
