import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Update balance from external API
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params in Next.js 15+
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Get provider details
        const provider = await prisma.apiProvider.findUnique({
            where: { id }
        });

        if (!provider) {
            return NextResponse.json(
                { error: 'Provider not found' },
                { status: 404 }
            );
        }

        // Fetch balance from external API using FormData
        const FormData = require('form-data');
        const axios = require('axios');

        const formData = new FormData();
        formData.append('key', provider.api_key);
        formData.append('action', 'balance');

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: provider.url,
            headers: {
                ...formData.getHeaders()
            },
            data: formData
        };

        const response = await axios.request(config);

        // Extract balance from response
        const balance = response.data?.balance;

        if (balance === undefined || balance === null) {
            return NextResponse.json(
                { error: 'Failed to retrieve balance from API' },
                { status: 500 }
            );
        }

        // Update balance in database
        const updatedProvider = await prisma.apiProvider.update({
            where: { id },
            data: { balance: parseFloat(balance) }
        });

        return NextResponse.json({
            message: 'Balance updated successfully',
            balance: updatedProvider.balance,
            currency: response.data?.currency || 'USD'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating balance:', error);

        // Handle axios errors
        if (error.response) {
            return NextResponse.json(
                { error: `API Error: ${error.response.status} - ${error.response.statusText}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update balance' },
            { status: 500 }
        );
    }
}
