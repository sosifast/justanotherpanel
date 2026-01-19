import { prisma } from "@/lib/prisma";
import TicketsView from "./view";

export default async function TicketsPage() {
    // TODO: Get actual logged in user ID
    const userId = 1;

    const tickets = await prisma.ticket.findMany({
        where: {
            id_user: userId
        },
        include: {
            messages: true
        },
        orderBy: {
            updated_at: 'desc'
        }
    });

    return <TicketsView initialTickets={tickets} />;
}
