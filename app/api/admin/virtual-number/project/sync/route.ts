import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const smsApi = await prisma.smsApi.findFirst();

        if (!smsApi) {
            return NextResponse.json({ error: 'SMS API Configuration not found' }, { status: 404 });
        }

        const url = `${smsApi.url}/list/projects?token=${smsApi.token}`;

        const response = await axios.get(url);

        if (response.data && response.data.code === 200 && response.data.data) {
            const projects = response.data.data;
            let syncedCount = 0;

            for (const key in projects) {
                const proj = projects[key];
                const pidStr = proj.id.toString();

                const existing = await prisma.projectSms.findFirst({
                    where: { pid: pidStr }
                });

                if (existing) {
                    await prisma.projectSms.update({
                        where: { id: existing.id },
                        data: {
                            title: proj.title,
                            code: proj.code
                        }
                    });
                } else {
                    await prisma.projectSms.create({
                        data: {
                            pid: pidStr,
                            title: proj.title,
                            code: proj.code
                        }
                    });
                }
                syncedCount++;
            }

            return NextResponse.json({ message: `Successfully synced ${syncedCount} projects` });
        }

        return NextResponse.json({ error: 'Failed to fetch projects from API' }, { status: 500 });

    } catch (error: any) {
        console.error('Project sync error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
