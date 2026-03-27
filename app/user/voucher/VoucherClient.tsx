'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Search, 
  Ticket, 
  Clock, 
  Copy, 
  CheckCircle2,
  Gift,
  Tag,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type SerializedDiscount = {
    id: number;
    name_discount: string;
    amount: number;
    type: 'PERCENTAGE' | 'FIXED';
    min_transaction: number;
    max_transaction: number;
    discount_max_get: number;
    expired_date: string;
    max_used: number;
    usage_count: number;
    status: string;
};

const VoucherClient = ({ discounts }: { discounts: SerializedDiscount[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied!`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredVouchers = discounts.filter(v => {
    const matchesSearch = v.name_discount.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isExpired = new Date(v.expired_date) < new Date();
    const currentStatus = isExpired ? 'Expired' : (v.usage_count >= v.max_used ? 'Used' : 'Active');
    
    const matchesFilter = activeFilter === 'All' || currentStatus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-10 select-none">
      
      {/* Header */}
      <div className="p-6 bg-white sticky top-0 z-40 border-b border-emerald-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/user" className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform">
              <ChevronLeft size={24} />
            </Link>
            <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight">My Vouchers</h2>
          </div>
          {/* Tag icon removed */}
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Enter voucher code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
          {['All', 'Active', 'Used', 'Expired'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all ${
                activeFilter === filter 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                : 'bg-emerald-50/50 text-emerald-600 border border-emerald-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Voucher List */}
        <div className="space-y-5">
          {filteredVouchers.length > 0 ? (
            filteredVouchers.map((voucher) => {
                const isExpired = new Date(voucher.expired_date) < new Date();
                const isFullyUsed = voucher.usage_count >= voucher.max_used;
                const status = isExpired ? 'Expired' : (isFullyUsed ? 'Used' : 'Active');

                return (
                    <div 
                        key={voucher.id} 
                        className={`relative bg-white border rounded-[2rem] overflow-hidden transition-all shadow-sm ${
                            status === 'Expired' ? 'border-slate-100 opacity-60' : 'border-emerald-100 hover:shadow-md'
                        }`}
                    >
                        {/* Decorative Half Circles (Voucher Look) */}
                        <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white border border-emerald-50 rounded-full z-10 shadow-inner"></div>
                        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-white border border-emerald-50 rounded-full z-10 shadow-inner"></div>

                        <div className="flex flex-col p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-2xl ${
                                        status === 'Expired' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        <Gift size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 tracking-tight">
                                            {voucher.amount}{voucher.type === 'PERCENTAGE' ? '%' : ' OFF'} Discount
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-medium capitalize">{voucher.type.toLowerCase()} Promo</p>
                                    </div>
                                </div>
                                {status === 'Active' && (
                                    <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                        Active
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                Get {voucher.amount}{voucher.type === 'PERCENTAGE' ? '%' : ' OFF'} off with minimum transaction of ${voucher.min_transaction}.
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-dashed border-emerald-100">
                                <div className="flex items-center space-x-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                    <Clock size={14} />
                                    <span>{isExpired ? 'Expired' : `Expires ${new Date(voucher.expired_date).toLocaleDateString()}`}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] font-black text-slate-600 tracking-widest">
                                        {voucher.name_discount}
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(voucher.name_discount, voucher.id)}
                                        disabled={status === 'Expired'}
                                        className={`p-2 rounded-xl transition-all active:scale-90 ${
                                            copiedId === voucher.id 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'bg-emerald-50 text-emerald-600'
                                        }`}
                                    >
                                        {copiedId === voucher.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-200 mb-4">
                <Ticket size={40} />
              </div>
              <h3 className="font-bold text-slate-800">No vouchers found</h3>
              <p className="text-xs text-slate-400 px-10 mt-1">Try a different search or check back later for new promos.</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100 flex items-start space-x-4">
          <Info size={20} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-black text-emerald-700">How to use?</h5>
            <p className="text-[10px] text-emerald-600 leading-relaxed font-medium">
              Copy the code and paste it on the checkout page of the corresponding service to enjoy your discount.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
};

export default VoucherClient;
