'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, LifeBuoy, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Pusher from 'pusher-js';

type DashboardStats = {
    revenue: string;
    orders: number;
    users: number;
    tickets: number;
};

type Order = {
    id: number;
    user: { username: string };
    service: { name: string };
    price_sale: any;
    status: string;
    created_at: string;
};

type StaffDashboardClientProps = {
    initialStats: DashboardStats;
    initialOrders: Order[];
    pusherSettings: { key: string; cluster: string } | null;
};

const StaffDashboardClient = ({ initialStats, initialOrders, pusherSettings }: StaffDashboardClientProps) => {
    const [stats, setStats] = useState(initialStats);
    const [recentOrders, setRecentOrders] = useState(initialOrders);

    useEffect(() => {
        if (!pusherSettings?.key || !pusherSettings?.cluster) return;

        const pusher = new Pusher(pusherSettings.key, {
            cluster: pusherSettings.cluster,
            authEndpoint: '/api/pusher/auth',
        });

        const channel = pusher.subscribe('private-staff');

        channel.bind('stats-update', (data: any) => {
            if (data.stats) {
                setStats(prev => ({ ...prev, ...data.stats }));
            }
            if (data.newOrder) {
                setRecentOrders(prev => [data.newOrder, ...prev].slice(0, 10));
            }
        });

        return () => {
            pusher.unsubscribe('private-staff');
        };
    }, [pusherSettings]);

    const statCards = [
        { label: "Pending Tickets", value: stats.tickets.toLocaleString(), icon: <LifeBuoy className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10" },
        { label: "Total Orders", value: stats.orders.toLocaleString(), icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, bg: "bg-blue-500/10" },
        { label: "Active Users", value: stats.users.toLocaleString(), icon: <Users className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-500/10" },
        { label: "Daily Revenue", value: `$${stats.revenue}`, icon: <DollarSign className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                Live
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Recent Orders</h3>
                        <Link href="/staff/order-history" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-wider">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 font-bold">
                                <tr>
                                    <th className="px-6 py-3">Order</th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">#{order.id}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[150px]">{order.service.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">@{order.user.username}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">${Number(order.price_sale).toFixed(4)}</td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                            No recent orders to display.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Alerts */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-400" /> Staff Actions
                        </h3>
                        <div className="space-y-3 relative z-10">
                            <Link href="/staff/ticket" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
                                <span className="text-sm font-medium">Handle Tickets</span>
                                <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{stats.tickets}</span>
                            </Link>
                            <Link href="/staff/order-history" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
                                <span className="text-sm font-medium">Review Orders</span>
                                <ShoppingBag className="w-4 h-4 opacity-50" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-500" /> Notifications
                        </h3>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <p className="text-sm text-slate-500 font-medium">No system alerts at this time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import Link from 'next/link';

export default StaffDashboardClient;
