'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
    Calendar, 
    ArrowRight, 
    Clock, 
    Search,
    ChevronRight,
    BookOpen,
    ChevronLeft,
    Filter
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

interface BlogViewProps {
    settings: any;
    allArticles: any[];
}

export default function BlogView({ settings, allArticles }: BlogViewProps) {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // 4x3 or 4x4 style

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeCategory]);

    const categories = useMemo(() => ['All', ...Array.from(new Set(allArticles.map(a => a.category?.name).filter(Boolean)))], [allArticles]);

    const filteredArticles = useMemo(() => {
        return allArticles.filter(article => {
            const matchesSearch = article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 (article.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || article.category?.name === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [allArticles, searchQuery, activeCategory]);

    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white">
            <Navbar settings={settings} />

            <main className="relative">
                {/* Clean Header - Minimalist */}
                {/* 4x Grid Feed */}
                <section className="px-4 pt-32 pb-16 lg:pb-24">
                    <div className="max-w-[1440px] mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {paginatedArticles.length > 0 ? paginatedArticles.map((article, idx) => (
                                <article 
                                    key={idx} 
                                    className="group flex flex-col bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 h-full border border-slate-100"
                                >
                                    <Link href={`/blog/${article.slug}`} className="relative aspect-[4/3] overflow-hidden">
                                        {article.banner_imagekit_upload_url ? (
                                            <img 
                                                src={article.banner_imagekit_upload_url} 
                                                alt={article.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                                                <BookOpen size={48} strokeWidth={1} />
                                            </div>
                                        )}
                                        {article.category && (
                                            <div className="absolute top-4 left-4">
                                                <div className="px-3 py-1 rounded-lg bg-white/95 backdrop-blur-sm shadow-sm text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-slate-100">
                                                    {article.category.name}
                                                </div>
                                            </div>
                                        )}
                                    </Link>
                                    
                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-indigo-600" />
                                                {new Date(article.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} className="text-indigo-600" />
                                                5m Read
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                            <Link href={`/blog/${article.slug}`}>
                                                {article.name}
                                            </Link>
                                        </h3>
                                        
                                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 line-clamp-2 flex-1">
                                            {article.desc_seo || article.seo_title || "Explore deep insights into social growth and automation strategies."}
                                        </p>
                                        
                                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <Link 
                                                href={`/blog/${article.slug}`}
                                                className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest group/read"
                                            >
                                                Read Entry
                                                <ChevronRight size={16} className="group-hover/read:translate-x-1 transition-transform" />
                                            </Link>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )) : (
                                <div className="col-span-full py-40 flex flex-col items-center text-center">
                                    <p className="text-slate-400 font-bold italic text-xl">No articles found matching your criteria.</p>
                                    <button onClick={() => {setSearchQuery(''); setActiveCategory('All');}} className="mt-6 text-indigo-600 font-black underline uppercase tracking-widest text-xs">Reset All Filters</button>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-24 flex items-center justify-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${currentPage === page ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer settings={settings} />
        </div>
    );
}
