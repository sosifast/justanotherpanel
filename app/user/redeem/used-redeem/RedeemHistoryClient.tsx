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
  History,
  X,
  RotateCcw,
  Ticket
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

type HistoryItem = {
    id: number;
    created_at: string;
    redeem_code: {
        name_code: string;
        get_balance: number;
    };
};

const RedeemHistoryClient = ({ initialHistory }: { initialHistory: HistoryItem[] }) => {
  const [history] = useState(initialHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.redeem_code.name_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.id.toString().includes(searchQuery);
    
    // For redeem history, most are 'Success' by default if they are in history
    const matchesStatus = statusFilter === 'All' || 'Success' === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const resetFilters = () => {
    setStatusFilter('All');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-10 select-none relative">
      
      {/* Header */}
      <div className="p-6 bg-white sticky top-0 z-40 border-b border-emerald-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/user/redeem/claim" className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform">
              <ChevronLeft size={24} />
            </Link>
            <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight">Redeem History</h2>
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`p-2.5 rounded-xl border transition-all ${
              statusFilter !== 'All' 
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
            placeholder="Search redemption codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Active Filters Tag Display */}
      {statusFilter !== 'All' && (
        <div className="px-6 mt-4 flex flex-wrap gap-2">
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-bold border border-emerald-100 flex items-center">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('All')} className="ml-2"><X size={12} /></button>
            </span>
        </div>
      )}

      {/* Transaction List */}
      <div className="p-6 space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div 
              key={item.id} 
              className="p-4 bg-white border border-emerald-50 rounded-[2rem] flex justify-between items-center shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <Ticket size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1 italic uppercase tracking-tight">{item.redeem_code.name_code}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center"><Calendar size={10} className="mr-1" /> {format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                    <span>•</span>
                    <span className="flex items-center"><Clock size={10} className="mr-1" /> {format(new Date(item.created_at), 'HH:mm')}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 tracking-wider uppercase">RID-{item.id}</p>
                </div>
              </div>

              <div className="text-right space-y-1.5">
                <p className="text-sm font-black text-emerald-600 italic">
                  +${Number(item.redeem_code.get_balance).toFixed(2)}
                </p>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={10} className="mr-1" />
                  Success
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-200">
              <History size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 uppercase italic tracking-tight">No history found</h3>
              <p className="text-xs text-slate-400 px-10 leading-relaxed font-medium">Try adjusting your filters or search query in the rewards matrix.</p>
              {statusFilter !== 'All' && (
                <button 
                  onClick={resetFilters}
                  className="mt-4 text-emerald-600 font-bold text-xs flex items-center mx-auto uppercase tracking-widest"
                >
                  <RotateCcw size={14} className="mr-2" /> Reset Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsFilterOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] p-8 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Filter Results</h3>
              <button 
                onClick={resetFilters}
                className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest"
              >
                <RotateCcw size={14} className="mr-1.5" /> Reset
              </button>
            </div>

            <div className="mb-10">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4 ml-1">Redemption Status</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Success', 'Pending', 'Failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-bold transition-all border ${
                      statusFilter === status 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' 
                      : 'bg-slate-50 text-slate-500 border-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsFilterOpen(false)}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm active:scale-[0.98] transition-all uppercase tracking-[0.2em] italic"
            >
              Analyze Data
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RedeemHistoryClient;
