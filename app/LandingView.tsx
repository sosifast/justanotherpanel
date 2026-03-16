'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  LayoutDashboard,
  Headphones,
  TrendingUp,
  X,
  CheckCircle,
  Globe,
  ArrowRight,
  ShieldCheck,
  MousePointer2,
  Instagram,
  Youtube,
  Twitter,
  ChevronRight,
  Target,
  Rocket,
  Plus
} from 'lucide-react';
import Navbar from '@/app/layouts/menu-navbar/Navbar';
import Footer from '@/app/layouts/footer/Footer';

const App = ({ settings }: { settings: any }) => {
  const siteName = settings?.site_name || "JustAnotherPanel";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const features = [
    {
      title: "Lowest Market Prices",
      description: "We optimize our direct-to-provider routing to ensure you get the most competitive rates globally.",
      icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
      color: "indigo"
    },
    {
      title: "Advanced Dashboard",
      description: "A professional-grade interface designed for speed, mass orders, and granular tracking.",
      icon: <LayoutDashboard className="w-6 h-6 text-violet-500" />,
      color: "violet"
    },
    {
      title: "Real-Time Delivery",
      description: "Our systems trigger instantly. Watch your social proof skyrocket the second you click order.",
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      color: "amber"
    },
    {
      title: "Elite Support 24/7",
      description: "Our dedicated agents are experts in social media growth, ready to assist you any time.",
      icon: <Headphones className="w-6 h-6 text-emerald-500" />,
      color: "emerald"
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Decorative Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-violet-200/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[5%] w-[25%] h-[25%] bg-blue-100/40 rounded-full blur-[90px]"></div>
      </div>

      <Navbar settings={settings} />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center lg:text-left grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="relative">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8 hover:bg-indigo-50 transition-colors cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                </span>
                World's #1 Social Growth Engine
              </div>

              <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.95]">
                We Lead,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
                  They Follow.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 max-w-xl mb-12 leading-relaxed">
                Scale your digital presence with precision. Our enterprise-grade SMM infrastructure delivers <strong>real engagement</strong> at <strong>unbeatable speeds</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12">
                {isLoggedIn ? (
                  <Link href="/user" className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group shadow-sm">
                    <LayoutDashboard className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all flex items-center justify-center gap-2.5 group">
                      Get Started Now
                      <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                    <Link href="/services" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-base hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm">
                      View Services
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2 font-bold text-slate-500 uppercase tracking-tighter italic">
                  <ShieldCheck size={20} className="text-emerald-500" /> Secure
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-500 uppercase tracking-tighter italic">
                  <Rocket size={20} className="text-indigo-500" /> Instant
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-500 uppercase tracking-tighter italic">
                  <Target size={20} className="text-rose-500" /> Targeted
                </div>
              </div>
            </div>

            {/* Dashboard Floating Mockup */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full scale-150"></div>
              <div className="relative w-full max-w-[540px] aspect-[4/5] sm:aspect-square bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-float">
                {/* Mock UI Content */}
                <div className="p-8 h-full bg-slate-50/50 flex flex-col">
                   <div className="flex items-center justify-between mb-8">
                     <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                       <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                     </div>
                     <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100">
                       <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3">
                         <TrendingUp size={16} />
                       </div>
                       <div className="h-3 w-12 bg-slate-100 rounded-full mb-2"></div>
                       <div className="h-6 w-20 bg-indigo-600 rounded-full"></div>
                     </div>
                     <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100">
                       <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                         <Target size={16} />
                       </div>
                       <div className="h-3 w-12 bg-slate-100 rounded-full mb-2"></div>
                       <div className="h-6 w-20 bg-emerald-500 rounded-full"></div>
                     </div>
                   </div>

                   <div className="bg-white flex-1 rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden">
                     <div className="flex justify-between items-center mb-6">
                       <div className="h-4 w-24 bg-slate-200 rounded-full"></div>
                       <div className="h-8 w-24 bg-slate-900 rounded-xl"></div>
                     </div>
                     <div className="space-y-4">
                       {[0, 1, 2, 3].map(i => (
                         <div key={i} className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                           <div className="flex-1 space-y-2">
                             <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                             <div className="h-2 w-2/3 bg-slate-50 rounded-full"></div>
                           </div>
                           <div className="h-3 w-8 bg-slate-100 rounded-full"></div>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              </div>
              
              {/* Decorative Floaties */}
              <div className="absolute top-[20%] -right-12 p-6 bg-white border border-slate-200 rounded-2xl shadow-xl animate-float [animation-delay:1s] hidden lg:block">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                      <Instagram size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Growth</div>
                      <div className="text-lg font-black text-slate-900">+12,450</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee Ticker */}
        <div className="py-12 bg-slate-900 overflow-hidden -rotate-1 translate-y-4">
           <div className="flex whitespace-nowrap animate-marquee gap-10">
              {[
                "Instagram Growth", "TikTok Mastery", "YouTube Authority", "X - Impressions Boost", 
                "Twitch Live Viewers", "Spotify Streams", "LinkedIn Network", "Facebook Engagement",
                "Threads Followers", "Telegram Members", "Snapchat Real Views"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 text-white/90 text-xl font-black uppercase tracking-tighter">
                   <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                   {text}
                </div>
              ))}
           </div>
        </div>

        {/* Services Section */}
        <section id="services" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest mb-4">
                  <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
                  Trending Solutions
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                  Engineered for <span className="text-indigo-600">Impact.</span>
                </h2>
                <p className="text-lg text-slate-600">
                  Select from over 2,000+ premium services optimized for maximum algorithmic performance.
                </p>
              </div>
              <Link href="/services" className="flex items-center gap-2 font-bold text-indigo-600 hover:gap-4 transition-all pb-2 border-b-2 border-indigo-100">
                Browse All Services <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Instagram', icon: <Instagram />, color: 'from-pink-500 to-rose-500', bg: 'bg-rose-50' },
                { name: 'TikTok', icon: <Plus />, color: 'from-slate-800 to-slate-950', bg: 'bg-slate-50' },
                { name: 'YouTube', icon: <Youtube />, color: 'from-red-600 to-orange-600', bg: 'bg-orange-50' },
                { name: 'X / Twitter', icon: <Twitter />, color: 'from-sky-500 to-blue-600', bg: 'bg-blue-50' },
                { name: 'Facebook', icon: <Plus />, color: 'from-blue-600 to-indigo-700', bg: 'bg-indigo-50' },
                { name: 'Other Platforms', icon: <Globe />, color: 'from-violet-600 to-purple-600', bg: 'bg-violet-50' },
              ].map((platform, idx) => (
                <div key={idx} className={`group relative p-8 rounded-3xl border border-slate-200 ${platform.bg} hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 overflow-hidden`}>
                   <div className="relative z-10">
                     <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                        {platform.icon}
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 mb-3">{platform.name}</h3>
                     <p className="text-slate-500 mb-8 font-medium">Global authority boost with high-retention real engagement.</p>
                     
                     <Link href="/services" className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        View Rates <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </Link>
                   </div>
                   <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-white relative overflow-hidden border-y border-slate-100">
           <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-20">
                 <h2 className="text-3xl font-black mb-4">Why Industry Leaders Choose {siteName}</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto">Experience the most stable and feature-rich SMM infrastructure in the ecosystem.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {features.map((feature, i) => (
                   <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl hover:bg-slate-50 transition-colors group">
                      <div className={`w-16 h-16 rounded-[2rem] bg-${feature.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all`}>
                         {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="bg-slate-900 rounded-[3.5rem] p-12 lg:p-24 relative overflow-hidden text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
               {/* Pattern */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#4f46e51a,transparent_40%)]" aria-hidden="true"></div>
               
               <div className="relative z-10 max-w-xl">
                 <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                    Ready to scale your <span className="text-indigo-400 italic">influence?</span>
                 </h2>
                 <p className="text-slate-400 text-lg md:text-xl mb-0">
                    Join over 250,000+ creators and brands who dominate social media using {siteName}.
                 </p>
               </div>

                <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-end">
                  <Link href="/auth/register" className="w-full sm:w-48 h-14 flex items-center justify-center bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/20">
                    Join Now
                  </Link>
                  <Link href="/contact" className="w-full sm:w-48 h-14 flex items-center justify-center bg-transparent border-2 border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-white/5 hover:border-white transition-all hover:scale-[1.02] active:scale-95">
                    Contact Now
                  </Link>
                </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
      
      {/* Dynamic Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
