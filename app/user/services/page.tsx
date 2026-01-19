'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Package,
    Star,
    Clock,
    TrendingUp,
    Filter
} from 'lucide-react';

const ServicesPage = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [platform, setPlatform] = useState('all');

    const services = [
        { id: 402, name: 'Instagram Followers | Max 500k | No Refill | Instant', category: 'Instagram', min: 100, max: 500000, rate: 0.50, avgTime: '0-1 hr', bestSeller: true },
        { id: 405, name: 'Instagram Followers | Refill 30D | High Quality', category: 'Instagram', min: 50, max: 100000, rate: 1.20, avgTime: '0-6 hr', bestSeller: false },
        { id: 890, name: 'Instagram Likes | Real Accounts | Instant', category: 'Instagram', min: 10, max: 50000, rate: 0.30, avgTime: '0-1 hr', bestSeller: true },
        { id: 1201, name: 'TikTok Views | Worldwide | Instant Start', category: 'TikTok', min: 100, max: 10000000, rate: 0.05, avgTime: '0-15 min', bestSeller: true },
        { id: 1205, name: 'TikTok Followers | High Quality | No Drop', category: 'TikTok', min: 50, max: 100000, rate: 2.50, avgTime: '0-12 hr', bestSeller: false },
        { id: 1502, name: 'YouTube Views | Retention 70% | Safe', category: 'YouTube', min: 500, max: 1000000, rate: 3.00, avgTime: '24-72 hr', bestSeller: false },
        { id: 1510, name: 'YouTube Subscribers | Real | Lifetime', category: 'YouTube', min: 100, max: 10000, rate: 15.00, avgTime: '1-7 days', bestSeller: false },
        { id: 2001, name: 'Twitter Followers | USA | High Quality', category: 'Twitter', min: 100, max: 50000, rate: 5.00, avgTime: '0-24 hr', bestSeller: false },
        { id: 2050, name: 'Twitter Likes | Fast | Worldwide', category: 'Twitter', min: 50, max: 100000, rate: 1.00, avgTime: '0-1 hr', bestSeller: true },
        { id: 3001, name: 'Facebook Page Likes | Real | Active', category: 'Facebook', min: 100, max: 100000, rate: 4.00, avgTime: '0-24 hr', bestSeller: false },
    ];

    const platforms = ['all', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
            service.id.toString().includes(search);
        const matchesPlatform = platform === 'all' || service.category === platform;
        return matchesSearch && matchesPlatform;
    });

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Services</h1>
                <p className="text-slate-500">Browse all available services and their rates</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="p-4 flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ID or service name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    {/* Platform Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm min-w-[180px]"
                        >
                            {platforms.map((p) => (
                                <option key={p} value={p}>{p === 'all' ? 'All Platforms' : p}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4 text-center">Min</th>
                                <th className="px-6 py-4 text-center">Max</th>
                                <th className="px-6 py-4 text-right">Rate per 1K</th>
                                <th className="px-6 py-4 text-center">Avg Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((service) => (
                                <tr key={service.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{service.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">{service.name}</span>
                                                    {service.bestSeller && (
                                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                            <Star className="w-3 h-3" /> Best
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400">{service.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600">{service.min.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center text-slate-600">{service.max.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-emerald-600">${service.rate.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" /> {service.avgTime}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-700">{filteredServices.length}</span> of <span className="font-medium text-slate-700">{services.length}</span> services
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg">1</button>
                        <button className="px-3 py-1.5 text-slate-600 text-sm rounded-lg hover:bg-white">2</button>
                        <button className="px-3 py-1.5 text-slate-600 text-sm rounded-lg hover:bg-white">3</button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
