'use client';

import React from 'react';
import { Search, Filter, MoreVertical, Download, ShoppingCart, User, Link as LinkIcon, DollarSign, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

const SmmHistoryOrderPage = () => {
  const orders = [
    { id: '#ORD-9982', user: 'johndoe', service: 'Instagram Followers [RealHQ]', link: 'https://instagram.com/johndoe', quantity: 1000, charge: '$5.00', startCount: 120, status: 'Completed', date: '2 mins ago' },
    { id: '#ORD-9981', user: 'alice_s', service: 'TikTok Views [Instant]', link: 'https://tiktok.com/@alice/video/...', quantity: 5000, charge: '$2.50', startCount: 0, status: 'Processing', date: '1 hour ago' },
    { id: '#ORD-9980', user: 'bob_j', service: 'YouTube Likes', link: 'https://youtube.com/watch?v=...', quantity: 500, charge: '$10.00', startCount: 45, status: 'Pending', date: '3 hours ago' },
    { id: '#ORD-9979', user: 'sarah_w', service: 'Facebook Page Likes', link: 'https://facebook.com/page', quantity: 200, charge: '$4.00', startCount: 10, status: 'Canceled', date: '1 day ago' },
    { id: '#ORD-9978', user: 'mike_t', service: 'Instagram Comments', link: 'https://instagram.com/p/...', quantity: 50, charge: '$1.50', startCount: 0, status: 'Completed', date: '1 day ago' },
  ];

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
                    <div className="font-medium text-slate-900">{order.id}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {order.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      {order.user}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium truncate max-w-[200px]" title={order.service}>{order.service}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" /> 
                      <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[150px]">{order.link}</a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div>Qty: <span className="font-medium text-slate-700">{order.quantity}</span></div>
                    <div>Start: <span className="font-medium text-slate-700">{order.startCount}</span></div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{order.charge}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : 
                       order.status === 'Processing' ? <Loader className="w-3 h-3 animate-spin" /> : 
                       order.status === 'Pending' ? <Clock className="w-3 h-3" /> : 
                       <XCircle className="w-3 h-3" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">5</span> of <span className="font-medium text-slate-900">10,293</span> results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmmHistoryOrderPage;
