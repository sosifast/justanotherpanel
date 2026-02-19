'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, Zap, Users, Target, Award, TrendingUp, Shield, Headphones, Clock, CheckCircle } from 'lucide-react';
import Footer from '@/components/Footer';

const AboutPage = ({ settings }: { settings: any }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const siteName = settings?.site_name || "JustAnotherPanel";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const stats = [
        { value: '1M+', label: 'Orders Completed', icon: <CheckCircle className="w-5 h-5" /> },
        { value: '50K+', label: 'Happy Customers', icon: <Users className="w-5 h-5" /> },
        { value: '99.9%', label: 'Uptime', icon: <TrendingUp className="w-5 h-5" /> },
        { value: '24/7', label: 'Support Available', icon: <Headphones className="w-5 h-5" /> },
    ];

    const values = [
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Speed',
            description: 'We deliver results fast. Our automated systems process orders in minutes, not hours.',
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Security',
            description: 'Your data and transactions are protected with enterprise-grade security measures.',
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: 'Quality',
            description: 'We prioritize quality over quantity. Every service is optimized for the best results.',
        },
        {
            icon: <Headphones className="w-6 h-6" />,
            title: 'Support',
            description: 'Our dedicated support team is available 24/7 to help you succeed.',
        },
    ];

    const timeline = [
        {
            year: '2020',
            title: 'The Beginning',
            description: 'JustAnotherPanel was founded with a vision to revolutionize social media marketing.',
        },
        {
            year: '2021',
            title: 'Rapid Growth',
            description: 'Reached 10,000 customers and expanded our service offerings to 20+ platforms.',
        },
        {
            year: '2022',
            title: 'Global Expansion',
            description: 'Launched multilingual support and payment options for customers worldwide.',
        },
        {
            year: '2023',
            title: 'Industry Leader',
            description: 'Became the #1 rated SMM panel with over 500,000 orders processed monthly.',
        },
        {
            year: '2024',
            title: 'Innovation',
            description: 'Introduced AI-powered analytics and advanced automation features.',
        },
        {
            year: '2025',
            title: 'The Future',
            description: 'Continuing to innovate and lead the industry with cutting-edge solutions.',
        },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white relative overflow-x-hidden">

            {/* Grid Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
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
                            <Link href="/about" className="text-sm font-medium text-slate-900 transition-colors">About</Link>
                        </nav>

                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
                            <Link href="/auth/register" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all inline-flex items-center justify-center">
                                Get Started
                            </Link>
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
                        <Link href="/about" className="text-slate-900 font-medium" onClick={() => setIsMenuOpen(false)}>About</Link>
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                            <Link href="/auth/login" className="text-slate-900 font-semibold text-left">Login</Link>
                            <Link href="/auth/register" className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium text-center">Sign Up</Link>
                        </div>
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main className="relative z-10">

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-6">
                            <Award className="w-3 h-3" />
                            About Us
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
                            Empowering Your
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600"> Social Growth</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            {siteName} is the world&apos;s leading SMM panel, trusted by millions of businesses and influencers to grow their social media presence. We combine cutting-edge technology with exceptional service to deliver results that matter.
                        </p>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 px-4 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl mb-4">
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                    <div className="text-sm text-slate-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-24 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                                    Our Mission
                                </h2>
                                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                    We believe everyone deserves access to powerful social media marketing tools. Our mission is to democratize social media growth by providing affordable, reliable, and effective services to businesses of all sizes.
                                </p>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    Whether you&apos;re a small business owner, content creator, or marketing agency, we&apos;re here to help you achieve your goals and reach new heights.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/auth/register" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                                        Start Growing Today
                                    </Link>
                                    <Link href="/services" className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                                        View Services
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-[2rem] opacity-50 blur-2xl -z-10"></div>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">Our Vision</h3>
                                            <p className="text-slate-500 text-sm">Where we&apos;re heading</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed">
                                        To become the most trusted and innovative social media marketing platform in the world, empowering millions of users to build their online presence and achieve their dreams.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 px-4 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                These principles guide everything we do and shape how we serve our customers.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300">
                                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className="py-24 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Journey</h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                From humble beginnings to industry leader - here&apos;s how we got here.
                            </p>
                        </div>
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2"></div>

                            <div className="space-y-12">
                                {timeline.map((item, index) => (
                                    <div key={index} className={`relative flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                        {/* Dot */}
                                        <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow -translate-x-1/2 z-10"></div>

                                        {/* Content */}
                                        <div className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3">
                                                    <Clock className="w-3 h-3" />
                                                    {item.year}
                                                </div>
                                                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                                <p className="text-sm text-slate-500">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                    Ready to Join Us?
                                </h2>
                                <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
                                    Start your social media growth journey today and see why millions trust {siteName}.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/auth/register" className="px-8 py-4 bg-white text-emerald-900 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg">
                                        Create Free Account
                                    </Link>
                                    <Link href="/support" className="px-8 py-4 bg-transparent border border-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-all">
                                        Contact Us
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer settings={settings} />
        </div>
    );
};

export default AboutPage;
