
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return null;
        }

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-secret-key-change-it'
        );

        const { payload } = await jwtVerify(token, secret);

        return {
            id: Number(payload.sub),
            username: payload.username as string,
            role: payload.role as string
        };
    } catch (error) {
        return null;
    }
}
