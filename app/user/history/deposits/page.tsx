import { prisma } from "@/lib/prisma";
import DepositsView from "./view";

export default async function DepositsPage() {
    // TODO: Get actual logged in user ID
    const userId = 1;

    const deposits = await prisma.deposits.findMany({
        where: {
            id_user: userId
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return <DepositsView initialDeposits={deposits} />;
}
