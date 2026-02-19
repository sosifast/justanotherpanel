import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import ServicesClient from './ServicesClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

async function getServicesData(page: number = 1, limit: number = 20) {
    try {
        const offset = (page - 1) * limit;

        const [totalServices, services] = await Promise.all([
            prisma.service.count({
                where: {
                    status: 'ACTIVE',
                    category: {
                        status: 'ACTIVE',
                        platform: {
                            status: 'ACTIVE'
                        }
                    }
                }
            }),
            prisma.service.findMany({
                where: {
                    status: 'ACTIVE',
                    category: {
                        status: 'ACTIVE',
                        platform: {
                            status: 'ACTIVE'
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    min: true,
                    max: true,
                    price_sale: true,
                    refill: true,
                    note: true,
                    status: true,
                    category: {
                        select: {
                            name: true,
                            platform: {
                                select: {
                                    name: true,
                                    slug: true,
                                    icon_imagekit_url: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { category: { platform: { name: 'asc' } } },
                    { category: { name: 'asc' } },
                    { name: 'asc' }
                ],
                skip: offset,
                take: limit
            })
        ]);

        const serializedServices = services.map(service => ({
            ...service,
            price_sale: service.price_sale.toString()
        }));

        const settings = await getSettings();

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalServices / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            services: serializedServices,
            pagination: {
                currentPage: page,
                totalPages,
                totalServices,
                hasNextPage,
                hasPrevPage,
                limit
            },
            settings: {
                site_name: settings?.site_name,
                logo_imagekit_url: settings?.logo_imagekit_url,
                favicon_imagekit_url: settings?.favicon_imagekit_url
            }
        };
    } catch (error) {
        console.error('Error fetching services:', error);
        return {
            services: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalServices: 0,
                hasNextPage: false,
                hasPrevPage: false,
                limit
            },
            settings: null
        };
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const { settings } = await getServicesData();
    const seoValues = await prisma.seoPage.findFirst();
    const siteName = settings?.site_name || 'JustAnotherPanel';

    const title = seoValues?.service_title || `Buy Followers & Subscriber Start From $1 | ${siteName}`;
    const description = seoValues?.service_desc || `Explore our wide range of social media marketing services. Boost your presence on Instagram, TikTok, YouTube, and more with ${siteName}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            siteName: siteName,
        }
    };
}

export default async function ServicesPage({ searchParams }: { searchParams: { page?: string } }) {
    const page = Number(searchParams?.page) || 1;
    const data = await getServicesData(page);

    return (
        <ServicesClient
            initialServices={data.services as any}
            initialSettings={data.settings}
            pagination={data.pagination}
        />
    );
}
