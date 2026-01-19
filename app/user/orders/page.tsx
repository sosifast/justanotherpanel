'use client';

import React, { useState } from 'react';
import {
    ShoppingCart,
    Package,
    Clock,
    TrendingUp,
    ChevronDown,
    Info,
    Plus,
    FileText,
    AlertCircle
} from 'lucide-react';

const OrdersPage = () => {
    const [category, setCategory] = useState('');
    const [service, setService] = useState('');
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState('single');

    // Mock service data
    const selectedService = {
        name: 'Instagram Followers | Max 500k | No Refill | Instant',
        min: 100,
        max: 500000,
        rate: 0.50,
        avgTime: '0-1 hr',
        description: 'High quality followers with instant delivery. No refill guarantee.',
    };

    const charge = quantity ? (parseFloat(quantity) / 1000 * selectedService.rate).toFixed(2) : '0.00';

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">New Order</h1>
                <p className="text-slate-500">Place a new order for SMM services</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Order Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Order Type Tabs */}
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setOrderType('single')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${orderType === 'single'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Single Order
                                </div>
                            </button>
                            <button
                                onClick={() => setOrderType('mass')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${orderType === 'mass'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Mass Order
                                </div>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {orderType === 'single' ? (
                                <>
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                        <div className="relative">
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            >
                                                <option value="">Select a category...</option>
                                                <option value="instagram">📸 Instagram Services</option>
                                                <option value="tiktok">🎵 TikTok Services</option>
                                                <option value="youtube">▶️ YouTube Services</option>
                                                <option value="twitter">🐦 Twitter / X Services</option>
                                                <option value="facebook">👍 Facebook Services</option>
                                                <option value="telegram">✈️ Telegram Services</option>
                                                <option value="spotify">🎧 Spotify Services</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Service */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
                                        <div className="relative">
                                            <select
                                                value={service}
                                                onChange={(e) => setService(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            >
                                                <option value="">Choose a service...</option>
                                                <option value="1">[ID: 402] Instagram Followers | Max 500k | No Refill | Instant - $0.50/1k</option>
                                                <option value="2">[ID: 405] Instagram Followers | Refill 30D | High Quality - $1.20/1k</option>
                                                <option value="3">[ID: 890] Instagram Likes | Real Accounts | Instant - $0.30/1k</option>
                                                <option value="4">[ID: 892] Instagram Views | Real | Fast - $0.10/1k</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                        {service && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    <Clock className="w-3 h-3" /> Start: {selectedService.avgTime}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    <TrendingUp className="w-3 h-3" /> Speed: 10k/day
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium">
                                                    ${selectedService.rate}/1k
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Link */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Link</label>
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder="https://instagram.com/yourusername"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">Enter the profile or post URL</p>
                                    </div>

                                    {/* Quantity & Charge */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                placeholder={`Min: ${selectedService.min} - Max: ${selectedService.max.toLocaleString()}`}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Charge</label>
                                            <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-sm font-semibold">
                                                ${charge}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                        <ShoppingCart className="w-4 h-4" /> Place Order
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Mass Order */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                                        <div className="flex gap-3">
                                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium mb-1">Mass Order Format</p>
                                                <p className="text-blue-600">service_id | link | quantity</p>
                                                <p className="text-blue-600 mt-1">Example: 402 | https://instagram.com/user | 1000</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Orders</label>
                                        <textarea
                                            rows={10}
                                            placeholder="402 | https://instagram.com/user1 | 1000&#10;405 | https://instagram.com/user2 | 5000&#10;890 | https://instagram.com/p/xyz | 2000"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-mono resize-none"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">One order per line</p>
                                    </div>

                                    <button className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" /> Submit Mass Order
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                        <p className="text-slate-300 text-sm mb-1">Available Balance</p>
                        <p className="text-3xl font-bold mb-4">$1,240.50</p>
                        <a href="/user/add-funds" className="block w-full py-2.5 bg-white text-slate-900 rounded-lg text-sm font-semibold text-center hover:bg-slate-100 transition-colors">
                            Add Funds
                        </a>
                    </div>

                    {/* Service Info */}
                    {service && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-semibold text-slate-900">Service Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Service</p>
                                    <p className="text-sm text-slate-900 font-medium">{selectedService.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Min Order</p>
                                        <p className="text-sm text-slate-900 font-medium">{selectedService.min}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Max Order</p>
                                        <p className="text-sm text-slate-900 font-medium">{selectedService.max.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Rate per 1000</p>
                                    <p className="text-lg text-emerald-600 font-bold">${selectedService.rate.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Description</p>
                                    <p className="text-sm text-slate-600">{selectedService.description}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-800 mb-1">Important Tips</p>
                                <ul className="text-amber-700 space-y-1 text-xs">
                                    <li>• Make sure your profile is public</li>
                                    <li>• Double-check the link before ordering</li>
                                    <li>• Orders cannot be cancelled once started</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
