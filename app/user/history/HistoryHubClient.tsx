'use client';

import React, { useState } from 'react';
import { 
    ChevronLeft, 
    Search, 
    Zap, 
    ShoppingBag, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Filter, 
    History,
    MessageSquare,
    Globe,
    Phone,
    Wallet,
    CreditCard,
    Info,
    RotateCcw,
    X,
    ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type SmmOrderItem = {
    id: number;
    service: { name: string };
    price_sale: number;
    status: string;
    created_at: string;
    link: string;
    quantity: number;
};

type SmsOrderItem = {
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

type DepositItem = {
    id: number;
    amount: number;
    status: string;
    created_at: string;
    detail_transaction: any;
};

type HistoryHubClientProps = {
    user: {
        full_name: string;
        role: string;
        profile_imagekit_url: string | null;
        balance: number;
    };
    smmOrders: SmmOrderItem[];
    smsOrders: SmsOrderItem[];
    deposits: DepositItem[];
};

export default function HistoryHubClient({ user, smmOrders, smsOrders, deposits }: HistoryHubClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'SMM' | 'SMS' | 'DEPOSIT'>('SMM');
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
            case 'PAYMENT':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/10';
            case 'IN_PROGRESS':
            case 'PROCESSING':
                return 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/10';
            case 'PENDING':
            case 'WAITING':
                return 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/10';
            case 'PARTIAL':
                return 'bg-purple-50 text-purple-600 border-purple-100 shadow-purple-100/10';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/10';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // --- FILTER ---
    const filteredSmm = smmOrders.filter(o => 
        o.id.toString().includes(searchTerm) || 
        o.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.link.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSms = smsOrders.filter(o => 
        o.number.includes(searchTerm) || 
        o.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDeposits = deposits.filter(d => 
        d.id.toString().includes(searchTerm) || 
        (d.detail_transaction?.method || d.detail_transaction?.provider || 'Deposit').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none mx-auto w-full md:max-w-3xl lg:max-w-4xl shadow-2xl relative transition-all duration-300">
            
            {/* Header */}
            <div className="p-6 flex items-center justify-between bg-white border-b border-emerald-50 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/user')}
                        className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors active:scale-95"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="font-black text-xl text-slate-900 tracking-tight uppercase italic">History Log</h2>
                        <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest leading-none">All Protocols</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[14px] font-black text-slate-900 leading-none">${user.balance.toFixed(2)}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Balance</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 mt-8 flex items-center space-x-8 border-b border-emerald-50">
                <button
                    onClick={() => setActiveTab('SMM')}
                    className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'SMM' ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    Order SMM
                    {activeTab === 'SMM' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full animate-in slide-in-from-left duration-300"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('SMS')}
                    className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'SMS' ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    Order SMS
                    {activeTab === 'SMS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full animate-in slide-in-from-left duration-300"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('DEPOSIT')}
                    className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'DEPOSIT' ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    Deposit Log
                    {activeTab === 'DEPOSIT' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full animate-in slide-in-from-left duration-300"></div>}
                </button>
            </div>

            {/* Search filter */}
            <div className="px-6 mt-8">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab.toLowerCase()} history...`}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-tight focus:outline-none placeholder:text-slate-300 text-slate-800 focus:bg-white focus:border-emerald-200 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-6 mt-8 space-y-4">
                {activeTab === 'SMM' && (
                    <div className="space-y-4">
                        {filteredSmm.length > 0 ? (
                            filteredSmm.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => router.push(`/user/history/order/${item.id}`)}
                                    className="p-4 bg-white border border-emerald-50 rounded-[1.75rem] flex gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                                >
                                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                        <Zap size={18} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[12px] font-black text-slate-900 truncate tracking-tight uppercase italic leading-none mb-2">ORDER #{item.id}</h4>
                                        <div className="flex items-center space-x-2">
                                            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-sm border ${getStatusStyle(item.status)}`}>
                                                {item.status}
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase truncate max-w-[120px]">{item.service.name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[14px] font-black text-slate-900 leading-none">-${item.price_sale.toFixed(2)}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">{formatDate(item.created_at)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <ShoppingBag className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No order records found</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'SMS' && (
                    <div className="space-y-4">
                        {filteredSms.length > 0 ? (
                            filteredSms.map((order) => (
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
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Virtual Number records</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'DEPOSIT' && (
                    <div className="space-y-4">
                        {filteredDeposits.length > 0 ? (
                            filteredDeposits.map((item) => {
                                const method = item.detail_transaction?.method || item.detail_transaction?.provider || 'Gateway';
                                
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => router.push('/user/history/deposits')}
                                        className="p-4 bg-white border border-emerald-50 rounded-[1.75rem] flex gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                                    >
                                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                                            ['ERROR', 'CANCELED'].includes(item.status) ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            <ArrowDownLeft size={18} strokeWidth={3} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-[12px] font-black text-slate-900 truncate tracking-tight pr-4 uppercase italic leading-none">DEPOSIT #{item.id}</h4>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-sm border ${getStatusStyle(item.status)}`}>
                                                    {item.status}
                                                </div>
                                                <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase truncate max-w-[120px]">{method}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[14px] font-black text-emerald-600 leading-none">+${item.amount.toFixed(2)}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">{formatDate(item.created_at)}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <Wallet className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No financial movements logged</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Style override */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
