import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single category
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                platform: {
                    select: {
                        id: true,
                        name: true,
                        icon_imagekit_url: true
                    }
                }
            }
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}

// PUT - Update category
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, id_platform, status } = body;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Build update data
        const updateData: any = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (id_platform !== undefined) {
            // Check if platform exists
            const platform = await prisma.platform.findUnique({
                where: { id: parseInt(id_platform) }
            });

            if (!platform) {
                return NextResponse.json(
                    { error: 'Platform not found' },
                    { status: 404 }
                );
            }
            updateData.id_platform = parseInt(id_platform);
        }

        if (status !== undefined) updateData.status = status;

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                platform: {
                    select: {
                        id: true,
                        name: true,
                        icon_imagekit_url: true
                    }
                },
                _count: {
                    select: { services: true }
                }
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE - Delete category
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { services: true }
                }
            }
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Check if category has services
        if (existingCategory._count.services > 0) {
            return NextResponse.json(
                { error: `Cannot delete category with ${existingCategory._count.services} services. Please delete or move services first.` },
                { status: 400 }
            );
        }

        // Delete category
        await prisma.category.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
