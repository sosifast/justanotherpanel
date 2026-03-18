'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Mail, ArrowRight, Loader2, 
    ArrowLeft, CheckCircle2, AlertCircle,
    KeyRound
} from 'lucide-react';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings/public');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/forget', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');

            setSuccess(data.message || 'If an account exists, a reset link has been sent.');
            setEmail('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -ml-64 -mb-64" />
            
            <div className="max-w-md w-full relative">
                {/* Branding Above Card */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link href="/" className="inline-block mb-6">
                        {settings?.logo_imagekit_url ? (
                            <img src={settings.logo_imagekit_url} alt="Logo" className="h-12 w-auto object-contain brightness-0 invert" />
                        ) : (
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-black text-2xl shadow-2xl">J</div>
                        )}
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in-95 duration-500">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Lost Access?</h2>
                        <p className="text-slate-400 font-medium tracking-tight">Enter your email and we&apos;ll help you regain control of your account.</p>
                    </div>

                    {success ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-400">
                                <CheckCircle2 className="w-8 h-8 mb-4" />
                                <p className="text-sm font-bold leading-relaxed">{success}</p>
                            </div>
                            <Link 
                                href="/auth/login" 
                                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Log In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recovery Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com" 
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-100 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        Send Rescue Link
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <Link 
                            href="/auth/login" 
                            className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 group"
                        >
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            Return to Login
                        </Link>
                    </div>
                </div>

                {/* Footer Info */}
                <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                    SECURE RECOVERY PROCESS
                </p>
            </div>
        </div>
    );
};

export default ForgetPassword;
