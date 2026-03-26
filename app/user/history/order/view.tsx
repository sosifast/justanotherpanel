'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Search, 
  ArrowUpRight, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Smartphone,
  Zap,
  ShoppingBag,
  CreditCard,
  History,
  X,
  RotateCcw,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, Service } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ReffilOrder = {
    id: number;
    status: string;
};

type OrderWithService = Order & {
    service: Service;
    reffil_orders: ReffilOrder[];
};

interface OrdersViewProps {
    initialOrders: OrderWithService[];
}

const OrderHistoryView = ({ initialOrders }: OrdersViewProps) => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [platformFilter, setPlatformFilter] = useState('All');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isRefilling, setIsRefilling] = useState<number | null>(null);

    const handleSyncStatus = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/user/orders/sync-all', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                router.refresh();
            } else {
                toast.error(data.error || 'Failed to sync orders');
            }
        } catch (error) {
            toast.error('An error occurred during sync');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRefill = async (orderId: number) => {
        setIsRefilling(orderId);
        try {
            const res = await fetch(`/api/user/orders/${orderId}/refill`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Refill requested successfully!');
                router.refresh();
            } else {
                toast.error(data.error || 'Failed to request refill');
            }
        } catch (error) {
            toast.error('An error occurred while requesting refill');
        } finally {
            setIsRefilling(null);
        }
    };

    const platforms = ['All', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];
    const statuses = ['All', 'COMPLETED', 'IN_PROGRESS', 'PROCESSING', 'PENDING', 'PARTIAL', 'ERROR', 'CANCELED', 'SUCCESS'];

    const getPlatformIcon = (serviceName: string) => {
        if (serviceName.includes('Instagram')) return <Smartphone size={18} />;
        if (serviceName.includes('TikTok')) return <Zap size={18} />;
        if (serviceName.includes('YouTube')) return <ShoppingBag size={18} />;
        if (serviceName.includes('Twitter')) return <Zap size={18} />;
        if (serviceName.includes('Facebook')) return <Smartphone size={18} />;
        return <ShoppingBag size={18} />;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
                return 'bg-emerald-50 text-emerald-600';
            case 'IN_PROGRESS':
            case 'PROCESSING':
            case 'PENDING':
                return 'bg-amber-50 text-amber-600';
            case 'PARTIAL':
                return 'bg-purple-50 text-purple-600';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-red-50 text-red-600';
            default:
                return 'bg-slate-50 text-slate-500';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const getPlatformFromService = (serviceName: string) => {
        if (serviceName.includes('Instagram')) return 'Instagram';
        if (serviceName.includes('TikTok')) return 'TikTok';
        if (serviceName.includes('YouTube')) return 'YouTube';
        if (serviceName.includes('Twitter')) return 'Twitter';
        if (serviceName.includes('Facebook')) return 'Facebook';
        return 'Other';
    };

    const filteredOrders = initialOrders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchQuery) ||
            order.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.link.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        const matchesPlatform = platformFilter === 'All' || getPlatformFromService(order.service.name) === platformFilter;
        return matchesSearch && matchesStatus && matchesPlatform;
    });

    const resetFilters = () => {
        setStatusFilter('All');
        setPlatformFilter('All');
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-10 select-none relative">
            
            {/* Header */}
            <div className="p-6 bg-white sticky top-0 z-40 border-b border-emerald-50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Link href="/user" className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform">
                            <ChevronLeft size={24} />
                        </Link>
                        <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight uppercase italic">ORDERS</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleSyncStatus}
                            disabled={isSyncing}
                            className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform hover:bg-emerald-100"
                        >
                            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                        </button>
                        <button 
                            onClick={() => setIsFilterOpen(true)}
                            className={`p-2.5 rounded-xl border transition-all ${
                                statusFilter !== 'All' || platformFilter !== 'All' 
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-50'
                            }`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search ID, service, or link..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm placeholder:text-slate-300 font-bold"
                    />
                </div>
            </div>

            {/* Active Filters Tag Display */}
            {(statusFilter !== 'All' || platformFilter !== 'All') && (
                <div className="px-6 mt-4 flex flex-wrap gap-2">
                    {statusFilter !== 'All' && (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center tracking-widest">
                            Status: {statusFilter}
                            <button onClick={() => setStatusFilter('All')} className="ml-2 hover:text-emerald-800"><X size={12} /></button>
                        </span>
                    )}
                    {platformFilter !== 'All' && (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center tracking-widest">
                            Platform: {platformFilter}
                            <button onClick={() => setPlatformFilter('All')} className="ml-2 hover:text-emerald-800"><X size={12} /></button>
                        </span>
                    )}
                </div>
            )}

            {/* Transaction List */}
            <div className="p-6 space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((item) => (
                        <div 
                            key={item.id} 
                            className="p-4 bg-white border border-emerald-50 rounded-[2rem] flex justify-between items-center shadow-sm active:scale-[0.98] transition-transform hover:shadow-md hover:border-emerald-100 group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-4 rounded-2xl transition-all group-hover:scale-105 ${
                                    item.status === 'ERROR' || item.status === 'CANCELED' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600 shadow-sm'
                                }`}>
                                    {getPlatformIcon(item.service.name)}
                                </div>
                                <div className="space-y-1 pr-2">
                                    <h4 className="text-sm font-black text-slate-800 line-clamp-1 leading-tight">{item.service.name}</h4>
                                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <span className="flex items-center"><Calendar size={10} className="mr-1 opacity-60" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                        <span className="opacity-30">•</span>
                                        <span className="flex items-center"><Clock size={10} className="mr-1 opacity-60" /> {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-[9px] font-black text-slate-300 tracking-[0.2em] uppercase italic bg-slate-50 inline-block px-1.5 py-0.5 rounded-md mt-1">#ID-{item.id}</p>
                                </div>
                            </div>

                            <div className="text-right space-y-1.5 min-w-[90px]">
                                <p className="text-sm font-black text-slate-900 tracking-tight">
                                    -${Number(item.price_sale).toFixed(2)}
                                </p>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${getStatusStyle(item.status)}`}>
                                    {item.status === 'COMPLETED' || item.status === 'SUCCESS' ? (
                                        <CheckCircle2 size={10} className="mr-1" />
                                    ) : item.status === 'PENDING' || item.status === 'PROCESSING' || item.status === 'IN_PROGRESS' ? (
                                        <Clock size={10} className="mr-1" />
                                    ) : (
                                        <XCircle size={10} className="mr-1" />
                                    )}
                                    {item.status}
                                </div>
                                <div className="flex items-center justify-end space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/user/history/order/${item.id}`} className="p-1 px-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                                        <ArrowUpRight size={14} strokeWidth={3} />
                                    </Link>
                                    {item.service.refill && (
                                        <button 
                                            onClick={() => handleRefill(item.id)}
                                            disabled={isRefilling === item.id || item.reffil_orders.some((r: ReffilOrder) => ['PENDING', 'SUCCESS', 'COMPLETED', 'FINISH'].includes(r.status))}
                                            className={`p-1 px-2.5 rounded-lg transition-all ${
                                                item.reffil_orders.some((r: ReffilOrder) => ['PENDING', 'SUCCESS', 'COMPLETED', 'FINISH'].includes(r.status))
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                            }`}
                                        >
                                            <RotateCcw size={14} strokeWidth={3} className={isRefilling === item.id ? 'animate-spin' : ''} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    /* Empty State */
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-200 shadow-inner">
                            <History size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-slate-900 uppercase">Archive Is Empty</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-10 leading-relaxed">Adjust your temporal filters or initiate a new acquisition protocol.</p>
                            {(statusFilter !== 'All' || platformFilter !== 'All') && (
                                <button 
                                    onClick={resetFilters}
                                    className="mt-6 text-white bg-emerald-600 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center mx-auto shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                                >
                                    <RotateCcw size={14} className="mr-2" /> Reset Metrics
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Bottom Sheet */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsFilterOpen(false)}
                    ></div>
                    
                    {/* Bottom Sheet Content */}
                    <div className="relative w-full max-w-md bg-white rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500 z-50 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                        
                        {/* Handle Bar */}
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 relative z-10"></div>
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">FILTER</h3>
                            <button 
                                onClick={resetFilters}
                                className="text-[10px] font-black text-emerald-600 flex items-center bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                            >
                                <RotateCcw size={14} className="mr-1.5" /> Reset
                            </button>
                        </div>

                        {/* Filter Section: Status */}
                        <div className="mb-8 relative z-10">
                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-4 ml-1">Current Status</label>
                            <div className="flex flex-wrap gap-2">
                                {statuses.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${
                                            statusFilter === status 
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100' 
                                            : 'bg-slate-50 text-slate-400 border-slate-50 hover:bg-slate-100'
                                        }`}
                                    >
                                        {status === 'All' ? 'ANY' : status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Section: Platform */}
                        <div className="mb-10 relative z-10">
                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-4 ml-1">Social Platform</label>
                            <div className="grid grid-cols-3 gap-3">
                                {platforms.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatformFilter(p)}
                                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${
                                            platformFilter === p 
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100' 
                                            : 'bg-slate-50 text-slate-400 border-slate-50 hover:bg-slate-100'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Apply Button */}
                        <button 
                            onClick={() => setIsFilterOpen(false)}
                            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm active:scale-[0.98] transition-all shadow-xl shadow-slate-200 uppercase tracking-widest relative z-10 flex items-center justify-center space-x-2"
                        >
                            <span>Apply Selection</span>
                            <ArrowUpRight size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderHistoryView;
