'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Discount } from '@prisma/client';

type DiscountFormData = {
    name_discount: string;
    min_transaction: string;
    max_transaction: string;
    discount_max_get: string;
    type: 'PERCENTAGE' | 'FIXED';
    amount: string;
    expired_date: string;
    max_used: string;
    status: 'ACTIVE' | 'NOT_ACTIVE';
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DiscountFormData) => Promise<void>;
    discount: (Discount & { min_transaction: number; max_transaction: number; discount_max_get: number; amount: number }) | null;
    mode: 'add' | 'edit';
};

const DiscountModal = ({ isOpen, onClose, onSubmit, discount, mode }: Props) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<DiscountFormData>({
        name_discount: '',
        min_transaction: '',
        max_transaction: '',
        discount_max_get: '',
        type: 'PERCENTAGE',
        amount: '',
        expired_date: '',
        max_used: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        if (discount && mode === 'edit') {
            setFormData({
                name_discount: discount.name_discount,
                min_transaction: discount.min_transaction.toString(),
                max_transaction: discount.max_transaction.toString(),
                discount_max_get: (discount.discount_max_get ?? 0).toString(),
                type: discount.type,
                amount: discount.amount.toString(),
                expired_date: new Date(discount.expired_date).toISOString().split('T')[0],
                max_used: discount.max_used.toString(),
                status: discount.status
            });
        } else {
            setFormData({
                name_discount: '',
                min_transaction: '',
                max_transaction: '',
                discount_max_get: '',
                type: 'PERCENTAGE',
                amount: '',
                expired_date: '',
                max_used: '',
                status: 'ACTIVE'
            });
        }
    }, [discount, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">
                        {mode === 'add' ? 'New Discount' : 'Edit Discount'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Discount Name
                        </label>
                        <input
                            type="text"
                            name="name_discount"
                            required
                            value={formData.name_discount}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. SUMMER2024"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Min Transaction
                            </label>
                            <input
                                type="number"
                                name="min_transaction"
                                required
                                value={formData.min_transaction}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Max Transaction
                            </label>
                            <input
                                type="number"
                                name="max_transaction"
                                required
                                value={formData.max_transaction}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Max Discount Amount (Get)
                        </label>
                        <input
                            type="number"
                            name="discount_max_get"
                            required
                            value={formData.discount_max_get}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0 for unlimited"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Amount
                            </label>
                            <input
                                type="number"
                                name="amount"
                                required
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Expired Date
                            </label>
                            <input
                                type="date"
                                name="expired_date"
                                required
                                value={formData.expired_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Max Used
                            </label>
                            <input
                                type="number"
                                name="max_used"
                                required
                                value={formData.max_used}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="NOT_ACTIVE">Not Active</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === 'add' ? 'Create Discount' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default DiscountModal;
