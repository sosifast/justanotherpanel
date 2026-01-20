import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET - Get single user
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                full_name: true,
                username: true,
                email: true,
                balance: true,
                role: true,
                status: true,
                created_at: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

// PUT - Update user
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { full_name, username, email, password, role, status, balance } = body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check for duplicate email/username (excluding current user)
        if (email || username) {
            const duplicateUser = await prisma.user.findFirst({
                where: {
                    AND: [
                        { id: { not: parseInt(id) } },
                        {
                            OR: [
                                ...(email ? [{ email }] : []),
                                ...(username ? [{ username }] : [])
                            ]
                        }
                    ]
                }
            });

            if (duplicateUser) {
                return NextResponse.json(
                    { error: 'Email or username already taken by another user' },
                    { status: 409 }
                );
            }
        }

        // Build update data
        const updateData: any = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (status !== undefined) updateData.status = status;
        if (balance !== undefined) updateData.balance = balance;

        // Only update password if provided
        if (password) {
            updateData.password = await hash(password, 12);
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                full_name: true,
                username: true,
                email: true,
                balance: true,
                role: true,
                status: true,
                created_at: true,
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// DELETE - Delete user
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete user
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
