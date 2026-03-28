'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Search, 
  ArrowDownLeft, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  History,
  X,
  RotateCcw,
  Eye,
  Info,
  ArrowUpRight
} from 'lucide-react';
import { Deposits } from '@prisma/client';
import { format } from 'date-fns';
import DepositDetailsModal from './DepositDetailsModal';
import Link from 'next/link';

interface TransactionDetail {
    fee?: number;
    method?: string;
    provider?: string;
    transactionId?: string;
    payment_url?: string;
    paypal_order_id?: string;
}

interface SerializedDeposit extends Omit<Deposits, 'amount'> {
    amount: number;
}

interface DepositsViewProps {
    initialDeposits: SerializedDeposit[];
}

const DepositsView = ({ initialDeposits }: DepositsViewProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [methodFilter, setMethodFilter] = useState('All');
    const [selectedDeposit, setSelectedDeposit] = useState<SerializedDeposit | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const methods = ['All', 'PayPal', 'Cryptomus', 'Manual'];
    const statuses = ['All', 'PAYMENT', 'PENDING', 'ERROR', 'CANCELED'];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAYMENT':
                return 'bg-emerald-50 text-emerald-600';
            case 'PENDING':
                return 'bg-amber-50 text-amber-600';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-red-50 text-red-600';
            default:
                return 'bg-slate-50 text-slate-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAYMENT': return 'Success';
            case 'PENDING': return 'Pending';
            case 'ERROR': return 'Failed';
            case 'CANCELED': return 'Canceled';
            default: return status;
        }
    };

    const handleViewDetails = (deposit: SerializedDeposit) => {
        setSelectedDeposit(deposit);
        setIsModalOpen(true);
    };

    const filteredDeposits = initialDeposits.filter(deposit => {
        const details = deposit.detail_transaction as unknown as TransactionDetail;
        const depositMethod = details?.method || details?.provider || 'Unknown';
        const transactionId = details?.transactionId || '';

        const matchesSearch = deposit.id.toString().includes(searchQuery) ||
            transactionId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || deposit.status === statusFilter;
        const matchesMethod = methodFilter === 'All' || depositMethod === methodFilter;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const resetFilters = () => {
        setStatusFilter('All');
        setMethodFilter('All');
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
                        <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight uppercase italic">DEPOSITS</h2>
                    </div>
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className={`p-2.5 rounded-xl border transition-all ${
                            statusFilter !== 'All' || methodFilter !== 'All' 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-50'
                        }`}
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search ID or transaction..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm placeholder:text-slate-300 font-bold"
                    />
                </div>
            </div>

            {/* Active Filters Tag Display */}
            {(statusFilter !== 'All' || methodFilter !== 'All') && (
                <div className="px-6 mt-4 flex flex-wrap gap-2">
                    {statusFilter !== 'All' && (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center tracking-widest">
                            Status: {statusFilter}
                            <button onClick={() => setStatusFilter('All')} className="ml-2 hover:text-emerald-800"><X size={12} /></button>
                        </span>
                    )}
                    {methodFilter !== 'All' && (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center tracking-widest">
                            Method: {methodFilter}
                            <button onClick={() => setMethodFilter('All')} className="ml-2 hover:text-emerald-800"><X size={12} /></button>
                        </span>
                    )}
                </div>
            )}

            {/* Transaction List */}
            <div className="p-6 space-y-4">
                {filteredDeposits.length > 0 ? (
                    filteredDeposits.map((item) => {
                        const details = item.detail_transaction as unknown as TransactionDetail;
                        const method = details?.method || details?.provider || 'Gateway';
                        
                        return (
                            <div 
                                key={item.id} 
                                onClick={() => handleViewDetails(item)}
                                className="p-4 bg-white border border-emerald-50 rounded-[2rem] flex justify-between items-center shadow-sm active:scale-[0.98] transition-all hover:shadow-md hover:border-emerald-100 group cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-4 rounded-2xl transition-all group-hover:scale-105 ${
                                        item.status === 'ERROR' || item.status === 'CANCELED' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600 shadow-sm'
                                    }`}>
                                        <ArrowDownLeft size={18} strokeWidth={3} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-slate-800 line-clamp-1 leading-tight group-hover:text-emerald-600 transition-colors">Deposit via {method}</h4>
                                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span className="flex items-center"><Calendar size={10} className="mr-1 opacity-60" /> {format(new Date(item.created_at), 'dd MMM yyyy')}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="flex items-center"><Clock size={10} className="mr-1 opacity-60" /> {format(new Date(item.created_at), 'HH:mm')}</span>
                                        </div>
                                        <p className="text-[9px] font-black text-slate-300 tracking-[0.2em] uppercase italic bg-slate-50 inline-block px-1.5 py-0.5 rounded-md mt-1">#DEP-{item.id}</p>
                                    </div>
                                </div>

                                <div className="text-right space-y-1.5 min-w-[90px]">
                                    <p className={`text-sm font-black ${item.status === 'PAYMENT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        +${Number(item.amount).toFixed(2)}
                                    </p>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${getStatusStyle(item.status)}`}>
                                        {item.status === 'PAYMENT' ? (
                                            <CheckCircle2 size={10} className="mr-1" />
                                        ) : item.status === 'PENDING' ? (
                                            <Clock size={10} className="mr-1" />
                                        ) : (
                                            <XCircle size={10} className="mr-1" />
                                        )}
                                        {getStatusLabel(item.status)}
                                    </div>
                                    <div className="flex items-center justify-end space-x-1 mt-1">
                                        {item.status === 'PENDING' && (details?.payment_url || details?.paypal_order_id) && (
                                            <a
                                                href={details?.payment_url || `https://www.paypal.com/checkoutnow?token=${details?.paypal_order_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 px-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all flex items-center space-x-1"
                                                title="Pay Now"
                                            >
                                                <CreditCard size={12} strokeWidth={3} />
                                                <span className="text-[8px] font-bold uppercase tracking-tighter">Pay</span>
                                            </a>
                                        )}
                                        <div className="p-1 px-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                            <Info size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* Empty State */
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-200 shadow-inner">
                            <History size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-slate-900 uppercase">Archive Is Empty</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-10 leading-relaxed">No deposit records found in this temporal slice.</p>
                            {(statusFilter !== 'All' || methodFilter !== 'All') && (
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
                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-4 ml-1">Deposit Status</label>
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
                                        {status === 'All' ? 'ANY' : getStatusLabel(status)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Section: Method */}
                        <div className="mb-10 relative z-10">
                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-4 ml-1">Payment Method</label>
                            <div className="grid grid-cols-3 gap-3">
                                {methods.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMethodFilter(m)}
                                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${
                                            methodFilter === m 
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100' 
                                            : 'bg-slate-50 text-slate-400 border-slate-50 hover:bg-slate-100'
                                        }`}
                                    >
                                        {m}
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

            <DepositDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deposit={selectedDeposit as any}
            />

        </div>
    );
};

export default DepositsView;
