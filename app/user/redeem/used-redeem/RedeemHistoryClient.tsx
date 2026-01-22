'use client';

import React, { useState } from 'react';
import { Search, Ticket, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

type HistoryItem = {
    id: number;
    created_at: string;
    redeem_code: {
        name_code: string;
        get_balance: number;
    };
};

const RedeemHistoryClient = ({ initialHistory }: { initialHistory: HistoryItem[] }) => {
    const [history] = useState(initialHistory);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = history.filter(item =>
        item.redeem_code.name_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Redeem History</h1>
                    <p className="text-slate-500 text-sm">Review your previously claimed reward codes.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search code name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-96 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">Redeem Code</th>
                                <th className="px-6 py-4 font-bold">Amount Received</th>
                                <th className="px-6 py-4 font-bold text-right">Claim Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-900 tracking-tight">{item.redeem_code.name_code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            {item.redeem_code.get_balance.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                                {format(new Date(item.created_at), 'HH:mm:ss')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredHistory.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Ticket className="w-12 h-12" />
                                            <p className="font-bold text-slate-500">No claim history found</p>
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
};

export default RedeemHistoryClient;
