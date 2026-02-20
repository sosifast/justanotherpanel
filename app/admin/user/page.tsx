import { prisma } from '@/lib/prisma';
import UsersClient from './UsersClient';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
    title: "Users",
    description: "Manage users."
};

export default async function UsersPage() {
    const session = await getCurrentUser();

    if (!session || session.role !== 'ADMIN') {
        redirect('/auth/login');
    }

    const users = await prisma.user.findMany({
        orderBy: { created_at: 'desc' }
    });

    // Convert Decimal and Date to serializable types
    const serializedUsers = users.map(user => ({
        ...user,
        balance: Number(user.balance),
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString()
    }));

    return <UsersClient initialUsers={serializedUsers} />;
}
