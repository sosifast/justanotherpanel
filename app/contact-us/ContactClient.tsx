'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Phone, 
    Mail, 
    MessageCircle, 
    Clock, 
    ChevronRight, 
    Send, 
    ArrowRight,
    HelpCircle,
    ShieldCheck,
    Globe,
    Headphones,
    CheckCircle2,
    Sparkles,
    Activity
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

const TelegramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
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

interface ContactClientProps {
    settings: any;
    siteName: string;
}

export default function ContactClient({ settings, siteName }: ContactClientProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const contactMethods = [
        {
            title: "WhatsApp",
            description: "Direct chat with our human agents for instant support.",
            value: "+62 882-9333-4443",
            icon: <MessageCircle className="w-6 h-6" />,
            color: "emerald",
            href: "https://wa.me/6288293334443",
            action: "Chat Now"
        },
        {
            title: "Telegram",
            description: "Join our community and get help from the team.",
            value: settings?.telegram ? (settings.telegram.includes('t.me/') ? `@${settings.telegram.split('t.me/')[1]}` : (settings.telegram.startsWith('@') ? settings.telegram : `@${settings.telegram}`)) : "@JustAnotherPanel",
            icon: <TelegramIcon />,
            color: "blue",
            href: settings?.telegram || "#",
            action: "Join Channel"
        },
        {
            title: "Email Support",
            description: "For partnership, business, or detailed inquiries.",
            value: "info@apkey.net",
            icon: <Mail className="w-6 h-6" />,
            color: "indigo",
            href: "mailto:info@apkey.net",
            action: "Send Email"
        }
    ];

    const faqs = [
        {
            q: "How fast is the delivery?",
            a: "Most services take 5-15 minutes to start. Complete delivery depends on quantity, but we specialized in instant execution."
        },
        {
            q: "Are the services safe?",
            a: "Absolutely. We use high-quality, organic-looking profiles and safe delivery speeds to ensure your account security is never compromised."
        },
        {
            q: "What payment methods are supported?",
            a: "We accept PayPal, Cryptomus (Crypto), and Bank Transfers. All transactions are encrypted and processed through secure gateways."
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
            
            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-violet-100/20 rounded-full blur-[100px]"></div>
            </div>

            <Navbar settings={settings} />

            <main className="relative z-10">
                {/* Hero Header */}
                <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8">
                            <Headphones className="w-3.5 h-3.5" />
                            Reliable Support 24/7
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-tight">
                            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Connect.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                            Questions? Issues? Feedback? Our specialist team is standing by to help you scale your social authority.
                        </p>
                    </div>
                </section>

                <section className="px-4 pb-32">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                            
                            {/* Contact Grid */}
                            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
                                {contactMethods.map((method, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`group relative p-8 rounded-[2.5rem] bg-white border border-slate-200/60 hover:border-${method.color}-400/50 hover:shadow-2xl hover:shadow-${method.color}-500/5 transition-all duration-500 overflow-hidden ${idx === 0 ? 'sm:col-span-2' : ''}`}
                                    >
                                        <div className="relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl bg-${method.color}-50 text-${method.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform animate-float`}>
                                                {method.icon}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">{method.title}</h3>
                                            <p className="text-slate-500 font-medium mb-6">{method.description}</p>
                                            
                                            <div className="flex flex-col gap-4">
                                                <div className="text-lg font-black text-slate-900">{method.value}</div>
                                                <Link 
                                                    href={method.href}
                                                    target={method.href.startsWith('http') ? "_blank" : "_self"}
                                                    className={`w-fit h-12 px-6 bg-slate-950 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all active:scale-95`}
                                                >
                                                    {method.action}
                                                    <ChevronRight size={18} />
                                                </Link>
                                            </div>
                                        </div>
                                        
                                        {/* Subtle background icon */}
                                        <div className={`absolute -bottom-10 -right-10 text-${method.color}-50/50 opacity-10 group-hover:scale-150 transition-transform duration-1000`}>
                                            {React.cloneElement(method.icon as React.ReactElement<any>, { size: 160 })}
                                        </div>
                                    </div>
                                ))}

                                {/* Trust Banner */}
                                <div className="sm:col-span-2 bg-indigo-600 rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#ffffff1a,transparent_40%)]"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                                            <Clock className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black mb-2">Fastest Response Guaranteed</h4>
                                            <p className="text-indigo-100 font-medium">Average reply time: <span className="font-black text-white px-2 py-0.5 bg-white/10 rounded-lg">8 Minutes</span> on WhatsApp.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ & Support Box */}
                            <div className="lg:col-span-5 space-y-8">
                                <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <HelpCircle size={100} />
                                    </div>
                                    
                                    <h2 className="text-3xl font-black mb-8 relative z-10">Quick <span className="text-indigo-400">FAQ</span></h2>
                                    
                                    <div className="space-y-8 relative z-10">
                                        {faqs.map((faq, i) => (
                                            <div key={i} className="group/faq cursor-pointer">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full group-hover/faq:scale-y-125 transition-transform"></div>
                                                    <h4 className="font-bold text-lg text-slate-100">{faq.q}</h4>
                                                </div>
                                                <p className="text-slate-400 font-medium pl-4.5">{faq.a}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-12 pt-12 border-t border-slate-800 flex flex-col items-center text-center">
                                        <div className="flex -space-x-3 mb-4">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-500 opacity-60"></div>
                                                </div>
                                            ))}
                                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black">
                                                +25
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Expert Agents Online Now</p>
                                        <Link 
                                            href="/auth/register"
                                            className="w-full h-14 bg-white text-slate-950 rounded-2xl font-black text-base hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 group shadow-xl"
                                        >
                                            Create Free Account
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Support Features */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: <ShieldCheck size={18} />, text: "Secure Tech" },
                                        { icon: <Globe size={18} />, text: "Global Multi-Lang" },
                                        { icon: <Activity className="w-4 h-4" />, text: "API Tracking" },
                                        { icon: <Sparkles size={18} />, text: "Premium Quality" }
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl">
                                            <div className="text-indigo-600">{f.icon}</div>
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{f.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer settings={settings} />

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
