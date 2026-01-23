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

            // Define home routes for each role
            const roleHomes: Record<string, string> = {
                'ADMIN': '/admin',
                'STAFF': '/staff',
                'MEMBER': '/user'
            };

            const userHome = roleHomes[role] || '/user';

            // Admin Area Protection: Only ADMIN allowed
            if (pathname.startsWith('/admin') && role !== 'ADMIN') {
                return NextResponse.redirect(new URL(userHome, request.url));
            }

            // Staff Area Protection: Only STAFF allowed (or ADMIN if allowed to manage staff area)
            // User requested strict separation, so STAFF area is for STAFF
            if (pathname.startsWith('/staff') && role !== 'STAFF') {
                return NextResponse.redirect(new URL(userHome, request.url));
            }

            // User Area Protection: Only MEMBER allowed
            if (pathname.startsWith('/user') && role !== 'MEMBER') {
                return NextResponse.redirect(new URL(userHome, request.url));
            }

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
                const { payload } = await jwtVerify(token, secret);
                const role = payload.role as string;

                const roleHomes: Record<string, string> = {
                    'ADMIN': '/admin',
                    'STAFF': '/staff',
                    'MEMBER': '/user'
                };

                const userHome = roleHomes[role] || '/user';

                // If token is valid, redirect to appropriate dashboard
                return NextResponse.redirect(new URL(userHome, request.url));
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
