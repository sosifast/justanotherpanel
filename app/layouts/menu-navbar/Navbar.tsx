'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, ChevronRight, Zap } from 'lucide-react';

interface NavbarProps {
    settings: any;
    alwaysSolid?: boolean;
}

export default function Navbar({ settings, alwaysSolid = false }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const siteName = settings?.site_name || "JustAnotherPanel";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
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

    const isSolid = alwaysSolid || scrolled;

    return (
        <header
            className={`fixed w-full z-50 transition-all duration-500 ${isSolid
                ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)]'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95" aria-label="Home">
                        {settings?.logo_imagekit_url ? (
                            <img src={settings.logo_imagekit_url} alt={siteName} className="h-10 w-auto object-contain" />
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
                                        {siteName.charAt(0)}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950">
                                    {siteName}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
                        {[
                            { name: 'Services', href: '/services' },
                            { name: 'Features', href: '/#features' },
                            { name: 'Why Us', href: '/#about' }
                        ].map((item) => (
                            <Link 
                                key={item.name}
                                href={item.href} 
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50/50 transition-all duration-300"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoggedIn ? (
                            <Link href="/user" className="group text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-indigo-600 transition-all duration-500 flex items-center gap-2 shadow-lg shadow-slate-200">
                                <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Dashboard
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 px-4 py-2 transition-colors">
                                    Login
                                </Link>
                                <Link href="/auth/register" className="relative group overflow-hidden bg-indigo-600 text-white px-7 py-2.5 rounded-full font-bold text-sm shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
                                    <span className="relative z-10">Get Started</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center gap-3">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}`}>
                <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 p-5 mx-4 mt-2 rounded-3xl shadow-2xl flex flex-col space-y-2">
                    {[
                        { name: 'Services', href: '/services' },
                        { name: 'Features', href: '/#features' },
                        { name: 'Why Us', href: '/#about' }
                    ].map((item) => (
                        <Link 
                            key={item.name}
                            href={item.href} 
                            className="flex items-center justify-between p-4 rounded-2xl text-slate-700 font-bold hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.name}
                            <ChevronRight size={16} className="opacity-40" />
                        </Link>
                    ))}
                    
                    <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
                        {isLoggedIn ? (
                            <Link href="/user" className="bg-slate-900 text-white p-4 rounded-2xl font-bold text-center flex items-center justify-center gap-3 shadow-lg group">
                                <LayoutDashboard size={20} />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="p-4 text-slate-900 font-bold text-center border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link href="/auth/register" className="bg-indigo-600 text-white p-4 rounded-2xl font-bold text-center shadow-xl shadow-indigo-100" onClick={() => setIsMenuOpen(false)}>
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
