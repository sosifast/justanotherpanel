import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createNotification } from '@/lib/notifications';
import { createAdminNotification } from '@/lib/admin-notifications';
import { uploadFileToImageKit } from '@/lib/imagekit-server';
import { sanitizeInput } from '@/lib/security';

type TicketMessage = {
    sender: string;
    content: string;
    image_url?: string | null;
    created_at: string;
};

// GET /api-mobile/tickets
/**
 * GET /api-mobile/tickets
 * 
 * Retrieves a list of support tickets for the authenticated user.
 * 
 * Auth: Required (Bearer Token)
 * 
 * Query Params:
 * - status (optional): Filter by status (OPEN, PENDING, ANSWERED, CLOSED).
 * - page (optional): Page number (default: 1).
 * - limit (optional): Items per page (default: 20).
 * 
 * Response (200):
 * {
 *   "list": TicketSummary[],
 *   "pagination": { page, limit, total, pages }
 * }
 */
export async function GET(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    try {
        const where: any = { id_user: user.id };
        if (status && status !== 'all' && status !== 'ALL') {
            where.status = status.toUpperCase();
        }

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                orderBy: { updated_at: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    subject: true,
                    category: true,
                    status: true,
                    priority: true,
                    created_at: true,
                    updated_at: true,
                }
            }),
            prisma.ticket.count({ where })
        ]);

        return successResponse({
            list: tickets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Mobile Get Tickets Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}

// POST /api-mobile/tickets
/**
 * POST /api-mobile/tickets
 * 
 * Creates a new support ticket. Supports both JSON and Multipart/Form-Data (for image attachments).
 * 
 * Auth: Required (Bearer Token)
 * 
 * Request (JSON or Form-Data):
 * - subject: string (required)
 * - category: string (required)
 * - message: string (required if no file)
 * - file: Image binary (optional, via form-data)
 * 
 * Response (201):
 * {
 *   "ticket": TicketObject,
 *   "message": "Ticket created successfully"
 * }
 * 
 * Errors:
 * 400 - Missing required fields or invalid file
 * 401 - Unauthorized
 * 500 - Upload failure or DB error
 */
export async function POST(req: NextRequest) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        let subject = '';
        let category = '';
        let message = '';
        let image_url: string | null = null;
        let file: File | null = null;

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            subject = (formData.get('subject') as string) || '';
            category = (formData.get('category') as string) || '';
            message = (formData.get('message') as string) || '';
            file = formData.get('file') as File | null;
        } else {
            const body = await req.json().catch(() => ({}));
            subject = body.subject || '';
            category = body.category || '';
            message = body.message || '';
            image_url = body.image_url || null;
        }

        if (!subject || !category || (!message && !image_url && !file)) {
            return errorResponse('Missing required fields: subject, category, and message/file', 400);
        }

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return errorResponse('Valid image file is required', 400);
            }
            if (file.size > 5 * 1024 * 1024) {
                return errorResponse('File size should not exceed 5MB', 400);
            }

            const uploadedUrl = await uploadFileToImageKit(file);
            if (!uploadedUrl) {
                return errorResponse('Failed to upload image file', 500);
            }
            image_url = uploadedUrl;
        }

        const initialMessage: TicketMessage = {
            sender: 'user',
            content: sanitizeInput(message) || '',
            image_url: image_url || null,
            created_at: new Date().toISOString()
        };

        const ticket = await prisma.ticket.create({
            data: {
                id_user: user.id,
                subject: sanitizeInput(subject),
                category,
                status: 'OPEN',
                priority: 'MEDIUM',
                messages: [initialMessage]
            }
        });

        // Notify Admin realtime
        await createAdminNotification(
            'New Support Ticket',
            `Ticket #${ticket.id}: "${subject}" opened by user #${user.id}.`,
            'NEW_TICKET',
            ticket.id
        ).catch(err => console.error('Failed to notify admin:', err));

        // Notify user (confirmation)
        await createNotification(
            user.id,
            'Ticket Created',
            `Your ticket "${subject}" has been submitted. Our team will respond soon.`,
            'TICKET',
            ticket.id
        ).catch(err => console.error('Failed to notify user:', err));

        return successResponse({
            ticket: {
                id: ticket.id,
                subject: ticket.subject,
                category: ticket.category,
                status: ticket.status,
                created_at: ticket.created_at,
            },
            message: 'Ticket created successfully'
        }, undefined, 201);
    } catch (error) {
        console.error('Mobile Create Ticket Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
