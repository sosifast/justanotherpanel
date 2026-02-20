import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const configRow = await prisma.smsApi.findFirst();

        if (!configRow || !configRow.url || !configRow.token) {
            return NextResponse.json({ error: 'Incomplete API configuration (missing URL or Token)' }, { status: 400 });
        }

        const { token, url } = configRow;
        const endpoint = `${url}/list/countries?token=${token}`;

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: endpoint,
            headers: {}
        };

        const response = await axios.request(config);
        const resData = response.data;

        /*
         Expected response format:
         {
           "code": 200,
           "message": "Operation Success",
           "data": {
             "1": { "id": 1, "title": "Unite State of America", "code": "us" },
             "2": { "id": 2, "title": "Russia", "code": "ru" }
             ...
           }
         }
        */

        if (resData?.code === 200 && resData?.data) {
            const countriesFromApi = Object.values(resData.data) as Array<{ id: number, title: string, code: string }>;

            let addedCount = 0;
            let updatedCount = 0;

            // Iterate and upsert the countries
            // Note: using Promise.all or a loop. Using loop for safety of connections
            for (const country of countriesFromApi) {
                const pidString = country.id.toString();

                const existingCountry = await prisma.countrySms.findFirst({
                    where: { pid: pidString }
                });

                if (existingCountry) {
                    await prisma.countrySms.update({
                        where: { id: existingCountry.id },
                        data: {
                            title: country.title,
                            code: country.code.toLowerCase(),
                        }
                    });
                    updatedCount++;
                } else {
                    await prisma.countrySms.create({
                        data: {
                            pid: pidString,
                            title: country.title,
                            code: country.code.toLowerCase(),
                        }
                    });
                    addedCount++;
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Countries synchronized successfully',
                added: addedCount,
                updated: updatedCount,
                total: countriesFromApi.length
            });
        } else {
            console.error("Unexpected API response format:", resData);
            return NextResponse.json({
                error: 'Failed to retrieve valid countries list from the provider',
                details: resData
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Error syncing SMS Countries:', error);
        return NextResponse.json(
            { error: error?.response?.data?.message || error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
