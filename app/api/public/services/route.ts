import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Fetch all active services with their categories and platforms
        const services = await prisma.service.findMany({
            where: {
                status: 'ACTIVE',
                category: {
                    status: 'ACTIVE',
                    platform: {
                        status: 'ACTIVE'
                    }
                }
            },
            select: {
                id: true,
                name: true,
                min: true,
                max: true,
                price_sale: true,
                refill: true,
                note: true,
                status: true,
                category: {
                    select: {
                        name: true,
                        platform: {
                            select: {
                                name: true,
                                slug: true,
                                icon_imagekit_url: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                {
                    category: {
                        platform: {
                            name: 'asc'
                        }
                    }
                },
                {
                    category: {
                        name: 'asc'
                    }
                },
                {
                    name: 'asc'
                }
            ]
        });

        // Get settings for the frontend
        const settings = await getSettings();

        return NextResponse.json({
            success: true,
            services,
            settings: {
                site_name: settings?.site_name,
                logo_imagekit_url: settings?.logo_imagekit_url,
                favicon_imagekit_url: settings?.favicon_imagekit_url
            }
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch services'
            },
            { status: 500 }
        );
    }
}
