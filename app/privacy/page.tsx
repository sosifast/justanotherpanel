'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, Shield, Eye, Database, Cookie, Lock, Users, Mail } from 'lucide-react';

const PrivacyPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        {
            id: 'introduction',
            icon: <Shield className="w-5 h-5" />,
            title: 'Introduction',
            content: [
                'At JustAnotherPanel, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.',
                'Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.',
                'We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of this Privacy Policy.',
            ]
        },
        {
            id: 'collection',
            icon: <Database className="w-5 h-5" />,
            title: 'Information We Collect',
            content: [
                'We may collect information about you in a variety of ways. The information we may collect on the Site includes:',
            ],
            subSections: [
                {
                    title: 'Personal Data',
                    items: [
                        'Full name and username',
                        'Email address',
                        'Phone number (optional)',
                        'Skype ID (optional)',
                        'Payment information',
                        'Social media account URLs you submit for orders',
                    ]
                },
                {
                    title: 'Derivative Data',
                    items: [
                        'IP address',
                        'Browser type and version',
                        'Operating system',
                        'Access times and dates',
                        'Pages viewed directly before and after accessing the Site',
                        'Geographic location',
                    ]
                },
                {
                    title: 'Financial Data',
                    items: [
                        'Payment method details (processed securely through third-party payment processors)',
                        'Transaction history',
                        'Account balance information',
                    ]
                }
            ]
        },
        {
            id: 'usage',
            icon: <Eye className="w-5 h-5" />,
            title: 'How We Use Your Information',
            content: [
                'Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use your information to:',
            ],
            list: [
                'Create and manage your account',
                'Process your orders and payments',
                'Deliver the services you have purchased',
                'Send you order confirmations and updates',
                'Respond to your inquiries and support requests',
                'Send you marketing communications (with your consent)',
                'Improve our website and services',
                'Monitor and analyze usage and trends',
                'Prevent fraudulent transactions and protect against criminal activity',
                'Comply with legal obligations',
            ]
        },
        {
            id: 'disclosure',
            icon: <Users className="w-5 h-5" />,
            title: 'Disclosure of Your Information',
            content: [
                'We may share information we have collected about you in certain situations. Your information may be disclosed as follows:',
            ],
            subSections: [
                {
                    title: 'By Law or to Protect Rights',
                    content: 'If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.'
                },
                {
                    title: 'Third-Party Service Providers',
                    content: 'We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.'
                },
                {
                    title: 'Business Transfers',
                    content: 'We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.'
                }
            ]
        },
        {
            id: 'cookies',
            icon: <Cookie className="w-5 h-5" />,
            title: 'Cookies and Tracking Technologies',
            content: [
                'We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience.',
                'When you access the Site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Site.',
            ],
            subSections: [
                {
                    title: 'Types of Cookies We Use',
                    items: [
                        'Essential Cookies: Required for the website to function properly',
                        'Analytics Cookies: Help us understand how visitors interact with our website',
                        'Preference Cookies: Remember your settings and preferences',
                        'Marketing Cookies: Track your activity for advertising purposes',
                    ]
                }
            ]
        },
        {
            id: 'security',
            icon: <Lock className="w-5 h-5" />,
            title: 'Security of Your Information',
            content: [
                'We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.',
                'Any information disclosed online is vulnerable to interception and misuse by unauthorized parties. Therefore, we cannot guarantee complete security if you provide personal information.',
                'All payment information is encrypted using SSL technology and processed through PCI-compliant payment processors.',
            ]
        },
        {
            id: 'rights',
            icon: <Users className="w-5 h-5" />,
            title: 'Your Privacy Rights',
            content: [
                'Depending on your location, you may have certain rights regarding your personal information:',
            ],
            list: [
                'Right to access the personal data we hold about you',
                'Right to request correction of inaccurate data',
                'Right to request deletion of your data',
                'Right to object to processing of your data',
                'Right to data portability',
                'Right to withdraw consent at any time',
            ],
            additional: [
                'To exercise any of these rights, please contact our support team. We will respond to your request within 30 days.',
            ]
        },
        {
            id: 'retention',
            icon: <Database className="w-5 h-5" />,
            title: 'Data Retention',
            content: [
                'We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.',
                'Order history and transaction records are kept for accounting and legal compliance purposes.',
                'You may request deletion of your account and associated data at any time by contacting support.',
            ]
        },
        {
            id: 'children',
            icon: <Users className="w-5 h-5" />,
            title: 'Policy for Children',
            content: [
                'We do not knowingly solicit information from or market to children under the age of 18. If we learn that we have collected personal information from a child under age 18 without verification of parental consent, we will delete that information as quickly as possible.',
                'If you become aware of any data we have collected from children under age 18, please contact us immediately.',
            ]
        },
        {
            id: 'contact',
            icon: <Mail className="w-5 h-5" />,
            title: 'Contact Us',
            content: [
                'If you have questions or comments about this Privacy Policy, please contact us at:',
            ],
            contactInfo: {
                email: 'support@justanotherpanel.com',
                website: 'https://justanotherpanel.com/support',
            }
        },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white relative overflow-x-hidden">

            {/* Grid Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent border-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 group" aria-label="JustAnotherPanel Home">
                            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-600 transition-colors">
                                J
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">JustAnotherPanel</span>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
                            <Link href="/#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Services</Link>
                            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
                            <Link href="/#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Why Us</Link>
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
                        <Link href="/#about" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Why Us</Link>
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                            <Link href="/auth/login" className="text-slate-900 font-semibold text-left">Login</Link>
                            <Link href="/auth/register" className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium text-center">Sign Up</Link>
                        </div>
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-4 relative z-10">
                <div className="max-w-4xl mx-auto">

                    {/* Page Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-6">
                            <Shield className="w-3 h-3" />
                            Legal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
                        </p>
                        <p className="text-sm text-slate-400 mt-4">Last updated: January 2026</p>
                    </div>

                    {/* Table of Contents */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-12">
                        <h2 className="font-bold text-slate-900 mb-4">Table of Contents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {sections.map((section, index) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors py-1"
                                >
                                    <span className="text-slate-400">{index + 1}.</span>
                                    {section.title}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-12">
                        {sections.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-32">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                                </div>

                                <div className="space-y-4 text-slate-600 leading-relaxed">
                                    {section.content.map((paragraph, idx) => (
                                        <p key={idx}>{paragraph}</p>
                                    ))}

                                    {section.list && (
                                        <ul className="list-disc list-inside space-y-2 pl-4">
                                            {section.list.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.additional && section.additional.map((text, idx) => (
                                        <p key={idx} className="mt-4">{text}</p>
                                    ))}

                                    {section.subSections && section.subSections.map((sub, idx) => (
                                        <div key={idx} className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
                                            <h3 className="font-semibold text-slate-900 mb-3">{sub.title}</h3>
                                            {'content' in sub && sub.content && <p className="text-slate-600">{sub.content}</p>}
                                            {'items' in sub && sub.items && (
                                                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                                                    {sub.items.map((item: string, i: number) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}

                                    {section.contactInfo && (
                                        <div className="mt-6 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                                            <p className="mb-2">
                                                <strong>Email:</strong>{' '}
                                                <a href={`mailto:${section.contactInfo.email}`} className="text-indigo-600 hover:underline">
                                                    {section.contactInfo.email}
                                                </a>
                                            </p>
                                            <p>
                                                <strong>Support:</strong>{' '}
                                                <a href={section.contactInfo.website} className="text-indigo-600 hover:underline">
                                                    {section.contactInfo.website}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Contact Box */}
                    <div className="mt-16 bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Questions About Privacy?</h3>
                        <p className="text-indigo-200 mb-6">If you have any questions about how we handle your data, our support team is here to help.</p>
                        <Link href="/support" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8 z-10 relative" role="contentinfo">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-4 group">
                                <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-600 transition-colors">
                                    J
                                </div>
                                <span className="font-bold text-xl text-slate-900">JustAnotherPanel</span>
                            </Link>
                            <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
                                The #1 SMM Panel in the World. Engineered for speed, designed for leaders who want to maximize their social media presence.
                            </p>
                        </div>

                        <nav aria-label="Footer Platform Links">
                            <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Platform</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><Link href="/services" className="hover:text-blue-600 transition-colors">Services</Link></li>
                                <li><Link href="/api" className="hover:text-blue-600 transition-colors">API Documentation</Link></li>
                                <li><Link href="/auth/register" className="hover:text-blue-600 transition-colors">Sign Up</Link></li>
                                <li><Link href="/auth/login" className="hover:text-blue-600 transition-colors">Login</Link></li>
                            </ul>
                        </nav>

                        <nav aria-label="Footer Company Links">
                            <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Company</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link></li>
                            </ul>
                        </nav>
                    </div>

                    <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                        <div>&copy; {new Date().getFullYear()} JustAnotherPanel. All rights reserved.</div>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span>English (US)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPage;
