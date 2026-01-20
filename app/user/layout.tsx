'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, ChevronDown, Settings, Wallet, LogOut, ShoppingCart, CreditCard } from 'lucide-react';
import Image from 'next/image';

type UserLayoutProps = {
  children: React.ReactNode;
};

type UserProfile = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  profile_imagekit_url: string | null;
  balance: number | string;
};

const UserLayout = ({ children }: UserLayoutProps) => {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (response.ok) {
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Failed to load user profile');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => pathname === path;
  const isHistoryActive = pathname?.startsWith('/user/history');

  const linkClass = (path: string) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(path)
      ? 'text-blue-600 bg-blue-50'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/user" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-600 transition-colors">
                  J
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-900 hidden md:block">
                  JustAnotherPanel
                </span>
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                <Link href="/user" className={linkClass('/user')}>
                  Dashboard
                </Link>
                <Link href="/user/services" className={linkClass('/user/services')}>
                  Services
                </Link>

                {/* History Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    onBlur={() => setTimeout(() => setIsHistoryOpen(false), 150)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isHistoryActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    History
                    <ChevronDown className={`w-4 h-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isHistoryOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                      <Link
                        href="/user/history/order"
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${isActive('/user/history/order')
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                          }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Order History
                      </Link>
                      <Link
                        href="/user/history/deposits"
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${isActive('/user/history/deposits')
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                          }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        Deposit History
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/user/add-funds" className={linkClass('/user/add-funds')}>
                  Add Funds
                </Link>
                <Link href="/user/tickets" className={linkClass('/user/tickets')}>
                  Tickets
                </Link>
                <Link href="/user/api" className={linkClass('/user/api')}>
                  API
                </Link>
                <Link href="/user/voucher" className={linkClass('/user/voucher')}>
                  Voucher
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>

              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {userProfile?.profile_imagekit_url ? (
                    <Image
                      src={userProfile.profile_imagekit_url}
                      alt={userProfile.full_name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {userProfile ? getInitials(userProfile.full_name) : 'U'}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-semibold text-slate-900">{userProfile?.full_name || 'Loading...'}</p>
                      <p className="text-xs text-slate-500">{userProfile?.email || ''}</p>
                    </div>
                    <Link
                      href="/user/account"
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <Settings className="w-4 h-4" /> Account
                    </Link>
                    <Link
                      href="/user/add-funds"
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <Wallet className="w-4 h-4" /> Add Funds
                    </Link>
                    <div className="border-t border-slate-50 mt-1">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default UserLayout;
