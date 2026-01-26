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
    Filter,
    ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { Service, Category, Platform } from '@prisma/client';

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
    userRole: string;
}

const ServicesView = ({ initialServices, userRole }: ServicesViewProps) => {
    const [search, setSearch] = useState('');
    const [platform, setPlatform] = useState('all');

    // Get unique platforms from services
    const platforms = ['all', ...Array.from(new Set(initialServices.map(s => s.category.platform.name)))];

    const filteredServices = initialServices.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
            service.id.toString().includes(search);
        const matchesPlatform = platform === 'all' || service.category.platform.name === platform;
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
                                <th className="px-6 py-4 text-center">Action</th>
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
                                                    {/* Best seller badge removed as it's not in schema yet */}
                                                </div>
                                                <span className="text-xs text-slate-400">{service.category.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600">{service.min.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center text-slate-600">{service.max.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-emerald-600">
                                            ${Number(userRole === 'RESELLER' || userRole === 'STAFF' || userRole === 'ADMIN' ? service.price_reseller : service.price_sale).toFixed(4)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" /> {/* Avg time not in schema */} -
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            href={`/user/new-order?service=${service.id}`}
                                            className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Order Now"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredServices.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No services found.
                    </div>
                )}

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-700">{filteredServices.length}</span> of <span className="font-medium text-slate-700">{initialServices.length}</span> services
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg">1</button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesView;
