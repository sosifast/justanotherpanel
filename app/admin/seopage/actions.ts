'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSeoPageData() {
    let data = await prisma.seoPage.findFirst();
    if (!data) {
        data = await prisma.seoPage.create({
            data: {}
        });
    }
    return data;
}

export async function updateSeoPageData(data: any) {
    // Remove id, created_at, updated_at from data if present to avoid errors
    const { id, created_at, updated_at, ...updateData } = data;

    const existing = await prisma.seoPage.findFirst();

    if (existing) {
        await prisma.seoPage.update({
            where: { id: existing.id },
            data: updateData
        });
    } else {
        await prisma.seoPage.create({
            data: updateData
        });
    }

    revalidatePath('/admin/seopage');
    return { success: true };
}
