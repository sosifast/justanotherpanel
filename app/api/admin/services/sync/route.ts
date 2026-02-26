import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { markup_sale, markup_reseller } = body;

        // validate markup
        if (markup_sale === undefined || markup_reseller === undefined) {
            return NextResponse.json(
                { error: 'Markup sale and reseller percentages are required' },
                { status: 400 }
            );
        }

        const markupSale = parseFloat(markup_sale);
        const markupReseller = parseFloat(markup_reseller);

        if (isNaN(markupSale) || isNaN(markupReseller)) {
            return NextResponse.json(
                { error: 'Invalid markup values' },
                { status: 400 }
            );
        }

        // Fetch all active API Providers
        const apiProviders = await prisma.apiProvider.findMany({
            where: { status: 'ACTIVE' }
        });

        const syncResults = [];

        for (const provider of apiProviders) {
            try {
                // Fetch services from the provider
                // Standard SMM API URL format: e.g. https://provider.com/api/v2
                // We use POST or GET? standard is POST or GET. We can just use POST/GET with search params.
                // Usually it's POST body or URL params.
                const apiUrl = new URL(provider.url);
                apiUrl.searchParams.append('key', provider.api_key);
                apiUrl.searchParams.append('action', 'services');

                const response = await fetch(apiUrl.toString(), {
                    method: 'POST'
                });
                const servicesData = await response.json();

                if (Array.isArray(servicesData)) {
                    let updatedCount = 0;

                    // Fetch local services for this provider
                    const localServices = await prisma.service.findMany({
                        where: { id_api_provider: provider.id }
                    });

                    // Map for quick lookup
                    const localServicesMap = new Map();
                    for (const s of localServices) {
                        if (s.sid) {
                            localServicesMap.set(s.sid.toString(), s);
                        }
                    }

                    const updatePromises = [];

                    for (const apiService of servicesData) {
                        const sid = apiService.service ? apiService.service.toString() : undefined;

                        if (sid && localServicesMap.has(sid)) {
                            const localService = localServicesMap.get(sid);

                            const rate = parseFloat(apiService.rate || 0);

                            if (rate > 0) {
                                const newPriceApi = rate;
                                const newPriceSale = rate + (rate * (markupSale / 100));
                                const newPriceReseller = rate + (rate * (markupReseller / 100));

                                const newMin = apiService.min ? parseInt(apiService.min) : localService.min;
                                const newMax = apiService.max ? parseInt(apiService.max) : localService.max;
                                const newNote = apiService.desc || apiService.description || localService.note;

                                updatePromises.push(
                                    prisma.service.update({
                                        where: { id: localService.id },
                                        data: {
                                            price_api: newPriceApi,
                                            price_sale: newPriceSale,
                                            price_reseller: newPriceReseller,
                                            min: newMin,
                                            max: newMax,
                                            note: newNote
                                        }
                                    })
                                );
                                updatedCount++;
                            }
                        }
                    }

                    // Execute updates sequentially to avoid DB overload just in case
                    for (const p of updatePromises) {
                        await p;
                    }

                    syncResults.push({
                        provider: provider.name,
                        status: 'success',
                        updatedCount
                    });

                } else {
                    syncResults.push({
                        provider: provider.name,
                        status: 'error',
                        error: 'Invalid response from provider API (expected array)'
                    });
                }
            } catch (err: any) {
                console.error(`Error syncing provider ${provider.name}:`, err);
                syncResults.push({
                    provider: provider.name,
                    status: 'error',
                    error: err.message || 'Failed to sync'
                });
            }
        }

        return NextResponse.json({ success: true, results: syncResults });
    } catch (error) {
        console.error('Error in sync services:', error);
        return NextResponse.json({ error: 'Failed to sync services' }, { status: 500 });
    }
}
