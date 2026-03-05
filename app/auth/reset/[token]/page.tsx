import React from 'react';
import ResetClient from './ResetClient';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default async function ResetPage({
    params
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params;

    // Verify token exists and is not expired
    const user = await prisma.user.findFirst({
        where: {
            reset_token: token,
            reset_token_expires: {
                gt: new Date()
            }
        }
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                    <div className="flex justify-center mb-6 text-red-500">
                        <XCircle className="w-16 h-16" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Invalid or Expired Link</h1>
                    <p className="text-slate-500 mb-8">
                        The password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        href="/auth/forget"
                        className="inline-flex items-center justify-center w-full py-3 px-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h1>
                    <p className="text-slate-500 text-sm">Please enter your new password below.</p>
                </div>

                <ResetClient token={token} />
            </div>
        </div>
    );
}
