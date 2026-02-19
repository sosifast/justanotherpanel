import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from './auth';

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return null;
        }

        const { payload } = await jwtVerify(token, getJwtSecret());

        return {
            id: Number(payload.sub),
            username: payload.username as string,
            role: payload.role as string
        };
    } catch (error) {
        return null;
    }
}
