import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const gatewayId = parseInt(id);
        const body = await req.json();
        const { provider, min_deposit, status, api_config } = body;

        const gateway = await prisma.paymentGateway.update({
            where: { id: gatewayId },
            data: {
                provider,
                min_deposit: min_deposit,
                status,
                api_config
            }
        });

        const serialized = {
            ...gateway,
            min_deposit: Number(gateway.min_deposit)
        };

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('Error updating gateway:', error);
        return NextResponse.json({ error: 'Failed to update gateway' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const gatewayId = parseInt(id); // Use parseInt directly after awaiting params? 
        // Wait, params is a Promise in Next.js 15+ or similar? The previous code used { params: Promise... } so I will follow that pattern.

        await prisma.paymentGateway.delete({
            where: { id: gatewayId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting gateway:', error);
        return NextResponse.json({ error: 'Failed to delete gateway' }, { status: 500 });
    }
}
