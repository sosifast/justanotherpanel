'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';

type GatewayFormData = {
    provider: 'PAYPAL' | 'CRYPTOMUS' | 'MANUAL';
    min_deposit: string;
    status: 'ACTIVE' | 'NOT_ACTIVE';
    fee: string;
    // PayPal
    paypal_client_id: string;
    paypal_client_secret: string;
    paypal_mode: 'sandbox' | 'live';
    // Cryptomus
    cryptomus_merchant_id: string;
    cryptomus_payment_key: string;
    // Manual
    manual_bank_name: string;
    manual_account_number: string;
    manual_account_holder: string;
    manual_instructions: string;
};

interface GatewayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    gateway?: any;
}

const GatewayModal = ({ isOpen, onClose, onSubmit, gateway }: GatewayModalProps) => {
    const [loading, setLoading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    const initialData: GatewayFormData = {
        provider: 'PAYPAL',
        min_deposit: '10',
        status: 'ACTIVE',
        fee: '0',
        paypal_client_id: '',
        paypal_client_secret: '',
        paypal_mode: 'sandbox',
        cryptomus_merchant_id: '',
        cryptomus_payment_key: '',
        manual_bank_name: '',
        manual_account_number: '',
        manual_account_holder: '',
        manual_instructions: '',
    };

    const [formData, setFormData] = useState<GatewayFormData>(initialData);

    useEffect(() => {
        if (gateway) {
            const config = gateway.api_config || {};
            setFormData({
                provider: gateway.provider,
                min_deposit: gateway.min_deposit.toString(),
                status: gateway.status,
                fee: config.fee || '0',
                paypal_client_id: config.clientId || '',
                paypal_client_secret: config.clientSecret || '',
                paypal_mode: config.mode || 'sandbox',
                cryptomus_merchant_id: config.merchantId || '',
                cryptomus_payment_key: config.paymentKey || '',
                manual_bank_name: config.bankName || '',
                manual_account_number: config.accountNumber || '',
                manual_account_holder: config.accountHolder || '',
                manual_instructions: config.instructions || '',
            });
        } else {
            setFormData(initialData);
        }
    }, [gateway, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const api_config: any = { fee: formData.fee };

        if (formData.provider === 'PAYPAL') {
            api_config.clientId = formData.paypal_client_id;
            api_config.clientSecret = formData.paypal_client_secret;
            api_config.mode = formData.paypal_mode;
        } else if (formData.provider === 'CRYPTOMUS') {
            api_config.merchantId = formData.cryptomus_merchant_id;
            api_config.paymentKey = formData.cryptomus_payment_key;
        } else if (formData.provider === 'MANUAL') {
            api_config.bankName = formData.manual_bank_name;
            api_config.accountNumber = formData.manual_account_number;
            api_config.accountHolder = formData.manual_account_holder;
            api_config.instructions = formData.manual_instructions;
        }

        const submitData = {
            provider: formData.provider,
            min_deposit: parseFloat(formData.min_deposit),
            status: formData.status,
            api_config
        };

        try {
            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-slate-800">
                        {gateway ? 'Edit Gateway' : 'New Gateway'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Provider Selection */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Provider</label>
                            <select
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PAYPAL">PayPal</option>
                                <option value="CRYPTOMUS">Cryptomus</option>
                                <option value="MANUAL">Manual Transfer</option>
                            </select>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="NOT_ACTIVE">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Min Deposit ($)</label>
                            <input
                                type="number"
                                value={formData.min_deposit}
                                onChange={(e) => setFormData({ ...formData, min_deposit: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Fee (%)</label>
                            <input
                                type="number"
                                value={formData.fee}
                                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                            Configuration
                        </h3>

                        {formData.provider === 'PAYPAL' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Client ID</label>
                                    <input
                                        type="text"
                                        value={formData.paypal_client_id}
                                        onChange={(e) => setFormData({ ...formData, paypal_client_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Client Secret</label>
                                    <div className="relative">
                                        <input
                                            type={showSecret ? "text" : "password"}
                                            value={formData.paypal_client_secret}
                                            onChange={(e) => setFormData({ ...formData, paypal_client_secret: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                        >
                                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Mode</label>
                                    <select
                                        value={formData.paypal_mode}
                                        onChange={(e) => setFormData({ ...formData, paypal_mode: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="sandbox">Sandbox</option>
                                        <option value="live">Live</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {formData.provider === 'CRYPTOMUS' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Merchant ID</label>
                                    <input
                                        type="text"
                                        value={formData.cryptomus_merchant_id}
                                        onChange={(e) => setFormData({ ...formData, cryptomus_merchant_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Payment Key</label>
                                    <div className="relative">
                                        <input
                                            type={showSecret ? "text" : "password"}
                                            value={formData.cryptomus_payment_key}
                                            onChange={(e) => setFormData({ ...formData, cryptomus_payment_key: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                        >
                                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.provider === 'MANUAL' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Bank Name</label>
                                    <input
                                        type="text"
                                        value={formData.manual_bank_name}
                                        onChange={(e) => setFormData({ ...formData, manual_bank_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
                                        <input
                                            type="text"
                                            value={formData.manual_account_number}
                                            onChange={(e) => setFormData({ ...formData, manual_account_number: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Account Holder</label>
                                        <input
                                            type="text"
                                            value={formData.manual_account_holder}
                                            onChange={(e) => setFormData({ ...formData, manual_account_holder: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Instructions / Notes</label>
                                    <textarea
                                        value={formData.manual_instructions}
                                        onChange={(e) => setFormData({ ...formData, manual_instructions: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter payment instructions for the user..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Gateway
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GatewayModal;
