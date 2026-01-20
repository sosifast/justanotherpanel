import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// GET - Get single platform
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const platform = await prisma.platform.findUnique({
            where: { id: parseInt(id) }
        });

        if (!platform) {
            return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
        }

        return NextResponse.json(platform);
    } catch (error) {
        console.error('Error fetching platform:', error);
        return NextResponse.json({ error: 'Failed to fetch platform' }, { status: 500 });
    }
}

// PUT - Update platform
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, icon_imagekit_url, status } = body;

        // Check if platform exists
        const existingPlatform = await prisma.platform.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingPlatform) {
            return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
        }

        // Build update data
        const updateData: any = {};

        if (name !== undefined) {
            updateData.name = name;
            updateData.slug = generateSlug(name);

            // Check for duplicate slug (excluding current platform)
            const duplicatePlatform = await prisma.platform.findFirst({
                where: {
                    AND: [
                        { id: { not: parseInt(id) } },
                        { slug: updateData.slug }
                    ]
                }
            });

            if (duplicatePlatform) {
                return NextResponse.json(
                    { error: 'Platform with this name already exists' },
                    { status: 409 }
                );
            }
        }

        if (icon_imagekit_url !== undefined) updateData.icon_imagekit_url = icon_imagekit_url;
        if (status !== undefined) updateData.status = status;

        const platform = await prisma.platform.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return NextResponse.json(platform);
    } catch (error) {
        console.error('Error updating platform:', error);
        return NextResponse.json({ error: 'Failed to update platform' }, { status: 500 });
    }
}

// DELETE - Delete platform
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if platform exists
        const existingPlatform = await prisma.platform.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { categories: true }
                }
            }
        });

        if (!existingPlatform) {
            return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
        }

        // Check if platform has categories
        if (existingPlatform._count.categories > 0) {
            return NextResponse.json(
                { error: `Cannot delete platform with ${existingPlatform._count.categories} categories. Please delete or move categories first.` },
                { status: 400 }
            );
        }

        // Delete platform
        await prisma.platform.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Platform deleted successfully' });
    } catch (error) {
        console.error('Error deleting platform:', error);
        return NextResponse.json({ error: 'Failed to delete platform' }, { status: 500 });
    }
}
