import { prisma } from "@/lib/prisma";
import DepositsView from "./view";
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Deposit History",
    description: "View your previous balance top-ups and deposits.",
};

export default async function DepositsPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect('/auth/login');
    }

    const userId = session.id;

    const deposits = await prisma.deposits.findMany({
        where: {
            id_user: userId
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    const serializedDeposits = deposits.map(deposit => ({
        ...deposit,
        amount: Number(deposit.amount)
    }));

    return <DepositsView initialDeposits={serializedDeposits} />;
}
