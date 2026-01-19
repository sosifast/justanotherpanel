import { prisma } from "@/lib/prisma";
import OrderHistoryView from "./view";

export default async function OrderHistoryPage() {
    // TODO: Get actual logged in user ID
    const userId = 1;

    const orders = await prisma.order.findMany({
        where: {
            id_user: userId
        },
        include: {
            service: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return <OrderHistoryView initialOrders={orders} />;
}
