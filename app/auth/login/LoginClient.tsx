'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    Eye, EyeOff, Lock, Mail, 
    ArrowRight, Loader2, CheckCircle2, 
    TrendingUp, ShieldCheck, Zap,
    ArrowLeft, Globe, Crown
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
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccess('Registration successful. Please check your email to activate.');
        }
    }, [searchParams]);

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
        <div className="min-h-screen bg-slate-950 flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white relative">
            
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -ml-80 -mt-80" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -mr-80 -mb-80" />
            
            {/* Left Side: Visual/Marketing */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 border-r border-white/5">
                <div className="max-w-xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
                        <Crown className="w-3 h-3 text-blue-400 fill-current" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Industry Leader</span>
                    </div>
                    
                    <h1 className="text-6xl font-black text-white leading-none mb-6 tracking-tighter">
                        Command Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Social Empire.</span>
                    </h1>
                    
                    <p className="text-slate-400 text-lg mb-10 font-medium leading-relaxed">
                        Access the world&apos;s most reliable SMM infrastructure. High speed, low cost, and professional support.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { icon: <Zap className="w-5 h-5 text-amber-400" />, title: 'Instant Delivery', desc: 'Average delivery starts in 2-5 minutes.' },
                            { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: 'Anti-Drop Protection', desc: '30-day refill guarantee on selected services.' },
                            { icon: <Globe className="w-5 h-5 text-blue-400" />, title: 'Global Coverage', desc: 'Services for every platform in every language.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md hover:bg-white/[0.08] transition-colors group">
                                <div className="p-3 bg-slate-900 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">{item.icon}</div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                                    <p className="text-slate-500 text-xs font-medium leading-tight">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <div className="max-w-md w-full bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-10 lg:p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
                    
                    {/* Header */}
                    <div className="mb-10 text-center lg:text-left">
                        <Link href="/" className="inline-block mb-8">
                            {settings?.logo_imagekit_url ? (
                                <img src={settings.logo_imagekit_url} alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" />
                            ) : (
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-2xl">J</div>
                            )}
                        </Link>
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">Welcome Back.</h2>
                        <p className="text-slate-400 font-medium tracking-tight">Access your dashboard and manage growth.</p>
                    </div>

                    {/* Alert Messages */}
                    {success && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl text-xs font-bold flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-xs font-bold flex items-center gap-3">
                            <div className="w-5 h-5 bg-red-400/20 rounded-full flex items-center justify-center text-red-400 font-black">!</div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                                <input 
                                    type="text" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Username or email" 
                                    className="w-full pl-12 pr-4 py-4.5 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Passphrase</label>
                                <Link href="/auth/forget" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="w-full pl-12 pr-12 py-4.5 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="remember" className="text-xs font-bold text-slate-500 uppercase tracking-tighter cursor-pointer select-none">Stay logged in</label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4.5 bg-white text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-white/5 hover:bg-slate-100 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : (
                                <>
                                    Log In to Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center pt-10 border-t border-white/5">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4 italic">No account yet?</p>
                        <Link 
                            href="/auth/register" 
                            className="inline-flex items-center gap-2 group text-white font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Create Free Account
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
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
