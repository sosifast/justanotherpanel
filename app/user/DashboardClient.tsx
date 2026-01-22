'use client';

import React from 'react';
import {
    LayoutDashboard,
    ShoppingCart,
    Wallet,
    TrendingUp,
    Clock,
    AlertCircle,
    Globe,
    ChevronRight,
    Package,
    X,
    Eye
} from 'lucide-react';
import Link from 'next/link';

type Platform = {
    id: number;
    name: string;
    slug: string;
    icon_imagekit_url?: string | null;
    status: string;
    _count?: {
        categories: number;
    };
};

type Order = {
    id: number;
    service: string;
    serviceId: number;
    link: string;
    quantity: number;
    status: string;
    created_at: string;
};

type News = {
    id: number;
    subject: string;
    content: string;
    created_at: string;
};

type DashboardData = {
    user: {
        id: number;
        full_name: string;
        username: string;
        email: string;
        balance: number;
        role: string;
        status: string;
        profile_imagekit_url?: string | null;
    } | null;
    stats: {
        balance: number;
        totalSpent: number;
        totalOrders: number;
        activeOrders: number;
    };
    recentOrders: Order[];
    platforms: Platform[];
    news: News[];
};

type Props = {
    data: DashboardData;
};

const DashboardClient = ({ data }: Props) => {
    const [selectedNews, setSelectedNews] = React.useState<News | null>(null);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    // Get status color
    const getStatusColor = (status: string) => {
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
                return 'bg-orange-100 text-orange-700';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const stats = [
        {
            label: "Total Balance",
            value: formatCurrency(data.stats.balance),
            icon: <Wallet className="w-5 h-5 text-emerald-600" />,
            color: 'text-emerald-600'
        },
        {
            label: "Total Spent",
            value: formatCurrency(data.stats.totalSpent),
            icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
            color: 'text-blue-600'
        },
        {
            label: "Total Orders",
            value: data.stats.totalOrders.toLocaleString(),
            icon: <ShoppingCart className="w-5 h-5 text-purple-600" />,
            color: 'text-purple-600'
        },
        {
            label: "Active Orders",
            value: data.stats.activeOrders.toString(),
            icon: <Clock className="w-5 h-5 text-amber-600" />,
            color: 'text-amber-600'
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">
                    Welcome back, {data.user?.full_name || 'User'}! Here&apos;s what&apos;s happening today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
                        </div>
                        <p className="text-slate-500 text-sm">{stat.label}</p>
                        <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Platforms Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" /> Available Platforms
                    </h2>
                    <Link href="/user/new-order" className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                        New Order <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="p-6">
                    {data.platforms.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No platforms available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                            {data.platforms.map((platform) => (
                                <Link
                                    key={platform.id}
                                    href={`/user/new-order?platform=${platform.slug}`}
                                    className="group flex flex-col items-center text-center transition-all hover:scale-105"
                                >
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow overflow-hidden bg-slate-100">
                                        {platform.icon_imagekit_url ? (
                                            <img
                                                src={platform.icon_imagekit_url}
                                                alt={platform.name}
                                                className="w-10 h-10 object-contain"
                                            />
                                        ) : (
                                            <Globe className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <h3 className="font-medium text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{platform.name}</h3>
                                    <p className="text-xs text-slate-400">
                                        {platform._count?.categories || 0} services
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Package className="w-4 h-4 text-purple-600" /> Recent Orders
                            </h2>
                            <Link href="/user/history/order" className="text-xs text-blue-600 font-medium hover:underline">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Service</th>
                                        <th className="px-6 py-3">Link</th>
                                        <th className="px-6 py-3 text-center">Qty</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentOrders.length > 0 ? (
                                        data.recentOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                                                <td className="px-6 py-4 truncate max-w-[200px]" title={order.service}>{order.service}</td>
                                                <td className="px-6 py-4 truncate max-w-[150px] text-blue-500">
                                                    <a href={order.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        {order.link.length > 30 ? order.link.substring(0, 30) + '...' : order.link}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-center">{order.quantity.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                                No orders yet. Place your first order!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-6 -mb-6 blur-xl"></div>
                        <div className="relative">
                            <p className="text-blue-100 text-sm mb-1">Available Balance</p>
                            <h3 className="text-3xl font-bold mb-4">{formatCurrency(data.stats.balance)}</h3>
                            <Link
                                href="/user/deposit"
                                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Wallet className="w-4 h-4" />
                                Add Funds
                            </Link>
                        </div>
                    </div>

                    {/* News & Updates */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" /> News &amp; Updates
                            </h2>
                        </div>
                        <div className="p-0">
                            {data.news.length > 0 ? (
                                data.news.map((item) => (
                                    <div key={item.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">News</span>
                                            <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-slate-800 text-sm mb-1">{item.subject}</h4>
                                            <button
                                                onClick={() => setSelectedNews(item)}
                                                className="p-1 hover:bg-white rounded text-blue-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-snug line-clamp-2">
                                            {item.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-slate-500">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm">No news at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* News Modal */}
                    {selectedNews && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedNews(null)}></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                        <h3 className="font-bold text-slate-800">News Details</h3>
                                    </div>
                                    <button onClick={() => setSelectedNews(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">News Update</span>
                                        <span className="text-xs text-slate-400 font-medium">{new Date(selectedNews.created_at).toLocaleString()}</span>
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedNews.subject}</h2>
                                    <div className="prose prose-slate prose-sm max-w-none">
                                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-base">
                                            {selectedNews.content}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <button onClick={() => setSelectedNews(null)} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">Need Help?</h3>
                        <p className="text-sm text-slate-500 mb-4">Our support team is available 24/7 to assist you with any issues.</p>
                        <Link
                            href="/user/tickets"
                            className="block w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                            Open Ticket
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardClient;
