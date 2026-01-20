import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// GET - Get all platforms
export async function GET() {
    try {
        const platforms = await prisma.platform.findMany({
            orderBy: { id: 'asc' },
            include: {
                _count: {
                    select: { categories: true }
                }
            }
        });

        return NextResponse.json(platforms);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
    }
}

// POST - Create new platform
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, icon_imagekit_url, status } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Platform name is required' },
                { status: 400 }
            );
        }

        // Generate slug
        const slug = generateSlug(name);

        // Check if platform with same slug already exists
        const existingPlatform = await prisma.platform.findUnique({
            where: { slug }
        });

        if (existingPlatform) {
            return NextResponse.json(
                { error: 'Platform with this name already exists' },
                { status: 409 }
            );
        }

        // Create platform
        const platform = await prisma.platform.create({
            data: {
                name,
                slug,
                icon_imagekit_url: icon_imagekit_url || null,
                status: status || 'ACTIVE',
            }
        });

        return NextResponse.json(platform, { status: 201 });
    } catch (error) {
        console.error('Error creating platform:', error);
        return NextResponse.json({ error: 'Failed to create platform' }, { status: 500 });
    }
}
