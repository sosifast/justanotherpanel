import React from 'react';
import { prisma } from '@/lib/prisma';
import StaffDepositsClient from './StaffDepositsClient';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Deposit Management | Staff Area",
    description: "View and manage user deposit history."
};

export default async function StaffDepositHistoryPage() {
    const session = await getCurrentUser();

    if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        redirect('/auth/login');
    }

    const deposits = await prisma.deposits.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            user: {
                select: {
                    username: true
                }
            }
        }
    });

    const serializedDeposits = deposits.map(d => ({
        ...d,
        amount: Number(d.amount),
        created_at: d.created_at.toISOString(),
        updated_at: d.updated_at.toISOString()
    }));

    return <StaffDepositsClient initialDeposits={serializedDeposits} />;
}
