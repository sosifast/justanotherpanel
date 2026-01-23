import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { providerId, services, categoryId, markupSale, markupReseller } = body;

        if (!providerId || !services || !categoryId || !Array.isArray(services)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const markupSaleVal = parseFloat(markupSale) || 0;
        const markupResellerVal = parseFloat(markupReseller) || 0;

        const importedServices = [];
        const errors = [];

        for (const service of services) {
            try {
                const providerRate = parseFloat(service.rate) || 0;
                const priceSale = providerRate * (1 + markupSaleVal / 100);
                const priceReseller = providerRate * (1 + markupResellerVal / 100);

                const newService = await prisma.service.create({
                    data: {
                        id_category: parseInt(categoryId),
                        id_api_provider: parseInt(providerId),
                        sid: service.service?.toString() || '',
                        name: service.name || 'Unnamed Service',
                        min: parseInt(service.min) || 0,
                        max: parseInt(service.max) || 0,
                        price_api: new Prisma.Decimal(providerRate),
                        price_sale: new Prisma.Decimal(priceSale),
                        price_reseller: new Prisma.Decimal(priceReseller),
                        type: (service.type?.toUpperCase() === 'DEFAULT' || !service.type) ? 'DEFAULT' :
                            (service.type?.toUpperCase() === 'CUSTOM COMMENTS') ? 'CUSTOM_COMMENTS' : 'DEFAULT',
                        refill: !!service.refill,
                        status: 'ACTIVE',
                        note: service.desc || ''
                    }
                });
                importedServices.push(newService);
            } catch (err: any) {
                console.error(`Error importing service ${service.service}:`, err.message);
                errors.push({ serviceId: service.service, error: err.message });
            }
        }

        if (importedServices.length === 0 && errors.length > 0) {
            return NextResponse.json({
                error: 'Failed to import any services',
                details: errors
            }, { status: 500 });
        }

        return NextResponse.json({
            message: `Successfully imported ${importedServices.length} services` + (errors.length > 0 ? ` (${errors.length} skipped due to errors)` : ''),
            count: importedServices.length,
            errors: errors.length > 0 ? errors : undefined
        }, { status: 201 });

    } catch (error: any) {
        console.error('Critical error in SMM import:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to import services' },
            { status: 500 }
        );
    }
}
