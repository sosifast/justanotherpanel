'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, ShoppingCart, User, Link as LinkIcon, DollarSign, CheckCircle, XCircle, Clock, Loader, RefreshCw, Trash2, Edit, Eye, X, Clipboard, ExternalLink, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

type OrderData = {
    id: number;
    invoice_number: string;
    id_api_provider: number | null;
    pid: string | null;
    user: {
        username: string;
        email: string;
        balance: number;
    };
    service: {
        id: number;
        name: string;
    };
    link: string;
    quantity: number;
    price_api: any;
    price_sale: any;
    price_seller: any;
    remains: number | null;
    start_count: number | null;
    status: string;
    refill: boolean;
    created_at: Date | string;
};

const StaffOrdersClient = ({ initialOrders }: { initialOrders: OrderData[] }) => {
    const [orders, setOrders] = useState(initialOrders);
    const [updating, setUpdating] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        status: '',
        link: '',
        quantity: 0,
        start_count: 0,
        remains: 0
    });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [isSyncing, setIsSyncing] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
            case 'SUCCESS': return 'bg-emerald-100 text-emerald-800';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'PENDING': return 'bg-orange-100 text-orange-800';
            case 'PARTIAL': return 'bg-indigo-100 text-indigo-800';
            case 'CANCELED': return 'bg-red-100 text-red-800';
            case 'ERROR': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-3 h-3" />;
            case 'SUCCESS': return <CheckCircle className="w-3 h-3" />;
            case 'PROCESSING': return <Loader className="w-3 h-3 animate-spin" />;
            case 'IN_PROGRESS': return <Loader className="w-3 h-3 animate-spin" />;
            case 'PENDING': return <Clock className="w-3 h-3" />;
            case 'CANCELED': return <XCircle className="w-3 h-3" />;
            case 'ERROR': return <XCircle className="w-3 h-3" />;
            default: return null;
        }
    };

    const handleUpdateStatus = async (orderId: number) => {
        try {
            setUpdating(orderId);
            setDropdownOpen(null);
            const res = await fetch(`/api/admin/orders/${orderId}/check-status`, {
                method: 'POST'
            });
            const data = await res.json();

            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? {
                    ...o,
                    status: data.order.status,
                    start_count: data.order.start_count,
                } : o));
                toast.success('Status updated from provider');
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error('Error updating status');
        } finally {
            setUpdating(null);
        }
    };

    const handleShowDetails = (order: OrderData) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
        setDropdownOpen(null);
    };

    const handleEditClick = (order: OrderData) => {
        setSelectedOrder(order);
        setEditFormData({
            status: order.status,
            link: order.link,
            quantity: order.quantity,
            start_count: order.start_count || 0,
            remains: order.remains || 0
        });
        setShowEditModal(true);
        setDropdownOpen(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: name === 'link' || name === 'status' ? value : parseInt(value) || 0
        }));
    };

    const handleSaveEdit = async () => {
        if (!selectedOrder) return;

        try {
            setUpdating(selectedOrder.id);
            const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });
            const data = await res.json();

            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? data.order : o));
                toast.success('Order updated successfully');
                setShowEditModal(false);
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error('Error updating order');
        } finally {
            setUpdating(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleSyncAll = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/orders/sync-all', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                window.location.reload();
            } else {
                toast.error(data.error || 'Sync failed');
            }
        } catch {
            toast.error('Error syncing orders');
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchSearch = search === '' ||
                o.id.toString().includes(search) ||
                o.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
                o.user.username.toLowerCase().includes(search.toLowerCase()) ||
                o.link.toLowerCase().includes(search.toLowerCase()) ||
                o.service.name.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'all' || o.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [orders, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / perPage));
    const safePage = Math.min(page, totalPages);
    const pagedOrders = filteredOrders.slice((safePage - 1) * perPage, safePage * perPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
                    <p className="text-slate-500 font-medium">Review and manage user SMM orders.</p>
                </div>
                <button
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Update All Status'}
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search order ID, invoice, user, link..."
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
                            {['PENDING', 'PROCESSING', 'IN_PROGRESS', 'COMPLETED', 'SUCCESS', 'PARTIAL', 'CANCELED', 'ERROR'].map(s => (
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
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Charge</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pagedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">#{order.id}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-bold italic">@{order.user.username}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-900 font-bold truncate max-w-[200px]" title={order.service.name}>{order.service.name}</div>
                                        <div className="text-[10px] text-indigo-500 font-medium truncate max-w-[150px] mt-0.5">{order.link}</div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-900">${Number(order.price_sale).toFixed(4)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => setDropdownOpen(dropdownOpen === order.id ? null : order.id)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {dropdownOpen === order.id && (
                                            <div className="absolute right-6 top-10 z-20 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 min-w-[180px] animate-in slide-in-from-top-1 duration-200">
                                                <button
                                                    onClick={() => handleShowDetails(order)}
                                                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" /> View Details
                                                </button>
                                                {order.id_api_provider && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id)}
                                                        disabled={updating === order.id}
                                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {updating === order.id ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                        Sync with Provider
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditClick(order)}
                                                    className="w-full text-left px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit Order
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {pagedOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Showing {filteredOrders.length === 0 ? 0 : (safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filteredOrders.length)} of {filteredOrders.length}
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

            {/* Details Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Order Insight</h3>
                                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">#{selectedOrder.invoice_number}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-3 hover:bg-white hover:rotate-90 rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-900 shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Order Status</label>
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusIcon(selectedOrder.status)}
                                            {selectedOrder.status}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Customer Profile</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
                                                {selectedOrder.user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight">@{selectedOrder.user.username}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">{selectedOrder.user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Selling Price</p>
                                            <p className="text-lg font-black text-indigo-600">${Number(selectedOrder.price_sale).toFixed(4)}</p>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm opacity-50">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Provider Cost</p>
                                            <p className="text-lg font-black text-slate-900">${Number(selectedOrder.price_api).toFixed(4)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Service Target</label>
                                        <p className="text-xs font-bold text-white mb-4 line-clamp-2 leading-relaxed">{selectedOrder.service.name}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyToClipboard(selectedOrder.link)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                                            >
                                                <Clipboard className="w-3.5 h-3.5" /> Copy
                                            </button>
                                            <a
                                                href={selectedOrder.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Visit
                                            </a>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Quantity</label>
                                            <p className="text-lg font-black text-slate-900 tracking-tighter">{selectedOrder.quantity.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Start Count</label>
                                            <p className="text-lg font-black text-slate-900 tracking-tighter">{selectedOrder.start_count?.toLocaleString() || '0'}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-indigo-100">
                                            Remains: {selectedOrder.remains?.toLocaleString() || '0'}
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border ${selectedOrder.refill ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            Refill: {selectedOrder.refill ? 'ON' : 'OFF'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.id_api_provider && (
                                <div className="mt-10 pt-8 border-t border-dashed border-slate-200">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">API Connectivity</label>
                                    <div className="grid grid-cols-2 gap-6 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                                        <div>
                                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-tight">Provider Ident</p>
                                            <p className="text-sm font-bold text-slate-900 mt-1">Provider #{selectedOrder.id_api_provider}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-tight">Remote Service ID</p>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{selectedOrder.pid || 'MANUAL'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-4">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mr-auto">Logged: {new Date(selectedOrder.created_at).toLocaleString()}</span>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal Adaption */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !updating && setShowEditModal(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Modify Order</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">#{selectedOrder.invoice_number}</p>
                        </div>

                        <div className="p-8 space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Executive Status</label>
                                <select
                                    name="status"
                                    value={editFormData.status}
                                    onChange={handleEditInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                >
                                    {['PENDING', 'PROCESSING', 'IN_PROGRESS', 'COMPLETED', 'PARTIAL', 'CANCELED', 'ERROR', 'SUCCESS'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Destination (Link)</label>
                                <input
                                    type="text"
                                    name="link"
                                    value={editFormData.link}
                                    onChange={handleEditInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Volume (Qty)</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={editFormData.quantity}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Snapshot</label>
                                    <input
                                        type="number"
                                        name="start_count"
                                        value={editFormData.start_count}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Remaining Volume</label>
                                <input
                                    type="number"
                                    name="remains"
                                    value={editFormData.remains}
                                    onChange={handleEditInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                disabled={!!updating}
                                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={!!updating}
                                className="px-8 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                            >
                                {updating ? <Loader className="w-4 h-4 animate-spin" /> : 'Commit Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffOrdersClient;
