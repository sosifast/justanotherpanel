'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  ArrowRight, 
  ChevronLeft,
  Loader2,
  CheckCircle2,
  X,
  KeyRound
} from 'lucide-react';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col overflow-x-hidden">
            
            {/* Top Area (Hero) - Light Theme */}
            <div className="relative h-[35vh] flex flex-col justify-end p-8 bg-emerald-600 overflow-hidden shadow-lg">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500 rounded-full opacity-40"></div>
                
                <Link href="/auth/login" className="absolute top-12 left-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all z-10">
                    <ChevronLeft size={24} />
                </Link>
                
                <div className="relative z-10 space-y-2 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-12 h-1.5 bg-white rounded-full mb-4 shadow-sm"></div>
                    <h1 className="text-4xl font-black tracking-tight leading-none text-white uppercase italic">
                        RECOVER<br/><span className="text-emerald-100 not-italic uppercase opacity-80 text-3xl">YOUR KEY.</span>
                    </h1>
                </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 bg-white rounded-t-[3rem] -mt-10 p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] relative z-20">
                
                {success && (
                    <div className="mb-6 p-8 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-[2.5rem] animate-in fade-in zoom-in duration-300 shadow-sm">
                        <CheckCircle2 className="w-10 h-10 mb-6 text-emerald-600" />
                        <h3 className="text-lg font-black text-slate-900 mb-2">Request Successful</h3>
                        <p className="text-sm font-bold leading-relaxed opacity-70 mb-8">{success}</p>
                        <Link 
                            href="/auth/login" 
                            className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 group transition-all active:scale-95"
                        >
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            Return to Entry Portal
                        </Link>
                    </div>
                )}

                {!success && (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] text-xs font-bold flex items-center gap-3 animate-in shake-in duration-300">
                                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black text-xs">!</div>
                                <span className="flex-1">{error}</span>
                                <button onClick={() => setError('')}><X size={14} /></button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10 mt-4">
                            
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300 ml-1">Recovery Destination</label>
                                <div className="relative border-b-2 border-slate-50 focus-within:border-emerald-500 transition-colors py-1 group">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@domain.com"
                                        className="w-full bg-transparent py-3 outline-none text-lg text-slate-800 placeholder:text-slate-300 transition-all font-bold"
                                    />
                                    <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center space-x-3 active:scale-[0.97] transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <span>SEND RECOVERY LINK</span>
                                        <ArrowRight size={22} strokeWidth={3} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 text-center">
                            <Link 
                                href="/auth/login" 
                                className="text-slate-400 text-sm font-medium hover:text-emerald-600 transition-colors"
                            >
                                Remembered your access key? <span className="text-emerald-600 font-bold underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-500 transition-all">Sign in here</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgetPassword;
