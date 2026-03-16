'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Zap,
    Search,
    Filter,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Loader2,
    ChevronRight,
    Target,
    Activity,
    Globe,
    ExternalLink
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

interface Service {
    id: number;
    name: string;
    min: number;
    max: number;
    price_sale: string;
    status: string;
    refill: boolean;
    note: string | null;
    category: {
        name: string;
        platform: {
            name: string;
            slug: string;
            icon_imagekit_url: string | null;
        };
    };
}

interface GroupedServices {
    [platform: string]: {
        [category: string]: Service[];
    };
}

interface ServicesClientProps {
    initialServices: Service[];
    initialSettings: any;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalServices: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        limit: number;
    };
}

export default function ServicesClient({ initialServices, initialSettings, pagination }: ServicesClientProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [services, setServices] = useState<Service[]>(initialServices);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [settings, setSettings] = useState<any>(initialSettings);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check');
                const data = await response.json();
                setIsLoggedIn(data.isAuthenticated);
            } catch (error) {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        setServices(initialServices);
        setSettings(initialSettings);
    }, [initialServices, initialSettings]);

    const siteName = settings?.site_name || "JustAnotherPanel";

    // Group services
    const groupedServices: GroupedServices = services.reduce((acc, service) => {
        const platformName = service.category.platform.name;
        const categoryName = service.category.name;

        if (!acc[platformName]) {
            acc[platformName] = {};
        }
        if (!acc[platformName][categoryName]) {
            acc[platformName][categoryName] = [];
        }
        acc[platformName][categoryName].push(service);
        return acc;
    }, {} as GroupedServices);

    const platforms = ['all', ...Object.keys(groupedServices)];

    const filteredGroupedServices = Object.entries(groupedServices).reduce((acc, [platform, categories]) => {
        if (selectedPlatform !== 'all' && platform !== selectedPlatform) {
            return acc;
        }

        const filteredCategories = Object.entries(categories).reduce((catAcc, [category, serviceList]) => {
            const filtered = serviceList.filter(service =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filtered.length > 0) {
                catAcc[category] = filtered;
            }
            return catAcc;
        }, {} as { [key: string]: Service[] });

        if (Object.keys(filteredCategories).length > 0) {
            acc[platform] = filteredCategories;
        }
        return acc;
    }, {} as GroupedServices);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
            
            {/* Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[10%] -left-[10%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]"></div>
                <div className="absolute top-[40%] -right-[5%] w-[25%] h-[25%] bg-violet-100/30 rounded-full blur-[90px]"></div>
            </div>

            <Navbar settings={settings} />

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-32 pb-12 lg:pt-48 lg:pb-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8">
                            <Activity className="w-3 h-3" />
                            Live Rates & Availability
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 font-sans">
                            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">Growth Catalog</span>
                        </h1>

                        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            Choose from over {pagination?.totalServices || '2,000'}+ premium services. Our industry-lowest rates are updated daily based on global provider API performance.
                        </p>
                    </div>
                </section>

                {/* Filters Section */}
                <section className="pb-12 px-4 sticky top-20 z-40 transition-all duration-300">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-4 lg:p-6 shadow-2xl shadow-slate-200/50">
                            <div className="grid lg:grid-cols-12 gap-4 items-center">
                                {/* Search */}
                                <div className="lg:col-span-7 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by ID, name or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full h-14 pl-14 pr-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
                                    />
                                </div>

                                {/* Platform Filter */}
                                <div className="lg:col-span-5 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Filter className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <select
                                        value={selectedPlatform}
                                        onChange={(e) => setSelectedPlatform(e.target.value)}
                                        className="block w-full h-14 pl-14 pr-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {platforms.map((platform) => (
                                            <option key={platform} value={platform}>
                                                {platform === 'all' ? 'Filtering: All Platforms' : `Platform: ${platform}`}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                                        <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services List Section */}
                <section className="pb-24 px-4 min-h-[400px]">
                    <div className="max-w-7xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
                                <p className="text-slate-600 font-bold">Retrieving latest pricing data...</p>
                            </div>
                        ) : Object.keys(filteredGroupedServices).length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                                    <Search size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No matching services</h3>
                                <p className="text-slate-500 font-medium">Try broadening your search or switching platforms.</p>
                            </div>
                        ) : (
                            <div className="space-y-20">
                                {Object.entries(filteredGroupedServices).map(([platform, categories]) => (
                                    <div key={platform} className="relative">
                                        {/* Platform Header */}
                                        <div className="flex items-center gap-4 mb-8">
                                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{platform}</h2>
                                            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
                                        </div>

                                        {/* Categories */}
                                        <div className="space-y-12">
                                            {Object.entries(categories).map(([category, serviceList]) => (
                                                <div key={category} className="group/cat">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-2 h-8 rounded-full bg-indigo-600 group-hover/cat:scale-y-110 transition-transform"></div>
                                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{category}</h3>
                                                        <span className="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{serviceList.length} items</span>
                                                    </div>

                                                    <div className="grid gap-4">
                                                        {serviceList.map((service) => (
                                                            <div
                                                                key={service.id}
                                                                className="bg-white border border-slate-200/60 rounded-[2rem] p-6 lg:p-8 hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group/item relative overflow-hidden"
                                                            >
                                                                {/* Grid Background in card */}
                                                                <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
                                                                
                                                                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                                                                    {/* ID & Info */}
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-3">
                                                                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-white px-2.5 py-1 rounded-lg">ID: {service.id}</span>
                                                                            {service.refill && (
                                                                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">
                                                                                    <Zap size={10} className="fill-emerald-700" />
                                                                                    Refill Enabled
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <h4 className="text-lg font-black text-slate-900 mb-3 group-hover/item:text-indigo-600 transition-colors leading-tight">
                                                                            {service.name}
                                                                        </h4>
                                                                        {service.note && (
                                                                            <p className="text-sm text-slate-500 mb-4 line-clamp-2 italic font-medium">"{service.note}"</p>
                                                                        )}
                                                                        
                                                                        <div className="flex flex-wrap items-center gap-6">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Qty</span>
                                                                                <span className="text-sm font-black text-slate-700">{service.min.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="w-px h-6 bg-slate-100 hidden sm:block"></div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Qty</span>
                                                                                <span className="text-sm font-black text-slate-700">{service.max.toLocaleString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Price & Action */}
                                                                    <div className="flex flex-row lg:flex-col lg:items-end justify-between items-center gap-4 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                                                                        <div className="lg:text-right">
                                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rate / 1,000</div>
                                                                            <div className="text-3xl font-black text-indigo-600 drop-shadow-sm">
                                                                                ${parseFloat(service.price_sale).toFixed(4)}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {isLoggedIn ? (
                                                                            <Link
                                                                                href="/user/new-order"
                                                                                className="h-14 px-8 bg-slate-950 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl active:scale-95"
                                                                            >
                                                                                Order Now
                                                                                <ArrowRight size={18} />
                                                                            </Link>
                                                                        ) : (
                                                                            <Link
                                                                                href="/auth/register"
                                                                                className="h-14 px-8 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-200 active:scale-95"
                                                                            >
                                                                                Join to Order
                                                                                <ExternalLink size={16} />
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                               green-400 </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <section className="pb-16 px-4">
                        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
                             <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Page <span className="text-slate-900">{pagination.currentPage}</span> of {pagination.totalPages}
                             </div>
                             <div className="flex items-center gap-2">
                                <Link
                                    href={`/services?page=${pagination.currentPage - 1}`}
                                    className={`h-14 px-6 rounded-2xl flex items-center justify-center font-bold transition-all ${pagination.hasPrevPage
                                        ? 'bg-white border border-slate-200 text-slate-900 hover:border-indigo-500 hover:text-indigo-600'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none'
                                        }`}
                                >
                                    Prev
                                </Link>
                                
                                <div className="hidden sm:flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum = 1;
                                        if (pagination.totalPages <= 5) pageNum = i + 1;
                                        else if (pagination.currentPage <= 3) pageNum = i + 1;
                                        else if (pagination.currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                        else pageNum = pagination.currentPage - 2 + i;

                                        return (
                                            <Link
                                                key={pageNum}
                                                href={`/services?page=${pageNum}`}
                                                className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black transition-all ${pagination.currentPage === pageNum
                                                    ? 'bg-slate-950 text-white shadow-xl scale-110'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </Link>
                                        );
                                    })}
                                </div>

                                <Link
                                    href={`/services?page=${pagination.currentPage + 1}`}
                                    className={`h-14 px-6 rounded-2xl flex items-center justify-center font-bold transition-all ${pagination.hasNextPage
                                        ? 'bg-white border border-slate-200 text-slate-900 hover:border-indigo-500 hover:text-indigo-600'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none'
                                        }`}
                                >
                                    Next
                                </Link>
                             </div>
                        </div>
                    </section>
                )}

                {/* Newsletter-replacement / Bottom CTA */}
                {!isLoggedIn && (
                    <section className="py-24 px-4 relative overflow-hidden">
                        <div className="max-w-6xl mx-auto">
                            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-[3.5rem] p-12 lg:p-24 relative overflow-hidden text-center">
                                {/* Grid Pattern */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight max-w-2xl">
                                        Ready to unlock <span className="text-indigo-400 italic underline decoration-indigo-500/30">unlimited</span> social growth?
                                    </h2>
                                    <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-xl font-medium">
                                        Join over 250,000+ happy customers already scaling their brands with {siteName}. Best prices, fastest delivery.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                                        <Link href="/auth/register" className="w-full sm:w-48 h-12 flex items-center justify-center bg-white text-slate-950 rounded-xl font-bold text-base hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20">
                                            Create Account
                                        </Link>
                                        <Link href="/contact" className="w-full sm:w-48 h-12 flex items-center justify-center bg-transparent border border-slate-700 text-white rounded-xl font-bold text-base hover:bg-white/5 hover:border-white transition-all hover:scale-105 active:scale-95">
                                            Talk to Sales
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer settings={settings} />
        </div>
    );
}
