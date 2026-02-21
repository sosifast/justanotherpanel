import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const smsApi = await prisma.smsApi.findFirst();

        if (!smsApi) {
            return NextResponse.json({ error: 'SMS API Configuration not found' }, { status: 404 });
        }

        const markupPercentage = Number(smsApi.markup_price_pecentase) || 0;
        const countries = await prisma.countrySms.findMany();
        let syncedCount = 0;

        // Fetch prices sequentially for each country to avoid spamming the external API
        for (const country of countries) {
            try {
                const url = `${smsApi.url}/list/prices?token=${smsApi.token}&country_id=${country.pid}`;
                const response = await axios.get(url);

                if (response.data && response.data.code === 200 && response.data.data) {
                    const prices = response.data.data;

                    for (const key in prices) {
                        const priceData = prices[key];
                        // project_id is what the API sends, but sometimes it is sent as string/number
                        const pidStr = String(priceData.project_id);

                        const cost = Number(priceData.cost);
                        // cost_sale is the cost + markup
                        const cost_sale = cost + (cost * markupPercentage / 100);

                        const existing = await prisma.productSms.findFirst({
                            where: {
                                country_id: country.id,
                                project_id: pidStr
                            }
                        });

                        if (existing) {
                            await prisma.productSms.update({
                                where: { id: existing.id },
                                data: {
                                    cost: cost,
                                    cost_sale: cost_sale,
                                    total_count: Number(priceData.total_count) || 0,
                                    title: priceData.title || existing.title,
                                    code: priceData.code || existing.code
                                }
                            });
                        } else {
                            await prisma.productSms.create({
                                data: {
                                    country_id: country.id,
                                    project_id: pidStr,
                                    cost: cost,
                                    cost_sale: cost_sale,
                                    total_count: Number(priceData.total_count) || 0,
                                    title: priceData.title || '',
                                    code: priceData.code || ''
                                }
                            });
                        }
                        syncedCount++;
                    }
                }
            } catch (err) {
                console.error(`Error syncing prices for country ${country.title}:`, err);
            }
        }

        return NextResponse.json({ message: `Successfully synced ${syncedCount} prices across all countries.` });

    } catch (error: any) {
        console.error('Pricelist sync error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
