'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, CloudDownload, Check, AlertCircle, ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Provider {
    id: number;
    name: string;
    url: string;
    balance: number;
}

interface Category {
    id: number;
    name: string;
}

interface RemoteService {
    service: string | number;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: boolean;
    desc?: string;
}

const SmmImportClient = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [services, setServices] = useState<RemoteService[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [markupSale, setMarkupSale] = useState('20');
    const [markupReseller, setMarkupReseller] = useState('10');
    const [selectedServices, setSelectedServices] = useState<Set<string | number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [providersRes, categoriesRes] = await Promise.all([
                axios.get('/api/admin/api-providers'),
                axios.get('/api/admin/categories')
            ]);
            setProviders(providersRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load providers or categories');
        }
    };

    const handleProviderChange = async (providerId: string) => {
        setSelectedProvider(providerId);
        setCurrentPage(1);
        if (!providerId) {
            setServices([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(`/api/admin/api-providers/${providerId}/services`);
            // Handle different response formats (object or array)
            const data = Array.isArray(response.data) ? response.data :
                (response.data.services ? response.data.services : []);
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to fetch services from provider');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectService = (id: string | number) => {
        const newSelected = new Set(selectedServices);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedServices(newSelected);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedServices(new Set(paginatedServices.map(s => s.service)));
        } else {
            const newSelected = new Set(selectedServices);
            paginatedServices.forEach(s => newSelected.delete(s.service));
            setSelectedServices(newSelected);
        }
    };

    const handleImport = async () => {
        if (!selectedProvider || !selectedCategory || selectedServices.size === 0) {
            toast.error('Please select provider, category and at least one service');
            return;
        }

        setIsImporting(true);
        try {
            const servicesToImport = services.filter(s => selectedServices.has(s.service));
            const response = await axios.post('/api/admin/smm/import', {
                providerId: selectedProvider,
                services: servicesToImport,
                categoryId: selectedCategory,
                markupSale,
                markupReseller
            });
            toast.success(response.data.message);
            setSelectedServices(new Set());
        } catch (error) {
            console.error('Error importing services:', error);
            toast.error('Failed to import services');
        } finally {
            setIsImporting(false);
        }
    };

    const filteredServices = services.filter(service => {
        const name = service.name || '';
        const category = service.category || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedServices = filteredServices.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Import Services</h1>
                    <p className="text-slate-500 text-sm">Import services from connected API providers.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleImport}
                        disabled={isImporting || selectedServices.size === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                        Import Selected ({selectedServices.size})
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-3 sticky top-0 z-10">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Provider</label>
                        <select
                            value={selectedProvider}
                            onChange={(e) => handleProviderChange(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select API Provider...</option>
                            {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Balance: ${p.balance})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Category...</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-28">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Sale (%)</label>
                        <input
                            type="number"
                            value={markupSale}
                            onChange={(e) => setMarkupSale(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-28">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Reseller (%)</label>
                        <input
                            type="number"
                            value={markupReseller}
                            onChange={(e) => setMarkupReseller(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1 min-w-[180px] relative">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search service name or category..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-[calc(100%-1.85rem)] w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedServices.length > 0 && paginatedServices.every(s => selectedServices.has(s.service))}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-4 font-semibold">Service ID</th>
                                <th className="px-6 py-4 font-semibold">Service Name</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold text-right">Rate</th>
                                <th className="px-6 py-4 font-semibold text-right">Min / Max</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <span>Fetching services from provider...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredServices.length > 0 ? (
                                paginatedServices.map((service) => (
                                    <tr key={service.service} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedServices.has(service.service)}
                                                onChange={() => handleSelectService(service.service)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{service.service}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{service.name}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{service.type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                                                {service.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700 text-right">${service.rate}</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs text-right">
                                            <div>Min: {service.min}</div>
                                            <div>Max: {service.max}</div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        {selectedProvider ? 'No services found.' : 'Select a provider to view services.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {filteredServices.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-medium text-slate-700">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredServices.length)}</span> of <span className="font-medium text-slate-700">{filteredServices.length}</span> services
                            {selectedServices.size > 0 && <span className="ml-2 text-blue-600">· {selectedServices.size} selected</span>}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-xs">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p as number)}
                                            className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${safePage === p
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )
                            }
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmmImportClient;
