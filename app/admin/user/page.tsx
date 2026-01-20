import { prisma } from '@/lib/prisma';
import UsersClient from './UsersClient';

export default async function UsersPage() {
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
