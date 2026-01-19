'use client';

import React, { useState } from 'react';
import { Search, MoreVertical, Plus, Server, Globe, CheckCircle, XCircle, Edit, Trash2, RefreshCw } from 'lucide-react';
import ApiProviderModal from './ApiProviderModal';

type ApiProviderData = {
  id: number;
  name: string;
  code: string;
  url: string;
  api_key: string;
  balance: any; // Decimal
  status: string;
};

type ApiProviderFormData = {
  name: string;
  code: string;
  url: string;
  api_key: string;
  balance: string;
  status: 'ACTIVE' | 'NOT_ACTIVE';
};

const ApiProvidersClient = ({ initialProviders }: { initialProviders: ApiProviderData[] }) => {
  const [providers, setProviders] = useState(initialProviders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProvider, setSelectedProvider] = useState<ApiProviderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingBalance, setUpdatingBalance] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter providers based on search and status
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setModalMode('add');
    setSelectedProvider(null);
    setIsModalOpen(true);
  };

  const handleEdit = (provider: ApiProviderData) => {
    setModalMode('edit');
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleDelete = async (provider: ApiProviderData) => {
    if (!confirm(`Are you sure you want to delete "${provider.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/api-providers/${provider.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete provider');
      }

      setProviders(prev => prev.filter(p => p.id !== provider.id));
      alert('Provider deleted successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to delete provider');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async (provider: ApiProviderData) => {
    setUpdatingBalance(provider.id);
    try {
      const response = await fetch(`/api/admin/api-providers/${provider.id}/balance`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update balance');
      }

      const result = await response.json();

      // Update the provider in the list with new balance
      setProviders(prev => prev.map(p =>
        p.id === provider.id ? { ...p, balance: result.balance } : p
      ));

      alert(`Balance updated successfully: $${Number(result.balance).toFixed(2)} ${result.currency || 'USD'}`);
    } catch (error: any) {
      alert(error.message || 'Failed to update balance');
    } finally {
      setUpdatingBalance(null);
    }
  };

  const handleSubmit = async (formData: ApiProviderFormData) => {
    const url = modalMode === 'add'
      ? '/api/admin/api-providers'
      : `/api/admin/api-providers/${selectedProvider?.id}`;

    const method = modalMode === 'add' ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save provider');
    }

    const savedProvider = await response.json();

    if (modalMode === 'add') {
      setProviders(prev => [...prev, savedProvider]);
    } else {
      setProviders(prev => prev.map(p => p.id === savedProvider.id ? savedProvider : p));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">API Providers</h1>
          <p className="text-slate-500 text-sm">Manage external API connections and balances.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="NOT_ACTIVE">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Provider Name</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">API URL</th>
                <th className="px-6 py-4 font-semibold">Balance</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <Server className="w-5 h-5" />
                      </div>
                      <div className="font-medium text-slate-900">{provider.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                      {provider.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="truncate max-w-[200px]">{provider.url}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">${Number(provider.balance).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${provider.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                      {provider.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdateBalance(provider)}
                        disabled={updatingBalance === provider.id}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Update Balance"
                      >
                        <RefreshCw className={`w-4 h-4 ${updatingBalance === provider.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleEdit(provider)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(provider)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProviders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {searchTerm || statusFilter !== 'all' ? 'No providers match your filters.' : 'No providers found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">1</span> to{' '}
            <span className="font-medium text-slate-900">{filteredProviders.length}</span> of{' '}
            <span className="font-medium text-slate-900">{providers.length}</span> results
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      <ApiProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        provider={selectedProvider}
        mode={modalMode}
      />
    </div>
  );
};

export default ApiProvidersClient;
