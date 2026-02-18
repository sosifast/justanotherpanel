'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Eye,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { Order, OrderStatus, Service } from '@prisma/client';

type OrderWithService = Order & {
    service: Service;
};

interface OrdersViewProps {
    initialOrders: OrderWithService[];
}

import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const OrderHistoryView = ({ initialOrders }: OrdersViewProps) => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [platform, setPlatform] = useState('all');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncStatus = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/user/orders/sync-all', { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
                router.refresh();
            } else {
                toast.error(data.error || 'Failed to sync orders');
            }
        } catch (error) {
            toast.error('An error occurred during sync');
        } finally {
            setIsSyncing(false);
        }
    };


    const platforms = ['all', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];
    const statuses = ['all', 'COMPLETED', 'IN_PROGRESS', 'PROCESSING', 'PENDING', 'PARTIAL', 'ERROR', 'CANCELED', 'SUCCESS'];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
                return 'bg-green-100 text-green-700';
            case 'IN_PROGRESS':
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-700';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700';
            case 'PARTIAL':
                return 'bg-purple-100 text-purple-700';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
                return <CheckCircle className="w-3 h-3" />;
            case 'IN_PROGRESS':
            case 'PROCESSING':
            case 'PENDING':
                return <Clock className="w-3 h-3" />;
            case 'PARTIAL':
                return <AlertCircle className="w-3 h-3" />;
            case 'ERROR':
            case 'CANCELED':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status: string) => {
        // Convert CONSTANT_CASE to Title Case if needed, or just return as is
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const getPlatformFromService = (serviceName: string) => {
        if (serviceName.includes('Instagram')) return 'Instagram';
        if (serviceName.includes('TikTok')) return 'TikTok';
        if (serviceName.includes('YouTube')) return 'YouTube';
        if (serviceName.includes('Twitter')) return 'Twitter';
        if (serviceName.includes('Facebook')) return 'Facebook';
        return 'Other';
    };

    const filteredOrders = initialOrders.filter(order => {
        const matchesSearch = order.id.toString().includes(search) ||
            order.service.name.toLowerCase().includes(search.toLowerCase()) ||
            order.link.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || order.status === status;
        const matchesPlatform = platform === 'all' || getPlatformFromService(order.service.name) === platform;
        return matchesSearch && matchesStatus && matchesPlatform;
    });

    const totalSpent = initialOrders.reduce((sum, o) => sum + Number(o.price_sale), 0);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
                    <p className="text-slate-500">View and track all your orders</p>
                </div>
                <button
                    onClick={handleSyncStatus}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Order Status'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Orders</p>
                        <p className="text-xl font-bold text-slate-900">{initialOrders.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="text-xl font-bold text-slate-900">{initialOrders.filter(o => o.status === 'COMPLETED' || o.status === 'SUCCESS').length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">In Progress</p>
                        <p className="text-xl font-bold text-slate-900">{initialOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'PROCESSING' || o.status === 'PENDING').length}</p>
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
                                <option key={s} value={s}>{s === 'all' ? 'All Status' : getStatusLabel(s)}</option>
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
                                            <p className="font-medium text-slate-900 truncate" title={order.service.name}>{order.service.name}</p>
                                            <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleString()}</p>
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
                                        <span className="font-semibold text-slate-900">${Number(order.price_sale).toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center text-slate-600">{order.start_count?.toLocaleString() || '-'}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={(order.remains || 0) > 0 ? 'text-amber-600 font-medium' : 'text-slate-400'}>
                                            {order.remains?.toLocaleString() || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <Link href={`/user/history/order/${order.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {order.status === 'PARTIAL' && (
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

                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No orders found.
                    </div>
                )}

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-700">{filteredOrders.length}</span> of <span className="font-medium text-slate-700">{initialOrders.length}</span> orders
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

export default OrderHistoryView;
