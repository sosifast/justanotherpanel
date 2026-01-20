import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { id: 'asc' },
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

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST - Create new category
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, id_platform, status } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        if (!id_platform) {
            return NextResponse.json(
                { error: 'Platform is required' },
                { status: 400 }
            );
        }

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

        // Create category
        const category = await prisma.category.create({
            data: {
                name,
                id_platform: parseInt(id_platform),
                status: status || 'ACTIVE',
            },
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

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
