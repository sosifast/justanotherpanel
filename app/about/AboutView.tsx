'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Globe, 
    Zap, 
    Users, 
    Target, 
    Award, 
    TrendingUp, 
    Shield, 
    Headphones, 
    Clock, 
    CheckCircle,
    ArrowRight,
    Sparkles,
    ChevronRight,
    Play
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

const AboutView = ({ settings }: { settings: any }) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const siteName = settings?.site_name || "JustAnotherPanel";

    const stats = [
        { value: '2.5M+', label: 'Orders Processed', icon: <CheckCircle className="w-5 h-5" /> },
        { value: '250K+', label: 'Active Users', icon: <Users className="w-5 h-5" /> },
        { value: '99.9%', label: 'API Uptime', icon: <TrendingUp className="w-5 h-5" /> },
        { value: '8m', label: 'Avg Response', icon: <Clock className="w-5 h-5" /> },
    ];

    const values = [
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Radical Speed',
            description: 'Our proprietary API infrastructure delivers results within seconds of ordering.',
            color: 'indigo'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Bulletproof Security',
            description: 'Enterprise-grade encryption and privacy protocols protecting every transaction.',
            color: 'emerald'
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: 'Hyper Quality',
            description: 'We curate only high-retention, organic-looking profiles for maximum results.',
            color: 'violet'
        },
        {
            icon: <Headphones className="w-6 h-6" />,
            title: 'Human Support',
            description: 'No bots. Real experts available 24/7 to solve your growth challenges.',
            color: 'amber'
        },
    ];

    const timeline = [
        {
            year: '2020',
            title: 'The Foundation',
            description: 'Launched with a simple mission: make social growth accessible to everyone.',
        },
        {
            year: '2021',
            title: 'Global Scale',
            description: 'Expanded infrastructure across 3 continents and 200+ payment methods.',
        },
        {
            year: '2022',
            title: 'The Platinum Tier',
            description: 'Introduced high-retention premium services that changed the industry.',
        },
        {
            year: '2023',
            title: 'Automation Era',
            description: 'Launched full API integration allowing resellers to scale effortlessly.',
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
            
            {/* Ambient Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-emerald-100/20 rounded-full blur-[100px]"></div>
            </div>

            <Navbar settings={settings} />

            <main className="relative z-10">
                {/* Hero section with floating elements */}
                <section className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-[10px] font-black uppercase tracking-widest mb-8">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    Since 2020 • Market Leaders
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950 mb-8 leading-[1.1]">
                                    We build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600">Future</span> of Influence.
                                </h1>
                                <p className="text-xl text-slate-600 font-medium leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                                    {siteName} isn't just a panel. We're an elite infrastructure for creators, brands, and agencies who refuse to settle for average growth.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link href="/auth/register" className="h-14 px-10 bg-indigo-600 text-white rounded-2xl font-black text-base hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
                                        Join the Elite
                                        <ArrowRight size={20} />
                                    </Link>
                                    <Link href="/services" className="h-14 px-10 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-base hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                                        Explore Solutions
                                    </Link>
                                </div>
                            </div>

                            <div className="relative order-first lg:order-last">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-[3rem] blur-3xl animate-pulse"></div>
                                <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-[3.5rem] shadow-2xl">
                                    <div className="bg-slate-950 rounded-[3rem] aspect-video flex items-center justify-center group cursor-pointer relative overflow-hidden">
                                        {/* Mock video / image area */}
                                        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform relative z-10">
                                            <Play size={32} className="fill-white ml-1" />
                                        </div>
                                        <div className="absolute bottom-6 left-8 right-8 z-10">
                                            <h4 className="text-white font-black text-lg">Watch Our Story</h4>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">2:45 Duration</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section with Glass Cards */}
                <section className="py-12 px-4 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] text-center hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 group">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 group-hover:rotate-6 transition-transform">
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl lg:text-5xl font-black text-slate-950 mb-2 tracking-tight">{stat.value}</div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 lg:py-40 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl lg:text-6xl font-black text-slate-950 mb-6 tracking-tight">Our Core DNA</h2>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                                We obsess over every detail of our platform to ensure your success is never left to chance.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => (
                                <div key={index} className="group p-10 rounded-[3rem] bg-white border border-slate-200/60 hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5">
                                    <div className={`w-16 h-16 bg-${value.color}-50 text-${value.color}-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform animate-pulse`}>
                                        {value.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4">{value.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline Section / Journey */}
                <section className="py-24 lg:py-40 px-4 bg-slate-950 relative overflow-hidden rounded-[4rem] lg:rounded-[6rem] mx-4">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px]"></div>
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 tracking-tighter">The Evolution</h2>
                            <div className="w-20 h-1 bg-indigo-500 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
                            {timeline.map((item, index) => (
                                <div key={index} className="relative pt-12 border-t border-white/10 group">
                                    <div className="absolute -top-3 left-0 w-6 h-6 rounded-full bg-indigo-600 border-4 border-slate-950 group-hover:scale-125 transition-transform shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
                                    <div className="text-5xl font-black text-white/5 mb-6 group-hover:text-indigo-400/20 transition-colors uppercase tracking-tighter">{item.year}</div>
                                    <h3 className="text-2xl font-black text-white mb-4 group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA Section */}
                <section className="py-24 lg:py-48 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[4rem] p-12 lg:p-24 relative overflow-hidden text-center shadow-3xl">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                            
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                                    Experience the <span className="text-indigo-500 italic underline decoration-indigo-500/30">{siteName}</span> Difference.
                                </h2>
                                <p className="text-slate-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                                    Join thousands of creators who switched to our elite infrastructure and never looked back. 
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8">
                                    <Link href="/auth/register" className="h-16 px-12 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20 flex items-center justify-center">
                                        Create Free Account
                                    </Link>
                                    <Link href="/contact-us" className="h-16 px-12 bg-slate-800 text-white rounded-2xl font-black text-lg hover:bg-slate-700 transition-all border border-white/10 flex items-center justify-center">
                                        Contact Sales
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer settings={settings} />

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default AboutView;
