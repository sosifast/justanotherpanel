'use client';

import React, { useState, useEffect } from 'react';
import { Search, Globe, Calendar, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import toast from 'react-hot-toast';

type CountrySmsData = {
    id: number;
    pid: string;
    title: string;
    code: string;
    created_at: Date;
};

export default function CountryClient({ initialCountries }: { initialCountries: CountrySmsData[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset to first page when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSyncCountries = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/virtual-number/country/sync', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to sync countries');
            }

            toast.success(`Synced successfully: ${data.added} added, ${data.updated} updated.`);

            // Reload the page to get the updated countries from server
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error syncing countries');
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredCountries = initialCountries.filter(country => {
        return country.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.pid.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Calculate pagination slices
    const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCountries = filteredCountries.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Virtual Number Countries</h1>
                    <p className="text-slate-500 text-sm">View and manage supported countries from the SMS API.</p>
                </div>
                <button
                    onClick={handleSyncCountries}
                    disabled={isSyncing}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-70"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Countries'}
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by name, code, or PID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Total: {filteredCountries.length}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Country Name</th>
                                <th className="px-6 py-4 font-semibold">Code / Prefix</th>
                                <th className="px-6 py-4 font-semibold">Provider ID (PID)</th>
                                <th className="px-6 py-4 font-semibold">Added On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedCountries.map((country) => (
                                <tr key={country.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500">#{country.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex-shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div className="font-medium text-slate-900">{country.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-medium border border-slate-200">
                                            {country.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                        {country.pid}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(country.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCountries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Globe className="w-8 h-8 text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-600">No countries found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or sync with the provider.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredCountries.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredCountries.length)}</span> of <span className="font-medium text-slate-900">{filteredCountries.length}</span> results
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="px-3 py-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded min-w-[3rem] text-center">
                                {currentPage} / {Math.max(totalPages, 1)}
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
