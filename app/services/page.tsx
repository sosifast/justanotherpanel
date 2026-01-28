'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Zap,
    LayoutDashboard,
    Menu,
    X,
    Search,
    Filter,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';

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

export default function ServicesPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [settings, setSettings] = useState<any>(null);

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
                console.error('Auth check failed:', error);
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/public/services');
                if (response.ok) {
                    const data = await response.json();
                    setServices(data.services || []);
                    setSettings(data.settings || null);
                }
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const siteName = settings?.site_name || "JustAnotherPanel";

    // Group services by platform and category
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

    // Get all platforms for filter
    const platforms = ['all', ...Object.keys(groupedServices)];

    // Filter services
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

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white relative overflow-x-hidden">

            {/* Grid Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent border-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 group" aria-label={`${siteName} Home`}>
                            {settings?.logo_imagekit_url ? (
                                <img src={settings.logo_imagekit_url} alt={siteName} className="h-9 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-600 transition-colors">
                                        {siteName.charAt(0)}
                                    </div>
                                    <span className="font-bold text-xl tracking-tight text-slate-900">{siteName}</span>
                                </>
                            )}
                        </Link>

                        <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
                            <Link href="/#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Services</Link>
                            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
                            <Link href="/#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Why Us</Link>
                        </nav>

                        <div className="hidden md:flex items-center gap-3">
                            {isLoggedIn ? (
                                <a href="/user" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </a>
                            ) : (
                                <>
                                    <a href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Login</a>
                                    <a href="/auth/register" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all inline-flex items-center justify-center">
                                        Get Started
                                    </a>
                                </>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-slate-900 p-2"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            >
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 py-4 px-4 flex flex-col space-y-4 shadow-lg" aria-label="Mobile Navigation">
                        <Link href="/#services" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Services</Link>
                        <Link href="/#features" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link href="/#about" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Why Us</Link>
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                            {isLoggedIn ? (
                                <a href="/user" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </a>
                            ) : (
                                <>
                                    <a href="/auth/login" className="text-slate-900 font-semibold text-left">Login</a>
                                    <a href="/auth/register" className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium text-center">Sign Up</a>
                                </>
                            )}
                        </div>
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-8">
                            <TrendingUp className="w-3 h-3" />
                            All Services
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Services</span>
                        </h1>

                        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Browse our complete catalog of social media marketing services. Choose from hundreds of options across all major platforms.
                        </p>
                    </div>
                </section>

                {/* Search and Filter Section */}
                <section className="pb-8 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-lg">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search services..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Platform Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <select
                                        value={selectedPlatform}
                                        onChange={(e) => setSelectedPlatform(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                                    >
                                        {platforms.map((platform) => (
                                            <option key={platform} value={platform}>
                                                {platform === 'all' ? 'All Platforms' : platform}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services List */}
                <section className="pb-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                <p className="text-slate-600">Loading services...</p>
                            </div>
                        ) : Object.keys(filteredGroupedServices).length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
                                <p className="text-slate-600">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {Object.entries(filteredGroupedServices).map(([platform, categories]) => (
                                    <div key={platform}>
                                        {/* Platform Header */}
                                        <div className="mb-6">
                                            <h2 className="text-3xl font-bold text-slate-900 mb-2">{platform}</h2>
                                            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                                        </div>

                                        {/* Categories */}
                                        <div className="space-y-8">
                                            {Object.entries(categories).map(([category, serviceList]) => (
                                                <div key={category}>
                                                    <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        {category}
                                                    </h3>

                                                    <div className="grid gap-4">
                                                        {serviceList.map((service) => (
                                                            <div
                                                                key={service.id}
                                                                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 group"
                                                            >
                                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                                            {service.name}
                                                                        </h4>
                                                                        {service.note && (
                                                                            <p className="text-sm text-slate-500 mb-2">{service.note}</p>
                                                                        )}
                                                                        <div className="flex flex-wrap gap-3 text-xs">
                                                                            <span className="text-slate-600">
                                                                                Min: <strong>{service.min.toLocaleString()}</strong>
                                                                            </span>
                                                                            <span className="text-slate-300">•</span>
                                                                            <span className="text-slate-600">
                                                                                Max: <strong>{service.max.toLocaleString()}</strong>
                                                                            </span>
                                                                            {service.refill && (
                                                                                <>
                                                                                    <span className="text-slate-300">•</span>
                                                                                    <span className="flex items-center gap-1 text-green-600">
                                                                                        <CheckCircle className="w-3 h-3" />
                                                                                        Refill Guaranteed
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-right">
                                                                            <div className="text-sm text-slate-500 mb-1">Price per 1k</div>
                                                                            <div className="text-2xl font-bold text-blue-600">
                                                                                ${parseFloat(service.price_sale).toFixed(4)}
                                                                            </div>
                                                                        </div>
                                                                        {isLoggedIn ? (
                                                                            <a
                                                                                href="/user/new-order"
                                                                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap"
                                                                            >
                                                                                Order Now
                                                                                <ArrowRight className="w-4 h-4" />
                                                                            </a>
                                                                        ) : (
                                                                            <a
                                                                                href="/auth/register"
                                                                                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center gap-2 whitespace-nowrap"
                                                                            >
                                                                                Sign Up
                                                                                <ArrowRight className="w-4 h-4" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
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

                {/* CTA Section */}
                {!isLoggedIn && (
                    <section className="py-24 px-4">
                        <div className="max-w-5xl mx-auto text-center">
                            <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" aria-hidden="true"></div>

                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                                        Ready to get started?
                                    </h2>
                                    <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                                        Create your free account now and start growing your social media presence today.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link href="/auth/register" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg transform hover:-translate-y-1 inline-block">
                                            Create Free Account
                                        </Link>
                                        <Link href="/#features" className="px-8 py-4 bg-transparent border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-all inline-block">
                                            Learn More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8 z-10 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
