import { prisma } from "@/lib/prisma";
import DepositsView from "./view";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Deposit History",
    description: "View your previous balance top-ups and deposits.",
};

export default async function DepositsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return <div>Unauthorized</div>;
    }

    const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'default-secret-key-change-it'
    );

    let userId: number;
    try {
        const { payload } = await jwtVerify(token, secret);
        userId = parseInt(payload.sub as string);
    } catch (error) {
        return <div>Invalid session</div>;
    }

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
