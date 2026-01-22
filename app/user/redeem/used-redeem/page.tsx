import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import RedeemHistoryClient from './RedeemHistoryClient';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Redeem History',
    description: 'View your previously claimed redeem codes.'
};

export default async function RedeemHistoryPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/auth/login');
    }

    try {
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-it'
        );
        const { payload } = await jwtVerify(token, secret);
        const userId = parseInt(payload.sub as string);

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
    } catch (error) {
        redirect('/auth/login');
    }
}
