import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all services
export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { id: 'asc' },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        platform: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                api_provider: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        });

        return NextResponse.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

// POST - Create new service
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            id_category,
            sid,
            id_api_provider,
            min,
            max,
            price_api,
            price_sale,
            price_reseller,
            refill,
            type,
            status,
            note
        } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Service name is required' },
                { status: 400 }
            );
        }

        if (!id_category) {
            return NextResponse.json(
                { error: 'Category is required' },
                { status: 400 }
            );
        }

        if (min === undefined || max === undefined) {
            return NextResponse.json(
                { error: 'Min and Max values are required' },
                { status: 400 }
            );
        }

        if (price_api === undefined || price_sale === undefined || price_reseller === undefined) {
            return NextResponse.json(
                { error: 'All price fields are required' },
                { status: 400 }
            );
        }

        // Check if category exists
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id_category) }
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check if api provider exists (if provided)
        if (id_api_provider) {
            const apiProvider = await prisma.apiProvider.findUnique({
                where: { id: parseInt(id_api_provider) }
            });

            if (!apiProvider) {
                return NextResponse.json(
                    { error: 'API Provider not found' },
                    { status: 404 }
                );
            }
        }

        // Create service
        const service = await prisma.service.create({
            data: {
                name,
                id_category: parseInt(id_category),
                sid: sid || null,
                id_api_provider: id_api_provider ? parseInt(id_api_provider) : null,
                min: parseInt(min),
                max: parseInt(max),
                price_api: parseFloat(price_api),
                price_sale: parseFloat(price_sale),
                price_reseller: parseFloat(price_reseller),
                refill: refill || false,
                type: type || 'DEFAULT',
                status: status || 'ACTIVE',
                note: note || null
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        platform: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                api_provider: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error('Error creating service:', error);
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}
