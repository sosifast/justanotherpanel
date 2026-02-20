import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const configRow = await prisma.smsApi.findFirst();

        if (!configRow) {
            return NextResponse.json({ error: 'API Configuration not found' }, { status: 404 });
        }

        const { token, url } = configRow;

        if (!url || !token) {
            return NextResponse.json({ error: 'Incomplete API configuration (missing URL or Token)' }, { status: 400 });
        }

        const endpoint = `${url}/get/balance?token=${token}`;

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: endpoint,
            headers: {}
        };

        const response = await axios.request(config);

        // Expected response:
        // { "code": 200, "message": "Operation Success", "data": { "frozen": 0, "balance": 2.52 } }
        const resData = response.data;

        if (resData?.code === 200 && resData?.data?.balance !== undefined) {
            const newBalance = Number(resData.data.balance);

            // Update database
            const updatedConfig = await prisma.smsApi.update({
                where: { id: configRow.id },
                data: { balance: newBalance }
            });

            return NextResponse.json({
                success: true,
                message: 'Balance updated successfully',
                balance: newBalance
            });
        } else {
            console.error("Unexpected API response format:", resData);
            return NextResponse.json({
                error: 'Failed to retrieve a valid balance from the provider',
                details: resData
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Error updating SMS API balance:', error);
        return NextResponse.json(
            { error: error?.response?.data?.message || error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
