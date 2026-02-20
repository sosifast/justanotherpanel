import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, CheckCircle, XCircle, Clock, User, CreditCard,
    Calendar, Hash, DollarSign, RefreshCw, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import AdminDepositActions from './AdminDepositActions';

export const dynamic = 'force-dynamic';


type Props = { params: Promise<{ id: string }> };

function getStatusStyle(status: string) {
    switch (status) {
        case 'PAYMENT': return { badge: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Completed' };
        case 'PENDING': return { badge: 'bg-amber-100 text-amber-800', icon: <Clock className="w-4 h-4" />, label: 'Pending' };
        case 'ERROR': return { badge: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Error' };
        case 'CANCELED': return { badge: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Canceled' };
        default: return { badge: 'bg-slate-100 text-slate-800', icon: <AlertCircle className="w-4 h-4" />, label: status };
    }
}

export default async function AdminDepositDetailPage({ params }: Props) {
    const { id } = await params;
    const depositId = parseInt(id);
    if (isNaN(depositId)) notFound();

    const deposit = await prisma.deposits.findUnique({
        where: { id: depositId },
        include: {
            user: { select: { id: true, username: true, email: true } }
        }
    });

    if (!deposit) notFound();

    const detail = deposit.detail_transaction as any;
    const provider = detail?.provider || detail?.method || 'Manual';
    const txnId = detail?.transactionId || detail?.paypal_order_id || detail?.cryptomus_uuid || detail?.order_id || '-';
    const fee = detail?.fee || 0;
    const amount = Number(deposit.amount);
    const { badge, icon, label } = getStatusStyle(deposit.status);

    const canAutoCheck = ['PAYPAL', 'CRYPTOMUS'].includes(provider) && deposit.status === 'PENDING';

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back */}
            <div className="mb-6">
                <Link
                    href="/admin/deposit_history"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Deposit History
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Deposit #{deposit.id}</h1>
                    <p className="text-slate-500 text-sm mt-1">Admin detail view</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${badge}`}>
                    {icon} {label}
                </span>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Transaction Details</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">User</p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                {deposit.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{deposit.user.username}</p>
                                <p className="text-xs text-slate-500">{deposit.user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-800">{provider}</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                        <p className="text-xl font-bold text-emerald-600">${amount.toFixed(2)}</p>
                        {fee > 0 && (
                            <p className="text-xs text-slate-400 mt-0.5">Fee: ${fee.toFixed(2)} · Net: ${(amount - fee).toFixed(2)}</p>
                        )}
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{format(new Date(deposit.created_at), 'dd MMM yyyy, HH:mm')}</span>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transaction ID</p>
                        <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 break-all">{txnId}</code>
                    </div>

                    {detail?.paypal_order_id && (
                        <div className="sm:col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PayPal Order ID</p>
                            <code className="text-xs bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700 break-all">{detail.paypal_order_id}</code>
                        </div>
                    )}

                    {detail?.cryptomus_uuid && (
                        <div className="sm:col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cryptomus UUID</p>
                            <code className="text-xs bg-purple-50 px-3 py-1.5 rounded-lg text-purple-700 break-all">{detail.cryptomus_uuid}</code>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Card */}
            <AdminDepositActions
                depositId={deposit.id}
                provider={provider}
                currentStatus={deposit.status}
                canAutoCheck={canAutoCheck}
            />
        </div>
    );
}
