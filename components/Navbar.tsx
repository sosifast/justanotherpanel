'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard } from 'lucide-react';

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
        <>
            <header
                className={`fixed w-full z-50 transition-all duration-300 ${isSolid
                    ? 'bg-white/80 backdrop-blur-md shadow-sm py-3'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 group" aria-label="JustAnotherPanel Home">
                            {settings?.logo_imagekit_url ? (
                                <img src={settings.logo_imagekit_url} alt={siteName} className="h-9 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-600 transition-colors">
                                        {siteName.charAt(0)}
                                    </div>
                                    <span className={`font-bold text-xl tracking-tight transition-colors ${isSolid ? 'text-slate-900' : 'text-slate-900'}`}>
                                        {siteName}
                                    </span>
                                </>
                            )}
                        </Link>

                        <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
                            <Link href="/services" className={`text-sm font-medium transition-colors ${isSolid ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Services</Link>
                            <Link href="/blog" className={`text-sm font-medium transition-colors ${isSolid ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Blog</Link>
                            <Link href="/#features" className={`text-sm font-medium transition-colors ${isSolid ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Features</Link>
                            <Link href="/#about" className={`text-sm font-medium transition-colors ${isSolid ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Why Us</Link>
                        </nav>

                        <div className="hidden md:flex items-center gap-3">
                            {isLoggedIn ? (
                                <Link href="/user" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href="/auth/login" className={`text-sm font-semibold transition-colors ${isSolid ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Login</Link>
                                    <Link href="/auth/register" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all inline-flex items-center justify-center">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`p-2 transition-colors ${isSolid ? 'text-slate-900' : 'text-slate-900'}`}
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            >
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 py-4 px-4 flex flex-col space-y-4 shadow-lg z-50">
                        <Link href="/services" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Services</Link>
                        <Link href="/blog" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                        <Link href="/#features" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link href="/#about" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Why Us</Link>
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                            {isLoggedIn ? (
                                <Link href="/user" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href="/auth/login" className="text-slate-900 font-semibold text-left">Login</Link>
                                    <Link href="/auth/register" className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium text-center">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </nav>
                )}
            </header>
        </>
    );
}
