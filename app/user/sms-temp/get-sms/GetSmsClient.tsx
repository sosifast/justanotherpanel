'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowLeft,
    Copy,
    CheckCircle2,
    Clock,
    Smartphone,
    Globe,
    ShoppingBag,
    Hash,
    Shield,
    RefreshCw,
    Loader2,
    MessageSquare,
    AlertCircle,
    XCircle,
    Phone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type OrderData = {
    id: number;
    invoice: string;
    request_id: string;
    number: string;
    status_order: string;
    sms_otp_code: string | null;
    price_sale: number;
    created_at: string;
    country: string;
    product: string;
};

type GetSmsClientProps = {
    user: {
        full_name: string;
        role: string;
        profile_imagekit_url: string | null;
        balance: number;
    };
    order: OrderData;
};

export default function GetSmsClient({ user, order: initialOrder }: GetSmsClientProps) {
    const router = useRouter();
    const [order, setOrder] = useState<OrderData>(initialOrder);
    const [polling, setPolling] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [isTimeout, setIsTimeout] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isPending = (order.status_order === 'PENDING' || order.status_order === 'PROCESSING') && !isTimeout;
    const isSuccess = order.status_order === 'SUCCESS' || order.status_order === 'COMPLETED';
    const isError = order.status_order === 'ERROR' || order.status_order === 'CANCELED' || isTimeout;

    // Poll for SMS status
    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/user/sms-temp/status?orderId=${order.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.order) {
                    setOrder(data.order);
                    if (data.order.sms_otp_code || data.order.status_order === 'SUCCESS' || data.order.status_order === 'COMPLETED') {
                        setPolling(false);
                        toast.success('SMS code received!');
                    }
                    if (data.order.status_order === 'ERROR' || data.order.status_order === 'CANCELED') {
                        setPolling(false);
                    }
                }
            }
        } catch (err) {
            // Silent fail, will retry
        }
    }, [order.id, isTimeout]);

    useEffect(() => {
        if (polling && isPending) {
            intervalRef.current = setInterval(checkStatus, 5000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [polling, isPending, checkStatus]);

    // Countdown logic
    useEffect(() => {
        if (isPending) {
            const startTime = new Date(order.created_at).getTime();
            const tick = () => {
                const now = Date.now();
                const diff = Math.max(0, 300 - Math.floor((now - startTime) / 1000));
                setTimeLeft(diff);
                if (diff <= 0) {
                    checkStatus(); // Force one last check to trigger server-side timeout/refund
                    setIsTimeout(true);
                    setPolling(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            };
            tick();
            timerRef.current = setInterval(tick, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPending, order.created_at]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(label);
            toast.success(`${label} copied!`);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = () => {
        if (isSuccess) {
            return {
                icon: <CheckCircle2 size={28} strokeWidth={2.5} />,
                label: 'SMS RECEIVED',
                color: 'text-emerald-500',
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                pulse: false
            };
        }
        if (isTimeout) {
            return {
                icon: <Clock size={28} strokeWidth={2.5} />,
                label: 'TIMEOUT',
                color: 'text-rose-500',
                bg: 'bg-rose-50',
                border: 'border-rose-100',
                pulse: false
            };
        }
        if (isError) {
            return {
                icon: <XCircle size={28} strokeWidth={2.5} />,
                label: order.status_order === 'CANCELED' ? 'CANCELED' : 'ERROR',
                color: 'text-rose-500',
                bg: 'bg-rose-50',
                border: 'border-rose-100',
                pulse: false
            };
        }
        return {
            icon: <Clock size={28} strokeWidth={2.5} />,
            label: 'WAITING FOR SMS',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            pulse: true
        };
    };

    const status = getStatusConfig();

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-28 select-none mx-auto w-full md:max-w-3xl lg:max-w-4xl shadow-2xl relative transition-all duration-300">

            {/* Header */}
            <div className="p-6 flex items-center gap-3 bg-white border-b border-emerald-50 sticky top-0 z-40">
                <button
                    onClick={() => router.push('/user/sms-temp/service')}
                    className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="font-black text-sm text-slate-900 uppercase tracking-tight truncate">Get SMS</h2>
                    <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest leading-none">{order.invoice}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`p-2.5 ${status.bg} rounded-xl ${status.color}`}>
                        {status.icon}
                    </div>
                </div>
            </div>

            {/* Status Hero */}
            <div className="px-6 mt-8">
                <div className={`p-8 rounded-[2.5rem] ${status.bg} border ${status.border} text-center relative overflow-hidden`}>
                    {/* Pulse ring animation for pending */}
                    {status.pulse && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-32 h-32 rounded-full border-2 border-amber-200 animate-ping opacity-20"></div>
                        </div>
                    )}

                    <div className={`inline-flex p-4 rounded-3xl ${status.color} bg-white shadow-sm mb-4 relative`}>
                        {isPending ? (
                            <Loader2 size={32} className="animate-spin" strokeWidth={2.5} />
                        ) : (
                            status.icon
                        )}
                    </div>

                    <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] ${status.color} mb-2`}>
                        {status.label}
                    </h3>

                    {isPending && (
                        <div className="mt-3">
                            <span className="text-[28px] font-black text-slate-900 tabular-nums leading-none">
                                {formatTime(timeLeft)}
                            </span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                Time Remaining
                            </p>
                        </div>
                    )}

                    {isSuccess && order.sms_otp_code && (
                        <div className="mt-4">
                            <button
                                onClick={() => copyToClipboard(order.sms_otp_code!, 'OTP Code')}
                                className="group relative"
                            >
                                <div className="flex items-center justify-center gap-3 bg-white rounded-2xl px-8 py-5 shadow-lg shadow-emerald-100 border border-emerald-100 hover:shadow-xl transition-all active:scale-[0.98]">
                                    <MessageSquare size={20} className="text-emerald-500" strokeWidth={2.5} />
                                    <span className="text-[24px] font-black text-slate-900 tracking-widest tabular-nums">
                                        {order.sms_otp_code}
                                    </span>
                                    {copied === 'OTP Code' ? (
                                        <CheckCircle2 size={18} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    )}
                                </div>
                            </button>
                        </div>
                    )}

                    {isError && (
                        <div className="mt-3">
                            <p className="text-[11px] font-bold text-rose-400 uppercase tracking-widest">
                                {isTimeout 
                                    ? 'Request timed out. Please try again.'
                                    : order.status_order === 'CANCELED' 
                                        ? 'This order has been canceled.' 
                                        : 'An error occurred. Please try again.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Number Card */}
            <div className="px-6 mt-6">
                <div className="p-5 bg-white border border-slate-50 rounded-[2rem] shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Phone size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                <p className="text-[18px] font-black text-slate-900 tracking-tight tabular-nums mt-0.5">
                                    {order.number}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => copyToClipboard(order.number, 'Number')}
                            className={`p-3 rounded-xl transition-all active:scale-95 ${
                                copied === 'Number'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
                            }`}
                        >
                            {copied === 'Number' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details */}
            <div className="px-6 mt-6 space-y-3">
                <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-[0.2em] px-1">
                    Order Details
                </h3>

                <div className="bg-white border border-slate-50 rounded-[2rem] shadow-sm shadow-black/5 divide-y divide-slate-50">
                    {/* Product */}
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                            <Smartphone size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Service</p>
                            <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight italic truncate">{order.product}</p>
                        </div>
                    </div>

                    {/* Country */}
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                            <Globe size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Country</p>
                            <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight italic">{order.country}</p>
                        </div>
                    </div>

                    {/* Request ID */}
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                            <Hash size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Request ID</p>
                            <p className="text-[13px] font-black text-slate-900 tracking-tight tabular-nums">{order.request_id}</p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(order.request_id, 'Request ID')}
                            className={`p-2 rounded-lg transition-all active:scale-95 ${
                                copied === 'Request ID'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-50 text-slate-300 hover:text-emerald-500'
                            }`}
                        >
                            {copied === 'Request ID' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        </button>
                    </div>

                    {/* Price */}
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                            <ShoppingBag size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price Paid</p>
                            <p className="text-[13px] font-black text-emerald-600 italic">${order.price_sale.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                            <Clock size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ordered At</p>
                            <p className="text-[13px] font-bold text-slate-600">{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 mt-8 space-y-3">
                {isPending && (
                    <button
                        onClick={checkStatus}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2 shadow-lg shadow-amber-200 transition-all active:scale-[0.98]"
                    >
                        <RefreshCw size={16} strokeWidth={3} className={polling ? 'animate-spin' : ''} />
                        Check SMS Now
                    </button>
                )}

                <button
                    onClick={() => router.push('/user/sms-temp/service')}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                >
                    <ArrowLeft size={16} strokeWidth={3} />
                    Back to Services
                </button>

                <button
                    onClick={() => router.push('/user/history')}
                    className="w-full py-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl text-[12px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Shield size={16} strokeWidth={3} />
                    Order History
                </button>
            </div>

            {/* Polling Indicator */}
            {isPending && polling && (
                <div className="px-6 mt-6">
                    <div className="flex items-center justify-center gap-2 py-3">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Auto-checking every 5 seconds
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
