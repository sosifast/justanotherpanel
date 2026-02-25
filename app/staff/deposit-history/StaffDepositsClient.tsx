'use client';

import React, { useState, useMemo } from 'react';
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
    Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

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

const StaffDepositsClient = ({ initialDeposits }: { initialDeposits: DepositData[] }) => {
    const [deposits, setDeposits] = useState(initialDeposits);
    const [loading, setLoading] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAYMENT': return 'bg-emerald-100 text-emerald-800';
            case 'PENDING': return 'bg-amber-100 text-amber-800';
            case 'CANCELED': return 'bg-rose-100 text-rose-800';
            case 'ERROR': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAYMENT': return <CheckCircle className="w-3 h-3" />;
            case 'PENDING': return <Clock className="w-3 h-3" />;
            case 'CANCELED': return <XCircle className="w-3 h-3" />;
            case 'ERROR': return <AlertCircle className="w-3 h-3" />;
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Deposit History</h1>
                    <p className="text-slate-500 font-medium">Monitor and manage user financial deposits.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search ID, user, method..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                    />
                    <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-600 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full appearance-none"
                        >
                            <option value="all">All Status</option>
                            {['PENDING', 'PAYMENT', 'CANCELED', 'ERROR'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <select
                        value={perPage}
                        onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                        className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {[10, 20, 50, 100].map(n => (
                            <option key={n} value={n}>{n} / page</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100 font-black">
                            <tr>
                                <th className="px-6 py-4">Deposit ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pagedDeposits.map((deposit) => (
                                <tr key={deposit.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">#{deposit.id}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            {formatDistanceToNow(new Date(deposit.created_at), { addSuffix: true })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-bold italic">@{deposit.user.username}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-900 font-bold">{deposit.method}</div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-900 text-lg">
                                        <span className="text-emerald-600">$</span>{Number(deposit.amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${getStatusColor(deposit.status)}`}>
                                            {getStatusIcon(deposit.status)}
                                            {deposit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => setDropdownOpen(dropdownOpen === deposit.id ? null : deposit.id)}
                                            disabled={loading === deposit.id}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            {loading === deposit.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                                        </button>

                                        {dropdownOpen === deposit.id && (
                                            <div className="absolute right-6 top-10 z-20 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 min-w-[180px] animate-in slide-in-from-top-1 duration-200">
                                                <p className="px-4 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Update Status</p>
                                                {['PENDING', 'PAYMENT', 'CANCELED', 'ERROR'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleUpdateStatus(deposit.id, s)}
                                                        className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2 ${s === deposit.status ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${s === 'PAYMENT' ? 'bg-emerald-500' : s === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'}`} />
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
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No deposits found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Showing {filteredDeposits.length === 0 ? 0 : (safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filteredDeposits.length)} of {filteredDeposits.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage <= 1}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-40 transition-all font-bold"
                        >
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
                            const pg = start + i;
                            if (pg > totalPages || pg < 1) return null;
                            return (
                                <button
                                    key={pg}
                                    onClick={() => setPage(pg)}
                                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${pg === safePage
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'
                                        }`}
                                >
                                    {pg}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage >= totalPages}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-40 transition-all"
                        >
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDepositsClient;
