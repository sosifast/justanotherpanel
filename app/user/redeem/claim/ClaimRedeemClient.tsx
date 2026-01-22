'use client';

import React, { useState } from 'react';
import { Ticket, Loader, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const ClaimRedeemClient = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ amount: number; new_balance: number | string } | null>(null);

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return toast.error('Please enter a redeem code');

        setLoading(true);
        try {
            const res = await fetch('/api/user/redeem/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() })
            });

            const data = await res.json();

            if (res.ok) {
                setResult({ amount: data.amount, new_balance: data.new_balance });
                toast.success('Code claimed successfully!');
                setCode('');
            } else {
                toast.error(data.error || 'Failed to claim code');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl text-blue-600 mb-2">
                    <Ticket className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Claim Redeem Code</h1>
                <p className="text-slate-500">Enter your code below to add balance to your account instantly.</p>
            </div>

            {result ? (
                <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl shadow-emerald-500/5 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Successfully Claimed!</h2>
                        <p className="text-slate-500">The balance has been added to your account.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Amount Added</p>
                            <p className="text-2xl font-black text-emerald-700">${Number(result.amount).toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">New Balance</p>
                            <p className="text-2xl font-black text-emerald-700">${Number(result.new_balance).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setResult(null)}
                            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                        >
                            Claim Another
                        </button>
                        <Link
                            href="/user/history/deposits"
                            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            View Deposits <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                    <form onSubmit={handleClaim} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">Redeem Code</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="EX: WELCOME-2024"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-black tracking-widest placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-center uppercase"
                                    disabled={loading}
                                />
                                {code && !loading && (
                                    <button
                                        type="button"
                                        onClick={() => setCode('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                                    >
                                        <AlertCircle className="w-5 h-5 rotate-45" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-6 h-6 animate-spin" />
                                    Claiming...
                                </>
                            ) : (
                                'Claim Reward Now'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-700 leading-relaxed">
                            <p className="font-bold mb-1">Important Information:</p>
                            <ul className="list-disc list-inside space-y-1 opacity-80">
                                <li>Each code can only be used once per account.</li>
                                <li>Make sure to check the expiration date of your code.</li>
                                <li>Balance will be added instantly to your wallet.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimRedeemClient;
