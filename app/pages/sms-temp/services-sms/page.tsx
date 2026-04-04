import { prisma } from '@/lib/prisma';
import SmsServicesClient from './SmsServicesClient';
import { Metadata } from 'next';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
    title: 'Available SMS Service Matrix - Virtual Numbers Catalog | JAP',
    description: 'Browse our complete list of 1.2 million+ temporary phone numbers and virtual SMS services across 30+ countries. Instant activation for social media & chat apps.',
    keywords: ['virtual number', 'sms verification service', 'temp phone number', 'sms activation', 'otp verification', 'disposable phone number'],
    alternates: {
        canonical: '/pages/sms-temp/services-sms',
    }
};

export default async function SmsServicesPage() {
    const limit = 20;
    const settings = await getSettings();

    // Fetch initial products and total count
    const [products, totalCount] = await prisma.$transaction([
        prisma.productSms.findMany({
            include: {
                country: true,
            },
            take: limit,
            orderBy: { title: 'asc' }
        }),
        prisma.productSms.count()
    ]);

    // Fetch all countries for the filter dropdown
    const countries = await prisma.countrySms.findMany({
        select: { title: true },
        orderBy: { title: 'asc' }
    });
    
    const countryList = ['All', ...countries.map(c => c.title)];

    const projects = await prisma.projectSms.findMany({
        orderBy: { title: 'asc' }
    });

    // Serialize Decimal values to numbers
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

    const serializedProjects = projects.map(p => ({
        ...p,
        created_at: p.created_at.toISOString(),
        updated_at: p.updated_at.toISOString(),
    }));

    return (
        <SmsServicesClient 
            settings={settings}
            products={serializedProducts as any} 
            projects={serializedProjects as any} 
            initialCountries={countryList}
            initialTotalPages={Math.ceil(totalCount / limit)}
        />
    );
}
