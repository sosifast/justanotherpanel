'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    ChevronLeft,
    Search,
    Ticket,
    CheckCircle2,
    ArrowRight,
    Layers,
    ChevronDown,
    X,
    Sparkles,
    Info,
    Link as LinkIcon,
    Hash,
    MessageSquare,
    Loader2,
    Wallet
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Service = {
    id: number;
    name: string;
    min: number;
    max: number;
    price_sale: number;
    price_reseller: number;
    refill: boolean;
    type: string;
    note: string | null;
};

type Category = {
    id: number;
    name: string;
    services: Service[];
};

type Platform = {
    id: number;
    name: string;
    slug: string;
    icon_imagekit_url: string | null;
    categories: Category[];
};

type User = {
    id: number;
    balance: number;
    role: string;
} | null;

type Props = {
    platforms: Platform[];
    selectedPlatformSlug: string | null;
    selectedServiceId?: number | null;
    user: User;
};

const NewOrderClient = ({ platforms, selectedPlatformSlug, selectedServiceId: initialServiceId, user }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    // Form state
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState('');
    const [comments, setComments] = useState('');
    const [runs, setRuns] = useState('');
    const [interval, setInterval] = useState('');

    // Discount state
    const [discountCode, setDiscountCode] = useState('');
    const [validatingDiscount, setValidatingDiscount] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState<{
        id: number;
        code: string;
        amount: number;
        type: string;
    } | null>(null);

    // Flatten services for the searchable select
    const allServices = useMemo(() => {
        const list: (Service & { platformName: string; categoryName: string; platformId: number; categoryId: number })[] = [];
        platforms.forEach(p => {
            p.categories.forEach(c => {
                c.services.forEach(s => {
                    list.push({ 
                        ...s, 
                        platformName: p.name, 
                        categoryName: c.name,
                        platformId: p.id,
                        categoryId: c.id
                    });
                });
            });
        });
        return list;
    }, [platforms]);

    // Filtered services based on search
    const filteredServices = useMemo(() => {
        if (!searchQuery) return allServices;
        const query = searchQuery.toLowerCase();
        return allServices.filter(s => 
            s.name.toLowerCase().includes(query) || 
            s.platformName.toLowerCase().includes(query) || 
            s.categoryName.toLowerCase().includes(query) ||
            s.id.toString().includes(query)
        );
    }, [allServices, searchQuery]);

    // Selected service object
    const selectedService = useMemo(() => 
        allServices.find(s => s.id === selectedServiceId) || null,
    [allServices, selectedServiceId]);

    // Set initial service from URL
    useEffect(() => {
        if (initialServiceId) {
            setSelectedServiceId(initialServiceId);
        } else if (selectedPlatformSlug) {
            // Find first service from this platform
            const platform = platforms.find(p => p.slug === selectedPlatformSlug);
            if (platform && platform.categories.length > 0 && platform.categories[0].services.length > 0) {
                // We don't auto-select to avoid confusion, but we could
            }
        }
    }, [initialServiceId, selectedPlatformSlug, platforms]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsSelectOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Price calculation
    const price = useMemo(() => {
        if (!selectedService || !user) return 0;
        const pricePerK = user.role === 'MEMBER' ? selectedService.price_sale : selectedService.price_reseller;
        
        if (selectedService.type === 'CUSTOM_COMMENTS') {
            const commentCount = comments.split(/\r?\n/).filter(c => c.trim() !== '').length;
            return (pricePerK / 1000) * commentCount;
        }
        
        const qty = parseInt(quantity) || 0;
        return (pricePerK / 1000) * qty;
    }, [selectedService, quantity, comments, user]);

    const finalPrice = useMemo(() => {
        if (!appliedDiscount) return price;
        return Math.max(0, price - appliedDiscount.amount);
    }, [price, appliedDiscount]);

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        if (!user) return toast.error('Please login to use discount');
        if (price <= 0) return toast.error('Enter valid quantity/comments first');

        setValidatingDiscount(true);
        try {
            const res = await fetch('/api/user/discount/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: discountCode,
                    userId: user.id,
                    totalPrice: price,
                    serviceId: selectedServiceId
                })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Invalid code');
                setAppliedDiscount(null);
            } else {
                setAppliedDiscount(data.discount);
                toast.success(`Discount applied: -$${data.discount.amount.toFixed(4)}`);
            }
        } catch (error) {
            toast.error('Failed to validate discount');
        } finally {
            setValidatingDiscount(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) return toast.error('Please login');
        if (!selectedServiceId) return toast.error('Select a service');
        if (!link.trim()) return toast.error('Enter target link');

        if (selectedService?.type === 'CUSTOM_COMMENTS') {
            const count = comments.split(/\r?\n/).filter(c => c.trim() !== '').length;
            if (count === 0) return toast.error('Enter comments');
        } else {
            const qty = parseInt(quantity) || 0;
            if (qty < (selectedService?.min || 0) || qty > (selectedService?.max || 0)) {
                return toast.error(`Quantity: ${selectedService?.min} - ${selectedService?.max}`);
            }
        }

        if (finalPrice > user.balance) return toast.error('Insufficient balance');

        setLoading(true);
        try {
            const res = await fetch('/api/user/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    serviceId: selectedServiceId,
                    link: link.trim(),
                    quantity: selectedService?.type === 'CUSTOM_COMMENTS' ? undefined : quantity,
                    comments: selectedService?.type === 'CUSTOM_COMMENTS' ? comments : undefined,
                    runs: runs || undefined,
                    interval: interval || undefined,
                    discountCode: appliedDiscount ? appliedDiscount.code : undefined
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to place order');
            
            toast.success('Order placed successfully!');
            router.push('/user/history/order');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none relative">
            
            {/* Header Navigation Standardized */}
            <div className="p-6 bg-white sticky top-0 z-50 border-b border-emerald-50">
                <div className="flex items-center">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight uppercase italic">Order Details</h2>
                </div>
            </div>

            <div className="px-6 space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Searchable Select Section */}
                <section className="relative" ref={selectRef}>
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-emerald-900/5 border border-white">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 ml-1">Select Service</label>
                        
                        <button 
                          onClick={() => setIsSelectOpen(!isSelectOpen)}
                          className={`w-full flex items-center justify-between p-4 bg-slate-50 border-2 rounded-2xl transition-all ${
                            isSelectOpen ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/5' : 'border-emerald-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden text-left">
                            <Layers className={selectedService ? 'text-emerald-500' : 'text-slate-300'} size={20} />
                            <span className={`text-sm font-bold truncate ${selectedService ? 'text-slate-800' : 'text-slate-300'}`}>
                              {selectedService ? selectedService.name : 'Choose a service...'}
                            </span>
                          </div>
                          <ChevronDown className={`text-slate-300 transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`} size={20} />
                        </button>

                        {isSelectOpen && (
                          <div className="absolute left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-emerald-50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="p-4 border-b border-slate-50">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input 
                                  type="text"
                                  autoFocus
                                  placeholder="Search service by name, platform, id..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:bg-white border border-transparent focus:border-emerald-100 transition-all font-sans"
                                />
                              </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                              {filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                  <button
                                    key={service.id}
                                    onClick={() => {
                                      setSelectedServiceId(service.id);
                                      setIsSelectOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className="w-full px-6 py-4 text-left hover:bg-emerald-50 flex items-center justify-between group transition-colors"
                                  >
                                    <div className="pr-4">
                                      <p className={`text-sm font-bold ${selectedServiceId === service.id ? 'text-emerald-600' : 'text-slate-700'}`}>
                                        <span className="opacity-40 font-mono text-xs mr-1">#{service.id}</span>
                                        {service.name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{service.platformName} / {service.categoryName}</p>
                                      <p className="text-[10px] text-emerald-500 font-bold mt-1 tracking-tight">
                                          ${user?.role === 'MEMBER' ? service.price_sale.toFixed(4) : service.price_reseller.toFixed(4)} / 1k
                                      </p>
                                    </div>
                                    {selectedServiceId === service.id && <CheckCircle2 size={18} className="text-emerald-500" />}
                                  </button>
                                ))
                              ) : (
                                <div className="p-8 text-center">
                                  <p className="text-xs font-bold text-slate-400 italic">No services found...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedService && (
                            <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in zoom-in duration-300">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    <Hash className="w-3 h-3" /> Min: {selectedService.min}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    <Hash className="w-3 h-3" /> Max: {selectedService.max}
                                </span>
                                {selectedService.refill && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" /> Refill Enabled
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Form Inputs (Link & Quantity/Comments) */}
                {selectedService && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Link Card */}
                        <section className="bg-white rounded-[2rem] p-6 shadow-xl shadow-emerald-900/5 border border-white">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 ml-1">Target Link</label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input 
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://platform.com/profile-or-post"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-emerald-50 rounded-2xl text-sm font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </section>

                        {/* Quantity / Comments Card */}
                        <section className="bg-white rounded-[2rem] p-6 shadow-xl shadow-emerald-900/5 border border-white">
                            {selectedService.type === 'CUSTOM_COMMENTS' ? (
                                <>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 ml-1">Comments (One per line)</label>
                                    <div className="relative group">
                                        <MessageSquare className="absolute left-4 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                        <textarea 
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            rows={5}
                                            placeholder="Write comments here..."
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-emerald-50 rounded-2xl text-sm font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none font-sans"
                                        />
                                    </div>
                                    <p className="mt-3 text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
                                        {comments.split(/\r?\n/).filter(c => c.trim() !== '').length} Comments Counted
                                    </p>
                                </>
                            ) : (
                                <>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 ml-1">Total Quantity</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                        <input 
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            placeholder={`Min ${selectedService.min} - Max ${selectedService.max}`}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-emerald-50 rounded-2xl text-sm font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    
                                    {/* Drip-feed Options */}
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Runs (Optional)</label>
                                            <input 
                                                type="number" value={runs} onChange={(e) => setRuns(e.target.value)}
                                                className="w-full p-3.5 bg-slate-50 border-2 border-emerald-50 rounded-xl text-xs font-bold focus:border-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Interval (Min)</label>
                                            <input 
                                                type="number" value={interval} onChange={(e) => setInterval(e.target.value)}
                                                className="w-full p-3.5 bg-slate-50 border-2 border-emerald-50 rounded-xl text-xs font-bold focus:border-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                )}

                {/* Voucher Section */}
                <section>
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-emerald-900/5 border border-white">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 ml-1">Promotional Code</label>
                        <div className="flex space-x-3">
                            <div className="relative flex-1 group">
                                <Ticket className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${appliedDiscount ? 'text-emerald-500' : 'text-slate-300 group-focus-within:text-emerald-500'}`} size={20} />
                                <input 
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => {
                                        setDiscountCode(e.target.value.toUpperCase());
                                        setAppliedDiscount(null);
                                    }}
                                    disabled={!!appliedDiscount}
                                    placeholder="HAVE A CODE?"
                                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm font-black outline-none border-2 transition-all tracking-widest placeholder:tracking-normal placeholder:font-bold ${
                                        appliedDiscount 
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                                        : 'border-emerald-50 focus:border-emerald-500 focus:bg-white'
                                    }`}
                                />
                                {appliedDiscount && (
                                    <button 
                                        onClick={() => {setAppliedDiscount(null); setDiscountCode('');}}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {!appliedDiscount && (
                                <button 
                                    onClick={handleApplyDiscount}
                                    disabled={discountCode.length < 3 || validatingDiscount}
                                    className={`px-6 rounded-2xl font-black text-xs transition-all ${
                                        discountCode.length >= 3 
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 active:scale-95' 
                                        : 'bg-emerald-50 text-emerald-300 cursor-not-allowed'
                                    }`}
                                >
                                    {validatingDiscount ? '...' : 'Apply'}
                                </button>
                            )}
                        </div>
                        {appliedDiscount && (
                            <div className="mt-4 flex items-center space-x-2 text-emerald-600 animate-in slide-in-from-left duration-300">
                                <Sparkles size={14} />
                                <p className="text-[10px] font-black uppercase tracking-wider">Discount of ${appliedDiscount.amount.toFixed(4)} applied!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Summary Section / Price Visualization */}
                {selectedService && (
                    <section className="bg-white rounded-[2rem] p-6 shadow-xl shadow-emerald-900/5 border border-white">
                        <div className="flex items-center justify-between mb-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Subtotal</p>
                             <p className="text-sm font-bold text-slate-700">${price.toFixed(4)}</p>
                        </div>
                        {appliedDiscount && (
                            <div className="flex items-center justify-between mb-2 text-emerald-600">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">Applied Discount</p>
                                <p className="text-sm font-bold">-${appliedDiscount.amount.toFixed(4)}</p>
                            </div>
                        )}
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-2">
                             <p className="text-sm font-black text-slate-900 uppercase">Total Payment</p>
                             <p className={`text-xl font-black tracking-tighter ${finalPrice > (user?.balance || 0) ? 'text-rose-500' : 'text-emerald-600'}`}>${finalPrice.toFixed(4)}</p>
                        </div>
                        {finalPrice > (user?.balance || 0) && (
                            <p className="mt-2 text-rose-500 text-[10px] font-bold uppercase tracking-wider text-right">Insufficient Balance ⚠️</p>
                        )}
                    </section>
                )}

                {/* Quick Note */}
                <section className="bg-emerald-50/50 border-2 border-dashed border-emerald-100 rounded-[2.5rem] p-6 flex items-start space-x-4">
                  <Info size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-emerald-700">Quick Note</h5>
                    <p className="text-[10px] text-emerald-600 leading-relaxed font-medium">
                      {(selectedService?.note) || "Please make sure to double check your target link before proceeding. Refunds are not available for invalid links."}
                    </p>
                  </div>
                </section>

            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-emerald-50/50 z-50 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={handleSubmit}
                  disabled={!selectedService || loading || finalPrice > (user?.balance || 0)}
                  className={`w-full py-5 rounded-[2rem] font-black text-sm tracking-tight flex items-center justify-center space-x-3 transition-all ${
                    selectedService && !loading && finalPrice <= (user?.balance || 0)
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 active:scale-[0.98]' 
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                      <Loader2 size={24} className="animate-spin" />
                  ) : (
                      <>
                        <span>ORDER</span>
                        <ArrowRight size={20} strokeWidth={3} />
                      </>
                  )}
                </button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>
        </div>
    );
};

export default NewOrderClient;
