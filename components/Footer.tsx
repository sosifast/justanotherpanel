'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Globe, Phone, Mail, MessageCircle } from 'lucide-react';

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

    // Menu items for easy management
    const mainPages = [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' },
        { name: 'About Us', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact Us', href: '/contact-us' }
    ];

    const legalPages = [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Support', href: '/support' },
        { name: 'API Documentation', href: '/api' }
    ];

    const accountPages = [
        { name: 'Sign Up', href: '/auth/register' },
        { name: 'Login', href: '/auth/login' },
        { name: 'FAQ', href: '#' },
        { name: 'API Status', href: '#' }
    ];

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8 z-10 relative" role="contentinfo">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                    {/* Company Info & Contact */}
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
                        <p className="text-slate-500 max-w-xs text-sm leading-relaxed mb-6">
                            The #1 SMM Panel in the World. Engineered for speed, designed for leaders who want to maximize their social media presence.
                        </p>
                        
                        {/* Contact Information */}
                        <div className="space-y-3 mb-6">
                            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">Contact Us</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone className="w-4 h-4 text-green-600" />
                                <a href="https://wa.me/6288293334443" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">
                                    +62 882-9333-4443 (WhatsApp)
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail className="w-4 h-4 text-blue-600" />
                                <a href="mailto:info@apkey.net" className="hover:text-blue-600 transition-colors">
                                    info@apkey.net
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Main Pages */}
                    <nav aria-label="Main Pages">
                        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Main Pages</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            {mainPages.map((page) => (
                                <li key={page.href}>
                                    <Link href={page.href} className="hover:text-blue-600 transition-colors">
                                        {page.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Legal Pages */}
                    <nav aria-label="Legal Pages">
                        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            {legalPages.map((page) => (
                                <li key={page.href}>
                                    <Link href={page.href} className="hover:text-blue-600 transition-colors">
                                        {page.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Account Links */}
                    <nav aria-label="Account Links">
                        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Account</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            {accountPages.map((page) => (
                                <li key={page.href}>
                                    <Link href={page.href} className="hover:text-blue-600 transition-colors">
                                        {page.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                    <div>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</div>
                    <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-4">
                            {/* WhatsApp Contact */}
                            <a href="https://wa.me/6288293334443" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-slate-400 hover:text-green-600 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </a>
                            {/* Telegram */}
                            {settings?.telegram && (
                                <a href={settings.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <TelegramIcon className="w-5 h-5" />
                                </a>
                            )}
                            {/* Facebook */}
                            {settings?.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {/* Instagram */}
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