'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Wallet,
    Calendar,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    CreditCard
} from 'lucide-react';
import { Deposits, DepositStatus } from '@prisma/client';
import { format } from 'date-fns';
import DepositDetailsModal from './DepositDetailsModal';

// Define the shape of detail_transaction
interface TransactionDetail {
    fee?: number;
    method?: string;
    provider?: string;
    transactionId?: string;
}

interface SerializedDeposit extends Omit<Deposits, 'amount'> {
    amount: number;
}

interface DepositsViewProps {
    initialDeposits: SerializedDeposit[];
}

const DepositsView = ({ initialDeposits }: DepositsViewProps) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [method, setMethod] = useState('all');
    const [selectedDeposit, setSelectedDeposit] = useState<SerializedDeposit | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const methods = ['all', 'PayPal', 'Cryptomus', 'Manual'];
    const statuses = ['all', 'PAYMENT', 'PENDING', 'ERROR', 'CANCELED'];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAYMENT':
                return 'bg-green-100 text-green-700';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAYMENT':
                return <CheckCircle className="w-3 h-3" />;
            case 'PENDING':
                return <Clock className="w-3 h-3" />;
            case 'ERROR':
            case 'CANCELED':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAYMENT':
                return 'Completed';
            case 'PENDING':
                return 'Pending';
            case 'ERROR':
                return 'Failed';
            case 'CANCELED':
                return 'Canceled';
            default:
                return status;
        }
    };

    const handleViewDetails = (deposit: SerializedDeposit) => {
        setSelectedDeposit(deposit);
        setIsModalOpen(true);
    };

    const filteredDeposits = initialDeposits.filter(deposit => {
        const details = deposit.detail_transaction as unknown as TransactionDetail;
        const depositMethod = details?.method || details?.provider || 'Unknown';
        const transactionId = details?.transactionId || '';

        const matchesSearch = deposit.id.toString().includes(search) ||
            transactionId.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || deposit.status === status;
        const matchesMethod = method === 'all' || depositMethod === method;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const totalDeposits = initialDeposits
        .filter(d => d.status === 'PAYMENT')
        .reduce((sum, d) => sum + Number(d.amount), 0);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Deposit History</h1>
                <p className="text-slate-500">View all your deposit transactions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Deposited</p>
                        <p className="text-xl font-bold text-slate-900">${totalDeposits.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Transactions</p>
                        <p className="text-xl font-bold text-slate-900">{initialDeposits.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Pending</p>
                        <p className="text-xl font-bold text-slate-900">{initialDeposits.filter(d => d.status === 'PENDING').length}</p>
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
                            placeholder="Search by deposit ID or transaction ID..."
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

                    {/* Method Filter */}
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm min-w-[150px]"
                        >
                            {methods.map((m) => (
                                <option key={m} value={m}>{m === 'all' ? 'All Methods' : m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Deposits Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Deposit ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Fee</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeposits.map((deposit) => {
                                const details = deposit.detail_transaction as unknown as TransactionDetail;
                                const fee = details?.fee || 0;
                                const total = Number(deposit.amount); // Assuming amount is total, or amount + fee. Let's assume amount is net and total is amount + fee? Or amount is total.
                                // In schema: amount Decimal.
                                // Let's display amount as Total.

                                return (
                                    <tr key={deposit.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">#{deposit.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {format(new Date(deposit.created_at), 'dd MMM yyyy, HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-700">{details?.method || details?.provider || 'Unknown'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-900">${(total - fee).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-slate-500">${fee.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-emerald-600">${total.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(deposit.status)}`}>
                                                {getStatusIcon(deposit.status)}
                                                {getStatusLabel(deposit.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetails(deposit)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredDeposits.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No deposits found.
                    </div>
                )}

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-700">{filteredDeposits.length}</span> of <span className="font-medium text-slate-700">{initialDeposits.length}</span> deposits
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

            <DepositDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deposit={selectedDeposit as any}
            />
        </div>
    );
};

export default DepositsView;
