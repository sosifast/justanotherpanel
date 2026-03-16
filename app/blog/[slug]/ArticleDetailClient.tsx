'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Calendar, 
    Tag, 
    ArrowLeft, 
    Share2, 
    Clock, 
    Link as LinkIcon,
    ArrowRight,
    Facebook,
    Twitter,
    Linkedin,
    BookOpen,
    Eye
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

interface ArticleDetailClientProps {
    article: any;
    settings: any;
    siteName: string;
    sidebarContent: {
        latest: any[];
        popular: any[];
        recommended: any[];
    };
}

export default function ArticleDetailClient({ article, settings, siteName, sidebarContent }: ArticleDetailClientProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const proseClass = "prose prose-lg prose-slate max-w-none break-words overflow-x-hidden prose-headings:font-black prose-headings:text-slate-950 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:my-10 prose-p:block prose-img:rounded-3xl prose-img:shadow-xl prose-blockquote:border-l-4 prose-blockquote:border-indigo-600 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-3xl prose-blockquote:text-slate-700 prose-blockquote:font-medium prose-blockquote:italic whitespace-normal";

    const formatText = (text: string) => {
        if (!text) return { __html: '' };
        
        // If it looks like HTML, return as is
        if (/<[a-z][\s\S]*>/i.test(text)) {
            return { __html: text };
        }
        
        // Handle plain text with newlines
        // Normalize newlines to \n
        const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Split by double newlines for paragraphs, or single newlines for line breaks
        const formattedHTML = normalized
            .split(/\n\n+/)
            .filter(para => para.trim().length > 0)
            .map(para => `<p style="margin-bottom: 1.5rem;">${para.replace(/\n/g, '<br />')}</p>`)
            .join('');
            
        return { __html: formattedHTML || text };
    };

    const renderContent = () => {
        const content = article.content;
        if (!content) return null;
        
        // Case 1: Pure string (HTML or Plain Text)
        if (typeof content === 'string') {
            return <div className={proseClass} dangerouslySetInnerHTML={formatText(content)} />;
        }
        
        // Case 2: JSON Object
        if (typeof content === 'object') {
            // Standard wrapping in 'html' or 'text' keys
            if ('html' in content && typeof content.html === 'string') {
                return <div className={proseClass} dangerouslySetInnerHTML={formatText(content.html)} />;
            }
            if ('text' in content && typeof content.text === 'string') {
                return <div className={proseClass} dangerouslySetInnerHTML={formatText(content.text)} />;
            }

            // TipTap / ProseMirror structure: { type: 'doc', content: [...] }
            if ('type' in content && content.type === 'doc' && Array.isArray((content as any).content)) {
                // If it's TipTap JSON, it's best to use a specialized renderer, 
                // but as a fallback we can try to extract text from paragraphs
                const extractText = (nodes: any[]): string => {
                    return nodes.map(node => {
                        if (node.type === 'text') return node.text;
                        if (node.content) return extractText(node.content);
                        if (node.type === 'paragraph') return '\n\n';
                        if (node.type === 'hardBreak') return '\n';
                        return '';
                    }).join('');
                };
                return <div className={proseClass} dangerouslySetInnerHTML={formatText(extractText((content as any).content))} />;
            }
            
            // EditorJS structure: { blocks: [...] }
            if ('blocks' in content && Array.isArray((content as any).blocks)) {
                const renderBlocks = (blocks: any[]) => {
                    return blocks.map((block, idx) => {
                        if (block.type === 'paragraph') return `<p style="margin-bottom: 1.5rem;">${block.data.text}</p>`;
                        if (block.type === 'header') return `<h${block.data.level} class="font-black text-slate-950 mb-4">${block.data.text}</h${block.data.level}>`;
                        if (block.type === 'list') {
                            const items = block.data.items.map((item: string) => `<li>${item}</li>`).join('');
                            return block.data.style === 'ordered' ? `<ol class="list-decimal pl-6 mb-4">${items}</ol>` : `<ul class="list-disc pl-6 mb-4">${items}</ul>`;
                        }
                        return '';
                    }).join('');
                };
                return <div className={proseClass} dangerouslySetInnerHTML={{ __html: renderBlocks((content as any).blocks) }} />;
            }
            
            // Generic Array of strings or objects
            if (Array.isArray(content)) {
                const combined = content.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n\n');
                return <div className={proseClass} dangerouslySetInnerHTML={formatText(combined)} />;
            }

            // Fallback for other objects
            try {
                const stringContent = JSON.stringify(content);
                // If the stringified version looks like a plain string (it was a quoted string in JSON)
                if (stringContent.startsWith('"') && stringContent.endsWith('"')) {
                    return <div className={proseClass} dangerouslySetInnerHTML={formatText(JSON.parse(stringContent))} />;
                }
                return <div className={proseClass}><pre className="whitespace-pre-wrap text-sm text-slate-400">{JSON.stringify(content, null, 2)}</pre></div>;
            } catch (e) {
                return <div className="text-slate-400 italic py-12 text-center">Rendering error.</div>;
            }
        }
        
        return <div className="text-slate-400 italic py-12 text-center border border-dashed border-slate-200 rounded-2xl">Content format error.</div>;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    // Sidebar Widgets
    const PopularWidget = ({ articles }: { articles: any[] }) => (
        <div className="mb-14">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-8">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                Most Popular
            </h3>
            <div className="space-y-6">
                {articles.map((item, idx) => (
                    <Link key={idx} href={`/blog/${item.slug}`} className="flex gap-5 group items-start">
                        <div className="text-4xl font-black text-slate-200 group-hover:text-indigo-600 transition-colors w-8 text-right shrink-0 leading-[0.9]">
                            {idx + 1}
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                {item.category?.name || 'Insight'}
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span className="text-slate-400 flex items-center gap-1"><Eye size={10} /> {item.view_count || 0}</span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                                {item.name}
                            </h4>
                            <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span>{new Date(item.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>5m read</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );

    const StandardWidget = ({ title, articles, iconColor }: { title: string, articles: any[], iconColor: string }) => (
        <div className="mb-14">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-8">
                <span className={`w-3 h-3 rounded-full ${iconColor}`}></span>
                {title}
            </h3>
            <div className="space-y-6">
                {articles.map((item, idx) => (
                    <Link key={idx} href={`/blog/${item.slug}`} className="flex gap-4 group items-center">
                        {item.banner_imagekit_upload_url ? (
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
                                <img src={item.banner_imagekit_upload_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-slate-50 shrink-0 flex items-center justify-center text-slate-300 border border-slate-100">
                                <BookOpen size={24} strokeWidth={1.5} />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                                {item.category?.name || 'Insight'}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-3 leading-snug">
                                {item.name}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-600 selection:text-white">
            <Navbar settings={settings} />

            <main className="relative pt-32 lg:pt-40 pb-20 lg:pb-32">
                <div className="max-w-[1440px] mx-auto px-4">
                    
                    {/* Editorial Header */}
                    <div className="max-w-4xl mb-12 lg:mb-16">
                        <Link 
                            href="/blog" 
                            className="inline-flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-8 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Insights
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            {article.category && (
                                <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                    {article.category.name}
                                </div>
                            )}
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-slate-300" />
                                    {new Date(article.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-slate-300" />
                                    Read: 5m
                                </span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-slate-950 mb-8 leading-[1.05]">
                            {article.name}
                        </h1>

                        <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
                                    {siteName.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-base font-black text-slate-900">{siteName} Editorial</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        Verified Staff
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button onClick={copyToClipboard} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200 transition-all">
                                    <LinkIcon size={18} />
                                </button>
                                <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/20 transition-all">
                                    <Twitter size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grand Banner */}
                    {article.banner_imagekit_upload_url && (
                        <div className="w-full aspect-[21/9] rounded-[2rem] lg:rounded-[3rem] overflow-hidden mb-16 shadow-2xl border border-slate-100 relative group">
                            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                            <img 
                                src={article.banner_imagekit_upload_url} 
                                alt={article.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                        </div>
                    )}

                    {/* Main Grid: Content + Sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                        
                        {/* Article Content */}
                        <div className="lg:col-span-8 lg:pr-12 lg:border-r border-slate-100 min-w-0">
                            <article className="relative min-w-0">
                                {/* Lead Paragraph (SEO description) */}
                                {(article.desc_seo || article.seo_title) && (
                                    <p className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed mb-12 pb-12 border-b border-slate-100 italic">
                                        {article.desc_seo || article.seo_title}
                                    </p>
                                )}

                                <div className="content-prose">
                                    {renderContent()}
                                </div>

                                {/* Article Footer Tags */}
                                <div className="mt-20 pt-10 border-t border-slate-100">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Tags:</span>
                                        {article.keyword && article.keyword.split(',').map((tag: string, i: number) => (
                                            <span key={i} className="px-4 py-2 rounded-full bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all hover:bg-slate-900 hover:text-white cursor-default border border-slate-100 border-dashed">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* Interactive Sidebar */}
                        <aside className="lg:col-span-4 min-w-0">
                            <div className="sticky top-32">
                                
                                {/* Latest Stories */}
                                {sidebarContent.latest?.length > 0 && (
                                    <StandardWidget title="Latest Stories" articles={sidebarContent.latest} iconColor="bg-indigo-500" />
                                )}

                                {/* Popular Stories */}
                                {sidebarContent.popular?.length > 0 && (
                                    <PopularWidget articles={sidebarContent.popular} />
                                )}

                                {/* Recommended Stories */}
                                {sidebarContent.recommended?.length > 0 && (
                                    <StandardWidget title="Recommended for You" articles={sidebarContent.recommended} iconColor="bg-emerald-500" />
                                )}

                                {/* Sticky CTA */}
                                <div className="mt-14 bg-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/10">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                                            <Calendar className="text-white" size={28} />
                                        </div>
                                        <h4 className="text-xl font-black mb-3">Never miss an insight.</h4>
                                        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Join the most advanced social growth platform and elevate your digital presence instantly.</p>
                                        <Link href="/auth/register" className="h-12 w-full bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-lg shadow-white/10">
                                            Start Growing Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>
            </main>

            <Footer settings={settings} />
        </div>
    );
}
