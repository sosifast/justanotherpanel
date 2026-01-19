'use client';

import React, { useState } from 'react';
import {
    Wallet,
    CreditCard,
    Bitcoin,
    Upload,
    CheckCircle,
    Clock,
    Info,
    Copy,
    ExternalLink,
    ChevronRight
} from 'lucide-react';

const AddFundsPage = () => {
    const [method, setMethod] = useState('');
    const [amount, setAmount] = useState('');

    const paymentMethods = [
        {
            id: 'paypal',
            name: 'PayPal',
            icon: '💳',
            description: 'Pay with PayPal balance or card',
            fee: '0%',
            minDeposit: 10,
            processing: 'Instant',
        },
        {
            id: 'crypto',
            name: 'Cryptomus',
            icon: '₿',
            description: 'Bitcoin, USDT, ETH & more',
            fee: '3%',
            minDeposit: 5,
            processing: '10-30 min',
        },
        {
            id: 'manual',
            name: 'Manual Transfer',
            icon: '🏦',
            description: 'Bank transfer or other methods',
            fee: '0%',
            minDeposit: 50,
            processing: '1-24 hours',
        },
    ];

    const quickAmounts = [10, 25, 50, 100, 250, 500];

    const selectedMethod = paymentMethods.find(m => m.id === method);
    const fee = selectedMethod?.fee === '0%' ? 0 : (parseFloat(amount || '0') * 0.03);
    const total = parseFloat(amount || '0') + fee;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Add Funds</h1>
                <p className="text-slate-500">Deposit money to your account balance</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Balance */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white flex items-center justify-between">
                        <div>
                            <p className="text-slate-300 text-sm mb-1">Current Balance</p>
                            <p className="text-3xl font-bold">$1,240.50</p>
                        </div>
                        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                            <Wallet className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-semibold text-slate-900">Select Payment Method</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-4">
                                {paymentMethods.map((pm) => (
                                    <button
                                        key={pm.id}
                                        onClick={() => setMethod(pm.id)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${method === pm.id
                                                ? 'border-blue-500 bg-blue-50/50'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                                                {pm.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">{pm.name}</h3>
                                                    {method === pm.id && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                                </div>
                                                <p className="text-sm text-slate-500">{pm.description}</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-slate-400">Fee: <span className="font-medium text-slate-700">{pm.fee}</span></p>
                                                <p className="text-xs text-slate-400">Min: <span className="font-medium text-slate-700">${pm.minDeposit}</span></p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    {method && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-semibold text-slate-900">Enter Amount</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Amount Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-slate-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder={`Min: $${selectedMethod?.minDeposit}`}
                                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-lg font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* Quick Amounts */}
                                <div>
                                    <p className="text-sm text-slate-500 mb-3">Quick select</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {quickAmounts.map((qa) => (
                                            <button
                                                key={qa}
                                                onClick={() => setAmount(qa.toString())}
                                                className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${amount === qa.toString()
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                ${qa}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                {parseFloat(amount) > 0 && (
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Deposit Amount</span>
                                            <span className="text-slate-900 font-medium">${parseFloat(amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Processing Fee ({selectedMethod?.fee})</span>
                                            <span className="text-slate-900 font-medium">${fee.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-slate-200 pt-3 flex justify-between">
                                            <span className="text-slate-700 font-medium">You will pay</span>
                                            <span className="text-lg text-slate-900 font-bold">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    disabled={!amount || parseFloat(amount) < (selectedMethod?.minDeposit || 0)}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {method === 'paypal' && <CreditCard className="w-4 h-4" />}
                                    {method === 'crypto' && <Bitcoin className="w-4 h-4" />}
                                    {method === 'manual' && <Upload className="w-4 h-4" />}
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Manual Transfer Instructions */}
                    {method === 'manual' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-semibold text-slate-900">Bank Transfer Details</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <div className="grid gap-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Bank Name</p>
                                                <p className="font-medium text-slate-900">Example Bank</p>
                                            </div>
                                            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                                <Copy className="w-4 h-4 text-slate-500" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Account Number</p>
                                                <p className="font-medium text-slate-900 font-mono">1234567890</p>
                                            </div>
                                            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                                <Copy className="w-4 h-4 text-slate-500" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Account Name</p>
                                                <p className="font-medium text-slate-900">JustAnotherPanel Ltd</p>
                                            </div>
                                            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                                <Copy className="w-4 h-4 text-slate-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                        <p className="text-sm text-amber-700">
                                            After making the transfer, please submit proof of payment below. Your balance will be credited within 1-24 hours.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Deposits */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900">Recent Deposits</h3>
                            <a href="/user/history/deposits" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                View All <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {[
                                { amount: 100, method: 'PayPal', status: 'Completed', date: '2 hours ago' },
                                { amount: 50, method: 'Cryptomus', status: 'Completed', date: '1 day ago' },
                                { amount: 200, method: 'Manual', status: 'Pending', date: '2 days ago' },
                            ].map((deposit, index) => (
                                <div key={index} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-slate-900">${deposit.amount.toFixed(2)}</p>
                                            <p className="text-xs text-slate-400">{deposit.method} • {deposit.date}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${deposit.status === 'Completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {deposit.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Help */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-blue-800 mb-1">Need Help?</p>
                                <p className="text-blue-600 mb-3">Having trouble adding funds? Our support team is here to assist.</p>
                                <a href="/user/tickets" className="inline-flex items-center gap-1 text-blue-700 font-medium hover:underline">
                                    Open a Ticket <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Processing Times */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" /> Processing Times
                        </h3>
                        <div className="space-y-3">
                            {paymentMethods.map((pm) => (
                                <div key={pm.id} className="flex justify-between text-sm">
                                    <span className="text-slate-500">{pm.name}</span>
                                    <span className="text-slate-900 font-medium">{pm.processing}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFundsPage;
