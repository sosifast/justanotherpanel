import { prisma } from '@/lib/prisma';
import ProjectClient from './ProjectClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Virtual Number Projects",
    description: "Manage virtual number SMS projects."
};

export default async function VirtualNumberProjectPage() {
    // Fetch all project sms records
    const projects = await prisma.projectSms.findMany({
        orderBy: { id: 'desc' }
    });

    return <ProjectClient initialProjects={projects as any} />;
}
