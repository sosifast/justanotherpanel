import { prisma } from '@/lib/prisma';
import CountryClient from './CountryClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Virtual Number Countries",
    description: "Manage virtual number SMS countries."
};

export default async function VirtualNumberCountryPage() {
    // Fetch all countries
    const countries = await prisma.countrySms.findMany({
        orderBy: { title: 'asc' }
    });

    return <CountryClient initialCountries={countries} />;
}
