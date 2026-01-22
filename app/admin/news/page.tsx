import { prisma } from '@/lib/prisma';
import NewsClient from './NewsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "News",
    description: "Manage news."
};

export default async function NewsPage() {
    const news = await prisma.news.findMany({
        orderBy: { created_at: 'desc' }
    });

    const serializedNews = news.map(item => ({
        ...item,
        created_at: item.created_at.toISOString(),
        updated_at: item.updated_at.toISOString()
    }));

    return <NewsClient initialNews={serializedNews as any} />;
}
