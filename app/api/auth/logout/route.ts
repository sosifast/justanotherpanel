import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies();

    // Determine the domain attribute based on environment
    // We need to match the attributes used when setting the cookie
    // However, for deletion, usually just setting maxAge=0 or using delete() with name works, 
    // but next/headers cookies().delete() is the way.

    cookieStore.delete('token');

    return NextResponse.json(
        { message: 'Logged out successfully' },
        { status: 200 }
    );
}
