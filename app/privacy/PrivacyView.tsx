'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Shield, 
    Eye, 
    Database, 
    Cookie, 
    Lock, 
    Users, 
    Mail,
    Search,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Info,
    FileText
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

const PrivacyView = ({ settings }: { settings: any }) => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const siteName = settings?.site_name || "JustAnotherPanel";

    const sections = [
        {
            id: 'introduction',
            icon: <Shield className="w-5 h-5" />,
            title: 'Introduction',
            color: 'indigo',
            content: [
                `At ${siteName}, we take your digital sovereignty seriously. This Privacy Policy documents our rigorous standards for collecting, using, and safeguarding your personal data.`,
                'By accessing our platform, you acknowledge and agree to the protocols defined herein. If you disagree with any segment of this policy, immediate cessation of site access is required.',
            ]
        },
        {
            id: 'collection',
            icon: <Database className="w-5 h-5" />,
            title: 'Information We Collect',
            color: 'emerald',
            content: [
                'We operate on a principle of minimal data collection, gathering only what is essential for service excellence.',
            ],
            subSections: [
                {
                    title: 'Identity Data',
                    items: ['Full Name', 'Account Username', 'Email Address', 'Telegram/Skype ID']
                },
                {
                    title: 'System Metadata',
                    items: ['IP Address logs', 'Browser fingerprinting', 'Operating system details', 'Access timestamps']
                },
                {
                    title: 'Financial Metadata',
                    items: ['Transaction IDs', 'Payment Method reference', 'Account balance history']
                }
            ]
        },
        {
            id: 'usage',
            icon: <Eye className="w-5 h-5" />,
            title: 'Strategic Data Usage',
            color: 'violet',
            content: [
                'Your data is utilized exclusively to power your growth and maintain platform integrity.',
            ],
            list: [
                'Lifecycle management of your user account',
                'Precision delivery of purchased SMM services',
                'Real-time order tracking and status updates',
                'Fraud prevention and security monitoring',
                'Algorithmic optimization of service quality',
            ]
        },
        {
            id: 'disclosure',
            icon: <Users className="w-5 h-5" />,
            title: 'Information Disclosure',
            color: 'amber',
            content: [
                'We do not sell your personal data to third-party marketing firms. Disclosure occurs only under specific operational or legal necessity.',
            ],
            subSections: [
                {
                    title: 'Operational Necessity',
                    items: ['Secure payment processors', 'API infrastructure providers', 'Official support channels']
                },
                {
                    title: 'Legal Compliance',
                    items: ['Official court orders', 'Anti-fraud investigations', 'Public safety requirements']
                }
            ]
        },
        {
            id: 'cookies',
            icon: <Cookie className="w-5 h-5" />,
            title: 'Tracking & Cookies',
            color: 'rose',
            content: [
                'We use non-invasive tracking technologies to remember your preferences and secure your login sessions.',
            ],
            list: [
                'Session Persistence: Keeping you logged in securely.',
                'Preference Storage: Remembering your theme and filter settings.',
                'Analytics: Anonymized data used to improve platform speed.',
            ]
        },
        {
            id: 'security',
            icon: <Lock className="w-5 h-5" />,
            title: 'Fortified Security',
            color: 'blue',
            content: [
                'We employ enterprise-grade administrative and technical measures to shield your data.',
                'All internal communications and payment data transfers are protected via 256-bit SSL encryption.',
                'We undergo regular security audits to identify and patch potential vulnerabilities.',
            ]
        }
    ];

    const filteredSections = sections.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
            
            {/* Ambient Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-emerald-100/20 rounded-full blur-[100px]"></div>
            </div>

            <Navbar settings={settings} />

            <main className="relative z-10">
                {/* Hero Header */}
                <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 px-4 bg-white/40 backdrop-blur-sm border-b border-slate-200/50">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-8 shadow-xl shadow-slate-200">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            Privacy Protocol
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950 mb-8 leading-tight">
                            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Policy.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                            Your data integrity is our mandate. Discover how we protect your information in the digital landscape.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                <Search size={18} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search privacy terms..."
                                className="w-full h-16 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="px-4 py-24">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-16">
                            
                            {/* Desktop Sidebar */}
                            <aside className="lg:col-span-4 hidden lg:block sticky top-32 h-fit">
                                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Explore Policies</h3>
                                    <nav className="space-y-2">
                                        {sections.map((section) => (
                                            <a 
                                                key={section.id} 
                                                href={`#${section.id}`}
                                                className="flex items-center justify-between p-4 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:text-emerald-600 transition-all border border-transparent hover:border-slate-100 group"
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
                                        <p className="text-xs font-bold text-slate-400 mb-4 uppercase">Data Request?</p>
                                        <Link href="/contact-us" className="w-full h-12 bg-slate-950 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
                                            Contact DPO
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </aside>

                            {/* Content Body */}
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
                                                    <div className="space-y-3 mt-8">
                                                        {section.list.map((item, i) => (
                                                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                                <span className="font-bold text-slate-700">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {section.subSections && (
                                                    <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6 mt-12">
                                                        {section.subSections.map((sub, i) => (
                                                            <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white transition-colors">
                                                                <div className="flex items-center gap-3 mb-6">
                                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800">
                                                                        <Info size={20} />
                                                                    </div>
                                                                    <h4 className="font-black text-slate-900 tracking-tight">{sub.title}</h4>
                                                                </div>
                                                                <ul className="space-y-3">
                                                                    {sub.items?.map((item, j) => (
                                                                        <li key={j} className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                            {item}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                )) : (
                                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                        <p className="font-bold text-slate-400 italic">No privacy terms match your search query...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Secure Banner */}
                <section className="pb-32 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-slate-950 rounded-[3.5rem] p-12 lg:p-20 text-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#4f46e51a,transparent_40%)]"></div>
                             <h3 className="text-white text-3xl font-black mb-6 relative z-10">Safe & Compliant</h3>
                             <p className="text-slate-400 font-medium text-lg mb-10 max-w-xl mx-auto relative z-10">We update our protocols regularly to match global data protection standards (GDPR, CCPA).</p>
                             <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                                <Link href="/contact-us" className="h-14 px-10 bg-indigo-600 text-white rounded-2xl font-black text-base flex items-center justify-center hover:bg-indigo-700 transition-all">
                                    Privacy Inquiry
                                </Link>
                                <button onClick={() => window.print()} className="h-14 px-10 bg-white/10 text-white rounded-2xl font-black text-base border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                    <FileText size={18} />
                                    Save as PDF
                                </button>
                             </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer settings={settings} />
        </div>
    );
};

export default PrivacyView;
