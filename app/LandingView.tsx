'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  LayoutDashboard,
  Headphones,
  TrendingUp,
  Menu,
  X,
  CheckCircle,
  Globe,
  ArrowRight,
  ShieldCheck,
  MousePointer2,
  Facebook,
  Instagram
} from 'lucide-react';

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

const App = ({ settings }: { settings: any }) => {
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
    // Check if user is logged in by calling the auth check API
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

  const features = [
    {
      title: "Unbelievable Prices",
      description: "Lowest prices in the market. We optimize costs to give you the best ROI for your social media campaigns.",
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Friendly Dashboard",
      description: "Engineered Dashboard to accommodate fast and simple use of the panel for professionals.",
      icon: <LayoutDashboard className="w-5 h-5 text-indigo-600" />,
    },
    {
      title: "Delivered in Minutes",
      description: "Super fast delivery. Watch your social media numbers grow in real-time.",
      icon: <Zap className="w-5 h-5 text-amber-600" />,
    },
    {
      title: "Support 24/7",
      description: "Support available around the clock. Expert assistance whenever you need it.",
      icon: <Headphones className="w-5 h-5 text-emerald-600" />,
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white relative overflow-x-hidden">

      {/* Grid Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* Semantic Header for Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group" aria-label="JustAnotherPanel Home">
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-600 transition-colors">
                {siteName.charAt(0)}
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">{siteName}</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
              <a href="#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Services</a>
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Why Us</a>
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
            <a href="#services" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Services</a>
            <a href="#features" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#about" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Why Us</a>
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

      {/* Main Content Wrapper */}
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 z-10" aria-label="Introduction">
          <div className="max-w-7xl mx-auto text-center relative">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-8 hover:bg-blue-100 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              #1 SMM Panel in the World
            </div>

            {/* H1 Optimized for SEO: Includes "We Lead, They Follow" but structure emphasizes branding */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8">
              We Lead,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">They Follow.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Revolutionize your <strong>social media growth</strong> with the definitive <strong>SMM Panel</strong>. Engineered for industry leaders who demand speed, quality, and results.
            </p>

            {/* Buttons changed to Anchors for crawlability */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              {isLoggedIn ? (
                <a href="/user" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                  <LayoutDashboard className="w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <>
                  <a href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                    Start Growing Now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="#services" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold text-base hover:bg-slate-50 transition-all hover:border-slate-300 flex items-center justify-center">
                    View Services
                  </a>
                </>
              )}
            </div>

            {/* Hero Image / Dashboard Mockup */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white/50 p-2 backdrop-blur-sm shadow-2xl" role="img" aria-label="SMM Panel Dashboard Interface Preview">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20"></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden aspect-[16/9] relative">
                {/* Mock UI */}
                <div className="absolute inset-0 flex">
                  {/* Sidebar */}
                  <div className="w-16 md:w-64 border-r border-slate-200 bg-white p-4 hidden md:block">
                    <div className="h-8 w-24 bg-slate-100 rounded mb-8"></div>
                    <div className="space-y-3">
                      <div className="h-8 w-full bg-blue-50 text-blue-600 rounded flex items-center px-2 text-sm font-medium">Dashboard</div>
                      <div className="h-8 w-full hover:bg-slate-50 rounded flex items-center px-2 text-sm text-slate-500">Orders</div>
                      <div className="h-8 w-full hover:bg-slate-50 rounded flex items-center px-2 text-sm text-slate-500">Services</div>
                      <div className="h-8 w-full hover:bg-slate-50 rounded flex items-center px-2 text-sm text-slate-500">Funds</div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-6 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-8">
                      <div className="h-8 w-32 bg-white border border-slate-200 rounded shadow-sm"></div>
                      <div className="h-8 w-8 bg-white border border-slate-200 rounded-full shadow-sm"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="h-24 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="h-4 w-4 bg-green-100 rounded-full mb-2"></div>
                        <div className="h-4 w-12 bg-slate-100 rounded mb-1"></div>
                        <div className="h-6 w-20 bg-slate-200 rounded"></div>
                      </div>
                      <div className="h-24 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="h-4 w-4 bg-blue-100 rounded-full mb-2"></div>
                        <div className="h-4 w-12 bg-slate-100 rounded mb-1"></div>
                        <div className="h-6 w-20 bg-slate-200 rounded"></div>
                      </div>
                      <div className="h-24 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="h-4 w-4 bg-purple-100 rounded-full mb-2"></div>
                        <div className="h-4 w-12 bg-slate-100 rounded mb-1"></div>
                        <div className="h-6 w-20 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-48 bg-white rounded-xl border border-slate-200 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Tape */}
        <div className="w-full bg-slate-900 text-white py-4 overflow-hidden transform -skew-y-1" aria-hidden="true">
          <div className="flex whitespace-nowrap animate-marquee gap-8 items-center justify-center">
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><Zap className="w-4 h-4 text-yellow-400" /> Instant Delivery</span>
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><ShieldCheck className="w-4 h-4 text-green-400" /> Secure Payments</span>
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><Headphones className="w-4 h-4 text-blue-400" /> 24/7 Support</span>
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><Zap className="w-4 h-4 text-yellow-400" /> Instant Delivery</span>
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><ShieldCheck className="w-4 h-4 text-green-400" /> Secure Payments</span>
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><Headphones className="w-4 h-4 text-blue-400" /> 24/7 Support</span>
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><Zap className="w-4 h-4 text-yellow-400" /> Instant Delivery</span>
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><ShieldCheck className="w-4 h-4 text-green-400" /> Secure Payments</span>
            <span className="flex items-center gap-2 mx-4 text-sm font-bold uppercase tracking-wider"><Headphones className="w-4 h-4 text-blue-400" /> 24/7 Support</span>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="py-24 relative z-10" aria-label="Key Features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Leaders Choose JAP</h2>
              <p className="text-slate-600 max-w-xl">
                Engineered for speed, built for scale. Experience the most advanced SMM panel in the market.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 group">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Big Feature Section - Optimized Content for SEO Keywords */}
        <section id="about" className="py-24 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
          {/* Subtle pattern for this section specifically */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#444cf7_1px,transparent_1px)] [background-size:16px_16px]" aria-hidden="true"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <article>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                  The Online World is Run by <span className="text-blue-600 underline decoration-4 decoration-blue-200 underline-offset-4">Industry Leaders</span>
                </h2>
                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                  Leaders know exactly what their customers want, and what to offer them in return. Here, we provide the best and most affordable <strong>SMM panel services</strong> to those leaders just like you.
                </p>

                <ul className="space-y-4">
                  {[
                    "Targeted Audience Reach",
                    "Maximum Engagement & Visibility",
                    "Optimized for Conversions",
                    "Real-time Analytics"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-[2rem] opacity-50 blur-2xl -z-10" aria-hidden="true"></div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-blue-600 rounded-lg p-3 text-white">
                      <MousePointer2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">One Click Growth</h3>
                      <p className="text-slate-500 text-sm">Select service, enter link, and launch.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-700 group-hover:text-blue-600">Instagram Followers</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Best Seller</span>
                      </div>
                      <p className="text-xs text-slate-500">Starting at $0.001 / 1k</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-700 group-hover:text-blue-600">TikTok Views</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Instant</span>
                      </div>
                      <p className="text-xs text-slate-500">Starting at $0.0001 / 1k</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-700 group-hover:text-blue-600">YouTube Subscribers</span>
                      </div>
                      <p className="text-xs text-slate-500">Starting at $1.50 / 1k</p>
                    </div>
                  </div>
                  <a href="/services" className="w-full mt-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center">
                    View All Services
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative z-10" aria-label="Call to Action">
          <div className="max-w-5xl mx-auto text-center">
            <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
              {/* Grid pattern overlay on dark bg */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" aria-hidden="true"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                  Ready to dominate the market?
                </h2>
                <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                  Join thousands of influencers and businesses who trust JustAnotherPanel for their social media growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg transform hover:-translate-y-1 inline-block">
                    Create Free Account
                  </Link>
                  <Link href="/contact" className="px-8 py-4 bg-transparent border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-all inline-block">
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 z-10 relative" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-600 transition-colors">
                  {siteName.charAt(0)}
                </div>
                <span className="font-bold text-xl text-slate-900">{siteName}</span>
              </Link>
              <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
                The #1 SMM Panel in the World. Engineered for speed, designed for leaders who want to maximize their social media presence.
              </p>
            </div>

            <nav aria-label="Footer Platform Links">
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="/services" className="hover:text-blue-600 transition-colors">Services</a></li>
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
    </div>
  );
};

export default App;
