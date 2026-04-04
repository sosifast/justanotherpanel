'use client';

import React, { useState } from 'react';
import { 
    Search, 
    ArrowLeft, 
    MessageSquare,
    Clock,
    ShoppingBag
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type OrderItem = {
    id: number;
    invoice: string;
    number: string;
    status_order: string;
    sms_otp_code: string | null;
    price_sale: number;
    created_at: string;
    country: string;
    product: string;
};

type HistoryOrderSmsClientProps = {
    user: {
        full_name: string;
        role: string;
        profile_imagekit_url: string | null;
        balance: number;
    };
    orders: OrderItem[];
};

export default function HistoryOrderSmsClient({ user, orders }: HistoryOrderSmsClientProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders.filter(o => 
        o.number.includes(searchTerm) || 
        o.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'SUCCESS':
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/10';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/10';
            default:
                return 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/10';
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none mx-auto w-full md:max-w-3xl lg:max-w-4xl shadow-2xl relative transition-all duration-300">
            
            {/* Header */}
            <div className="p-6 flex items-center justify-between bg-white border-b border-emerald-50 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/user/history')}
                        className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors active:scale-95"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="font-black text-xl text-slate-900 tracking-tight uppercase italic">Sms History</h2>
                        <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest leading-none">Virtual Numbers</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[14px] font-black text-slate-900 leading-none">${user.balance.toFixed(2)}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Balance</p>
                </div>
            </div>

            {/* Search filter */}
            <div className="px-6 mt-8">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search invoice, number or service..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-tight focus:outline-none placeholder:text-slate-300 text-slate-800 focus:bg-white focus:border-emerald-200 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-6 mt-8 space-y-4">
                 <div className="flex justify-between items-center px-1 mb-6">
                    <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Transmission Logs</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredOrders.length} Protocols</span>
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div 
                                key={order.id}
                                onClick={() => (order.status_order === 'PENDING' || order.status_order === 'WAITING' || (order.status_order === 'SUCCESS' && !order.sms_otp_code)) && router.push(`/user/sms-temp/get-sms?orderId=${order.id}`)}
                                className="p-4 bg-white border border-emerald-50 rounded-[1.75rem] flex gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                            >
                                <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                    <MessageSquare size={18} strokeWidth={3} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[12px] font-black text-slate-900 truncate tracking-tight uppercase italic leading-none mb-2">{order.invoice}</h4>
                                    <div className="flex items-center space-x-2">
                                        <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-sm border ${getStatusStyle(order.status_order)}`}>
                                            {order.status_order}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase truncate">{order.product}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[14px] font-black text-slate-900 leading-none">-${order.price_sale.toFixed(2)}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">{formatDate(order.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <ShoppingBag className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No order records found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
