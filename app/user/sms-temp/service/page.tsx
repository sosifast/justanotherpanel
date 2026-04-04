import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import SmsServiceClient from './SmsServiceClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'SMS Service - Temporary Numbers',
    description: 'Get temporary SMS verification numbers for various projects and countries.',
};

type SearchParams = {
    q?: string;
    country?: string;
    sort?: string;
    page?: string;
};

export default async function SmsServicePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const session = await getCurrentUser();
    
    if (!session) {
        redirect('/auth/login');
    }

    // Fetch full user profile from database to get correct balance and info
    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            full_name: true,
            role: true,
            profile_imagekit_url: true,
            balance: true
        }
    });

    if (!user) {
        redirect('/auth/login');
    }

    // Resolve searchParams promise
    const params = await searchParams;
    const q = params.q || '';
    const countryFilter = params.country || 'all';
    const sort = params.sort || 'popular';
    const page = parseInt(params.page || '1');
    const pageSize = 12;

    // Prepare User Info for Header (like Dashboard)
    const userInfo = {
        full_name: user.full_name,
        role: user.role,
        profile_imagekit_url: user.profile_imagekit_url || null,
        balance: Number(user.balance)
    };

    // Step 1: Find matching project IDs (PIDs) from ProjectSms AND ProductSms
    // This ensures that if a variation lacks a title, the master project title still makes it findable.
    const matchingProjectPids = await prisma.projectSms.findMany({
        where: {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { code: { contains: q, mode: 'insensitive' } },
            ]
        },
        select: { pid: true }
    });

    const projectPidList = matchingProjectPids.map(p => p.pid);

    const where: any = {
        AND: [
            {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { code: { contains: q, mode: 'insensitive' } },
                    { project_id: { in: projectPidList } }
                ]
            }
        ]
    };
    if (countryFilter !== 'all') {
        where.AND.push({ country: { code: countryFilter } });
    }

    // Get unique project_ids for the current filter
    const projectIdsRaw = await prisma.productSms.groupBy({
        by: ['project_id'],
        where,
        _sum: { total_count: true },
        orderBy: {
            _sum: { total_count: 'desc' }
        }
    });

    const totalProjects = projectIdsRaw.length;
    const paginatedProjectIds = projectIdsRaw
        .slice((page - 1) * pageSize, page * pageSize)
        .map(p => p.project_id);

    // Step 2: Fetch full details for the paginated projects + all their country variations
    const [productsRaw, countries, allProjectsInfo, stats] = await Promise.all([
        prisma.productSms.findMany({
            where: {
                project_id: { in: paginatedProjectIds },
                ...(countryFilter !== 'all' ? { country: { code: countryFilter } } : {})
            },
            include: { country: true },
            orderBy: { cost_sale: 'asc' }
        }),
        prisma.countrySms.findMany({
            select: { id: true, title: true, code: true },
            orderBy: { title: 'asc' }
        }),
        prisma.projectSms.findMany({
            where: { pid: { in: paginatedProjectIds } },
            select: { pid: true, title: true, code: true }
        }),
        prisma.productSms.aggregate({
            _count: { project_id: true },
            _sum: { total_count: true },
            _min: { cost_sale: true }
        })
    ]);

    // Create unique project cards and group their variations
    const projectMap = new Map(allProjectsInfo.map(p => [p.pid, p]));
    
    // Group products by project_id
    const groupedData = paginatedProjectIds.map(pid => {
        const projectInfo = projectMap.get(pid);
        const variations = productsRaw.filter(p => p.project_id === pid);
        
        // Calculate project-level stats
        const totalStock = variations.reduce((acc, v) => acc + v.total_count, 0);
        const minPrice = variations.length > 0 ? Math.min(...variations.map(v => Number(v.cost_sale))) : 0;

        return {
            pid,
            title: variations[0]?.title || projectInfo?.title || 'Unknown Project',
            code: variations[0]?.code || projectInfo?.code || 'N/A',
            totalStock,
            minPrice,
            variations: variations.map(v => ({
                id: v.id,
                cost_sale: Number(v.cost_sale),
                total_count: v.total_count,
                country: {
                    title: v.country.title,
                    code: v.country.code
                }
            }))
        };
    });

    const simplifiedStats = {
        totalServices: stats._count.project_id,
        totalStock: Number(stats._sum.total_count || 0),
        minPrice: Number(stats._min.cost_sale || 0)
    };

    return (
        <SmsServiceClient
            user={userInfo}
            projects={groupedData as any}
            countries={countries}
            stats={simplifiedStats}
            totalItems={totalProjects}
            pageSize={pageSize}
            currentPage={page}
        />
    );
}
