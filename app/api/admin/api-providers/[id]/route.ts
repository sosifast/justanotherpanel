import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single API provider
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        const provider = await prisma.apiProvider.findUnique({
            where: { id }
        });

        if (!provider) {
            return NextResponse.json(
                { error: 'Provider not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(provider, { status: 200 });
    } catch (error) {
        console.error('Error fetching API provider:', error);
        return NextResponse.json(
            { error: 'Failed to fetch API provider' },
            { status: 500 }
        );
    }
}

// PUT - Update API provider
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();
        const { name, code, url, api_key, balance, status } = body;

        // Check if provider exists
        const existing = await prisma.apiProvider.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Provider not found' },
                { status: 404 }
            );
        }

        // Check if code is being changed and if it conflicts
        if (code && code !== existing.code) {
            const codeExists = await prisma.apiProvider.findUnique({
                where: { code }
            });

            if (codeExists) {
                return NextResponse.json(
                    { error: 'Provider code already exists' },
                    { status: 409 }
                );
            }
        }

        const provider = await prisma.apiProvider.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(code && { code }),
                ...(url && { url }),
                ...(api_key && { api_key }),
                ...(balance !== undefined && { balance }),
                ...(status && { status })
            }
        });

        return NextResponse.json(provider, { status: 200 });
    } catch (error) {
        console.error('Error updating API provider:', error);
        return NextResponse.json(
            { error: 'Failed to update API provider' },
            { status: 500 }
        );
    }
}

// DELETE - Delete API provider
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Check if provider exists
        const existing = await prisma.apiProvider.findUnique({
            where: { id },
            include: {
                services: true,
                orders: true
            }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Provider not found' },
                { status: 404 }
            );
        }

        // Check if provider has associated services or orders
        if (existing.services.length > 0 || existing.orders.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete provider with associated services or orders' },
                { status: 409 }
            );
        }

        await prisma.apiProvider.delete({
            where: { id }
        });

        return NextResponse.json(
            { message: 'Provider deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting API provider:', error);
        return NextResponse.json(
            { error: 'Failed to delete API provider' },
            { status: 500 }
        );
    }
}
