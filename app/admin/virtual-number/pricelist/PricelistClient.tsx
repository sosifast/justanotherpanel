'use client';

import React, { useState } from 'react';
import { Search, ShoppingBag, Globe, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type ProductSmsData = {
    id: number;
    country_id: number;
    project_id: string;
    cost: number;
    cost_sale: number;
    total_count: number;
    title: string;
    code: string;
    created_at: Date;
    country: {
        id: number;
        title: string;
        code: string;
    };
};

export default function PricelistClient({ initialProducts }: { initialProducts: ProductSmsData[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const pageSizeOptions = [10, 20, 50, 100, 150];

    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/virtual-number/pricelist/sync', {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || 'Pricelist synced successfully');
                router.refresh();
            } else {
                toast.error(data.error || 'Failed to sync pricelist');
            }
        } catch (error) {
            toast.error('An error occurred during sync');
            console.error(error);
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredProducts = initialProducts.filter(product => {
        return product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.project_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.country?.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Calculate pagination slices
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, pageSize]);

    // Handlers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Virtual Number Pricelist</h1>
                    <p className="text-slate-500 text-sm">View and manage SMS pricelist across different countries.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Pricelist'}</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by product, code, project ID, or country..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Product Name</th>
                                <th className="px-6 py-4 font-semibold">Project ID / Code</th>
                                <th className="px-6 py-4 font-semibold">Country</th>
                                <th className="px-6 py-4 font-semibold text-right">Cost (API)</th>
                                <th className="px-6 py-4 font-semibold text-right">Cost (Sale)</th>
                                <th className="px-6 py-4 font-semibold text-right">Available Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500">#{product.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex-shrink-0 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                                <ShoppingBag className="w-4 h-4" />
                                            </div>
                                            <div className="font-medium text-slate-900">{product.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono text-xs text-slate-600">{product.project_id}</span>
                                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 w-fit">
                                                {product.code}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-700">{product.country?.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 text-right">
                                        ${product.cost.toFixed(4)}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-emerald-600 text-right">
                                        ${product.cost_sale.toFixed(4)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.total_count > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                            {product.total_count.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {paginatedProducts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-600">No products found</p>
                                            <p className="text-sm mt-1">Try adjusting your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="px-2 py-1 border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="font-medium text-slate-900">{endIndex}</span> of <span className="font-medium text-slate-900">{totalItems}</span> results
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
