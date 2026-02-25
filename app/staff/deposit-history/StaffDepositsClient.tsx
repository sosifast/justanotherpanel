'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    DollarSign,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Loader2,
    TrendingUp,
    Inbox,
    Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import Pusher from 'pusher-js';

type DepositData = {
    id: number;
    id_user: number;
    method: string;
    amount: number;
    status: string;
    created_at: Date | string;
    updated_at: Date | string;
    user: {
        username: string;
    };
};

type DepositStats = {
    totalRevenue: string;
    pendingCount: number;
    todayCount: number;
};

const StaffDepositsClient = ({ initialDeposits, initialStats }: { initialDeposits: DepositData[], initialStats: DepositStats }) => {
    const [deposits, setDeposits] = useState(initialDeposits);
    const [stats, setStats] = useState(initialStats);
    const [loading, setLoading] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    // Pusher real-time updates
    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '', {
            cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || '',
            authEndpoint: '/api/pusher/auth',
        });

        const channel = pusher.subscribe('private-staff');

        channel.bind('deposit-update', (data: { depositId: number; status: string; amount: number; username: string }) => {
            setDeposits(prev => prev.map(d => d.id === data.depositId ? { ...d, status: data.status } : d));

            // Re-calculate stats locally or notify user
            toast.success(`Deposit #${data.depositId} (@${data.username}) updated to ${data.status}`, {
                icon: '🔄',
                duration: 4000
            });
        });

        return () => {
            pusher.unsubscribe('private-staff');
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAYMENT': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'CANCELED': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'ERROR': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAYMENT': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'PENDING': return <Clock className="w-3.5 h-3.5" />;
            case 'CANCELED': return <XCircle className="w-3.5 h-3.5" />;
            case 'ERROR': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    const handleUpdateStatus = async (depositId: number, newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}? This may affect user balance.`)) return;

        try {
            setLoading(depositId);
            setDropdownOpen(null);
            const res = await fetch(`/api/admin/deposits/${depositId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();

            if (res.ok) {
                // State is updated by Pusher globally, but we can update locally for immediate feedback
                setDeposits(prev => prev.map(d => d.id === depositId ? { ...d, status: newStatus } : d));
                toast.success(`Deposit status updated to ${newStatus}`);
            } else {
                toast.error(data.error || 'Failed to update deposit');
            }
        } catch (e) {
            toast.error('Error updating deposit');
        } finally {
            setLoading(null);
        }
    };

    const filteredDeposits = useMemo(() => {
        return deposits.filter(d => {
            const matchSearch = search === '' ||
                d.id.toString().includes(search) ||
                d.user.username.toLowerCase().includes(search.toLowerCase()) ||
                d.method.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'all' || d.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [deposits, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredDeposits.length / perPage));
    const safePage = Math.min(page, totalPages);
    const pagedDeposits = filteredDeposits.slice((safePage - 1) * perPage, safePage * perPage);

    const statCards = [
        { label: "Total Revenue", value: `$${stats.totalRevenue}`, icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Pending Deposits", value: stats.pendingCount.toString(), icon: <Inbox className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50", border: "border-amber-100" },
        { label: "Today's Volume", value: stats.todayCount.toString(), icon: <Calendar className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50", border: "border-indigo-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Deposits</h1>
                    <p className="text-slate-500 font-medium">Verify and manage user payment transactions.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`bg-white p-6 rounded-3xl border ${stat.border} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125 duration-500 opacity-50`} />
                        <div className="relative z-10">
                            <div className={`p-3 rounded-2xl ${stat.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-30">
                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        placeholder="Search ID, user, method..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold placeholder:text-slate-400"
                    />
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="pl-4 pr-10 py-3 border border-slate-200 rounded-2xl text-slate-700 bg-white text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full appearance-none shadow-sm cursor-pointer"
                        >
                            <option value="all">ALL DEPOSITS</option>
                            {['PENDING', 'PAYMENT', 'CANCELED', 'ERROR'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden border-separate">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-[10px] text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 border-b border-slate-100 font-black">
                            <tr>
                                <th className="px-8 py-5">Transaction</th>
                                <th className="px-6 py-5">Verified User</th>
                                <th className="px-6 py-5">Payment Method</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pagedDeposits.map((deposit) => (
                                <tr key={deposit.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-900 text-base">#{deposit.id}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(deposit.created_at), { addSuffix: true })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {deposit.user.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-slate-900 font-bold">@{deposit.user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-600 uppercase tracking-tighter shadow-sm border border-slate-200">
                                            {deposit.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-emerald-500 font-black text-xs">$</span>
                                            <span className="font-black text-slate-900 text-xl tracking-tighter">
                                                {Number(deposit.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(deposit.status)}`}>
                                            {getStatusIcon(deposit.status)}
                                            {deposit.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right relative">
                                        <button
                                            onClick={() => setDropdownOpen(dropdownOpen === deposit.id ? null : deposit.id)}
                                            disabled={loading === deposit.id}
                                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                        >
                                            {loading === deposit.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
                                        </button>

                                        {dropdownOpen === deposit.id && (
                                            <div className="absolute right-8 top-16 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl py-3 min-w-[200px] animate-in zoom-in-95 slide-in-from-top-2 duration-200 ring-4 ring-slate-900/5">
                                                <p className="px-5 py-1 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Change Status</p>
                                                {['PENDING', 'PAYMENT', 'CANCELED', 'ERROR'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleUpdateStatus(deposit.id, s)}
                                                        className={`w-full text-left px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 flex items-center gap-3 transition-colors ${s === deposit.status ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full shadow-sm ${s === 'PAYMENT' ? 'bg-emerald-500' : s === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {pagedDeposits.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-slate-50 rounded-3xl">
                                                <Search className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching transactions found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        Displaying {filteredDeposits.length === 0 ? 0 : (safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filteredDeposits.length)} of {filteredDeposits.length} Records
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage <= 1}
                            className="p-2.5 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all shadow-sm bg-white"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
                                const pg = start + i;
                                if (pg > totalPages || pg < 1) return null;
                                return (
                                    <button
                                        key={pg}
                                        onClick={() => setPage(pg)}
                                        className={`w-10 h-10 text-xs font-black rounded-xl border transition-all flex items-center justify-center ${pg === safePage
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-110 z-10'
                                            : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-500'
                                            }`}
                                    >
                                        {pg}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage >= totalPages}
                            className="p-2.5 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all shadow-sm bg-white"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDepositsClient;
