'use client';

import React from 'react';
import { X, Copy, CheckCircle, Clock, XCircle, CreditCard, Wallet, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type Deposit = {
    id: number;
    amount: number;
    status: string;
    created_at: Date;
    detail_transaction: any;
};

interface DepositDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deposit: Deposit | null;
}

const DepositDetailsModal = ({ isOpen, onClose, deposit }: DepositDetailsModalProps) => {
    if (!isOpen || !deposit) return null;

    const details = deposit.detail_transaction || {};
    const provider = details.provider || details.method || 'Unknown';
    const fee = details.fee || 0;
    const total = deposit.amount; // Assuming amount is total for display simplicity if not split
    const net = total - fee;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAYMENT':
                return (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Completed
                    </div>
                );
            case 'PENDING':
                return (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" /> Pending
                    </div>
                );
            case 'ERROR':
            case 'CANCELED':
                return (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" /> {status === 'ERROR' ? 'Failed' : 'Canceled'}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Transaction Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header Info */}
                    <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-slate-100 border-dashed">
                        {getStatusBadge(deposit.status)}
                        <h3 className="text-3xl font-bold text-slate-900 mt-4">${total.toFixed(2)}</h3>
                        <p className="text-slate-500 text-sm mt-1">Total Amount</p>
                    </div>

                    {/* Key Details */}
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500 text-sm">Transaction ID</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-slate-900">
                                    {details.transactionId || details.order_id || details.paypal_order_id || details.cryptomus_uuid || `#${deposit.id}`}
                                </span>
                                <button
                                    onClick={() => handleCopy(details.transactionId || details.order_id || details.paypal_order_id || details.cryptomus_uuid || deposit.id.toString())}
                                    className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                    <Copy className="w-3 h-3 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-slate-50">
                            <span className="text-slate-500 text-sm flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Date
                            </span>
                            <span className="text-sm font-medium text-slate-900">
                                {format(new Date(deposit.created_at), 'dd MMM yyyy, HH:mm')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-slate-50">
                            <span className="text-slate-500 text-sm flex items-center gap-2">
                                <Wallet className="w-3 h-3" /> Payment Method
                            </span>
                            <span className="text-sm font-medium text-slate-900 uppercase">
                                {provider}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-slate-50">
                            <span className="text-slate-500 text-sm">Status</span>
                            <span className="text-sm font-medium text-slate-900 capitalize">
                                {deposit.status.toLowerCase()}
                            </span>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Amount</span>
                            <span className="font-medium text-slate-900">${net.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Fee</span>
                            <span className="font-medium text-slate-900">${fee.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                            <span className="font-bold text-slate-700">Total</span>
                            <span className="font-bold text-slate-900">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                    {/* Could add 'Get Help' or other actions here */}
                </div>
            </div>
        </div>
    );
};

export default DepositDetailsModal;
