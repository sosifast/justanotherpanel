import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createAdminNotification } from '@/lib/admin-notifications';
import { createNotification } from '@/lib/notifications';
import { triggerPusher } from '@/lib/pusher';

type TicketMessage = {
    sender: string;
    content: string;
    image_url?: string | null;
    created_at: string;
};

import { uploadFileToImageKit } from '@/lib/imagekit-server';
import { sanitizeInput } from '@/lib/security';

/**
 * POST /api-mobile/tickets/[id]/reply
 * 
 * Appends a new message to an existing ticket. 
 * Supports both JSON and Multipart/Form-Data (for image attachments).
 * Sets ticket status back to 'PENDING' for admin review.
 * 
 * Auth: Required (Bearer Token)
 * 
 * Request (JSON or Form-Data):
 * - message/content: string (required if no file)
 * - file: Image binary (optional, via form-data)
 * 
 * Response (201):
 * {
 *   "message": NewMessageObject,
 *   "info": "Reply sent successfully"
 * }
 * 
 * Errors:
 * 400 - Missing message or file
 * 401 - Unauthorized
 * 403 - Cannot reply to a CLOSED ticket
 * 404 - Ticket not found
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await verifyMobileToken(req);
    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const { id } = await params;
        const ticketId = parseInt(id);

        if (isNaN(ticketId)) {
            return errorResponse('Invalid ticket ID', 400);
        }

        let contentVal = '';
        let image_url: string | null = null;
        let file: File | null = null;

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            contentVal = (formData.get('message') as string) || (formData.get('content') as string) || '';
            file = formData.get('file') as File | null;
        } else {
            const body = await req.json().catch(() => ({}));
            contentVal = body.message || body.content || '';
            image_url = body.image_url || null;
        }

        if (!contentVal && !image_url && !file) {
            return errorResponse('Message or image file is required', 400);
        }

        if (file) {
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

        const ticket = await prisma.ticket.findFirst({
            where: {
                id: ticketId,
                id_user: user.id
            }
        });

        if (!ticket) {
            return errorResponse('Ticket not found', 404);
        }

        if (ticket.status === 'CLOSED') {
            return errorResponse('Cannot reply to a closed ticket', 403);
        }

        const existingMessages = Array.isArray(ticket.messages)
            ? (ticket.messages as TicketMessage[])
            : [];

        const newMessage: TicketMessage = {
            sender: 'user',
            content: sanitizeInput(contentVal) || '',
            image_url: image_url || null,
            created_at: new Date().toISOString()
        };

        const updatedMessages = [...existingMessages, newMessage];

        await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                messages: updatedMessages,
                status: 'PENDING'
            }
        });

        // Realtime: push new message to ticket channel
        await triggerPusher(`private-ticket-${ticketId}`, 'new-message', {
            ticketId,
            sender: 'user',
            userId: user.id,
            message: newMessage
        }).catch(err => console.error('Failed to trigger pusher:', err));

        // Notify Admin
        await createAdminNotification(
            'Ticket Reply',
            `User #${user.id} replied to ticket #${ticketId}.`,
            'TICKET_UPDATE',
            ticketId
        ).catch(err => console.error('Failed to notify admin:', err));

        // Push confirmation to user
        createNotification(
            user.id,
            'Reply Sent',
            `Your reply on ticket #${ticketId} has been sent. Our team will respond soon.`,
            'TICKET',
            ticketId,
            { ticket_id: String(ticketId), screen: 'ticket_detail' }
        ).catch(() => { });

        return successResponse({
            message: newMessage,
            info: 'Reply sent successfully'
        }, undefined, 201);

    } catch (error) {
        console.error('Mobile Reply Ticket Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
