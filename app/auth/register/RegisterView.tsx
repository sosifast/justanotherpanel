'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Eye, EyeOff, Lock, Mail, User, 
    ArrowRight, Loader2, Sparkles, 
    CheckCircle2, Globe, Rocket,
    ArrowLeft, ShieldCheck, Zap
} from 'lucide-react';

const Register = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState<any>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

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
        <div className="min-h-screen bg-slate-950 flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white relative">
            
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -mr-80 -mt-80" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -ml-80 -mb-80" />
            
            {/* Left Side: Visual/Marketing */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 border-r border-white/5">
                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                        <Sparkles className="w-3 h-3 text-emerald-400 fill-current" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Growth Accelerated</span>
                    </div>
                    
                    <h1 className="text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
                        Ignite Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Digital Presence.</span>
                    </h1>
                    
                    <p className="text-slate-400 text-lg mb-12 font-medium leading-relaxed">
                        Join the elite marketers using our infrastructure to dominate social algorithms.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: <Zap className="w-5 h-5 text-amber-400" />, title: 'High-Speed API', text: 'Resellers can connect via our ultra-fast documented API.' },
                            { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: 'Premium Retention', text: 'Proprietary methods to ensure your stats stay long-term.' },
                            { icon: <Rocket className="w-5 h-5 text-blue-400" />, title: 'Global Deployment', text: 'Instant access to over 2,000+ specialized social services.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md group hover:bg-white/[0.08] transition-colors">
                                <div className="mt-1 p-3 bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 overflow-y-auto">
                <div className="max-w-md w-full py-12 bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-10 lg:p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
                    
                    <div className="mb-10 text-center lg:text-left">
                        <Link href="/" className="inline-block mb-8">
                            {settings?.logo_imagekit_url ? (
                                <img src={settings.logo_imagekit_url} alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" />
                            ) : (
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-2xl">J</div>
                            )}
                        </Link>
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">Get Started.</h2>
                        <p className="text-slate-400 font-medium tracking-tight">Setup your account in seconds.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-xs font-bold flex items-center gap-3">
                            <div className="w-5 h-5 bg-red-400/20 rounded-full flex items-center justify-center text-red-400 font-black">!</div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-all" />
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Full name" 
                                        className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-all" />
                                    <input 
                                        type="text" 
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Username" 
                                        className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Electronic Mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com" 
                                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Passphrase</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-all" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••" 
                                    className="w-full pl-11 pr-11 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm identity</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-all" />
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••" 
                                    className="w-full pl-11 pr-11 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex items-start gap-3">
                            <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500" required />
                            <label htmlFor="terms" className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em] cursor-pointer leading-tight">
                                I agree to <Link href="/terms" className="text-white hover:underline">Terms</Link> & <Link href="/privacy" className="text-white hover:underline">Privacy Policy</Link>.
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4.5 bg-white text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-white/5 hover:bg-slate-100 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : (
                                <>
                                    Initialize Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4 italic">Already a member?</p>
                        <Link 
                            href="/auth/login" 
                            className="inline-flex items-center gap-2 group text-white font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Sign In to Portal
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
