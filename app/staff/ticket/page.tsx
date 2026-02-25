import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import StaffTicketsClient from './StaffTicketsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Ticket Management | Staff Area",
    description: "Manage and respond to user support tickets."
};

export default async function StaffTicketsPage() {
    const session = await getCurrentUser();

    if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        redirect('/auth/login');
    }

    return (
        <div className="space-y-6">
            <StaffTicketsClient />
        </div>
    );
}
