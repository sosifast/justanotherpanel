'use client';

import React from 'react';
import { Search, Filter, MoreVertical, Plus, Layers, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const SmmServicePage = () => {
  const services = [
    { id: 101, name: 'Instagram Followers [RealHQ] - Max 10k', category: 'Instagram Followers', rate: '$5.00', min: 100, max: 10000, status: 'Active' },
    { id: 102, name: 'Instagram Likes [Instant] - Max 50k', category: 'Instagram Likes', rate: '$1.00', min: 50, max: 50000, status: 'Active' },
    { id: 103, name: 'TikTok Views [Fast] - Max 1M', category: 'TikTok Views', rate: '$0.50', min: 1000, max: 1000000, status: 'Active' },
    { id: 104, name: 'YouTube Subscribers [Slow] - Max 5k', category: 'YouTube Subscribers', rate: '$25.00', min: 100, max: 5000, status: 'Inactive' },
    { id: 105, name: 'Facebook Page Likes [Real] - Max 20k', category: 'Facebook Page Likes', rate: '$15.00', min: 100, max: 20000, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">SMM Services</h1>
          <p className="text-slate-500 text-sm">Manage services, rates, and constraints.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20">
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search services..."
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
            <option>All Categories</option>
            <option>Instagram Followers</option>
            <option>Instagram Likes</option>
            <option>TikTok Views</option>
            <option>YouTube Subscribers</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Service ID & Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Rate (per 1k)</th>
                <th className="px-6 py-4 font-semibold">Min / Max</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{service.id}</div>
                    <div className="text-sm text-slate-600 truncate max-w-[250px]" title={service.name}>{service.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Layers className="w-4 h-4 text-slate-400" />
                      {service.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{service.rate}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div>Min: {service.min}</div>
                    <div>Max: {service.max}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ` +
                        (service.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800')
                      }
                    >
                      {service.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {service.status}
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
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">5</span> of <span className="font-medium text-slate-900">542</span> results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmmServicePage;
