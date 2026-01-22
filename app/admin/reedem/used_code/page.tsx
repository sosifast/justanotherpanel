import { prisma } from '@/lib/prisma';
import ReedemUsedClient from './ReedemUsedClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Redeem History",
    description: "View redeem history."
};

export default async function ReedemUsedPage() {
    const history = await prisma.redeemUsed.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            user: {
                select: { username: true, email: true }
            },
            redeem_code: {
                select: { name_code: true, get_balance: true }
            }
        }
    });

    const serializedHistory = history.map((item: any) => ({
        ...item,
        redeem_code: {
            ...item.redeem_code,
            get_balance: Number(item.redeem_code.get_balance)
        },
        created_at: item.created_at.toISOString(),
        updated_at: item.updated_at.toISOString(),
    }));

    return <ReedemUsedClient initialHistory={serializedHistory as any} />;
}
