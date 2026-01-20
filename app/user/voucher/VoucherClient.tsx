'use client';

import React from 'react';
import { Tag, Calendar, Copy, CheckCircle, Percent, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';
import { Discount } from '@prisma/client';
import toast from 'react-hot-toast';

type SerializedDiscount = Omit<Discount, 'min_transaction' | 'max_transaction' | 'amount'> & {
    min_transaction: number;
    max_transaction: number;
    amount: number;
    usage_count: number;
};

const VoucherClient = ({ discounts }: { discounts: SerializedDiscount[] }) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied "${text}" to clipboard`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Available Vouchers</h1>
                    <p className="text-slate-500 text-sm">Use these codes to get discounts on your orders.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discounts.length > 0 ? (
                    discounts.map((discount) => {
                        const isExpired = new Date(discount.expired_date) < new Date();
                        const isFullyUsed = discount.usage_count >= discount.max_used;
                        const isAvailable = !isExpired && !isFullyUsed && discount.status === 'ACTIVE';

                        return (
                            <div
                                key={discount.id}
                                className={`group relative bg-white border rounded-xl overflow-hidden transition-all duration-300 ${isAvailable
                                    ? 'border-slate-200 hover:shadow-lg hover:border-blue-200'
                                    : 'border-slate-100 opacity-75 grayscale-[0.5]'
                                    }`}
                            >
                                {/* Top Banner */}
                                <div className={`h-2 ${isAvailable ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-200'}`} />

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isAvailable
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {discount.type === 'PERCENTAGE' ? (
                                                <Percent className="w-6 h-6" />
                                            ) : (
                                                <DollarSign className="w-6 h-6" />
                                            )}
                                        </div>
                                        {isAvailable ? (
                                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {isExpired ? 'Expired' : 'Limit Reached'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{discount.name_discount}</h3>
                                        <p className="text-sm text-slate-500">
                                            {discount.type === 'PERCENTAGE'
                                                ? `Get ${discount.amount}% off your order`
                                                : `Get $${discount.amount} off your order`
                                            }
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-slate-600 gap-2 bg-slate-50 p-2 rounded-lg">
                                            <ArrowRight className="w-4 h-4 text-slate-400" />
                                            <span>Min: <span className="font-semibold text-slate-900">${discount.min_transaction}</span></span>
                                            <span className="text-slate-300">|</span>
                                            <span>Max: <span className="font-semibold text-slate-900">${discount.max_transaction}</span></span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500 gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Expires: {new Date(discount.expired_date).toISOString().split('T')[0]}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500 gap-2">
                                            <Tag className="w-4 h-4" />
                                            <span>Used: {discount.usage_count} / {discount.max_used}</span>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => isAvailable && copyToClipboard(discount.name_discount)}
                                        className={`flex items-center justify-between p-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer group/code ${isAvailable
                                            ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300'
                                            : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className={`font-mono font-bold text-lg tracking-wider ${isAvailable ? 'text-blue-700' : 'text-slate-400'}`}>
                                            {discount.name_discount}
                                        </span>
                                        {isAvailable && (
                                            <Copy className="w-4 h-4 text-blue-400 group-hover/code:text-blue-600 transition-colors" />
                                        )}
                                    </div>
                                    {isAvailable && (
                                        <p className="text-xs text-center text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Click code to copy
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Tag className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No Vouchers Available</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            There are currently no active discount codes. Please check back later for new offers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoucherClient;
