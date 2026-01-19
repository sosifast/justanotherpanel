import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all API providers
export async function GET() {
    try {
        const providers = await prisma.apiProvider.findMany({
            orderBy: { id: 'asc' }
        });

        return NextResponse.json(providers, { status: 200 });
    } catch (error) {
        console.error('Error fetching API providers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch API providers' },
            { status: 500 }
        );
    }
}

// POST - Create new API provider
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, code, url, api_key, balance, status } = body;

        // Validation
        if (!name || !code || !url || !api_key) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existing = await prisma.apiProvider.findUnique({
            where: { code }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Provider code already exists' },
                { status: 409 }
            );
        }

        const provider = await prisma.apiProvider.create({
            data: {
                name,
                code,
                url,
                api_key,
                balance: balance || 0,
                status: status || 'ACTIVE'
            }
        });

        return NextResponse.json(provider, { status: 201 });
    } catch (error) {
        console.error('Error creating API provider:', error);
        return NextResponse.json(
            { error: 'Failed to create API provider' },
            { status: 500 }
        );
    }
}
