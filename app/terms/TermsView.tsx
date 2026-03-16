'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Shield, 
    CreditCard, 
    Lock, 
    FileText, 
    Cookie, 
    RefreshCw,
    Scale,
    AlertCircle,
    ChevronRight,
    ArrowRight,
    Search
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

const TermsView = ({ settings }: { settings: any }) => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const siteName = settings?.site_name || "JustAnotherPanel";

    const sections = [
        {
            id: 'delivery',
            icon: <FileText className="w-5 h-5" />,
            title: 'Delivery Policy',
            color: 'indigo',
            content: [
                'By ordering our services, you expressly agree to the following terms. Ignorance of these terms will not be considered a valid reason for non-compliance.',
                'The authority reserves the right to modify these terms without prior notice. Continuous monitoring of this page is recommended.',
                `Services provided by ${siteName} must be used in a manner that complies with all relevant social media platform terms of service.`,
                'Service rates are dynamic and may change based on market conditions without immediate update to this documentation.',
                'Delivery durations are estimates. While we strive for instant execution, technical delays may occur. Refunds are processed for orders exceeding estimated durations significantly.',
                'We reserve the right to evolve our service types to meet shifting market demands and platform algorithm changes.',
            ]
        },
        {
            id: 'violations',
            icon: <Shield className="w-5 h-5" />,
            title: 'Terms Violations',
            color: 'rose',
            content: [
                'Our enforcement decisions regarding code of conduct violations are final and non-negotiable. Violations may result in:',
            ],
            list: [
                'Immediate cessation of all active services',
                'Permanent account suspension without obligation for explanation',
                'Refund of remaining wallet balance to the original payment source (subject to processing fees)',
            ],
            additional: [
                `${siteName} is not liable for any professional losses or business interruptions resulting from account actions.`,
                'Platform-side content removal or account suspensions by social media networks are beyond our control and liability.',
            ]
        },
        {
            id: 'service',
            icon: <Scale className="w-5 h-5" />,
            title: 'Service Policy',
            color: 'violet',
            content: [
                `${siteName} provides promotional services designed to enhance social media appearance. We do not represent the platforms themselves.`,
                'Interaction from delivered followers/likes is not guaranteed. We guarantee the quantity as per the specific service description.',
                'Account profiles used for delivery aim for realism but may not always contain complete bios or distinct posting history.',
                'Strictly no prohibited or adult material. Content must meet the community standards of the respective social media platforms.',
                'Services cannot be used as a "refill strategy" for losses from other providers. We only replace engagement lost from our own delivery systems.',
            ]
        },
        {
            id: 'payment',
            icon: <CreditCard className="w-5 h-5" />,
            title: 'Refund Policy',
            color: 'emerald',
            content: [
                'Deposit of funds is required prior to order execution. We support major gateways including VISA, MasterCard, Crypto, and various electronic wallets.',
                'Credits are usually deposited within minutes of successful transaction confirmation.',
                'Refund requests must be directed to our support team. Approved refunds are returned to the original payment gateway used for the deposit.',
                'Refund amounts will exclude any bonuses or promotional credits applied during the initial deposit phase.',
                'Crypto and certain electronic wallet deposits are non-refundable to the original source; they remain as site credit.',
                'Filing a dispute or chargeback without prior support consultation will result in immediate account termination and potential reversal of delivered services.',
                'We are not responsible for delivery failures caused by private profiles, broken URLs, or username changes post-order.',
            ]
        },
        {
            id: 'privacy',
            icon: <Lock className="w-5 h-5" />,
            title: 'Privacy & Data',
            color: 'amber',
            content: [
                'Maintaining your privacy is fundamental to our business model. We employ strict data handling protocols.',
                'Utilization of our services implies consent to our data collection practices outlined herein.',
            ],
            subTitle: 'Critical Data Points We Handle:',
            listItems: [
                'Registered Email Address',
                'Technical IP Logs',
                'Payment Transaction References',
                'Target Social Media Linkage',
                'Cookie Metadata for Session Security',
            ]
        },
        {
            id: 'security',
            icon: <Shield className="w-5 h-5" />,
            title: 'Security Protocols',
            color: 'blue',
            content: [
                'We do not sell user contact information to third-party marketing agencies.',
                'All payment processing is handled through SSL-encrypted tunnels. We do not store full credit card details on our local servers.',
            ]
        }
    ];

    const filteredSections = sections.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
            
            {/* Premium Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-violet-100/20 rounded-full blur-[100px]"></div>
            </div>

            <Navbar settings={settings} />

            <main className="relative z-10">
                {/* Hero Header */}
                <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 px-4 bg-white/40 backdrop-blur-sm border-b border-slate-200/50">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-8 shadow-xl shadow-slate-200">
                            <Scale className="w-3.5 h-3.5 text-indigo-400" />
                            Rules of Engagement
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950 mb-8 leading-tight">
                            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Service.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                            Transparency is our core value. Please review our operating protocols to ensure a smooth growth experience.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <Search size={18} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search policies (e.g. refund, delivery)..."
                                className="w-full h-16 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="px-4 py-24">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-16">
                            
                            {/* Navigation Sidebar */}
                            <aside className="lg:col-span-4 hidden lg:block sticky top-32 h-fit">
                                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Quick Navigation</h3>
                                    <nav className="space-y-2">
                                        {sections.map((section) => (
                                            <a 
                                                key={section.id} 
                                                href={`#${section.id}`}
                                                className="flex items-center justify-between p-4 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg bg-${section.color}-50 flex items-center justify-center text-${section.color}-600`}>
                                                        {section.icon}
                                                    </div>
                                                    {section.title}
                                                </div>
                                                <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        ))}
                                    </nav>

                                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                                        <p className="text-xs font-bold text-slate-400 mb-4 uppercase">Need Clarity?</p>
                                        <Link href="/contact-us" className="w-full h-12 bg-slate-950 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors">
                                            Talk to Support
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </aside>

                            {/* Content Grid */}
                            <div className="lg:col-span-8 space-y-16">
                                {filteredSections.length > 0 ? filteredSections.map((section) => (
                                    <article key={section.id} id={section.id} className="scroll-mt-32 group">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className={`w-12 h-12 rounded-2xl bg-${section.color}-50 text-${section.color}-600 flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                                                {React.cloneElement(section.icon as React.ReactElement<any>, { size: 24 })}
                                            </div>
                                            <h2 className="text-3xl font-black text-slate-950">{section.title}</h2>
                                        </div>

                                        <div className="bg-white border border-slate-200/60 rounded-[3rem] p-8 lg:p-12 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all duration-500">
                                            <div className="space-y-6">
                                                {section.content.map((p, i) => (
                                                    <p key={i} className="text-lg text-slate-600 font-medium leading-[1.8]">{p}</p>
                                                ))}

                                                {section.list && (
                                                    <div className="mt-8 space-y-4">
                                                        {section.list.map((item, i) => (
                                                            <div key={i} className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                                                <span className="font-bold text-slate-700">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {section.subTitle && (
                                                    <div className="mt-12">
                                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{section.subTitle}</h4>
                                                        <div className="grid sm:grid-cols-2 gap-3">
                                                            {section.listItems?.map((item, i) => (
                                                                <div key={i} className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                                    <span className="font-bold text-slate-600">{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {section.additional && (
                                                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 font-bold text-slate-400 italic text-sm">
                                                        {section.additional.map((text, i) => (
                                                            <p key={i}>{text}</p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                )) : (
                                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                        <p className="font-bold text-slate-400 italic">No policies matches your search query...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom Trust Section */}
                <section className="pb-32 px-4">
                    <div className="max-w-4xl mx-auto bg-indigo-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#ffffff1a,transparent_40%)]"></div>
                        <h3 className="text-3xl font-black mb-6 relative z-10">Last Revised: Jan 2026</h3>
                        <p className="text-indigo-100 font-medium text-lg mb-8 relative z-10">Your continued use of our platform constitutes agreement to the evolved rules listed above.</p>
                        <Link href="/" className="inline-flex h-14 px-10 bg-white text-slate-900 rounded-2xl font-black text-base items-center justify-center hover:scale-105 active:scale-95 transition-all relative z-10 shadow-xl">
                            Accept & Go Home
                        </Link>
                    </div>
                </section>
            </main>

            <Footer settings={settings} />
        </div>
    );
};

export default TermsView;
