import { prisma } from "@/lib/prisma";
import { Metadata } from 'next';
import ResellerClient from './ResellerClient';

export const metadata: Metadata = {
    title: "Resellers",
    description: "Manage registered resellers."
};

export default async function AdminResellerPage() {
    const resellers = await prisma.reseller.findMany({
        include: {
            user: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    // Serialize Decimal fields
    const serialized = resellers.map(r => ({
        ...r,
        created_at: r.created_at.toISOString(),
        user: {
            ...r.user,
            balance: Number(r.user.balance),
            created_at: r.user.created_at.toISOString(),
            updated_at: r.user.updated_at.toISOString(),
        }
    }));

    return <ResellerClient resellers={serialized as any} />;
}
