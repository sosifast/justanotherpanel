import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const country = searchParams.get('country') || 'All';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { project_id: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (country !== 'All') {
            where.country = { title: country };
        }

        const [products, totalCount] = await prisma.$transaction([
            prisma.productSms.findMany({
                where,
                include: { country: true },
                skip,
                take: limit,
                orderBy: { title: 'asc' }
            }),
            prisma.productSms.count({ where })
        ]);

        const serializedProducts = products.map(p => ({
            ...p,
            cost: Number(p.cost),
            cost_sale: Number(p.cost_sale),
            created_at: p.created_at.toISOString(),
            updated_at: p.updated_at.toISOString(),
            country: {
                ...p.country,
                created_at: p.country.created_at.toISOString(),
                updated_at: p.country.updated_at.toISOString(),
            }
        }));

        return NextResponse.json({
            products: serializedProducts,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalCount
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
