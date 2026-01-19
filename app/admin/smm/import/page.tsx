'use client';

import React from 'react';
import { Search, Filter, Download, Plus, CloudDownload, Check, AlertCircle, ArrowRight } from 'lucide-react';

const SmmImportPage = () => {
  // Mock data representing services fetched from an API provider
  const servicesToImport = [
    { id: 1001, remoteId: 554, name: 'Instagram Followers [Real] - Max 10k', type: 'Default', rate: 0.45, min: 100, max: 10000, provider: 'SMM King' },
    { id: 1002, remoteId: 555, name: 'Instagram Likes [Instant]', type: 'Default', rate: 0.10, min: 50, max: 20000, provider: 'SMM King' },
    { id: 1003, remoteId: 120, name: 'TikTok Views [Fast]', type: 'Default', rate: 0.01, min: 1000, max: 1000000, provider: 'SMM King' },
    { id: 1004, remoteId: 882, name: 'YouTube Subscribers [Non-Drop]', type: 'Default', rate: 12.50, min: 100, max: 2000, provider: 'SMM King' },
    { id: 1005, remoteId: 993, name: 'Facebook Page Likes', type: 'Default', rate: 8.00, min: 100, max: 50000, provider: 'SMM King' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Import Services</h1>
          <p className="text-slate-500 text-sm">Import services from connected API providers.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <Filter className="w-4 h-4" />
                Bulk Edit
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20">
            <CloudDownload className="w-4 h-4" />
            Import Selected
            </button>
        </div>
      </div>

      {/* Provider Selection & Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Provider</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select API Provider...</option>
                    <option selected>SMM King (Balance: $54.20)</option>
                    <option>JustAnotherPanel (Balance: $12.00)</option>
                    <option>PerfectPanel (Balance: $0.00)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Percentage Increase (%)</label>
                <input 
                    type="number" 
                    placeholder="e.g. 20"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Search Service</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search service name..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-10">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="px-6 py-4 font-semibold">Remote ID</th>
                <th className="px-6 py-4 font-semibold">Service Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Provider Rate</th>
                <th className="px-6 py-4 font-semibold">Min / Max</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servicesToImport.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                   <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">{service.remoteId}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{service.name}</div>
                    <div className="text-xs text-slate-500">{service.provider}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                        {service.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">${service.rate.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div>Min: {service.min}</div>
                    <div>Max: {service.max}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group" title="Import this service">
                      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">5</span> of <span className="font-medium text-slate-900">128</span> services</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmmImportPage;
