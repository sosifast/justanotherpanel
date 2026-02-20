'use client';

import React, { useState } from 'react';
import { Search, User as UserIcon, Calendar, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type OrderSmsData = {
    id: number;
    id_user: number;
    invoice: string;
    request_id: string;
    number: string;
    status_order: 'PENDING' | 'ACTIVE' | 'NOT_ACTIVE' | string;
    sms_otp_code: string | null;
    price_api_sms: number;
    price_sale: number;
    created_at: Date;
    user: {
        id: number;
        username?: string;
        name: string;
        email: string;
    };
    country: {
        title: string;
        code: string;
    };
    product: {
        title: string;
        project_id: string;
    };
};

export default function HistoryOrderClient({ initialOrders }: { initialOrders: OrderSmsData[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOrders = initialOrders.filter(order => {
        const matchesSearch =
            order.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.product?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.country?.title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status_order === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        SUCCESS
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" />
                        WAITING
                    </span>
                );
            case 'NOT_ACTIVE':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3" />
                        CANCELED
                    </span>
                );
            default:
                return (
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-800">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">SMS Orders History</h1>
                    <p className="text-slate-500 text-sm">View and manage virtual number SMS purchases.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by invoice, user, number, or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="ACTIVE">Success</option>
                        <option value="PENDING">Waiting</option>
                        <option value="NOT_ACTIVE">Canceled</option>
                    </select>
                    <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                        Total: {filteredOrders.length}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User / Invoice</th>
                                <th className="px-6 py-4 font-semibold">Service</th>
                                <th className="px-6 py-4 font-semibold">Phone Number</th>
                                <th className="px-6 py-4 font-semibold">Status / OTP</th>
                                <th className="px-6 py-4 font-semibold text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="font-medium text-slate-900">{order.user?.username || order.user?.name}</span>
                                            </div>
                                            <span className="font-mono text-xs text-slate-500">{order.invoice}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-slate-800">{order.product?.title}</span>
                                            <span className="text-xs text-slate-500">{order.country?.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono font-medium text-slate-900 bg-slate-50 px-2 py-1 rounded w-fit border border-slate-200">
                                            +{order.number}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2 items-start">
                                            {getStatusBadge(order.status_order)}
                                            {order.sms_otp_code ? (
                                                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                    OTP: {order.sms_otp_code}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Waiting for SMS...</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end flex-col gap-1">
                                            <span className="font-medium text-slate-900">${order.price_sale.toFixed(4)}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <MessageSquare className="w-8 h-8 text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-600">No orders found</p>
                                            <p className="text-sm mt-1">Users haven't purchased any virtual numbers yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
