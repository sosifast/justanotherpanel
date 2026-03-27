'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    User,
    Loader2,
    X
} from 'lucide-react';

const Register = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            router.push('/auth/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col overflow-x-hidden">

            {/* Top Area (Hero) - Light Theme */}
            <div className="relative h-[30vh] flex flex-col justify-end p-8 bg-emerald-600 overflow-hidden shadow-lg">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full opacity-40"></div>

                <Link href="/auth/login" className="absolute top-12 left-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all z-10">
                    <ChevronLeft size={24} />
                </Link>

                <div className="relative z-10 space-y-2 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-12 h-1.5 bg-white rounded-full mb-4 shadow-sm"></div>
                    <h1 className="text-4xl font-black tracking-tight leading-none text-white uppercase italic">
                        JOIN THE<br /><span className="text-emerald-100 not-italic uppercase opacity-80">COMMUNITY.</span>
                    </h1>
                </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 bg-white rounded-t-[3rem] -mt-10 p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] relative z-20">

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] text-xs font-bold flex items-center gap-3 animate-in shake-in duration-300">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black text-xs">!</div>
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError('')}><X size={14} /></button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300 ml-1">Real Identity</label>
                        <div className="relative border-b-2 border-slate-50 focus-within:border-emerald-500 transition-colors py-1 group">
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Full name"
                                className="w-full bg-transparent py-3 outline-none text-lg text-slate-800 placeholder:text-slate-300 transition-all font-bold"
                            />
                            <User className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300 ml-1">Account Username</label>
                        <div className="relative border-b-2 border-slate-50 focus-within:border-emerald-500 transition-colors py-1 group">
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                className="w-full bg-transparent py-3 outline-none text-lg text-slate-800 placeholder:text-slate-300 transition-all font-bold"
                            />
                            <User className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300 ml-1">Active Email</label>
                        <div className="relative border-b-2 border-slate-50 focus-within:border-emerald-500 transition-colors py-1 group">
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@domain.com"
                                className="w-full bg-transparent py-3 outline-none text-lg text-slate-800 placeholder:text-slate-300 transition-all font-bold"
                            />
                            <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300 ml-1">Password</label>
                        <div className="relative border-b-2 border-slate-50 focus-within:border-emerald-500 transition-colors py-1 group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-transparent py-3 outline-none text-lg text-slate-800 placeholder:text-slate-300 transition-all font-bold"
                            />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-300 hover:text-emerald-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                <Lock className="text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Repeat Password */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300 ml-1">Repeat Key</label>
                        <div className="relative border-b-2 border-slate-50 focus-within:border-emerald-500 transition-colors py-1 group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-transparent py-3 outline-none text-lg text-slate-800 placeholder:text-slate-300 transition-all font-bold"
                            />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-300 hover:text-emerald-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                <Lock className="text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="pt-2 flex items-start gap-3">
                        <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-slate-100 bg-slate-50 text-emerald-600 focus:ring-emerald-500 shadow-sm" required />
                        <label htmlFor="terms" className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-tight">
                            I accept the <Link href="/terms" className="text-emerald-600 hover:underline">Terms</Link> & <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
                        </label>
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center space-x-3 active:scale-[0.97] transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>Sign Up</span>
                                <ArrowRight size={22} strokeWidth={3} className="ml-2" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Already a member? <Link href="/auth/login" className="text-emerald-600 font-bold underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-500 transition-all">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
