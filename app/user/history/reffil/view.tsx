'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Eye,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { ReffilStatus } from '@prisma/client';

type RefillWithOrder = {
    id: number;
    id_order: number;
    pid_reffil: string | null;
    status: ReffilStatus;
    create_at: string;
    update_at: string;
    order: {
        id: number;
        link: string;
        service: {
            name: string;
        };
    };
    api_provider: {
        name: string;
    };
};

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface RefillHistoryViewProps {
    initialRefills: RefillWithOrder[];
}

const RefillHistoryView = ({ initialRefills }: RefillHistoryViewProps) => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncStatus = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/user/orders/reffil/sync-all', { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
                router.refresh();
            } else {
                toast.error(data.error || 'Failed to sync refill statuses');
            }
        } catch (error) {
            toast.error('An error occurred during sync');
        } finally {
            setIsSyncing(false);
        }
    };

    const statuses = ['all', 'PENDING', 'ERROR', 'COMPLETED', 'SUCCESS', 'FINISH'];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
            case 'FINISH':
                return 'bg-green-100 text-green-700';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700';
            case 'ERROR':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
            case 'FINISH':
                return <CheckCircle className="w-3 h-3" />;
            case 'PENDING':
                return <Clock className="w-3 h-3" />;
            case 'ERROR':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status: string) => {
        return status.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const filteredRefills = initialRefills.filter(refill => {
        const matchesSearch = refill.id.toString().includes(search) ||
            refill.id_order.toString().includes(search) ||
            refill.order?.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
            refill.pid_reffil?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || refill.status === status;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="p-4 flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, Order ID, or service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative min-w-[180px]">
                        <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                        >
                            {statuses.map((s) => (
                                <option key={s} value={s}>{s === 'all' ? 'All Status' : getStatusLabel(s)}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sync Button */}
                    <button
                        onClick={handleSyncStatus}
                        disabled={isSyncing}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/10 transition-all min-w-[180px]"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Updates'}
                    </button>
                </div>
            </div>

            {/* Refills Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4">ID</th>
                                <th className="px-4 py-4">Order ID</th>
                                <th className="px-4 py-4">Refill ID</th>
                                <th className="px-4 py-4">Service</th>
                                <th className="px-4 py-4 text-center">Date</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-4 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRefills.map((refill) => (
                                <tr key={refill.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">#{refill.id}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Link href={`/user/history/order/${refill.id_order}`} className="text-blue-600 hover:underline font-medium">
                                            #{refill.id_order}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 font-mono text-xs italic">
                                        {refill.pid_reffil || '-'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="max-w-[200px]">
                                            <p className="font-medium text-slate-900 truncate" title={refill.order?.service?.name}>
                                                {refill.order?.service?.name || 'Deleted Service'}
                                            </p>
                                            <a href={refill.order?.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 text-[10px] truncate max-w-full italic">
                                                {refill.order?.link}
                                                <ExternalLink className="w-2 h-2" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="text-xs text-slate-500">
                                            <p>{new Date(refill.create_at).toLocaleDateString()}</p>
                                            <p>{new Date(refill.create_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(refill.status)}`}>
                                            {getStatusIcon(refill.status)}
                                            {refill.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                         <Link href={`/user/history/order/${refill.id_order}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block" title="View Order Details">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRefills.length === 0 && (
                    <div className="p-12 text-center text-slate-400 italic">
                        No refill requests found.
                    </div>
                )}
                
                 {/* Pagination - Dummy */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <div className="text-xs text-slate-500">
                        Showing <span className="font-medium text-slate-700">{filteredRefills.length}</span> of <span className="font-medium text-slate-700">{initialRefills.length}</span> requests
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="px-3 py-1 bg-slate-900 text-white text-xs rounded-lg">1</button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors" disabled>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefillHistoryView;
