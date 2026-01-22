'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Download, ShoppingCart, User, Link as LinkIcon, DollarSign, CheckCircle, XCircle, Clock, Loader, RefreshCw, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

type OrderData = {
  id: number;
  id_api_provider: number | null;
  user: { username: string };
  service: { name: string };
  link: string;
  quantity: number;
  price_sale: any; // Decimal
  start_count: number | null;
  status: string;
  created_at: Date;
};

const OrdersClient = ({ initialOrders }: { initialOrders: OrderData[] }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order History</h1>
          <p className="text-slate-500 text-sm">View and manage user SMM orders.</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search order ID, link or user..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <select className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Pending</option>
            <option>Canceled</option>
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
              {orders.map((order) => (
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
                      <div className="absolute right-6 top-10 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px]">
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
                              onClick={() => handleManualUpdate(order.id)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-blue-600"
                            >
                              <Edit className="w-3 h-3" />
                              Update Status
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
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{orders.length}</span> of <span className="font-medium text-slate-900">{orders.length}</span> results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersClient;
