'use client';

import React, { useState, useMemo } from 'react';
import { Shield, Mail, Wallet, Calendar, Search } from 'lucide-react';
import Image from 'next/image';

type Reseller = {
    id: number;
    status: string;
    created_at: string;
    user: {
        full_name: string;
        username: string;
        email: string;
        balance: number | string;
        profile_imagekit_url: string | null;
    };
};

const PER_PAGE_OPTIONS = [10, 20, 50, 100, 200];

export default function ResellerClient({ resellers }: { resellers: Reseller[] }) {
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = useMemo(() =>
        resellers.filter(r =>
            r.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
            r.user.username.toLowerCase().includes(search.toLowerCase()) ||
            r.user.email.toLowerCase().includes(search.toLowerCase())
        ), [resellers, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };
    const handlePerPage = (val: number) => { setPerPage(val); setCurrentPage(1); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Reseller Management</h1>
                    <p className="text-slate-500 text-sm">View and manage all registered resellers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">{resellers.length} Total Resellers</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search resellers..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Per page:</span>
                        <select value={perPage} onChange={e => handlePerPage(Number(e.target.value))} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                <th className="px-6 py-4 border-b border-slate-100">Reseller</th>
                                <th className="px-6 py-4 border-b border-slate-100">Contact</th>
                                <th className="px-6 py-4 border-b border-slate-100">Balance</th>
                                <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                <th className="px-6 py-4 border-b border-slate-100">Joined Date</th>
                                <th className="px-6 py-4 border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginated.map((reseller) => (
                                <tr key={reseller.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {reseller.user.profile_imagekit_url ? (
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                                                    <Image
                                                        src={reseller.user.profile_imagekit_url}
                                                        alt={reseller.user.full_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border border-blue-100">
                                                    {reseller.user.full_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{reseller.user.full_name}</p>
                                                <p className="text-xs text-slate-500">@{reseller.user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-sm">{reseller.user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-900">
                                                ${parseFloat(reseller.user.balance.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reseller.status === 'ACTIVE'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                            {reseller.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-sm">
                                                {new Date(reseller.created_at).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No resellers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors">«</button>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors">‹</button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                                return start + i;
                            }).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`px-2.5 py-1 text-xs rounded border transition-colors ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-slate-100'}`}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors">›</button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors">»</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
