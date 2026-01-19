'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Calendar,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Eye,
    RefreshCw,
    ExternalLink
} from 'lucide-react';

const OrderHistoryPage = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [platform, setPlatform] = useState('all');

    const orders = [
        { id: 45210, service: 'Instagram Followers | Max 500k | No Refill', link: 'https://instagram.com/user1', quantity: 1000, charge: 0.50, startCount: 15420, remains: 0, status: 'Completed', date: '2024-01-15 14:32:00' },
        { id: 45211, service: 'TikTok Views | Worldwide | Instant', link: 'https://tiktok.com/@user/video/123', quantity: 50000, charge: 2.50, startCount: 1250, remains: 12500, status: 'In Progress', date: '2024-01-15 13:20:00' },
        { id: 45212, service: 'YouTube Subscribers | Real | Lifetime', link: 'https://youtube.com/@channel', quantity: 500, charge: 7.50, startCount: 0, remains: 500, status: 'Pending', date: '2024-01-15 12:15:00' },
        { id: 45213, service: 'Instagram Likes | Real Accounts', link: 'https://instagram.com/p/xyz', quantity: 2000, charge: 0.60, startCount: 523, remains: 0, status: 'Completed', date: '2024-01-14 18:45:00' },
        { id: 45214, service: 'Twitter Followers | USA | High Quality', link: 'https://twitter.com/user', quantity: 1000, charge: 5.00, startCount: 890, remains: 350, status: 'Partial', date: '2024-01-14 16:30:00' },
        { id: 45215, service: 'Facebook Page Likes | Real', link: 'https://facebook.com/page', quantity: 500, charge: 2.00, startCount: 0, remains: 0, status: 'Error', date: '2024-01-14 14:00:00' },
        { id: 45216, service: 'Instagram Followers | Refill 30D', link: 'https://instagram.com/user2', quantity: 5000, charge: 6.00, startCount: 8520, remains: 2100, status: 'Processing', date: '2024-01-14 10:00:00' },
        { id: 45217, service: 'TikTok Followers | High Quality', link: 'https://tiktok.com/@user2', quantity: 2000, charge: 5.00, startCount: 4521, remains: 0, status: 'Completed', date: '2024-01-13 09:00:00' },
    ];

    const platforms = ['all', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];
    const statuses = ['all', 'Completed', 'In Progress', 'Processing', 'Pending', 'Partial', 'Error'];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-700';
            case 'In Progress':
            case 'Processing':
                return 'bg-blue-100 text-blue-700';
            case 'Pending':
                return 'bg-amber-100 text-amber-700';
            case 'Partial':
                return 'bg-purple-100 text-purple-700';
            case 'Error':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle className="w-3 h-3" />;
            case 'In Progress':
            case 'Processing':
                return <Clock className="w-3 h-3" />;
            case 'Pending':
                return <Clock className="w-3 h-3" />;
            case 'Partial':
                return <AlertCircle className="w-3 h-3" />;
            case 'Error':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getPlatformFromService = (service: string) => {
        if (service.includes('Instagram')) return 'Instagram';
        if (service.includes('TikTok')) return 'TikTok';
        if (service.includes('YouTube')) return 'YouTube';
        if (service.includes('Twitter')) return 'Twitter';
        if (service.includes('Facebook')) return 'Facebook';
        return 'Other';
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(search) ||
            order.service.toLowerCase().includes(search.toLowerCase()) ||
            order.link.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || order.status === status;
        const matchesPlatform = platform === 'all' || getPlatformFromService(order.service) === platform;
        return matchesSearch && matchesStatus && matchesPlatform;
    });

    const totalSpent = orders.reduce((sum, o) => sum + o.charge, 0);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
                <p className="text-slate-500">View and track all your orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Orders</p>
                        <p className="text-xl font-bold text-slate-900">{orders.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="text-xl font-bold text-slate-900">{orders.filter(o => o.status === 'Completed').length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">In Progress</p>
                        <p className="text-xl font-bold text-slate-900">{orders.filter(o => o.status === 'In Progress' || o.status === 'Processing' || o.status === 'Pending').length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Spent</p>
                        <p className="text-xl font-bold text-slate-900">${totalSpent.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="p-4 flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by order ID, service, or link..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm min-w-[150px]"
                        >
                            {statuses.map((s) => (
                                <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Platform Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm min-w-[150px]"
                        >
                            {platforms.map((p) => (
                                <option key={p} value={p}>{p === 'all' ? 'All Platforms' : p}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4">ID</th>
                                <th className="px-4 py-4">Service</th>
                                <th className="px-4 py-4">Link</th>
                                <th className="px-4 py-4 text-center">Qty</th>
                                <th className="px-4 py-4 text-right">Charge</th>
                                <th className="px-4 py-4 text-center">Start</th>
                                <th className="px-4 py-4 text-center">Remains</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-4 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">#{order.id}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="max-w-[200px]">
                                            <p className="font-medium text-slate-900 truncate" title={order.service}>{order.service}</p>
                                            <p className="text-xs text-slate-400">{order.date}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <a href={order.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs max-w-[150px] truncate">
                                            {order.link}
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        </a>
                                    </td>
                                    <td className="px-4 py-4 text-center text-slate-600">{order.quantity.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="font-semibold text-slate-900">${order.charge.toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center text-slate-600">{order.startCount.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={order.remains > 0 ? 'text-amber-600 font-medium' : 'text-slate-400'}>
                                            {order.remains.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {order.status === 'Partial' && (
                                                <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Request Refill">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-700">{filteredOrders.length}</span> of <span className="font-medium text-slate-700">{orders.length}</span> orders
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

export default OrderHistoryPage;
