'use client';

import React from 'react';
import Link from 'next/link';
import { 
    Zap, 
    Rocket, 
    Target, 
    ArrowRight, 
    CheckCircle2, 
    Users, 
    TrendingUp, 
    Globe,
    Star,
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

const industries = [
    { title: "Entertainment", icon: "🎬", desc: "Amplify your reach with viral content strategies." },
    { title: "Music", icon: "🎶", desc: "For artists, labels & indie musicians looking for real streams." },
    { title: "Influencers", icon: "🌟", desc: "Grow your personal brand & audience engagement." },
    { title: "Business", icon: "💼", desc: "B2B & B2C branding & performance-driven lead generation." },
    { title: "Fitness", icon: "🏋️", desc: "Coaches, gyms & wellness brands looking for a pulse." },
    { title: "Food", icon: "🍴", desc: "Bloggers, chefs & restaurants aiming for the local map." },
    { title: "Fashion", icon: "👗", desc: "Designers, models & boutiques scaling their runways." },
    { title: "Education", icon: "📚", desc: "Coaches, online courses & schools building authority." },
    { title: "Travel", icon: "✈️", desc: "Influencers & travel agencies driving wanderlust." },
    { title: "Real Estate", icon: "🏡", desc: "Agents & property developers generating quality leads." },
    { title: "Healthcare", icon: "👩‍⚕️", desc: "Clinics, practitioners & wellness centers building trust." },
    { title: "E-Commerce", icon: "🛒", desc: "Shops, D2C brands & marketplaces scaling sales." }
];

export default function SmmIndiaClient({ settings }: { settings: any }) {
    return (
        <div className="min-h-screen bg-white">
            <Navbar settings={settings} alwaysSolid={false} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900 border-b border-white/5">
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-orange-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="lg:w-3/5 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                <Star size={14} className="fill-indigo-400" />
                                #1 Indian social media promotion
                            </div>
                            <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 italic">
                                SMM India <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-orange-400">
                                    Promotions
                                </span>
                            </h1>
                            <p className="text-lg lg:text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-2xl">
                                We skyrocket your brand with organic + advanced strategies: more followers, real engagement, and viral visibility. Instagram, YouTube, LinkedIn, Threads — we dominate them all.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link 
                                    href="/auth/register" 
                                    className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    Get Started Free <Rocket size={20} />
                                </Link>
                                <Link 
                                    href="/services" 
                                    className="px-10 py-5 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                >
                                    View Services <Zap size={20} />
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-2/5 relative animate-float">
                            <div className="absolute -inset-10 bg-indigo-500/20 blur-[100px] rounded-full"></div>
                            <div className="relative bg-slate-800/50 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Growth Matrix</div>
                                            <div className="text-2xl font-black text-white italic">+240.5% Organic</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Real Followers', value: '100% Guaranteed', icon: <Users size={16} /> },
                                            { label: 'Delivery Speed', value: 'Instant Trigger', icon: <Zap size={16} /> },
                                            { label: 'Global Proxies', value: 'Indian-Based Nodes', icon: <Globe size={16} /> }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between group cursor-default">
                                                <div className="flex items-center gap-3 text-slate-400 group-hover:text-indigo-400 transition-colors">
                                                    {item.icon}
                                                    <span className="text-xs font-bold uppercase">{item.label}</span>
                                                </div>
                                                <span className="text-xs font-black text-white italic">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Verticals Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 mb-6 text-indigo-600 font-black text-xs uppercase tracking-widest">
                            <Target size={16} /> Industries We Dominate
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none italic uppercase">
                            Dedicated YouTube & <br className="hidden lg:block" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-orange-500">Instagram Growth</span> Services
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {industries.map((item, i) => (
                            <div key={i} className="group p-8 bg-slate-50 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 border border-slate-100 relative overflow-hidden">
                                <div className="text-5xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform block">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-3 group-hover:translate-x-1 transition-transform">
                                    {item.title}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                    {item.desc}
                                </p>
                                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-24 bg-slate-900 overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#4f46e515_0%,transparent_100%)]"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                                Performance <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-white">Over Promises.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                We are the engine behind some of India's biggest digital successes. No bots, no ghost engagement—just pure growth data.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="text-4xl font-black text-white italic">1M+</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left">Successful Orders</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl font-black text-indigo-400 italic">24/7</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Monitoring</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: 'Verified Profiles', desc: 'Real Indian IDs for 100% verification security.' },
                                { title: 'Algorithm Safe', desc: 'Drip-feed technology to mimic natural growth.' },
                                { title: 'Retention Engine', desc: 'Highest persistence rate in the Indian market.' },
                                { title: 'API Integration', desc: 'Professional tools for resellers and businesses.' }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-indigo-400 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase tracking-tight italic">{feature.title}</h4>
                                        <p className="text-slate-400 text-xs font-medium">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-indigo-600 rounded-[3.5rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                        <div className="absolute top-0 left-0 w-full h-full bg-slate-900 opacity-10"></div>
                        <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter italic uppercase leading-[0.9]">
                                Dominate Bharat's <br /> Digital Space.
                            </h2>
                            <p className="text-indigo-50 text-lg lg:text-xl font-medium leading-relaxed opacity-90">
                                Join 50,000+ Indian creators who scaled their presence using our elite panel infrastructure.
                            </p>
                            <Link 
                                href="/auth/register" 
                                className="inline-flex h-20 items-center justify-center px-16 bg-white text-indigo-600 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all gap-4"
                            >
                                Launch Growth Now <ArrowRight size={24} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer settings={settings} />

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-30px); }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                @media (max-width: 768px) {
                    .animate-float { animation: none; }
                }
            `}</style>
        </div>
    );
}
