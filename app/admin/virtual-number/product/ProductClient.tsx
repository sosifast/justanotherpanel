'use client';

import React, { useState } from 'react';
import { Search, ShoppingBag, Calendar, Globe } from 'lucide-react';

type ProductSmsData = {
    id: number;
    country_id: number;
    project_id: string;
    cost: number;
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

export default function ProductClient({ initialProducts }: { initialProducts: ProductSmsData[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = initialProducts.filter(product => {
        return product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.project_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.country?.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Virtual Number Products</h1>
                    <p className="text-slate-500 text-sm">View and manage SMS products available across different countries.</p>
                </div>
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
                <div className="text-sm text-slate-500 font-medium">
                    Total: {filteredProducts.length}
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
                                <th className="px-6 py-4 font-semibold text-right">Cost</th>
                                <th className="px-6 py-4 font-semibold text-right">Available Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map((product) => (
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
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.total_count > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                            {product.total_count.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-600">No products found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or sync with the provider.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
