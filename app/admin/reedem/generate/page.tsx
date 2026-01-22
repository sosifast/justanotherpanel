import { prisma } from '@/lib/prisma';
import ReedemGenerateClient from './ReedemGenerateClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Redeem Codes",
    description: "Manage redeem codes."
};

export default async function ReedemGeneratePage() {
    const codes = await prisma.redeemCode.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            _count: {
                select: { used_by: true }
            }
        }
    });

    const serializedCodes = codes.map((code: any) => ({
        ...code,
        get_balance: Number(code.get_balance),
        created_at: code.created_at.toISOString(),
        expired_date: code.expired_date.toISOString(),
    }));

    return <ReedemGenerateClient initialCodes={serializedCodes as any} />;
}
