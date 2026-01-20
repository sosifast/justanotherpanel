'use client';

import React, { useState } from 'react';
import { Search, Plus, Calendar, CheckCircle, XCircle, Edit, Trash2, Tag, ArrowRight } from 'lucide-react';
import { Discount } from '@prisma/client';
import DiscountModal from './DiscountModal';
import toast from 'react-hot-toast';

type SerializedDiscount = Omit<Discount, 'min_transaction' | 'max_transaction' | 'amount' | 'discount_max_get'> & {
    min_transaction: number;
    max_transaction: number;
    discount_max_get: number;
    amount: number;
};

const DiscountClient = ({ initialDiscounts }: { initialDiscounts: SerializedDiscount[] }) => {
    const [discounts, setDiscounts] = useState<SerializedDiscount[]>(initialDiscounts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedDiscount, setSelectedDiscount] = useState<SerializedDiscount | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDiscounts = discounts.filter(d =>
        d.name_discount.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setModalMode('add');
        setSelectedDiscount(null);
        setIsModalOpen(true);
    };

    const handleEdit = (discount: SerializedDiscount) => {
        setModalMode('edit');
        setSelectedDiscount(discount);
        setIsModalOpen(true);
    };

    const handleDelete = async (discount: SerializedDiscount) => {
        if (!confirm(`Are you sure you want to delete "${discount.name_discount}"?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/discounts/${discount.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            setDiscounts(prev => prev.filter(d => d.id !== discount.id));
            toast.success('Discount deleted successfully');
        } catch (error) {
            toast.error('Failed to delete discount');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: any) => {
        const url = modalMode === 'add' ? '/api/admin/discounts' : `/api/admin/discounts/${selectedDiscount?.id}`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!res.ok) throw new Error('Failed to save');

        const savedDiscount = await res.json();

        if (modalMode === 'add') {
            setDiscounts(prev => [...prev, savedDiscount]);
            toast.success('Discount created successfully');
        } else {
            setDiscounts(prev => prev.map(d => d.id === savedDiscount.id ? savedDiscount : d));
            toast.success('Discount updated successfully');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Discounts</h1>
                    <p className="text-slate-500 text-sm">Manage promotional codes and discounts.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-4 h-4" />
                    New Discount
                </button>
            </div>

            {/* Filter/Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative max-w-sm">
                    <input
                        type="text"
                        placeholder="Search discounts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold text-center">Amount</th>
                                <th className="px-6 py-4 font-semibold text-center">Transaction Limit (Min - Max)</th>
                                <th className="px-6 py-4 font-semibold text-center">Expires</th>
                                <th className="px-6 py-4 font-semibold text-center">Max Used</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDiscounts.map((discount) => (
                                <tr key={discount.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-slate-900">{discount.name_discount}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-slate-700">
                                            {discount.type === 'PERCENTAGE' ? `${discount.amount}%` : `$${discount.amount}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-slate-600">
                                            <span>${discount.min_transaction}</span>
                                            <ArrowRight className="w-3 h-3 text-slate-400" />
                                            <span>${discount.max_transaction}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(discount.expired_date).toISOString().split('T')[0]}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono">
                                        {discount.max_used}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${discount.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                            }`}>
                                            {discount.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {discount.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(discount)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(discount)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDiscounts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        No discounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DiscountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                discount={selectedDiscount as any}
                mode={modalMode}
            />
        </div>
    );
};

export default DiscountClient;
