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
  History,
  X,
  RotateCcw,
  RefreshCw
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
        const lowerName = serviceName.toLowerCase();
        if (lowerName.includes('instagram')) return <Smartphone size={18} />;
        if (lowerName.includes('tiktok')) return <Zap size={18} />;
        if (lowerName.includes('youtube')) return <ShoppingBag size={18} />;
        if (lowerName.includes('twitter')) return <Zap size={18} />;
        if (lowerName.includes('facebook')) return <Smartphone size={18} />;
        return <ShoppingBag size={18} />;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-100/10';
            case 'IN_PROGRESS':
            case 'PROCESSING':
                return 'bg-blue-50 text-blue-600 border border-blue-100 shadow-blue-100/10';
            case 'PENDING':
                return 'bg-orange-50 text-orange-600 border border-orange-100 shadow-orange-100/10';
            case 'PARTIAL':
                return 'bg-purple-50 text-purple-600 border border-purple-100 shadow-purple-100/10';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-100/10';
            default:
                return 'bg-slate-50 text-slate-600 border border-slate-100';
        }
    };

    const resetFilters = () => {
        setStatusFilter('All');
        setPlatformFilter('All');
        setSearchQuery('');
    };

    const filteredOrders = initialOrders.filter((order) => {
        const matchesSearch = 
            order.id.toString().includes(searchQuery) ||
            order.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.link.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        
        const matchesPlatform = platformFilter === 'All' || order.service.name.toLowerCase().includes(platformFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesPlatform;
    });

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none relative">
            
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
                            onClick={() => router.push(`/user/history/order/${item.id}`)}
                            className="p-4 bg-white border border-emerald-50 rounded-[1.75rem] flex items-center shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                        >
                            {/* Compact Icon Section */}
                            <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                ['ERROR', 'CANCELED'].includes(item.status) ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                                {getPlatformIcon(item.service.name)}
                            </div>

                            <div className="flex-1 min-w-0 ml-4">
                                {/* Row 1: Title and Price */}
                                <div className="flex items-center justify-between mb-1.5">
                                    <h4 className="text-xs font-black text-slate-900 truncate tracking-tight pr-4 uppercase italic leading-none">{item.service.name}</h4>
                                    <span className="text-sm font-black text-slate-900 leading-none shrink-0">-${Number(item.price_sale).toFixed(2)}</span>
                                </div>

                                {/* Row 2: Status, Meta, and Actions */}
                                <div className="flex items-center">
                                    <div className="flex items-center space-x-2">
                                        <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center shadow-sm border ${getStatusStyle(item.status)}`}>
                                            {item.status === 'COMPLETED' || item.status === 'SUCCESS' ? (
                                                <CheckCircle2 size={10} className="mr-1" />
                                            ) : (
                                                <Clock size={10} className="mr-1" />
                                            )}
                                            {item.status}
                                        </div>
                                        
                                        <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase">ID:{item.id}</span>
                                        
                                        <span className="w-1 h-1 bg-slate-100 rounded-full"></span>
                                        
                                        <div className="flex items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                            <Calendar size={10} className="mr-1 opacity-40" /> 
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {item.service.refill && (
                                        <div className="ml-auto pl-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleRefill(item.id); }}
                                                disabled={isRefilling === item.id || item.reffil_orders.some((r: ReffilOrder) => ['PENDING', 'SUCCESS', 'COMPLETED', 'FINISH'].includes(r.status))}
                                                className={`p-1.5 rounded-lg transition-all ${
                                                    item.reffil_orders.some((r: ReffilOrder) => ['PENDING', 'SUCCESS', 'COMPLETED', 'FINISH'].includes(r.status))
                                                        ? 'bg-slate-50 text-slate-200 cursor-not-allowed'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                }`}
                                            >
                                                <RotateCcw size={12} strokeWidth={3} className={isRefilling === item.id ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-200 mb-6 transition-transform hover:scale-110">
                            <History size={48} />
                        </div>
                        <h3 className="font-black text-slate-800 uppercase italic tracking-tight">No Protocols Logged</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-12 leading-relaxed">System logs for the current filter<br/>selection are currently empty.</p>
                    </div>
                )}
            </div>

            {/* Filter Bottom Sheet */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
                    
                    <div className="relative w-full max-w-md bg-white rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500 z-50 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                        
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

                        <div className="mb-8 relative z-10 text-left">
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

                        <div className="mb-10 relative z-10 text-left">
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
