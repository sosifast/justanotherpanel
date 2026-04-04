'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Search, 
    Globe, 
    ShoppingBag, 
    Smartphone as PhoneIcon, 
    ArrowRight, 
    Info, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    Zap, 
    CheckCircle2, 
    ChevronUp,
    Bell,
    Gift,
    Wallet,
    Plus,
    Home,
    History,
    Ticket,
    User as UserIcon,
    Plus as PlusIcon,
    ShoppingCart,
    Loader2,
    Clock,
    ChevronDown,
    MapPin,
    Megaphone
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

type ProductVariation = {
    id: number;
    cost_sale: number;
    total_count: number;
    country: {
        title: string;
        code: string;
    };
};

type ProjectGroup = {
    pid: string;
    title: string;
    code: string;
    totalStock: number;
    minPrice: number;
    variations: ProductVariation[];
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

type SmsServiceClientProps = {
    user: {
        full_name: string;
        role: string;
        profile_imagekit_url: string | null;
        balance: number;
    };
    projects: ProjectGroup[];
    countries: { id: number; title: string; code: string }[];
    stats: {
        totalServices: number;
        totalStock: number;
        minPrice: number;
    };
    totalItems: number;
    pageSize: number;
    currentPage: number;
};

export default function SmsServiceClient({ 
    user,
    projects, 
    countries, 
    stats,
    totalItems,
    pageSize,
    currentPage 
}: SmsServiceClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'all');
    
    // Bottom Sheet States
    const [selectedProject, setSelectedProject] = useState<ProjectGroup | null>(null);

    // Notification States (Concept from Dashboard)
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);

    const createQueryString = useCallback(
        (params: Record<string, string | number | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '' || value === 'all') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, String(value));
                }
            });
            return newParams.toString();
        },
        [searchParams]
    );

    const updateFilters = (newParams: Record<string, string | number | null>) => {
        if (!newParams.hasOwnProperty('page')) newParams.page = 1;
        const queryString = createQueryString(newParams);
        router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (searchParams.get('q') || '')) {
                updateFilters({ q: searchTerm });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Initial notification fetch
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

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderingId, setOrderingId] = useState<number | null>(null);

    const handleOrder = async (productId: number) => {
        if (orderLoading) return;
        setOrderLoading(true);
        setOrderingId(productId);
        try {
            const res = await fetch('/api/user/sms-temp/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Failed to order number');
                return;
            }
            toast.success('Number ordered successfully!');
            router.push(`/user/sms-temp/get-sms?orderId=${data.order.id}`);
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setOrderLoading(false);
            setOrderingId(null);
        }
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    const formatCurrency = (amount: any) => {
        const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(val);
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
                    <div 
                        onClick={() => router.push('/user/account')}
                        className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200 text-xs overflow-hidden cursor-pointer"
                    >
                        {user.profile_imagekit_url ? (
                            <img src={user.profile_imagekit_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user.full_name?.substring(0, 2).toUpperCase() || 'JD'
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-slate-900 truncate max-w-[120px] md:max-w-[200px]">{user.full_name || 'Member'}</h2>
                        <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest leading-none">{user.role || 'Member'}</p>
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

            {/* Filter Hub (No Card, Compact) */}
            <div className="px-6 mt-8 flex items-center gap-2">
                <div className="relative flex-[1.5] group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-tight focus:outline-none placeholder:text-slate-300 text-slate-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative flex-1 group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500" />
                    <select 
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-800 focus:outline-none appearance-none"
                        value={selectedCountry}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedCountry(val);
                            updateFilters({ country: val });
                        }}
                    >
                        <option value="all">All Geo</option>
                        {countries.map(country => (
                            <option key={country.code} value={country.code}>{country.title}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none" />
                </div>
            </div>

            {/* Services Grid (Exact dashboard classes) */}
            <div className="px-6 mt-10 space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-[0.2em]">Services</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{totalItems} Results</span>
                </div>
                
                {projects.length > 0 ? (
                    <div className="grid grid-cols-4 gap-y-10 px-1">
                        {projects.map((project) => (
                            <div 
                                key={project.pid}
                                onClick={() => setSelectedProject(project)}
                                className="flex flex-col items-center group cursor-pointer active:scale-95 transition-all text-center px-1"
                            >
                                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 flex items-center justify-center transition-all bg-slate-50 border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white shadow-sm shadow-black/5">
                                    <PhoneIcon size={28} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black text-slate-800 text-center line-clamp-1 px-1 uppercase tracking-tighter group-active:text-emerald-600 transition-colors">
                                    {project.title}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-100 italic">
                        <ShoppingBag className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No results</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-6 py-12">
                        <button
                            onClick={(e) => { e.stopPropagation(); updateFilters({ page: currentPage - 1 }); }}
                            disabled={currentPage <= 1}
                            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-400"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-[16px] font-black text-slate-900 leading-none">
                                {currentPage}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                of {totalPages}
                            </span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); updateFilters({ page: currentPage + 1 }); }}
                            disabled={currentPage >= totalPages}
                            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-400"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Notifications */}
            {showNotifications && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowNotifications(false)}></div>
                    <div className="relative bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
                        <div className="px-8 py-6 border-b border-emerald-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-emerald-500 rounded-2xl text-white shadow-lg">
                                    <Bell size={20} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 uppercase tracking-tight">Notifications</h3>
                                </div>
                            </div>
                            <button onClick={() => setShowNotifications(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 active:scale-95">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto h-full pb-32 no-scrollbar">
                            {notifLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-emerald-200 animate-spin mb-4" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleViewNotification(n)}
                                        className={`p-4 rounded-[1.5rem] border transition-all flex items-start space-x-4 cursor-pointer active:scale-[0.98] group ${n.is_read ? 'bg-white border-slate-50' : 'bg-emerald-50/30 border-emerald-100 shadow-sm'
                                            }`}
                                    >
                                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${n.is_read ? 'bg-slate-50 text-slate-400' : 'bg-white text-emerald-600 shadow-sm'
                                            }`}>
                                            {getNotifIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-[12px] font-bold uppercase tracking-tight truncate pr-2 ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</h4>
                                                {!n.is_read && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse"></div>}
                                            </div>
                                            <p className={`text-[11px] font-medium leading-relaxed mt-1 line-clamp-2 ${n.is_read ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {n.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center text-center">
                                    <Bell size={32} className="opacity-20 mb-4" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No notifications</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SYNCED POPUP - COMPACT & CLEAN */}
            {selectedProject && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-0 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedProject(null)}></div>
                    <div className="relative bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
                        {/* Compact Header */}
                        <div className="px-8 py-5 border-b border-emerald-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-emerald-500 rounded-2xl text-white">
                                    <PhoneIcon size={20} strokeWidth={3} />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase italic tracking-tight truncate max-w-[200px] text-[16px] leading-none">{selectedProject.title}</h3>
                            </div>
                            <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Ultra-Compact Content - Simplified Lists */}
                        <div className="p-5 space-y-3 overflow-y-auto h-full pb-32 no-scrollbar">
                           {selectedProject.variations.map((v) => (
                             <div 
                                key={v.id}
                                onClick={() => handleOrder(v.id)}
                                className={`p-4 bg-white border border-slate-50 rounded-[2rem] flex items-center hover:bg-slate-50 hover:border-emerald-100 transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-black/5 ${orderingId === v.id ? 'opacity-60 pointer-events-none' : ''}`}
                             >
                                <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 text-emerald-500 flex items-center justify-center">
                                   <MapPin size={22} strokeWidth={2.5} />
                                </div>
                                
                                <div className="flex-1 min-w-0 ml-4">
                                  <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight italic leading-none">{v.country.title}</h4>
                                  <div className="mt-2 flex items-center gap-1.5 opacity-40">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{v.total_count.toLocaleString()} READY</span>
                                  </div>
                                </div>

                                <div className="ml-2">
                                   <div className={`${orderingId === v.id ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 group/btn transition-all`}>
                                      {orderingId === v.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                      ) : (
                                        <>
                                          <span className="text-[14px] font-black italic leading-none">${v.cost_sale.toFixed(2)}</span>
                                          <ShoppingCart size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                                        </>
                                      )}
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>

                        {/* Clean Close Button */}
                        <div className="px-8 py-5 bg-white border-t border-emerald-50 flex justify-end absolute bottom-0 w-full">
                            <button onClick={() => setSelectedProject(null)} className="w-full py-4 bg-emerald-600 text-white text-[12px] font-black rounded-2xl hover:bg-emerald-700 transition-all uppercase tracking-widest italic leading-none">
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
}
