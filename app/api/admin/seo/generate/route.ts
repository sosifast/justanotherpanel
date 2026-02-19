import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        revalidatePath('/sitemap.xml');
        return NextResponse.json({ message: 'Sitemap revalidated' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
    }
}
