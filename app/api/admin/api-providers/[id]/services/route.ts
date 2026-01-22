import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const providerId = parseInt(resolvedParams.id);

        const provider = await prisma.apiProvider.findUnique({
            where: { id: providerId }
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        const formData = new URLSearchParams();
        formData.append('key', provider.api_key);
        formData.append('action', 'services');

        const response = await axios.post(provider.url, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching services from provider:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch services from provider' },
            { status: 500 }
        );
    }
}
