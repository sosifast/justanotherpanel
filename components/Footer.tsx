'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Globe } from 'lucide-react';

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

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8 z-10 relative" role="contentinfo">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4 group">
                            {settings?.logo_imagekit_url ? (
                                <img src={settings.logo_imagekit_url} alt={siteName} className="h-8 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-600 transition-colors">
                                        {siteName.charAt(0)}
                                    </div>
                                    <span className="font-bold text-xl text-slate-900">{siteName}</span>
                                </>
                            )}
                        </Link>
                        <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
                            The #1 SMM Panel in the World. Engineered for speed, designed for leaders who want to maximize their social media presence.
                        </p>
                    </div>

                    <nav aria-label="Footer Platform Links">
                        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link href="/services" className="hover:text-blue-600 transition-colors">Services</Link></li>
                            <li><a href="/api" className="hover:text-blue-600 transition-colors">API Documentation</a></li>
                            <li><a href="/auth/register" className="hover:text-blue-600 transition-colors">Sign Up</a></li>
                            <li><a href="/auth/login" className="hover:text-blue-600 transition-colors">Login</a></li>
                        </ul>
                    </nav>

                    <nav aria-label="Footer Company Links">
                        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><a href="/about" className="hover:text-blue-600 transition-colors">About Us</a></li>
                            <li><a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                            <li><a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="/support" className="hover:text-blue-600 transition-colors">Support</a></li>
                        </ul>
                    </nav>
                </div>

                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                    <div>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</div>
                    <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-4">
                            {settings?.telegram && (
                                <a href={settings.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <TelegramIcon className="w-5 h-5" />
                                </a>
                            )}
                            {settings?.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {settings?.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-pink-600 transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                        <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span>English (US)</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
