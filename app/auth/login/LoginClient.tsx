'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Chrome,
    ChevronLeft,
    Smartphone,
    Fingerprint,
    Loader2,
    CheckCircle2,
    X
} from 'lucide-react';
import Link from 'next/link';

const LoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccess('Registration successful. Please check your email to activate.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            if (data.user.role === 'ADMIN') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/user';
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col overflow-hidden">

            {/* Top Area (Hero) - Light Theme */}
            <div className="relative h-[35vh] flex flex-col justify-end px-8 pb-16 bg-emerald-600 overflow-hidden shadow-lg">
                {/* Decoration Ornaments */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500 rounded-full opacity-40"></div>
                <div className="absolute bottom-10 -left-10 w-24 h-24 bg-emerald-700 rounded-full opacity-20"></div>

                <Link href="/" className="absolute top-12 left-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all z-10">
                    <ChevronLeft size={24} />
                </Link>

                <div className="relative z-10 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-12 h-1.5 bg-white rounded-full mb-4 shadow-sm"></div>
                    <h1 className="text-4xl font-black tracking-tight leading-none text-white uppercase italic">
                        LOGIN<br /><span className="text-emerald-100 not-italic uppercase opacity-80">ACCOUNT.</span>
                    </h1>
                </div>
            </div>

            {/* Form Area (Clean Sheet) */}
            <div className="flex-1 bg-white rounded-t-[3rem] -mt-10 p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] relative z-20">

                {/* Alert Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-[1.5rem] text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{success}</span>
                        <button onClick={() => setSuccess('')}><X size={14} /></button>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] text-xs font-bold flex items-center gap-3 animate-in shake-in duration-300">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black text-xs">!</div>
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError('')}><X size={14} /></button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 ml-1">Email or Username</label>
                        <div className="relative border-b-2 border-slate-100 focus-within:border-emerald-500 transition-colors py-1 group">
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-transparent py-3 outline-none text-lg text-slate-800 placeholder:text-slate-300 transition-all font-bold"
                            />
                            <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 ml-1">Secret Key</label>
                            <Link href="/auth/forget" className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors">Forgot?</Link>
                        </div>
                        <div className="relative border-b-2 border-slate-100 focus-within:border-emerald-500 transition-colors py-1 group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-transparent py-3 outline-none text-lg text-slate-800 placeholder:text-slate-300 transition-all font-bold"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center space-x-3 active:scale-[0.97] transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>LOG IN</span>
                                <ArrowRight size={22} strokeWidth={3} className="ml-2" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Don&apos;t have an account? <Link href="/auth/register" className="text-emerald-600 font-bold underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-500 transition-all">Register free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const Login = () => {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
};

export default Login;
