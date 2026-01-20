import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single service
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const service = await prisma.service.findUnique({
            where: { id: parseInt(id) },
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

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
    }
}

// PUT - Update service
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        // Check if service exists
        const existingService = await prisma.service.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingService) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Build update data
        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (sid !== undefined) updateData.sid = sid || null;
        if (min !== undefined) updateData.min = parseInt(min);
        if (max !== undefined) updateData.max = parseInt(max);
        if (price_api !== undefined) updateData.price_api = parseFloat(price_api);
        if (price_sale !== undefined) updateData.price_sale = parseFloat(price_sale);
        if (price_reseller !== undefined) updateData.price_reseller = parseFloat(price_reseller);
        if (refill !== undefined) updateData.refill = refill;
        if (type !== undefined) updateData.type = type;
        if (status !== undefined) updateData.status = status;
        if (note !== undefined) updateData.note = note || null;

        if (id_category !== undefined) {
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
            updateData.id_category = parseInt(id_category);
        }

        if (id_api_provider !== undefined) {
            if (id_api_provider) {
                // Check if api provider exists
                const apiProvider = await prisma.apiProvider.findUnique({
                    where: { id: parseInt(id_api_provider) }
                });

                if (!apiProvider) {
                    return NextResponse.json(
                        { error: 'API Provider not found' },
                        { status: 404 }
                    );
                }
                updateData.id_api_provider = parseInt(id_api_provider);
            } else {
                updateData.id_api_provider = null;
            }
        }

        const service = await prisma.service.update({
            where: { id: parseInt(id) },
            data: updateData,
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

        return NextResponse.json(service);
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

// DELETE - Delete service
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if service exists
        const existingService = await prisma.service.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        if (!existingService) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Check if service has orders
        if (existingService._count.orders > 0) {
            return NextResponse.json(
                { error: `Cannot delete service with ${existingService._count.orders} orders. Please archive or handle orders first.` },
                { status: 400 }
            );
        }

        // Delete service
        await prisma.service.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
