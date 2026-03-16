'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Search, 
    BookOpen, 
    Zap, 
    CreditCard, 
    Settings, 
    MessageCircle, 
    Mail, 
    Clock, 
    ChevronRight, 
    ArrowRight,
    HelpCircle,
    ShieldCheck,
    Globe,
    Headphones,
    CheckCircle2,
    Sparkles,
    Activity,
    LifeBuoy,
    FileText
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

const TelegramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
);

interface SupportClientProps {
    settings: any;
    siteName: string;
}

export default function SupportClient({ settings, siteName }: SupportClientProps) {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const categories = [
        {
            title: "Getting Started",
            description: "Learn the basics of using our panel and placing your first order.",
            icon: <Zap className="w-6 h-6" />,
            color: "indigo",
            articles: 12
        },
        {
            title: "Billing & Funds",
            description: "Issues with deposits, payment methods, or refund status.",
            icon: <CreditCard className="w-6 h-6" />,
            color: "emerald",
            articles: 8
        },
        {
            title: "API Integration",
            description: "Documentation for resellers and automated panel connections.",
            icon: <Activity className="w-6 h-6" />,
            color: "violet",
            articles: 15
        },
        {
            title: "Account Security",
            description: "Managing your password, 2FA, and profile settings.",
            icon: <ShieldCheck className="w-6 h-6" />,
            color: "amber",
            articles: 6
        },
        {
            title: "Service Support",
            description: "Tracking order status, refills, and quality inquiries.",
            icon: <LifeBuoy className="w-6 h-6" />,
            color: "rose",
            articles: 20
        },
        {
            title: "General FAQ",
            description: "Common questions about our platforms and social networks.",
            icon: <HelpCircle className="w-6 h-6" />,
            color: "sky",
            articles: 30
        }
    ];

    const contactMethods = [
        {
            title: "WhatsApp",
            value: "+62 882-9333-4443",
            icon: <MessageCircle className="w-5 h-5" />,
            color: "emerald",
            href: "https://wa.me/6288293334443"
        },
        {
            title: "Telegram",
            value: settings?.telegram ? (settings.telegram.includes('t.me/') ? `@${settings.telegram.split('t.me/')[1]}` : settings.telegram) : "@JustAnotherPanel",
            icon: <TelegramIcon />,
            color: "blue",
            href: settings?.telegram || "#"
        },
        {
            title: "24/7 Email",
            value: "info@apkey.net",
            icon: <Mail className="w-5 h-5" />,
            color: "indigo",
            href: "mailto:info@apkey.net"
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
            
            {/* Ambient Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-emerald-100/20 rounded-full blur-[100px]"></div>
            </div>

            <Navbar settings={settings} />

            <main className="relative z-10">
                {/* Hero Header */}
                <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 bg-white/40 backdrop-blur-sm border-b border-slate-200/50">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-8 shadow-xl shadow-slate-200">
                            <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                            Help Center
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950 mb-8 leading-tight">
                            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">help you?</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                            Search our knowledge base or choose a category below to find the answers you need to scale your social authority.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <Search size={22} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search help articles (e.g. 'how to add funds')..."
                                className="w-full h-20 pl-16 pr-8 bg-white border border-slate-200 rounded-[2rem] font-bold text-lg text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-xl shadow-slate-200/40"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Popular Keywords */}
                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 py-2">Popular:</span>
                            {['Refunds', 'TikTok Views', 'API Key', 'PerfectMoney', 'Order Status'].map((tag) => (
                                <button key={tag} className="px-5 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Status Banner */}
                <div className="max-w-7xl mx-auto px-4 -translate-y-1/2 relative z-20">
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/5">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Activity size={24} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-ping"></div>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900">All Systems Operational</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global SMM Nodes: 100% stable</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden lg:block text-right">
                                <div className="text-sm font-black text-slate-900">Uptime: 99.98%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Last 24 Hours</div>
                            </div>
                            <button className="h-12 px-6 bg-slate-950 text-white rounded-xl font-black text-sm hover:bg-indigo-600 transition-all flex items-center gap-2">
                                System Status
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <section className="px-4 py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-950 mb-6">Browse by Category</h2>
                            <p className="text-lg text-slate-500 font-medium">Find specific solutions for every aspect of your growth journey.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((cat, idx) => (
                                <Link 
                                    key={idx} 
                                    href="/support" 
                                    className="group p-10 rounded-[3rem] bg-white border border-slate-200/60 hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col h-full"
                                >
                                    <div className={`w-16 h-16 bg-${cat.color}-50 text-${cat.color}-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                        {cat.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4">{cat.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">{cat.description}</p>
                                    
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{cat.articles} Articles</span>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Resource Links with Visual Icons */}
                <section className="py-24 bg-slate-950 relative overflow-hidden rounded-[4rem] lg:rounded-[6rem] mx-4 lg:mx-8">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px]"></div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 tracking-tighter">Essential Resources</h2>
                                <p className="text-slate-400 text-lg lg:text-xl font-medium mb-12 max-w-xl">
                                    Deep dive into our technical guides and platform rules to maximize your account performance.
                                </p>
                                
                                <div className="space-y-4">
                                    {[
                                        { title: "API Documentation", icon: <FileText />, href: "/api", desc: "Build your own automation" },
                                        { title: "Reseller Program", icon: <Globe />, href: "/about", desc: "Start your own business" },
                                        { title: "Terms of Service", icon: <ShieldCheck />, href: "/terms", desc: "Rules and policies" }
                                    ].map((item, i) => (
                                        <Link 
                                            key={i} 
                                            href={item.href}
                                            className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <div className="text-white font-black">{item.title}</div>
                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.desc}</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-indigo-500/20 to-violet-600/20 blur-[100px] absolute inset-0 animate-pulse"></div>
                                <div className="relative p-10 lg:p-14 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[4rem] text-center">
                                    <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-indigo-600/40 transform -rotate-6">
                                        <Mail size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-6">Can't find what you're looking for?</h3>
                                    <p className="text-slate-400 font-medium mb-10">Our human support team is available 24/7 to resolve complex issues.</p>
                                    <Link 
                                        href="/contact-us"
                                        className="h-16 px-12 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 w-full shadow-2xl"
                                    >
                                        Inquire Directly
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Direct Contact Cards */}
                <section className="py-24 lg:py-40 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6">
                            {contactMethods.map((method, idx) => (
                                <Link 
                                    key={idx} 
                                    href={method.href} 
                                    className="flex items-center justify-between p-8 bg-white border border-slate-200 rounded-[2.5rem] hover:border-indigo-500/30 hover:shadow-2xl transition-all duration-500 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 bg-${method.color}-50 text-${method.color}-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            {method.icon}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{method.title}</div>
                                            <div className="font-black text-slate-900 tracking-tight">{method.value}</div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer settings={settings} />
        </div>
    );
}
