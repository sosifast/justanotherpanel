'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Layers,
  LifeBuoy,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  AlertCircle,
  Server,
  CreditCard,
  Wallet,
  Globe,
  List,
  Download,
  MessageSquare,
  DollarSign,
  Shield,
  Check,
  Ticket,
  History
} from 'lucide-react';
import Pusher from 'pusher-js';
import { toast } from 'react-hot-toast';

type AdminLayoutProps = {
  children: React.ReactNode;
};

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
  isActive?: boolean;
};

type AdminNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

const SidebarItem = ({ icon, label, href, badge, isActive = false }: SidebarItemProps) => (
  <Link
    href={href}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
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

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const router = useRouter();

  // State
  const [counts, setCounts] = useState({ pending_orders: 0, open_tickets: 0 });
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [pusherSettings, setPusherSettings] = useState<{ key: string; cluster: string } | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchCounts();
    fetchNotifications();
    fetchPusherSettings();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role !== 'ADMIN') {
          router.push(data.user?.role === 'STAFF' ? '/staff' : '/user');
        }
      } else {
        router.push('/auth/login');
      }
    } catch (e) {
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    if (!pusherSettings) return;

    const pusher = new Pusher(pusherSettings.key, {
      cluster: pusherSettings.cluster,
      authEndpoint: '/api/pusher/auth',
    });

    // Subscribe to private-admin channel
    // Note: The auth endpoint must allow 'private-admin' checks for ADMIN role
    const channel = pusher.subscribe('private-admin');

    channel.bind('admin-notification', (data: any) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
      fetchCounts(); // Refresh counts as well

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
      pusher.unsubscribe('private-admin');
    };
  }, [pusherSettings]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setIsSearchOpen(false);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results);
          setIsSearchOpen(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);


  const fetchPusherSettings = async () => {
    try {
      const res = await fetch('/api/settings/public');
      if (res.ok) {
        const data = await res.json();
        setPusherSettings(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/admin/sidebar-counts');
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications/list');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch (e) { console.error(e); }
  };

  const handleMarkAsRead = async (id: number | 'all') => {
    try {
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      } else {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      await fetch('/api/admin/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
    } catch (e) { console.error(e); }
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 w-72 h-screen bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="py-6 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/50">
              A
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">AdminPanel</h1>
              <p className="text-slate-500 text-xs">v2.4.0 Pro</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Main
          </p>
          <SidebarItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            href="/admin"
            isActive={isActive('/admin')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            SMM Management
          </p>
          <SidebarItem
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Orders"
            href="/admin/smm/history_order"
            isActive={isActive('/admin/smm/history_order')}
            badge={counts.pending_orders > 0 ? `${counts.pending_orders} New` : undefined}
          />
          <SidebarItem
            icon={<Layers className="w-5 h-5" />}
            label="Services"
            href="/admin/smm/service"
            isActive={isActive('/admin/smm/service')}
          />
          <SidebarItem
            icon={<List className="w-5 h-5" />}
            label="Categories"
            href="/admin/smm/category"
            isActive={isActive('/admin/smm/category')}
          />
          <SidebarItem
            icon={<Globe className="w-5 h-5" />}
            label="Platforms"
            href="/admin/smm/platform"
            isActive={isActive('/admin/smm/platform')}
          />
          <SidebarItem
            icon={<DollarSign className="w-5 h-5" />}
            label="Discounts"
            href="/admin/discount"
            isActive={isActive('/admin/discount')}
          />
          <SidebarItem
            icon={<Download className="w-5 h-5" />}
            label="Import Services"
            href="/admin/smm/import"
            isActive={isActive('/admin/smm/import')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            Users & Billing
          </p>
          <SidebarItem
            icon={<Users className="w-5 h-5" />}
            label="Users"
            href="/admin/user"
            isActive={isActive('/admin/user')}
          />
          <SidebarItem
            icon={<Shield className="w-5 h-5" />}
            label="Resellers"
            href="/admin/register-reseller"
            isActive={isActive('/admin/register-reseller')}
          />
          <SidebarItem
            icon={<Wallet className="w-5 h-5" />}
            label="Deposit History"
            href="/admin/deposit_history"
            isActive={isActive('/admin/deposit_history')}
          />
          <SidebarItem
            icon={<CreditCard className="w-5 h-5" />}
            label="Payment Gateways"
            href="/admin/payment_gateway"
            isActive={isActive('/admin/payment_gateway')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            Redeem System
          </p>
          <SidebarItem
            icon={<Ticket className="w-5 h-5" />}
            label="Generate Code"
            href="/admin/reedem/generate"
            isActive={isActive('/admin/reedem/generate')}
          />
          <SidebarItem
            icon={<History className="w-5 h-5" />}
            label="Usage History"
            href="/admin/reedem/used_code"
            isActive={isActive('/admin/reedem/used_code')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            Support
          </p>
          <SidebarItem
            icon={<LifeBuoy className="w-5 h-5" />}
            label="Tickets"
            href="/admin/tickets"
            isActive={isActive('/admin/tickets')}
            badge={counts.open_tickets > 0 ? counts.open_tickets.toString() : undefined}
          />
          <SidebarItem
            icon={<MessageSquare className="w-5 h-5" />}
            label="News"
            href="/admin/news"
            isActive={isActive('/admin/news')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            System
          </p>
          <SidebarItem
            icon={<Server className="w-5 h-5" />}
            label="API Providers"
            href="/admin/api_provider"
            isActive={isActive('/admin/api_provider')}
          />
          <SidebarItem
            icon={<DollarSign className="w-5 h-5" />}
            label="Report Money"
            href="/admin/report_money"
            isActive={isActive('/admin/report_money')}
          />
          <SidebarItem
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            href="/admin/settings"
            isActive={isActive('/admin/settings')}
          />
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <img
              src="https://i.pravatar.cc/150?u=admin"
              alt="Admin"
              className="w-9 h-9 rounded-full border-2 border-slate-700"
            />
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-white">Administrator</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen md:ml-72 relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <header className="py-6 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden md:block">Dashboard Overview</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group z-50">
              <input
                type="text"
                placeholder="Search anything... (User, Order, Ticket)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                className="w-96 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />

              {isSearchOpen && (searchResults.length > 0 || searching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2 max-h-[60vh] overflow-y-auto">
                  {searching ? (
                    <div className="p-4 text-center text-slate-500 text-sm">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <Link
                        key={`${result.type}-${result.id}-${index}`}
                        href={result.url}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                          {result.type === 'USER' && <Users className="w-4 h-4" />}
                          {result.type === 'ORDER' && <ShoppingBag className="w-4 h-4" />}
                          {result.type === 'TICKET' && <MessageSquare className="w-4 h-4" />}
                          {result.type === 'SERVICE' && <Layers className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{result.title}</p>
                          <p className="text-xs text-slate-500">{result.subtitle}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">No results found</div>
                  )}
                </div>
              )}

              {isSearchOpen && (
                <div
                  className="fixed inset-0 z-[-1]"
                  onClick={() => setIsSearchOpen(false)}
                />
              )}
            </div>

            <div className="relative">
              <button
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <p className="font-semibold text-sm text-slate-900">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => handleMarkAsRead('all')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                          onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.is_read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1.5">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 z-10">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
