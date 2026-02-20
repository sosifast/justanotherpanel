import { prisma } from '@/lib/prisma';
import SliderClient from './SliderClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
    title: "Sliders",
    description: "Manage homepage sliders."
};

export default async function SliderPage() {
    const sliders = await prisma.slider.findMany({
        orderBy: { created_at: 'desc' }
    });

    return <SliderClient initialSliders={sliders} />;
}
