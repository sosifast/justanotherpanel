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
    ChevronRight,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Gateway = {
    id: number;
    provider: string; // 'PAYPAL' | 'CRYPTOMUS' | 'MANUAL'
    min_deposit: number;
    api_config: any;
};

const AddFundsClient = ({ gateways, userBalance }: { gateways: Gateway[], userBalance: number }) => {
    const router = useRouter();
    const [method, setMethod] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const quickAmounts = [10, 25, 50, 100, 250, 500];

    const selectedGateway = gateways.find(g => g.id === method);

    const getFee = (gateway: Gateway) => {
        const feeConfig = gateway.api_config?.fee || '0';
        if (feeConfig.endsWith('%')) {
            const percentage = parseFloat(feeConfig);
            return (parseFloat(amount || '0') * percentage) / 100;
        }
        return parseFloat(feeConfig);
    };

    const fee = selectedGateway ? getFee(selectedGateway) : 0;
    const total = parseFloat(amount || '0') + fee;

    const getIcon = (provider: string) => {
        switch (provider) {
            case 'PAYPAL': return '💳';
            case 'CRYPTOMUS': return '₿';
            case 'MANUAL': return '🏦';
            default: return '💰';
        }
    };

    const getDescription = (provider: string) => {
        switch (provider) {
            case 'PAYPAL': return 'Pay with PayPal balance or card';
            case 'CRYPTOMUS': return 'Bitcoin, USDT, ETH & more';
            case 'MANUAL': return 'Bank transfer or other methods';
            default: return 'Add funds instantly';
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleSubmit = async () => {
        if (!selectedGateway || !amount) return;

        setLoading(true);
        try {
            if (selectedGateway.provider === 'MANUAL') {
                // For manual, we might just create a pending deposit or show instructions + generic success?
                // Usually manual requires submitting proof. For now, let's create a "Pending" deposit and tell user to contact support/wait.
                const res = await fetch('/api/user/deposits/manual', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gatewayId: selectedGateway.id,
                        amount: parseFloat(amount)
                    })
                });
                if (!res.ok) throw new Error('Failed to create deposit request');
                toast.success('Deposit request created. Please follow instructions.');
                // Maybe redirect to history or stay here?
            } else if (selectedGateway.provider === 'PAYPAL') {
                const res = await fetch('/api/user/deposits/paypal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gatewayId: selectedGateway.id,
                        amount: parseFloat(amount)
                    })
                });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.error('Failed to initialize PayPal payment');
                }
            } else if (selectedGateway.provider === 'CRYPTOMUS') {
                const res = await fetch('/api/user/deposits/cryptomus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gatewayId: selectedGateway.id,
                        amount: parseFloat(amount)
                    })
                });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.error('Failed to initialize Cryptomus payment');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

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
                            <p className="text-3xl font-bold">${userBalance.toFixed(2)}</p>
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
                                {gateways.map((gw) => (
                                    <button
                                        key={gw.id}
                                        onClick={() => setMethod(gw.id)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${method === gw.id
                                            ? 'border-blue-500 bg-blue-50/50'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                                                {getIcon(gw.provider)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">{gw.provider === 'MANUAL' ? (gw.api_config?.bankName || 'Manual Transfer') : (gw.provider.charAt(0) + gw.provider.slice(1).toLowerCase())}</h3>
                                                    {method === gw.id && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                                </div>
                                                <p className="text-sm text-slate-500">{getDescription(gw.provider)}</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-slate-400">Fee: <span className="font-medium text-slate-700">{gw.api_config?.fee || '0'}%</span></p>
                                                <p className="text-xs text-slate-400">Min: <span className="font-medium text-slate-700">${gw.min_deposit}</span></p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </button>
                                ))}
                                {gateways.length === 0 && (
                                    <p className="text-center text-slate-500 py-4">No payment methods available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    {selectedGateway && (
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
                                            placeholder={`Min: $${selectedGateway.min_deposit}`}
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
                                            <span className="text-slate-500">Processing Fee ({selectedGateway.api_config?.fee || '0'}%)</span>
                                            <span className="text-slate-900 font-medium">${fee.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-slate-200 pt-3 flex justify-between">
                                            <span className="text-slate-700 font-medium">You will pay</span>
                                            <span className="text-lg text-slate-900 font-bold">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Submit */}
                                {selectedGateway.provider !== 'MANUAL' && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !amount || parseFloat(amount) < selectedGateway.min_deposit}
                                        className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <>
                                                {selectedGateway.provider === 'PAYPAL' && <CreditCard className="w-4 h-4" />}
                                                {selectedGateway.provider === 'CRYPTOMUS' && <Bitcoin className="w-4 h-4" />}
                                                Proceed to Payment
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Manual Transfer Instructions */}
                    {selectedGateway?.provider === 'MANUAL' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-semibold text-slate-900">Bank Transfer Details</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <div className="grid gap-4">
                                        {selectedGateway.api_config?.bankName && (
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase">Bank Name</p>
                                                    <p className="font-medium text-slate-900">{selectedGateway.api_config.bankName}</p>
                                                </div>
                                                <button onClick={() => handleCopy(selectedGateway.api_config.bankName)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                                    <Copy className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </div>
                                        )}
                                        {selectedGateway.api_config?.accountNumber && (
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase">Account Number</p>
                                                    <p className="font-medium text-slate-900 font-mono">{selectedGateway.api_config.accountNumber}</p>
                                                </div>
                                                <button onClick={() => handleCopy(selectedGateway.api_config.accountNumber)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                                    <Copy className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </div>
                                        )}
                                        {selectedGateway.api_config?.accountHolder && (
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase">Account Holder</p>
                                                    <p className="font-medium text-slate-900">{selectedGateway.api_config.accountHolder}</p>
                                                </div>
                                                <button onClick={() => handleCopy(selectedGateway.api_config.accountHolder)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                                    <Copy className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </div>
                                        )}
                                        {selectedGateway.api_config?.instructions && (
                                            <div className="pt-2 border-t border-slate-200 mt-2">
                                                <p className="text-xs text-slate-400 uppercase mb-1">Instructions</p>
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedGateway.api_config.instructions}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                        <p className="text-sm text-amber-700">
                                            After making the transfer, click below to confirm. Your balance will be credited after verification.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !amount || parseFloat(amount) < selectedGateway.min_deposit}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Confirm Transfer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
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
                </div>
            </div>
        </div>
    );
};

export default AddFundsClient;
