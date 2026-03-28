'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  History,
  Ticket,
  User,
  Bell,
  Wallet,
  Plus,
  Send,
  Smartphone,
  Zap,
  Globe,
  ShoppingBag,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Gift,
  Search,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ArrowRight,
  Megaphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type Platform = {
  id: number;
  name: string;
  slug: string;
  icon_imagekit_url?: string | null;
  status: string;
  _count?: {
    categories: number;
  };
};

type Order = {
  id: number;
  service: string;
  serviceId: number;
  link: string;
  quantity: number;
  status: string;
  created_at: string;
};

type News = {
  id: number;
  subject: string;
  content: string;
  created_at: string;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  type: 'ORDER' | 'DEPOSIT' | 'TICKET' | 'SYSTEM';
  is_read: boolean;
  related_id?: number | null;
  created_at: string;
};

type DashboardData = {
  user: {
    id: number;
    full_name: string;
    username: string;
    email: string;
    balance: number;
    role: string;
    status: string;
    profile_imagekit_url?: string | null;
  } | null;
  stats: {
    balance: number;
    totalSpent: number;
    totalOrders: number;
    activeOrders: number;
  };
  recentOrders: Order[];
  recentDeposits: {
    id: number;
    amount: number;
    status: string;
    created_at: string;
  }[];
  platforms: Platform[];
  news: News[];
  socialMedia: {
    instagram: string | null;
    facebook: string | null;
    telegram: string | null;
  };
  sliders: {
    id: number;
    name: string;
    imagekit_url_banner: string;
    slug: string;
  }[];
};

type Props = {
  data: DashboardData;
};

