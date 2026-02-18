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
    Send,
    Facebook,
    Image as ImageIcon,
    Eye,
    X
} from 'lucide-react';
import Link from 'next/link';

// Instagram icon (not in lucide)
const InstagramIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

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
    socialMedia: {
        instagram: string | null;
        facebook: string | null;
        telegram: string | null;
    };
    sliders: {
        id: number;
        name: string;
        imagekit_url_banner: string;
        slug: string;
    }[];
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

            {/* Platforms & Slider Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* SMM Services */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" /> SMM Services
                        </h2>
                    </div>

                    <div className="p-6">
                        {data.platforms.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No platforms available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
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

                {/* Slider */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                    <div className="p-0 flex-1 relative group">
                        {data.sliders.length > 0 ? (
                            <div className="relative w-full h-full min-h-[300px] bg-slate-100">
                                {/* Simple CSS Slider implementation since we can't easily add swiper/slick without installing packages */}
                                <div className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                                    {data.sliders.map((slider) => (
                                        <div key={slider.id} className="w-full flex-shrink-0 snap-center relative">
                                            <img
                                                src={slider.imagekit_url_banner}
                                                alt={slider.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="w-8 h-8 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white">
                                        <ChevronRight className="w-5 h-5 rotate-180" />
                                    </div>
                                </div>
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="w-8 h-8 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 bg-slate-50">
                                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                <p>No highlights available</p>
                            </div>
                        )}
                    </div>
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
                    {/* Social Media Card */}
                    {(data.socialMedia.instagram || data.socialMedia.facebook || data.socialMedia.telegram) && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-600" /> Follow Us
                                </h2>
                            </div>
                            <div className="p-4 flex flex-col gap-3">
                                {data.socialMedia.instagram && (
                                    <a
                                        href={data.socialMedia.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-sm">
                                            <InstagramIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 group-hover:text-pink-600 transition-colors">Instagram</p>
                                            <p className="text-xs text-slate-400 truncate max-w-[160px]">{data.socialMedia.instagram.replace(/^https?:\/\/(www\.)?/, '')}</p>
                                        </div>
                                    </a>
                                )}
                                {data.socialMedia.facebook && (
                                    <a
                                        href={data.socialMedia.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                                            <Facebook className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Facebook</p>
                                            <p className="text-xs text-slate-400 truncate max-w-[160px]">{data.socialMedia.facebook.replace(/^https?:\/\/(www\.)?/, '')}</p>
                                        </div>
                                    </a>
                                )}
                                {data.socialMedia.telegram && (
                                    <a
                                        href={data.socialMedia.telegram.startsWith('http') ? data.socialMedia.telegram : `https://t.me/${data.socialMedia.telegram.replace(/^@/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50 transition-colors group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-sm">
                                            <Send className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-500 transition-colors">Telegram</p>
                                            <p className="text-xs text-slate-400 truncate max-w-[160px]">{data.socialMedia.telegram.replace(/^https?:\/\/(www\.)?/, '')}</p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

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
