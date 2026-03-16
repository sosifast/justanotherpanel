'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Globe, Phone, Mail, MessageCircle, ArrowUpRight, Zap, Target, ShieldCheck, Heart } from 'lucide-react';

const TelegramIcon = ({ className }: { className?: string }) => (
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

interface FooterProps {
    settings: any;
}

export default function Footer({ settings }: FooterProps) {
    const siteName = settings?.site_name || "JustAnotherPanel";

    const mainPages = [
        { name: 'Services', href: '/services' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact-us' },
        { name: 'Blog', href: '/blog' }
    ];

    const popularServices = [
        { name: 'Instagram Followers', href: '/services' },
        { name: 'TikTok Views', href: '/services' },
        { name: 'YouTube Subscribers', href: '/services' },
        { name: 'Facebook Likes', href: '/services' }
    ];

    const legalPages = [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Support', href: '/support' },
        { name: 'API Docs', href: '/api' }
    ];

    return (
        <footer className="relative bg-slate-950 text-white pt-24 pb-12 overflow-hidden" role="contentinfo">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="flex items-center gap-2.5 mb-8 group w-fit">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                                {siteName.charAt(0)}
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight text-white">
                                {siteName}
                            </span>
                        </Link>
                        <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm">
                            The world's most trusted SMM panel. We empower influencers and businesses with high-performance social growth solutions.
                        </p>
                        
                        <div className="flex gap-4">
                            {[
                                { icon: <MessageCircle size={20} />, href: "https://wa.me/6288293334443" },
                                { icon: <TelegramIcon className="w-5 h-5" />, href: settings?.telegram },
                                { icon: <Facebook size={20} />, href: settings?.facebook_url },
                                { icon: <Instagram size={20} />, href: settings?.instagram_url }
                            ].map((social, i) => (
                                social.href && (
                                    <a 
                                        key={i} 
                                        href={social.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95"
                                    >
                                        {social.icon}
                                    </a>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 lg:col-span-8 gap-8">
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Company</h4>
                            <ul className="space-y-4">
                                {mainPages.map((page) => (
                                    <li key={page.name}>
                                        <Link href={page.href} className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center gap-1 group">
                                            {page.name}
                                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Services</h4>
                            <ul className="space-y-4">
                                {popularServices.map((service) => (
                                    <li key={service.name}>
                                        <Link href={service.href} className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center gap-1 group">
                                            {service.name}
                                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Support</h4>
                            <ul className="space-y-4">
                                {legalPages.map((page) => (
                                    <li key={page.name}>
                                        <Link href={page.href} className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center gap-1 group">
                                            {page.name}
                                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>


                {/* Trust Badges & Copyright */}
                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap justify-center md:justify-start gap-8 opacity-30">
                        <div className="flex items-center gap-1.5 grayscale">
                            <ShieldCheck size={18} />
                            <span className="text-xs font-bold uppercase tracking-tighter">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-1.5 grayscale">
                            <Zap size={18} />
                            <span className="text-xs font-bold uppercase tracking-tighter">Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-1.5 grayscale">
                            <Target size={18} />
                            <span className="text-xs font-bold uppercase tracking-tighter">Targeted Reach</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-2 text-center md:text-right">
                        <p className="text-slate-500 text-sm">
                            &copy; {new Date().getFullYear()} {siteName}. Engineered for excellence.
                        </p>
                        <p className="text-slate-600 text-[10px] uppercase tracking-widest flex items-center justify-center md:justify-end gap-1">
                            Made with <Heart size={8} className="text-rose-600 fill-rose-600" /> by Industry Leaders
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
