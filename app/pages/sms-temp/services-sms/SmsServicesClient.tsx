'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
    Search, 
    Globe, 
    Zap, 
    ArrowLeft, 
    Filter,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

type Product = {
    id: number;
    title: string;
    code: string;
    cost_sale: number;
    total_count: number;
    project_id: string;
    country: {
        title: string;
        code: string;
    };
};

type Project = {
    id: number;
    pid: string;
    title: string;
};

type Props = {
    settings: any;
    products: Product[];
    projects: Project[];
    initialCountries: string[];
    initialTotalPages: number;
};

export default function SmsServicesClient({ settings, products: initialProducts, projects, initialCountries, initialTotalPages }: Props) {
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
    const [loading, setLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Handle debouncing search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchData = useCallback(async (p: number = 1, currentFilter: string = 'All', search: string = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/pages/sms-temp/services?page=${p}&country=${encodeURIComponent(currentFilter)}&search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
                setTotalPages(data.totalPages);
                setPage(data.currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Only run if not on the first load without search/filter
        if (debouncedSearch !== '' || selectedCountry !== 'All') {
            fetchData(1, selectedCountry, debouncedSearch);
        }
    }, [debouncedSearch, selectedCountry, fetchData]);

    const handlePageChange = (p: number) => {
        if (p >= 1 && p <= totalPages) {
            fetchData(p, selectedCountry, debouncedSearch);
        }
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
        } else {
            items.push(1);
            if (page > 3) items.push('...');
            
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            
            for (let i = start; i <= end; i++) {
                if (!items.includes(i)) items.push(i);
            }
            
            if (page < totalPages - 2) items.push('...');
            if (!items.includes(totalPages)) items.push(totalPages);
        }

        return items.map((item, idx) => (
            <button
                key={idx}
                disabled={item === '...' || loading}
                onClick={() => typeof item === 'number' && handlePageChange(item)}
                className={`w-10 h-10 rounded-xl font-black text-[10px] uppercase transition-all active:scale-90 ${
                    item === page 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                    : item === '...' 
                    ? 'text-slate-300' 
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                }`}
            >
                {item}
            </button>
        ));
    };

    return (
        <div className="min-h-screen bg-white transition-all duration-700 select-none">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-50/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-emerald-50/40 rounded-full blur-[120px]"></div>
            </div>

            <Navbar settings={settings} alwaysSolid={true} />

            <div className="max-w-7xl mx-auto px-6 pt-36 pb-24 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
                    <div className="space-y-5">
                        <Link 
                            href="/pages/sms-temp" 
                            className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-50 text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] rounded-full hover:text-indigo-600 hover:bg-indigo-50 transition-all group border border-slate-100 shadow-sm"
                        >
                            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                            Return overview
                        </Link>
                        <h1 className="text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                            Virtual <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Numbered Matrix</span>
                        </h1>
                        <p className="max-w-xl text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
                            Encrypted access to over <span className="text-slate-900">1.2 million</span> distinct transmissions across <span className="text-slate-900 cursor-help underline decoration-emerald-500/30 decoration-2 underline-offset-4">{initialCountries.length - 1} nations</span> globally.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Scan service matrix..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-50 rounded-[2rem] text-sm font-bold uppercase tracking-tight focus:outline-none focus:border-indigo-100 focus:ring-8 focus:ring-indigo-50/50 transition-all shadow-2xl shadow-slate-200/40 placeholder:text-slate-300"
                            />
                            {loading && (
                                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                    <Zap className="w-5 h-5 text-indigo-600 animate-pulse fill-indigo-600" />
                                </div>
                            )}
                        </div>
                        <div className="relative w-full sm:w-56 group">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:rotate-12 transition-transform" size={20} />
                            <select 
                                value={selectedCountry}
                                onChange={(e) => {
                                    setSelectedCountry(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-14 pr-8 py-5 bg-white border-2 border-slate-50 rounded-[2rem] text-sm font-black uppercase tracking-widest focus:outline-none focus:border-indigo-100 focus:ring-8 focus:ring-indigo-50/50 transition-all shadow-2xl shadow-slate-200/40 appearance-none cursor-pointer"
                            >
                                {initialCountries.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Main Content Table (Pure Professionalism) */}
                <div className={`bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-100/50 overflow-hidden relative transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/40 border-b border-slate-100/50 backdrop-blur-md sticky top-0">
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Transmission Identification</th>
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">National Origin</th>
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Stock Index</th>
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Unit Price</th>
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Execute</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/80">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all group duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all shadow-lg border border-slate-100/50 group-hover:border-indigo-100 group-hover:shadow-indigo-100/30 text-slate-400 group-hover:text-indigo-600">
                                                    <Zap size={24} fill={p.total_count > 0 ? "currentColor" : "none"} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-base uppercase tracking-tight italic group-hover:translate-x-1 transition-transform">{p.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] bg-slate-50 px-2 py-0.5 rounded-md">ID: {p.project_id}</span>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em]">SMRT-V.{p.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-all group-hover:border-emerald-100">
                                                <Globe size={16} className="text-emerald-500" />
                                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight italic">{p.country.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className={`text-[14px] font-black tabular-nums transition-colors ${p.total_count > 0 ? 'text-indigo-600' : 'text-rose-500 underline decoration-wavy'}`}>
                                                {p.total_count.toLocaleString()}
                                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 italic">
                                                    Available Units
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="space-y-0.5">
                                                <div className="text-[20px] font-black text-slate-900 tabular-nums leading-none tracking-tight">
                                                    ${Number(p.cost_sale).toFixed(3)}
                                                </div>
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Per Transmission</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <Link 
                                                href={`/auth/login?returnUrl=/user/sms-temp/service?productId=${p.id}`}
                                                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-600 hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-slate-200 hover:shadow-indigo-200"
                                            >
                                                Initialize Order
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {products.length === 0 && !loading && (
                        <div className="py-32 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border-2 border-slate-100 border-dashed animate-pulse">
                                <Search size={44} className="opacity-40" />
                            </div>
                            <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-2xl">Matrix Empty</h3>
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-4 px-12 leading-relaxed italic max-w-sm mx-auto">No signatures matching your transmission parameters were detected in local space.</p>
                        </div>
                    )}
                </div>

                {/* Premium Numbered Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex flex-col items-center gap-6 animate-in fade-in duration-1000">
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1 || loading}
                                onClick={() => handlePageChange(page - 1)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            <div className="flex items-center gap-2">
                                {renderPaginationItems()}
                            </div>

                            <button
                                disabled={page === totalPages || loading}
                                onClick={() => handlePageChange(page + 1)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
                            Viewing Sector <span className="text-slate-900">{page}</span> of Total <span className="text-slate-900">{totalPages}</span> Matrix Slices
                        </p>
                    </div>
                )}

                {/* Aesthetic Features */}
                <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: 'Global Node System', desc: 'Secure transmissions through verified international points of presence.', icon: <Globe className="text-emerald-500" /> },
                        { title: 'Real-Time Sync', desc: 'Instant cryptographic verification codes delivered within seconds.', icon: <Zap className="text-indigo-600 fill-indigo-600" /> },
                        { title: 'Encrypted Payments', desc: 'Tier-1 financial security for all credit and digital asset transactions.', icon: <ShieldCheck className="text-amber-500" /> }
                    ].map((item, idx) => (
                        <div key={idx} className="group text-center">
                            <div className="inline-flex w-16 h-16 bg-white rounded-[1.5rem] shadow-xl border border-slate-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                {item.icon}
                            </div>
                            <h4 className="font-black text-slate-900 uppercase tracking-widest italic text-sm mb-3">{item.title}</h4>
                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic opacity-80">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <Footer settings={settings} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
}
