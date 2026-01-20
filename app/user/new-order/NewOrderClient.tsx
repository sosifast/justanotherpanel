'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Globe,
    ChevronDown,
    Layers,
    Package,
    Link as LinkIcon,
    Hash,
    Clock,
    RefreshCw,
    Loader2,
    CheckCircle,
    Info,
    Wallet,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';
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

    // Form state
    const [selectedPlatformId, setSelectedPlatformId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
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

    // Set initial platform from URL
    useEffect(() => {
        if (selectedPlatformSlug && !initialServiceId && platforms.length > 0) {
            const platform = platforms.find(p => p.slug === selectedPlatformSlug);
            if (platform) {
                setSelectedPlatformId(platform.id);
                setSelectedCategoryId(null);
                setSelectedServiceId(null);
            }
        }
    }, [selectedPlatformSlug, initialServiceId, platforms]);

    // Set initial service from URL
    useEffect(() => {
        if (initialServiceId && platforms.length > 0) {
            for (const p of platforms) {
                for (const c of p.categories) {
                    const s = c.services.find(svc => svc.id === initialServiceId);
                    if (s) {
                        setSelectedPlatformId(p.id);
                        setSelectedCategoryId(c.id);
                        setSelectedServiceId(s.id);
                        return;
                    }
                }
            }
        }
    }, [initialServiceId, platforms]);

    // Reset discount when service changes or price changes significantly (optional but safer)
    useEffect(() => {
        setAppliedDiscount(null);
        setDiscountCode('');
    }, [selectedServiceId]);

    // Get selected entities
    const selectedPlatform = useMemo(() =>
        platforms.find(p => p.id === selectedPlatformId) || null,
        [platforms, selectedPlatformId]
    );

    const selectedCategory = useMemo(() =>
        selectedPlatform?.categories.find(c => c.id === selectedCategoryId) || null,
        [selectedPlatform, selectedCategoryId]
    );

    const selectedService = useMemo(() =>
        selectedCategory?.services.find(s => s.id === selectedServiceId) || null,
        [selectedCategory, selectedServiceId]
    );

    // Calculate price
    const price = useMemo(() => {
        if (!selectedService || !user) return 0;

        const pricePerK = user.role === 'MEMBER'
            ? selectedService.price_sale
            : selectedService.price_reseller;

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

    // Handle platform change
    const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPlatformId(value ? parseInt(value) : null);
        setSelectedCategoryId(null);
        setSelectedServiceId(null);
    };

    // Handle category change
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedCategoryId(value ? parseInt(value) : null);
        setSelectedServiceId(null);
        setQuantity('');
        setComments('');
    };

    // Handle service change
    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedServiceId(value ? parseInt(value) : null);
        setQuantity('');
        setComments('');
        setRuns('');
        setInterval('');
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        if (!user) {
            toast.error('Please login to use discount');
            return;
        }
        if (price <= 0) {
            toast.error('Please enter a valid quantity first');
            return;
        }

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
                toast.error(data.error || 'Invalid discount code');
                setAppliedDiscount(null);
            } else {
                setAppliedDiscount(data.discount);
                toast.success(`Discount applied: -$${data.discount.amount.toFixed(4)}`);
            }
        } catch (error) {
            console.error('Discount validation error:', error);
            toast.error('Failed to validate discount');
        } finally {
            setValidatingDiscount(false);
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        toast.success('Discount removed');
    };

    // Submit order
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to place an order');
            return;
        }

        if (!selectedServiceId) {
            toast.error('Please select a service');
            return;
        }

        if (!link.trim()) {
            toast.error('Please enter a link/target');
            return;
        }

        if (selectedService?.type === 'CUSTOM_COMMENTS') {
            const commentCount = comments.split(/\r?\n/).filter(c => c.trim() !== '').length;
            if (commentCount === 0) {
                toast.error('Please enter at least one comment');
                return;
            }
        } else {
            const qty = parseInt(quantity) || 0;
            if (qty < (selectedService?.min || 0) || qty > (selectedService?.max || 0)) {
                toast.error(`Quantity must be between ${selectedService?.min} and ${selectedService?.max}`);
                return;
            }
        }

        if (finalPrice > user.balance) {
            toast.error('Insufficient balance');
            return;
        }

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

            if (!res.ok) {
                toast.error(data.error || 'Failed to place order');
                return;
            }

            toast.success(`Order placed successfully! Invoice: ${data.order.invoice_number}`);
            router.push('/user/history/order');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">New Order</h1>
                <p className="text-slate-500">Select a service and place your order.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Order Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-600" /> Order Details
                            </h2>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Platform Selection (only if NOT from URL) */}
                            {!selectedPlatformSlug && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Globe className="w-4 h-4 inline mr-1" /> Platform
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedPlatformId || ''}
                                            onChange={handlePlatformChange}
                                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        >
                                            <option value="">Select Platform</option>
                                            {platforms.map(platform => (
                                                <option key={platform.id} value={platform.id}>
                                                    {platform.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {/* Category Selection */}
                            {selectedPlatform && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Layers className="w-4 h-4 inline mr-1" /> Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedCategoryId || ''}
                                            onChange={handleCategoryChange}
                                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        >
                                            <option value="">Select Category</option>
                                            {selectedPlatform.categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name} ({category.services.length} services)
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {/* Service Selection */}
                            {selectedCategory && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Package className="w-4 h-4 inline mr-1" /> Service
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedServiceId || ''}
                                            onChange={handleServiceChange}
                                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        >
                                            <option value="">Select Service</option>
                                            {selectedCategory.services.map(service => (
                                                <option key={service.id} value={service.id}>
                                                    [ID: {service.id}] {service.name} - ${user?.role === 'MEMBER' ? service.price_sale.toFixed(4) : service.price_reseller.toFixed(4)}/1k
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>

                                    {/* Service Info */}
                                    {selectedService && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                <Hash className="w-3 h-3" /> Min: {selectedService.min.toLocaleString()}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                <Hash className="w-3 h-3" /> Max: {selectedService.max.toLocaleString()}
                                            </span>
                                            {selectedService.refill && (
                                                <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                    <RefreshCw className="w-3 h-3" /> Refill
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                {selectedService.type}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Link Input */}
                            {selectedService && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <LinkIcon className="w-4 h-4 inline mr-1" /> Link / Target
                                    </label>
                                    <input
                                        type="text"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="https://instagram.com/username"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    />
                                </div>
                            )}

                            {/* Quantity or Comments Input */}
                            {selectedService && selectedService.type === 'CUSTOM_COMMENTS' ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <MessageSquare className="w-4 h-4 inline mr-1" /> Comments
                                        <span className="text-slate-400 font-normal ml-2">(One comment per line)</span>
                                    </label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Nice post!&#10;Great content!&#10;Love this!"
                                        rows={6}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-mono"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        {comments.split(/\r?\n/).filter(c => c.trim() !== '').length} comments entered
                                    </p>
                                </div>
                            ) : selectedService && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <Hash className="w-4 h-4 inline mr-1" /> Quantity
                                        </label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            placeholder={`Min: ${selectedService.min} - Max: ${selectedService.max}`}
                                            min={selectedService.min}
                                            max={selectedService.max}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>

                                    {/* Optional Runs & Interval */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <Clock className="w-4 h-4 inline mr-1" /> Runs
                                                <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={runs}
                                                onChange={(e) => setRuns(e.target.value)}
                                                placeholder="Runs to deliver"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <Clock className="w-4 h-4 inline mr-1" /> Interval
                                                <span className="text-slate-400 font-normal ml-1">(Minutes)</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={interval}
                                                onChange={(e) => setInterval(e.target.value)}
                                                placeholder="Interval in minutes"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Service Note */}
                            {selectedService?.note && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-amber-800">{selectedService.note}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !selectedService}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Place Order
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
                        <div className="relative">
                            <p className="text-blue-100 text-sm mb-1">Your Balance</p>
                            <h3 className="text-2xl font-bold">${user?.balance.toFixed(2) || '0.00'}</h3>
                            <Link
                                href="/user/add-funds"
                                className="inline-flex items-center gap-1 mt-3 text-sm text-white/80 hover:text-white"
                            >
                                <Wallet className="w-4 h-4" /> Add Funds
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-semibold text-slate-900">Order Summary</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {selectedPlatform && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Platform</span>
                                    <span className="font-medium text-slate-900">{selectedPlatform.name}</span>
                                </div>
                            )}
                            {selectedCategory && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Category</span>
                                    <span className="font-medium text-slate-900">{selectedCategory.name}</span>
                                </div>
                            )}
                            {selectedService && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Service ID</span>
                                        <span className="font-medium text-slate-900">#{selectedService.id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Rate</span>
                                        <span className="font-medium text-emerald-600">
                                            ${user?.role === 'MEMBER'
                                                ? selectedService.price_sale.toFixed(4)
                                                : selectedService.price_reseller.toFixed(4)}/1k
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Quantity</span>
                                        <span className="font-medium text-slate-900">
                                            {selectedService.type === 'CUSTOM_COMMENTS'
                                                ? `${comments.split(/\r?\n/).filter(c => c.trim() !== '').length} comments`
                                                : quantity || '0'
                                            }
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="border-t border-slate-100 pt-3 mt-3">
                                {/* Discount Section */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Discount Code
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                placeholder="Enter Code"
                                                disabled={!!appliedDiscount}
                                                className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase"
                                            />
                                        </div>
                                        {appliedDiscount ? (
                                            <button
                                                type="button"
                                                onClick={handleRemoveDiscount}
                                                className="w-full h-10 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleApplyDiscount}
                                                disabled={!discountCode || validatingDiscount}
                                                className="w-full h-10 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                {validatingDiscount ? '...' : 'Apply'}
                                            </button>
                                        )}
                                    </div>
                                    {appliedDiscount && (
                                        <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Code applied: -${Number(appliedDiscount.amount.toFixed(4))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-slate-500">Subtotal</span>
                                    <span className="font-medium text-slate-900">${Number(price.toFixed(4))}</span>
                                </div>

                                {appliedDiscount && (
                                    <div className="flex justify-between items-center mb-1 text-emerald-600">
                                        <span className="text-sm">Discount</span>
                                        <span className="font-medium">-${Number(appliedDiscount.amount.toFixed(4))}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                                    <span className="font-medium text-slate-900">Total</span>
                                    <span className={`text-xl font-bold ${finalPrice > (user?.balance || 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                                        ${Number(finalPrice.toFixed(4))}
                                    </span>
                                </div>
                                {finalPrice > (user?.balance || 0) && (
                                    <p className="text-xs text-red-500 mt-1">Insufficient balance</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewOrderClient;
