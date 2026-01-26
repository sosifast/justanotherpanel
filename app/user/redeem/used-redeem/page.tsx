import { prisma } from '@/lib/prisma';
import RedeemHistoryClient from './RedeemHistoryClient';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Redeem History',
    description: 'View your previously claimed redeem codes.'
};

export default async function RedeemHistoryPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    const userId = session.id;

    const history = await prisma.redeemUsed.findMany({
        where: { id_user: userId },
        include: {
            redeem_code: {
                select: {
                    name_code: true,
                    get_balance: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    const serializedHistory = history.map((item: any) => ({
        ...item,
        created_at: item.created_at.toISOString(),
        redeem_code: {
            ...item.redeem_code,
            get_balance: Number(item.redeem_code.get_balance)
        }
    }));

    return <RedeemHistoryClient initialHistory={serializedHistory} />;
}
