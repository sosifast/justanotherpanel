import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, url, markup_price_pecentase } = body;

        // Check if config already exists
        const existingConfig = await prisma.smsApi.findFirst();

        let config;
        if (existingConfig) {
            // Update existing
            config = await prisma.smsApi.update({
                where: { id: existingConfig.id },
                data: {
                    token,
                    url,
                    markup_price_pecentase: markup_price_pecentase ? Number(markup_price_pecentase) : 0,
                },
            });
        } else {
            // Create new
            config = await prisma.smsApi.create({
                data: {
                    token,
                    url,
                    markup_price_pecentase: markup_price_pecentase ? Number(markup_price_pecentase) : 0,
                    balance: 0,
                },
            });
        }

        return NextResponse.json(config);
    } catch (error: any) {
        console.error('Error saving SMS API config:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
