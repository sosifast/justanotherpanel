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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative font-sans">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
                <div className="max-w-md w-full relative bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-10 lg:p-12 rounded-[3.5rem] shadow-2xl text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                            <XCircle className="w-8 h-8" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-4">Link Expired.</h1>
                    <p className="text-slate-400 font-medium mb-8">
                        The password reset security token is invalid or has expired for your safety.
                    </p>
                    <Link
                        href="/auth/forget"
                        className="inline-flex items-center justify-center w-full py-4 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                    >
                        Request New Security Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative font-sans overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
            
            <div className="max-w-md w-full relative">
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-10 lg:p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white tracking-tight mb-3">Reset Security.</h1>
                        <p className="text-slate-400 font-medium tracking-tight">Enter your new passphrase below to regain access.</p>
                    </div>

                    <ResetClient token={token} />
                </div>
            </div>
        </div>
    );
}
