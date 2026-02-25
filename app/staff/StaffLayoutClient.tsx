'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    LifeBuoy,
    Bell,
    Menu,
    X,
    LogOut,
    Wallet,
    History,
    Ticket
} from 'lucide-react';
import Pusher from 'pusher-js';
import { toast } from 'react-hot-toast';

type StaffLayoutClientProps = {
    children: React.ReactNode;
    initialSettings: { key: string; cluster: string; site_name?: string; logo_imagekit_url?: string } | null;
};

type SidebarItemProps = {
    icon: React.ReactNode;
    label: string;
    href: string;
    badge?: string;
    isActive?: boolean;
};

const SidebarItem = ({ icon, label, href, badge, isActive = false }: SidebarItemProps) => (
    <Link
        href={href}
        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </div>
        {badge && (
            <span
                className={`text-xs px-2 py-0.5 rounded-full ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
            >
                {badge}
            </span>
        )}
    </Link>
);

const StaffLayoutClient = ({ children, initialSettings }: StaffLayoutClientProps) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => pathname === path;

    // State
    const [counts, setCounts] = useState({ pending_orders: 0, open_tickets: 0 });
    const [unreadCount, setUnreadCount] = useState(0);
    const [settings] = useState(initialSettings);

    useEffect(() => {
        checkAuth();
        fetchCounts();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/check');
            if (res.ok) {
                const data = await res.json();
                if (data.user?.role !== 'STAFF' && data.user?.role !== 'ADMIN') {
                    router.push('/user');
                }
            } else {
                router.push('/auth/login');
            }
        } catch (e) {
            router.push('/auth/login');
        }
    };

    useEffect(() => {
        if (!settings?.key || !settings?.cluster) return;

        const pusher = new Pusher(settings.key, {
            cluster: settings.cluster,
            authEndpoint: '/api/pusher/auth',
        });

        const channel = pusher.subscribe('private-staff');

        channel.bind('staff-notification', (data: any) => {
            setUnreadCount(prev => prev + 1);
            fetchCounts();

            toast(
                (t) => (
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <p className="font-medium text-sm">{data.title}</p>
                            <p className="text-xs text-slate-500">{data.message}</p>
                        </div>
                        <button onClick={() => toast.dismiss(t.id)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ),
                { duration: 4000, position: 'bottom-right' }
            );
        });

        return () => {
            pusher.unsubscribe('private-staff');
        };
    }, [settings]);

    const fetchCounts = async () => {
        try {
            const res = await fetch('/api/admin/sidebar-counts'); // Use existing counts API if compatible or create staff specific
            if (res.ok) {
                const data = await res.json();
                setCounts(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            router.push('/auth/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 w-64 h-screen bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="py-6 flex items-center px-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        {settings?.logo_imagekit_url ? (
                            <img src={settings.logo_imagekit_url} alt="Logo" className="w-auto h-10 object-contain" />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {(settings?.site_name || "Staff").charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight truncate w-32">
                                {settings?.site_name || "Staff Panel"}
                            </h1>
                            <p className="text-slate-500 text-xs">Staff Area</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Workspace
                    </p>
                    <SidebarItem
                        icon={<LayoutDashboard className="w-5 h-5" />}
                        label="Dashboard"
                        href="/staff"
                        isActive={isActive('/staff')}
                    />
                    <SidebarItem
                        icon={<LifeBuoy className="w-5 h-5" />}
                        label="Tickets"
                        href="/staff/ticket"
                        isActive={isActive('/staff/ticket')}
                        badge={counts.open_tickets > 0 ? counts.open_tickets.toString() : undefined}
                    />

                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
                        History
                    </p>
                    <SidebarItem
                        icon={<ShoppingBag className="w-5 h-5" />}
                        label="Order History"
                        href="/staff/order-history"
                        isActive={pathname.startsWith('/staff/order-history')}
                    />
                    <SidebarItem
                        icon={<Wallet className="w-5 h-5" />}
                        label="Deposit History"
                        href="/staff/deposit-history"
                        isActive={pathname.startsWith('/staff/deposit-history')}
                    />
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-800 transition-colors group text-left"
                    >
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">Staff Member</p>
                            <p className="text-xs text-slate-500">Sign Out</p>
                        </div>
                        <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-h-screen md:ml-64 relative">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
                            )}
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-6 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                    <div className="relative z-10">{children}</div>
                </div>
            </main>
        </div>
    );
};

export default StaffLayoutClient;
