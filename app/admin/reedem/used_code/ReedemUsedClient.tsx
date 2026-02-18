'use client';

import React, { useState, useMemo } from 'react';
import { Search, User, Ticket, Clock, DollarSign, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

type UsageHistory = {
    id: number;
    id_user: number;
    id_redeem_code: number;
    created_at: string;
    user: {
        username: string;
        email: string;
    };
    redeem_code: {
        name_code: string;
        get_balance: number;
    };
};

const PER_PAGE_OPTIONS = [10, 20, 50, 100, 200];

const ReedemUsedClient = ({ initialHistory }: { initialHistory: UsageHistory[] }) => {
    const [history] = useState(initialHistory);
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredHistory = useMemo(() => history.filter(item =>
        item.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.redeem_code.name_code.toLowerCase().includes(searchQuery.toLowerCase())
    ), [history, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredHistory.length / perPage));
    const paginatedHistory = filteredHistory.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
    const handlePerPage = (val: number) => { setPerPage(val); setCurrentPage(1); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Redeem Usage History</h1>
                    <p className="text-slate-500 text-sm">Track which users have claimed redeem codes.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search username or code..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Code Used</th>
                                <th className="px-6 py-4 font-semibold">Balance Received</th>
                                <th className="px-6 py-4 font-semibold">Used Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {item.user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{item.user.username}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{item.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-4 h-4 text-blue-500" />
                                            <span className="font-bold text-slate-700">{item.redeem_code.name_code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                            <DollarSign className="w-3 h-3" />
                                            {item.redeem_code.get_balance.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock className="w-4 h-4" />
                                            <div>
                                                <div className="text-slate-900 font-medium">{format(new Date(item.created_at), 'MMM dd, yyyy')}</div>
                                                <div className="text-[10px] font-medium tracking-tight uppercase text-slate-400">{format(new Date(item.created_at), 'HH:mm:ss')}</div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedHistory.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">No usage history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Showing {Math.min((currentPage - 1) * perPage + 1, filteredHistory.length)}–{Math.min(currentPage * perPage, filteredHistory.length)} of {filteredHistory.length}
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
};

export default ReedemUsedClient;
