'use client';

import React, { useState } from 'react';
import { Save, Link as LinkIcon, Key, Percent, Server, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

type SmsApiConfig = {
    id?: number;
    token: string;
    url: string;
    balance?: number;
    markup_price_pecentase: number;
};

export default function SmsApiSettingsClient({ initialConfig }: { initialConfig: SmsApiConfig | null }) {
    const [formData, setFormData] = useState<SmsApiConfig>({
        token: initialConfig?.token || '',
        url: initialConfig?.url || '',
        markup_price_pecentase: initialConfig?.markup_price_pecentase || 0,
    });
    const [loading, setLoading] = useState(false);
    const [updatingBalance, setUpdatingBalance] = useState(false);

    const handleUpdateBalance = async () => {
        setUpdatingBalance(true);
        try {
            const res = await fetch('/api/admin/virtual-number/api/balance', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update balance');
            }

            // Update UI with new balance
            setFormData(prev => ({ ...prev, balance: data.balance }));
            toast.success(`Balance updated: $${data.balance}`);

            // Reload page to reflect changes across the board if desired, 
            // but updating local state is smoother.
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error updating balance');
        } finally {
            setUpdatingBalance(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/virtual-number/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update settings');
            }

            toast.success('API Settings updated successfully');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 w-full">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Server className="w-6 h-6 text-blue-600" />
                    Virtual Number API Settings
                </h1>
                <p className="text-slate-500 text-sm mt-1">Configure your SMS API provider credentials and pricing markup.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 relative w-full flex flex-col">
                <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
                        {/* URL Endpoint */}
                        <div className="col-span-1 md:col-span-4 flex flex-col justify-end">
                            <label className="block text-sm font-medium text-slate-700 mb-1">API URL Endpoint</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    required
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    placeholder="https://api.smsprovider.com/v1"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">The base URL for the SMS provider API.</p>
                        </div>

                        {/* API Key / Token */}
                        <div className="col-span-1 md:col-span-4 flex flex-col justify-end">
                            <label className="block text-sm font-medium text-slate-700 mb-1">API Token / Key</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.token}
                                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                                    placeholder="Enter your API token..."
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1 opacity-0">Spacer</p>
                        </div>

                        {/* Markup Percentage */}
                        <div className="col-span-1 md:col-span-4 flex flex-col justify-end">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Markup Price Percentage (%)</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={formData.markup_price_pecentase}
                                    onChange={(e) => setFormData({ ...formData, markup_price_pecentase: Number(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    placeholder="0"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Extra percentage added to the base SMS cost for user sales.</p>
                        </div>

                        {/* Balance Display (Read Only) */}
                        {initialConfig?.balance !== undefined && (
                            <div className="col-span-1 md:col-span-12">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current API Balance</label>
                                <div className="relative w-full">
                                    <div className="w-full pl-4 pr-32 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium text-sm flex items-center h-10">
                                        <span>${formData.balance !== undefined ? Number(formData.balance).toFixed(4) : Number(initialConfig.balance).toFixed(4)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleUpdateBalance}
                                        disabled={updatingBalance || !formData.url || !formData.token}
                                        className="absolute right-1 top-1 bottom-1 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:hover:bg-blue-50"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${updatingBalance ? 'animate-spin' : ''}`} />
                                        Update
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">This balance updates automatically upon fetching products.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end mt-auto">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-600/20"
                        >
                            {loading ? (
                                'Saving Settings...'
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save API Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
