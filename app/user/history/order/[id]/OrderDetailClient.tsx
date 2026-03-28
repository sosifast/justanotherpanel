'use client';

import React from 'react';
import { 
  ChevronLeft, 
  Copy, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Hash, 
  Link2, 
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  XCircle,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type OrderDetail = {
    id: number;
    invoice_number: string;
    link: string;
    quantity: number;
    start_count: number | null;
    remains: number | null;
    status: string;
    price_sale: number;
    created_at: Date | string;
    service: {
        id: number;
        name: string;
        category: {
            name: string;
            platform: { name: string };
        };
    };
    api_provider?: { name: string } | null;
};

type Props = {
    order: OrderDetail;
};

const OrderDetailClient = ({ order }: Props) => {
    const router = useRouter();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
                return { 
                    label: 'Completed', 
                    color: 'bg-emerald-500', 
                    bg: 'bg-emerald-50', 
                    text: 'text-emerald-600', 
                    icon: <CheckCircle2 size={40} strokeWidth={2.5} /> 
                };
            case 'PROCESSING':
            case 'IN_PROGRESS':
                return { 
                    label: 'Processing', 
                    color: 'bg-blue-500', 
                    bg: 'bg-blue-50', 
                    text: 'text-blue-600', 
                    icon: <RefreshCw size={40} strokeWidth={2.5} className="animate-spin" /> 
                };
            case 'PENDING':
                return { 
                    label: 'Pending', 
                    color: 'bg-amber-500', 
                    bg: 'bg-amber-50', 
                    text: 'text-amber-600', 
                    icon: <Clock size={40} strokeWidth={2.5} /> 
                };
            case 'PARTIAL':
                return { 
                    label: 'Partial', 
                    color: 'bg-purple-500', 
                    bg: 'bg-purple-50', 
                    text: 'text-purple-600', 
                    icon: <AlertCircle size={40} strokeWidth={2.5} /> 
                };
            case 'ERROR':
            case 'CANCELED':
                return { 
                    label: 'Canceled', 
                    color: 'bg-rose-500', 
                    bg: 'bg-rose-50', 
                    text: 'text-rose-600', 
                    icon: <XCircle size={40} strokeWidth={2.5} /> 
                };
            default:
                return { 
                    label: status, 
                    color: 'bg-slate-500', 
                    bg: 'bg-slate-50', 
                    text: 'text-slate-600', 
                    icon: <Clock size={40} strokeWidth={2.5} /> 
                };
        }
    };

    const statusConfig = getStatusConfig(order.status);
    const dateObj = new Date(order.created_at);
    const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans pb-12 select-none">
            
            {/* Emerald Backdrop */}
            <div className="fixed top-0 left-0 w-full h-48 bg-emerald-600 rounded-b-[3rem] -z-10 shadow-2xl shadow-emerald-900/20"></div>

            {/* Standardized Header Navigation */}
            <nav className="p-6 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-emerald-50">
                <div className="flex items-center">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-95 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="ml-4 text-xl font-black tracking-tight uppercase italic text-slate-900">
                        Order Details
                    </h1>
                </div>
                
                <button 
                    onClick={() => router.push('/user/tickets')}
                    className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-95 transition-all"
                >
                    <HelpCircle size={24} />
                </button>
            </nav>

            <div className="px-6 mt-6 space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Main Status Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-emerald-900/5 border border-white flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        {statusConfig.icon}
                    </div>

                    <div className={`w-20 h-20 rounded-3xl ${statusConfig.bg} flex items-center justify-center ${statusConfig.text} mb-4 shadow-inner`}>
                        {statusConfig.icon}
                    </div>
                    
                    <div className={`inline-flex items-center px-5 py-2 rounded-full ${statusConfig.color} text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-200`}>
                        {statusConfig.label}
                    </div>
                    
                    <h2 className="mt-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</h2>
                    <div className="flex items-center space-x-2 mt-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="text-base font-black text-slate-800 tracking-tight">#ORD-{order.id}</span>
                        <button onClick={() => handleCopy(`#ORD-${order.id}`)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg active:scale-90 transition-all">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                {/* Service & Target Information */}
                <div className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-emerald-900/5 border border-white space-y-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3.5 bg-blue-50 text-blue-500 rounded-2xl shadow-sm">
                            <Zap size={22} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Type</p>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{order.service.name}</p>
                            <span className="inline-block mt-2 text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                {order.service.category.name}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                            <Link2 size={22} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Account / Link</p>
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-sm font-bold text-emerald-700 truncate pr-2">{order.link}</p>
                                <a 
                                    href={order.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="shrink-0 p-1.5 bg-white text-emerald-600 rounded-lg shadow-sm active:scale-90 transition-all border border-emerald-50"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Statistics */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Quantity', val: order.quantity.toLocaleString(), icon: <Hash size={14} />, color: 'text-slate-800' },
                        { label: 'Start', val: order.start_count?.toLocaleString() ?? '—', icon: <UserPlus size={14} />, color: 'text-slate-800' },
                        { label: 'Remains', val: order.remains?.toLocaleString() ?? '—', icon: <Clock size={14} />, color: 'text-emerald-600' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-[2rem] border border-white shadow-lg shadow-emerald-900/5 text-center flex flex-col items-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                            <div className="p-2 bg-slate-50 rounded-xl mb-2 text-slate-300">
                                {stat.icon}
                            </div>
                            <span className={`text-sm font-black ${stat.color}`}>
                                {stat.val}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Billing Summary */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-900/20 space-y-5 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-20"></div>
                    
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 relative z-10">Billing Details</h4>
                    
                    <div className="flex justify-between items-center text-xs relative z-10">
                        <span className="text-slate-400 font-bold">Total Payment</span>
                        <span className="font-black">$ {Number(order.price_sale).toFixed(4)}</span>
                    </div>
                    
                    <div className="pt-5 border-t border-white/10 flex justify-between items-end relative z-10">
                        <div>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Final Amount Paid</p>
                            <h3 className="text-3xl font-black text-white leading-none">$ {Number(order.price_sale).toFixed(4)}</h3>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end text-[10px] font-bold text-slate-400 mb-1">
                                <Clock size={12} className="mr-1" /> {formattedDate}
                            </div>
                            <p className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase">{formattedTime}</p>
                        </div>
                    </div>
                </div>

                {/* Support Buttons */}
                <div className="flex flex-col items-center space-y-6 pt-4">
                    <button 
                        onClick={() => router.push('/user/tickets')}
                        className="group w-full py-5 rounded-[2.5rem] bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-sm flex items-center justify-center space-x-3 active:scale-[0.98] transition-all hover:bg-emerald-100"
                    >
                        <MessageSquare size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>Need Help with this Order?</span>
                    </button>
                    
                    <div className="flex flex-col items-center space-y-2 opacity-40">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em]">Processed via {order.api_provider?.name || 'Standard Matrix'}</p>
                        <div className="flex items-center space-x-2 text-[9px] font-bold">
                            <ShieldCheck size={12} />
                            <span>Verified Secure Transaction</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailClient;
