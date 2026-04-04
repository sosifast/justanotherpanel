'use client';

import React from 'react';
import Link from 'next/link';
import { 
    Globe, 
    ShieldCheck, 
    Zap, 
    CreditCard, 
    RefreshCcw, 
    ChevronRight,
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

export default function SmsTempClient({ settings }: { settings: any }) {
    return (
        <div className="min-h-screen bg-white">
            <Navbar settings={settings} alwaysSolid={false} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
                    <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[100px] opacity-40"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-in fade-in slide-in-from-bottom duration-700">
                        <Zap size={14} className="text-indigo-600 fill-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Premium Virtual Numbers</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                        Instant SMS Verification <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500">Without a SIM Card</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-slate-600 font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                        Unlock accounts on social networks, chat services, and global platforms instantly. Our high-speed temporary numbers provide the most reliable SMS reception available 24/7.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                        <Link 
                            href="/pages/sms-temp/services-sms" 
                            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Get Started Now <ChevronRight size={18} />
                        </Link>
                        <Link 
                            href="/pages/sms-temp/services-sms" 
                            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-600 border border-slate-200 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            View All Services
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap justify-center items-center gap-10 opacity-60 grayscale filter hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2 font-black text-slate-400 text-xs tracking-widest uppercase">
                            <ShieldCheck size={20} /> Security First
                        </div>
                        <div className="flex items-center gap-2 font-black text-slate-400 text-xs tracking-widest uppercase">
                            <Globe size={20} /> Global Coverage
                        </div>
                        <div className="flex items-center gap-2 font-black text-slate-400 text-xs tracking-widest uppercase">
                            <Zap size={20} /> 100% Instant
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Use Our Services Section */}
            <section id="features" className="py-24 bg-slate-50/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase italic mb-4">Why Choose Our Virtual Numbers?</h2>
                        <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-10 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group border border-slate-100">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-indigo-100">
                                <Globe size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Global Network</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Our infrastructure spans over 30 countries with more than 1 million active numbers available at any given moment.
                            </p>
                        </div>

                        <div className="p-10 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group border border-slate-100">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-emerald-100">
                                <RefreshCcw size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Daily Refresh</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                We maintain high success rates by adding fresh phone numbers to our database every single day.
                            </p>
                        </div>

                        <div className="p-10 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group border border-slate-100">
                            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-amber-100">
                                <CreditCard size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Flexible Payments</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Top-up your balance easily through e-wallets, bank cards, or direct cryptocurrency transfers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-indigo-600 rounded-[4rem] p-12 lg:p-24 text-center overflow-hidden shadow-2xl shadow-indigo-200">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 opacity-90"></div>
                        
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight uppercase italic mb-8">Ready to skip <br />the SIM card store?</h2>
                            <p className="text-lg text-indigo-50 font-medium leading-relaxed mb-12">
                                Join over 100,000 users who trust JustAnotherPanel for their online verification needs.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link 
                                    href="/pages/sms-temp/services-sms" 
                                    className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    Get Started Free <ChevronRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer settings={settings} />
        </div>
    );
}
