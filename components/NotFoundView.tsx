'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, AlertCircle } from 'lucide-react';

export default function NotFoundView() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-bold text-blue-600">404</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center border-4 border-slate-50">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-slate-800">Page Not Found</h1>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>

                <div className="pt-8 border-t border-slate-200/60">
                    <p className="text-xs text-slate-400">
                        Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