const DashboardClient = ({ data }: Props) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Home');
  const [activeSlider, setActiveSlider] = useState(0);
  const [historyType, setHistoryType] = useState('Order');
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // Auto-slide effect for hero slider
  useEffect(() => {
    if (data.sliders.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlider((prev) => (prev + 1) % data.sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [data.sliders.length]);

  // Initial notification fetch for the badge
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/user/notifications/list');
        if (res.ok) {
          const d = await res.json();
          setUnreadCount(d.unread_count);
        }
      } catch (e) { }
    };
    fetchUnread();

    // Realtime-ish polling (every 30 seconds)
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleViewNotification = (n: Notification) => {
    setShowNotifications(false);
    switch (n.type) {
      case 'ORDER':
        if (n.related_id) router.push(`/user/history/order/${n.related_id}`);
        else router.push('/user/history/order');
        break;
      case 'DEPOSIT':
        router.push('/user/history/deposits');
        break;
      case 'TICKET':
        router.push('/user/tickets');
        break;
      default:
        break;
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    setNotifLoading(true);
    try {
      const res = await fetch('/api/user/notifications/list');
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications);
        setUnreadCount(d.unread_count);

        // Mark all as read after a short delay
        if (d.unread_count > 0) {
          setTimeout(async () => {
            await fetch('/api/user/notifications/read', { method: 'POST' });
            setUnreadCount(0);
          }, 2000);
        }
      }
    } catch (e) {
      toast.error('Failed to sync transmissions');
    } finally {
      setNotifLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <ShoppingBag size={18} className="text-emerald-500" />;
      case 'DEPOSIT': return <Wallet size={18} className="text-blue-500" />;
      case 'TICKET': return <Ticket size={18} className="text-amber-500" />;
      default: return <Bell size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-28 select-none mx-auto w-full md:max-w-3xl lg:max-w-4xl shadow-2xl relative transition-all duration-300">

      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-white border-b border-emerald-50 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200 text-xs overflow-hidden">
            {data.user?.profile_imagekit_url ? (
              <img src={data.user.profile_imagekit_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              data.user?.full_name?.substring(0, 2).toUpperCase() || 'JD'
            )}
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 truncate max-w-[120px] md:max-w-[200px]">{data.user?.full_name || 'Member'}</h2>
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">{data.user?.role || 'Premium'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href="/user/voucher" className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-colors">
            <Gift size={20} />
          </Link>
          <button
            onClick={handleOpenNotifications}
            className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 relative hover:bg-emerald-100 transition-colors group"
          >
            <Bell size={20} className="group-active:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[8px] flex items-center justify-center text-white font-black animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-6 mt-6">
        <div className="bg-emerald-600 py-10 px-8 rounded-[1.25rem] shadow-xl shadow-emerald-100 text-white relative overflow-hidden transition-all hover:scale-[1.01] duration-300">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Active Balance</span>
              <Wallet size={16} className="text-emerald-100 opacity-60" />
            </div>

            <div className="flex justify-between items-center mt-2 group">
              <h1 className="text-3xl font-bold tracking-tighter group-hover:scale-[1.02] transition-transform duration-500">
                {formatCurrency(data.stats.balance)}
              </h1>

              <Link
                href="/user/add-funds"
                className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center justify-center space-x-2 font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all border border-white/10 shadow-lg shadow-emerald-700/20"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Top Up</span>
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-emerald-500 rounded-full opacity-40"></div>
          <div className="absolute top-[-20%] left-[-10%] w-24 h-24 bg-emerald-700 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-6 mt-10">
        <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Main Services</h3>
        <div className="grid grid-cols-4 gap-y-8">
          {data.platforms.slice(0, 7).map((item) => (
            <Link key={item.id} href={`/user/new-order?platform=${item.slug}`} className="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform">
              <div className={`w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-3 shadow-sm group-hover:bg-emerald-100 group-hover:shadow-emerald-100 transition-all duration-300`}>
                {item.icon_imagekit_url ? (
                  <img src={item.icon_imagekit_url} alt={item.name} className="w-7 h-7 object-contain group-hover:scale-110 transition-transform" />
                ) : (
                  <Smartphone size={24} />
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-600 text-center line-clamp-1 px-1 uppercase tracking-tight">{item.name}</span>
            </Link>
          ))}
          <Link href="/user/services" className="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center mb-3 shadow-sm group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-300">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-tight">Others</span>
          </Link>
        </div>
      </div>

      {/* Image Slider */}
      <div className="px-6 mt-10">
        <div className="overflow-hidden rounded-3xl border border-emerald-50 shadow-sm relative h-40">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeSlider * 100}%)` }}
          >
            {data.sliders.map((banner) => (
              <div key={banner.id} className="min-w-full h-full">
                <img
                  src={banner.imagekit_url_banner}
                  alt={banner.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {data.sliders.length === 0 && (
              <div className="min-w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                No Active Promos
              </div>
            )}
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5">
            {data.sliders.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeSlider === i ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/50'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Promo Slide */}
      <div className="mt-12">
        <div className="px-6 flex justify-between items-center mb-5">
          <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-[0.2em] ml-1">Elite Offers</h3>
          <Link href="/user/services" className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center hover:scale-105 transition-transform">
            See All <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        <div className="flex space-x-5 overflow-x-auto px-6 no-scrollbar pb-8 snap-x">
          {data.news.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedNews(p)} 
              className="min-w-[300px] max-w-[300px] bg-white p-7 rounded-[3rem] snap-start cursor-pointer shadow-xl shadow-emerald-900/5 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all group border border-emerald-50/50"
            >
              <h4 className="font-black text-[16px] text-slate-900 leading-tight uppercase tracking-tight">{p.subject}</h4>
              <p className="mt-4 text-[12px] font-medium text-slate-500 leading-relaxed line-clamp-3">
                {p.content.split(' ').slice(0, 30).join(' ')}{p.content.split(' ').length > 30 ? '...' : ''}
              </p>
              <div className="mt-7 flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-widest italic group-hover:translate-x-1 transition-transform">
                See Detail <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
          {data.news.length === 0 && (
            <div className="w-full text-center py-12 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] italic bg-slate-50/50 rounded-[2.5rem] border border-dashed border-emerald-100">No active transmissions</div>
          )}
        </div>
      </div>

      {/* History Tabs & List */}
      <div className="px-6 mt-12 pb-10">
        <div className="flex items-center space-x-8 mb-6 border-b border-emerald-50">
          <button
            onClick={() => setHistoryType('Order')}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${historyType === 'Order' ? 'text-slate-900' : 'text-slate-400'}`}
          >
            Recent Orders
            {historyType === 'Order' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full animate-in slide-in-from-left duration-300"></div>}
          </button>
          <button
            onClick={() => setHistoryType('Deposit')}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${historyType === 'Deposit' ? 'text-slate-900' : 'text-slate-400'}`}
          >
            History Deposit
            {historyType === 'Deposit' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full animate-in slide-in-from-left duration-300"></div>}
          </button>
        </div>

        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-[0.2em]">
            {historyType === 'Order' ? 'Latest Activity' : 'Deposit Matrix'}
          </h3>
          <Link 
            href={historyType === 'Order' ? '/user/history/order' : '/user/history/deposits'} 
            className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center hover:scale-105 transition-transform"
          >
            See All <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>

        <div className="space-y-4">
          {historyType === 'Order' ? (
            data.recentOrders.slice(0, 5).map((h) => (
              <div 
                key={h.id} 
                onClick={() => router.push(`/user/history/order/${h.id}`)}
                className="p-4 bg-white border border-emerald-50 rounded-3xl flex items-center shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
              >
                {/* Horizontal Slim Design */}
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap size={18} />
                </div>
                
                <div className="flex-1 min-w-0 ml-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[12px] font-black text-slate-800 truncate uppercase tracking-tight pr-2">{h.service}</h4>
                    <span className="text-[12px] font-black text-slate-900 shrink-0">#{h.id}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1.5">
                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      h.status === 'COMPLETED' || h.status === 'SUCCESS' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {h.status === 'COMPLETED' || h.status === 'SUCCESS' ? 'Succeeded' : h.status}
                    </div>
                    <span className="w-1 h-1 bg-slate-100 rounded-full"></span>
                    <span className="text-[9px] font-black text-slate-400 opacity-60 uppercase">{formatDate(h.created_at)}</span>
                  </div>
                </div>
                
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={18} className="text-emerald-500" />
                </div>
              </div>
            ))
          ) : (
            data.recentDeposits.map((d) => (
              <div 
                key={d.id} 
                className="p-4 bg-white border border-emerald-50 rounded-3xl flex items-center shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                onClick={() => router.push('/user/history/deposits')}
              >
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet size={18} />
                </div>
                
                <div className="flex-1 min-w-0 ml-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[12px] font-black text-slate-800 truncate uppercase tracking-tight pr-2">Automatic Top-Up</h4>
                    <span className="text-sm font-black text-emerald-600 shrink-0">+${d.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1.5">
                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      d.status === 'SUCCESS' || d.status === 'PAYMENT' || d.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : d.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {d.status === 'PAYMENT' ? 'Success' : d.status}
                    </div>
                    <span className="w-1 h-1 bg-slate-100 rounded-full"></span>
                    <span className="text-[9px] font-black text-slate-400 opacity-60 uppercase">{formatDate(d.created_at)}</span>
                  </div>
                </div>
                
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={18} className="text-emerald-500" />
                </div>
              </div>
            ))
          )}

          {historyType === 'Order' && data.recentOrders.length === 0 && (
            <div className="py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] italic bg-emerald-50/20 rounded-[2rem] border border-dashed border-emerald-100 flex flex-col items-center">
              <ShoppingBag size={32} className="mb-4 opacity-20" />
              No acquisitions found in matrix
            </div>
          )}

          {historyType === 'Deposit' && data.recentDeposits.length === 0 && (
            <div className="py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] italic bg-emerald-50/20 rounded-[2rem] border border-dashed border-emerald-100 flex flex-col items-center">
              <Wallet size={32} className="mb-4 opacity-20" />
              Your financial log is currently baseline
            </div>
          )}
        </div>
      </div>

      {/* Footer Tab Menu */}
      <div className="fixed bottom-0 left-0 right-0 max-w-3xl lg:max-w-4xl mx-auto bg-white/80 backdrop-blur-3xl border-t border-emerald-50/50 px-10 py-5 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
        <Link
          href="/user"
          onClick={() => setActiveTab('Home')}
          className={`flex flex-col items-center space-y-1.5 transition-all active:scale-90 group ${activeTab === 'Home' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home size={22} strokeWidth={activeTab === 'Home' ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </Link>
        <Link
          href="/user/history/order"
          onClick={() => setActiveTab('History')}
          className={`flex flex-col items-center space-y-1.5 transition-all active:scale-90 group ${activeTab === 'History' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <History size={22} strokeWidth={activeTab === 'History' ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
        </Link>
        <Link
          href="/user/tickets"
          onClick={() => setActiveTab('Ticket')}
          className={`flex flex-col items-center space-y-1.5 transition-all active:scale-90 group ${activeTab === 'Ticket' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Ticket size={22} strokeWidth={activeTab === 'Ticket' ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Support</span>
        </Link>
        <Link
          href="/user/account"
          onClick={() => setActiveTab('Account')}
          className={`flex flex-col items-center space-y-1.5 transition-all active:scale-90 group ${activeTab === 'Account' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <User size={22} strokeWidth={activeTab === 'Account' ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Account</span>
        </Link>
      </div>

      {/* Realtime Notification Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowNotifications(false)}></div>
          <div className="relative bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="px-8 py-6 border-b border-emerald-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-200">
                  <Bell size={20} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase italic tracking-tight">Notifications</h3>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Realtime Feed</p>
                </div>
              </div>
              <button onClick={() => setShowNotifications(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-all active:scale-90">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto h-full pb-32 no-scrollbar">
              {notifLoading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                  <Loader2 className="w-10 h-10 text-emerald-200 animate-spin mb-4" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scanning Network...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-5 rounded-[2.2rem] border transition-all flex items-start space-x-4 group ${n.is_read ? 'bg-white border-slate-50' : 'bg-emerald-50/30 border-emerald-100 shadow-sm'
                      }`}
                  >
                    <div className={`p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${n.is_read ? 'bg-slate-50 text-slate-400' : 'bg-white text-emerald-600 shadow-sm'
                      }`}>
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-[13px] font-black uppercase tracking-tight truncate pr-2 ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</h4>
                        {!n.is_read && <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse"></div>}
                      </div>
                      <p className={`text-[11px] font-medium leading-relaxed mt-1 line-clamp-2 ${n.is_read ? 'text-slate-400' : 'text-slate-600'}`}>
                        {n.message}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                          <Clock size={10} className="mr-1" />
                          {formatDate(n.created_at)}
                        </div>
                        <button 
                          onClick={() => handleViewNotification(n)}
                          className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic flex items-center group-hover:underline"
                        >
                          View <ExternalLink size={10} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 border border-slate-100/50">
                    <Bell size={40} className="opacity-40" />
                  </div>
                  <h3 className="font-black text-slate-800 uppercase italic tracking-tight">No Notifications</h3>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 px-12 leading-relaxed">Your secure feed is currently at baseline.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* News Modal (Promo Details) */}
      {selectedNews && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedNews(null)}></div>
          <div className="relative bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="px-8 py-7 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/20 sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-200">
                  <Megaphone size={22} strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 uppercase italic tracking-tight truncate max-w-[200px]">{selectedNews.subject}</h3>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Official Broadcast</p>
                </div>
              </div>
              <button onClick={() => setSelectedNews(null)} className="p-3 hover:bg-emerald-100/50 rounded-2xl text-slate-400 transition-all active:scale-95">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 pt-6 space-y-6 overflow-y-auto h-full pb-32 no-scrollbar">
              <div className="prose prose-emerald">
                <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedNews.content}
                </p>
              </div>
            </div>
            <div className="px-8 py-6 bg-white border-t border-emerald-50 flex justify-end absolute bottom-0 w-full">
              <button onClick={() => setSelectedNews(null)} className="w-full py-4 bg-emerald-600 text-white text-xs font-black rounded-[2rem] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 uppercase tracking-[0.2em] italic">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </div>
  );
};

export default DashboardClient;
