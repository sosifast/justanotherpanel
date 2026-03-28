'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  ShoppingCart,
  Eye,
  Layers,
  CheckCircle2,
  Tag,
  Hash,
  ArrowRight,
  Info,
  X,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { Service, Category, Platform } from '@prisma/client';
import { useRouter } from 'next/navigation';

type ServiceClient = Omit<Service, 'price_api' | 'price_sale' | 'price_reseller'> & {
  price_api: number;
  price_sale: number;
  price_reseller: number;
};

type ServiceWithCategory = ServiceClient & {
  category: Category & {
    platform: Platform;
  };
};

interface ServicesViewProps {
  initialServices: ServiceWithCategory[];
  avgTimeMap: Record<number, number>;
  userRole: string;
}

function formatAvgTime(minutes: number | undefined): string {
  if (!minutes || minutes <= 0) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const ServicesView = ({ initialServices, avgTimeMap, userRole }: ServicesViewProps) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Get unique platforms from services
  const platforms = ['all', ...Array.from(new Set(initialServices.map(s => s.category.platform.name)))];

  const filteredServices = initialServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.id.toString().includes(search);
    const matchesPlatform = platform === 'all' || service.category.platform.name === platform;
    return matchesSearch && matchesPlatform;
  });

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize));

  // Reset to page 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, platform, pageSize]);

  // Handle click outside for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedServices = filteredServices.slice(startIndex, startIndex + pageSize);

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, safePage - delta); i <= Math.min(totalPages, safePage + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none">
      
      {/* Header Sticky Container */}
      <div className="bg-white sticky top-0 z-40 border-b border-emerald-50 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/user')}
                className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight uppercase italic">Service</h2>
            </div>
            
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2.5 rounded-xl transition-all ${isFilterOpen ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-emerald-50 text-emerald-600'}`}
              >
                <Filter size={20} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-emerald-50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-5 border-b border-emerald-50 bg-emerald-50/20">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Filter Parameters</p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Platform</label>
                      <select 
                        value={platform}
                        onChange={(e) => {
                          setPlatform(e.target.value);
                          setIsFilterOpen(false);
                        }}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {platforms.map(p => (
                          <option key={p} value={p}>{p === 'all' ? 'All Networks' : p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Page Size</label>
                      <select 
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setIsFilterOpen(false);
                        }}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {PAGE_SIZE_OPTIONS.map(size => (
                          <option key={size} value={size}>{size} per page</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Persistent Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by ID or service name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none text-sm font-bold placeholder:text-slate-300 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Service List with Initial High-Fidelity Cards */}
      <div className="p-6 space-y-5">
        
        {/* Results Counter */}
        <div className="flex items-center justify-between px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
          <span>{filteredServices.length} Service Found</span>
          {platform !== 'all' && <span className="text-emerald-500">Filtered by {platform}</span>}
        </div>

        <div className="space-y-4">
          {pagedServices.length > 0 ? (
            pagedServices.map((service) => (
              <div 
                key={service.id}
                className="bg-white border border-emerald-50 rounded-[2.5rem] p-5 shadow-sm active:scale-[0.99] transition-all group hover:shadow-md hover:border-emerald-100"
              >
                <div className="flex items-start">
                  <div className="shrink-0 w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    {service.category.platform.icon_imagekit_url ? (
                      <img src={service.category.platform.icon_imagekit_url} className="w-6 h-6 object-contain" alt="pf" />
                    ) : (
                      <Smartphone size={22} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 ml-4">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight line-clamp-1 pr-4 group-hover:text-emerald-600 transition-colors">
                        {service.name}
                      </h4>
                      <span className="text-[11px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg shrink-0 border border-slate-100 shadow-sm transition-transform active:rotate-3">#{service.id}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <span>{service.category.platform.name}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="truncate">{service.category.name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 mt-4">
                  <Link 
                    href={`/user/services/${service.id}`}
                    className="flex-1 py-3 bg-white border border-slate-100 text-slate-900 font-extrabold text-[10px] rounded-2xl uppercase tracking-widest italic flex items-center justify-center space-x-2 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                  >
                    <Info size={14} />
                    <span>View Detail</span>
                  </Link>
                  <Link 
                    href={`/user/new-order?service=${service.id}`}
                    className="flex-1 py-3 bg-emerald-600 text-white font-extrabold text-[10px] rounded-2xl uppercase tracking-widest italic flex items-center justify-center space-x-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-100"
                  >
                    <ShoppingCart size={14} />
                    <span>Order Now</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-200 mb-6 animate-pulse">
                <Search size={40} />
              </div>
              <h3 className="font-black text-slate-800 uppercase italic tracking-tight">Zero Results</h3>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 px-12 leading-relaxed">Adjust your filter parameters or try a different frequency search.</p>
              <button 
                onClick={() => {setSearch(''); setPlatform('all');}}
                className="mt-6 text-[10px] font-black text-emerald-600 underline uppercase tracking-widest italic"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="pt-6 flex flex-col items-center space-y-4">
            <div className="flex items-center bg-white border border-emerald-50 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-3 text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center px-2">
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-full text-xs font-black transition-all ${
                      page === safePage
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-110'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-3 text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
              Level {safePage} of {totalPages}
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ServicesView;
