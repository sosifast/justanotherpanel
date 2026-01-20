import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { provider, min_deposit, status, api_config } = body;

        const gateway = await prisma.paymentGateway.create({
            data: {
                provider,
                min_deposit: min_deposit,
                status,
                api_config
            }
        });

        // Handle BigInt/Decimal serialization
        const serialized = {
            ...gateway,
            min_deposit: Number(gateway.min_deposit)
        };

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('Error creating gateway:', error);
        return NextResponse.json({ error: 'Failed to create gateway' }, { status: 500 });
    }
}
