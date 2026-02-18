'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, ShoppingCart, User, Link as LinkIcon, DollarSign, CheckCircle, XCircle, Clock, Loader, RefreshCw, Trash2, Edit, Eye, X, Clipboard, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
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
  created_at: Date;
};

const OrdersClient = ({ initialOrders }: { initialOrders: OrderData[] }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
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

  const handleManualUpdate = async (orderId: number) => {
    const newStatus = prompt('Enter new status (PENDING, PROCESSING, COMPLETED, CANCELED, PARTIAL, ERROR):');
    if (!newStatus) return;

    const upperStatus = newStatus.toUpperCase();
    const validStatuses = ['PENDING', 'PROCESSING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'PARTIAL', 'ERROR', 'SUCCESS'];

    if (!validStatuses.includes(upperStatus)) {
      toast.error('Invalid status');
      return;
    }

    try {
      setUpdating(orderId);
      setDropdownOpen(null);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: upperStatus })
      });
      const data = await res.json();

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        toast.success('Order status updated successfully');
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Error updating order');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    try {
      setIsDeleting(orderId);
      setDropdownOpen(null);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success('Order deleted successfully');
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Error deleting order');
    } finally {
      setIsDeleting(null);
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
        // Refresh orders list from server by reloading
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
          <h1 className="text-2xl font-bold text-slate-800">Order History</h1>
          <p className="text-slate-500 text-sm">View and manage user SMM orders.</p>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Update All Status'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search order ID, invoice, user, link..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="SUCCESS">Success</option>
              <option value="PARTIAL">Partial</option>
              <option value="CANCELED">Canceled</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
          <select
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[10, 20, 50, 100, 200].map(n => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Charge</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">#{order.id}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      {order.user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium truncate max-w-[200px]" title={order.service.name}>{order.service.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[150px]">{order.link}</a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div>Qty: <span className="font-medium text-slate-700">{order.quantity}</span></div>
                    <div>Start: <span className="font-medium text-slate-700">{order.start_count || 0}</span></div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">${Number(order.price_sale).toFixed(4)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === order.id ? null : order.id)}
                      disabled={isDeleting === order.id}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {isDeleting === order.id ? <Loader className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                    </button>

                    {dropdownOpen === order.id && (
                      <div className="absolute right-6 top-10 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[170px]">
                        <button
                          onClick={() => handleShowDetails(order)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                        {order.id_api_provider ? (
                          <button
                            onClick={() => handleUpdateStatus(order.id)}
                            disabled={updating === order.id}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
                          >
                            {updating === order.id ? <Loader className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            Check Status
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(order)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-blue-600"
                            >
                              <Edit className="w-3 h-3" />
                              Edit Order
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete Order
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {pagedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredOrders.length === 0 ? 0 : (safePage - 1) * perPage + 1}</span>–<span className="font-medium text-slate-900">{Math.min(safePage * perPage, filteredOrders.length)}</span> of <span className="font-medium text-slate-900">{filteredOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, safePage - 2);
              const pg = start + i;
              if (pg > totalPages) return null;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${pg === safePage
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order Details</h3>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">#{selectedOrder.invoice_number}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status and User Section */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Customer</label>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                          {selectedOrder.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{selectedOrder.user.username}</p>
                          <p className="text-xs text-slate-500">{selectedOrder.user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pricing</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Sale Price</p>
                        <p className="text-sm font-bold text-slate-900">${Number(selectedOrder.price_sale).toFixed(4)}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Cost (API)</p>
                        <p className="text-sm font-bold text-slate-900">${Number(selectedOrder.price_api).toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service and Details Section */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Service Information</label>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-slate-900 mb-1">{selectedOrder.service.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => copyToClipboard(selectedOrder.link)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Clipboard className="w-3 h-3" /> Copy Link
                        </button>
                        <a
                          href={selectedOrder.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 bg-blue-600 rounded-lg text-[10px] font-bold text-white hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Visit
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Quantity</label>
                      <p className="text-sm font-bold text-slate-900">{selectedOrder.quantity.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Start Count</label>
                      <p className="text-sm font-bold text-slate-900">{selectedOrder.start_count?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Execution</label>
                    <div className="flex gap-2">
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${selectedOrder.refill ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                        Refill: {selectedOrder.refill ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold">
                        Remains: {selectedOrder.remains?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              {selectedOrder.id_api_provider && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Provider Metadata</label>
                  <div className="grid grid-cols-2 gap-4 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                    <div>
                      <p className="text-[10px] text-amber-600 font-bold uppercase">Provider ID</p>
                      <p className="text-sm font-bold text-slate-900">#{selectedOrder.id_api_provider}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-600 font-bold uppercase">External Order ID</p>
                      <p className="text-sm font-bold text-slate-900">{selectedOrder.pid || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 italic">
                  <span>Created: {new Date(selectedOrder.created_at).toLocaleString()}</span>
                  <span>Internal ID: #{selectedOrder.id}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !updating && setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Order</h3>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">#{selectedOrder.invoice_number}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={!!updating}
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="CANCELED">CANCELED</option>
                    <option value="ERROR">ERROR</option>
                    <option value="SUCCESS">SUCCESS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Link</label>
                  <input
                    type="text"
                    name="link"
                    value={editFormData.link}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={editFormData.quantity}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Start Count</label>
                    <input
                      type="number"
                      name="start_count"
                      value={editFormData.start_count}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Remains</label>
                  <input
                    type="number"
                    name="remains"
                    value={editFormData.remains}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={!!updating}
                className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!!updating}
                className="px-6 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {updating ? <Loader className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersClient;
