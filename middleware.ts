import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that require authentication
    if (pathname.startsWith('/admin') || pathname.startsWith('/staff') || pathname.startsWith('/user')) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(
                process.env.JWT_SECRET || 'default-secret-key-change-it'
            );
            const { payload } = await jwtVerify(token, secret);
            const role = payload.role as string;

            // Admin Protection
            if (pathname.startsWith('/admin') && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/user', request.url));
            }

            // Staff Protection (Allow Admin and Staff)
            if (pathname.startsWith('/staff') && role !== 'STAFF' && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/user', request.url));
            }

            // User Protection (Any valid role is allowed)
            // No extra check needed as long as token is valid

        } catch (error) {
            // Invalid token -> Redirect to login
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Guest-only paths (Auth pages)
    if (pathname.startsWith('/auth')) {
        if (token) {
            try {
                const secret = new TextEncoder().encode(
                    process.env.JWT_SECRET || 'default-secret-key-change-it'
                );
                await jwtVerify(token, secret);
                // If token is valid, redirect to user dashboard
                return NextResponse.redirect(new URL('/user', request.url));
            } catch (error) {
                // If token is invalid, allow access to auth pages (and maybe clear cookie?)
                // For now just allow access, the login process will overwrite the invalid cookie
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/staff/:path*', '/user/:path*', '/auth/:path*'],
};
