import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
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

        const ticket = await prisma.ticket.findFirst({
            where: {
                id: ticketId,
                id_user: user.id
            }
        });

        if (!ticket) {
            return errorResponse('Ticket not found', 404);
        }

        return successResponse({ ticket });
    } catch (error) {
        console.error('Mobile Get Single Ticket Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
