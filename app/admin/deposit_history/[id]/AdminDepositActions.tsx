'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, Loader2, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import { checkDepositStatus } from '../actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Props = {
    depositId: number;
    provider: string;
    currentStatus: string;
    canAutoCheck: boolean;
};

const VALID_STATUSES = ['PENDING', 'PAYMENT', 'ERROR', 'CANCELED'];

export default function AdminDepositActions({ depositId, provider, currentStatus, canAutoCheck }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isManualUpdating, setIsManualUpdating] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [manualStatus, setManualStatus] = useState(currentStatus);

    const handleCheckStatus = () => {
        startTransition(async () => {
            try {
                const result = await checkDepositStatus(depositId);
                if (result.success) {
                    toast.success(result.message);
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            } catch {
                toast.error('Failed to check status');
            }
        });
    };

    const handleManualUpdate = async () => {
        if (manualStatus === currentStatus) {
            setShowManual(false);
            return;
        }
        setIsManualUpdating(true);
        try {
            const res = await fetch(`/api/admin/deposits/${depositId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: manualStatus })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Status updated');
                router.refresh();
                setShowManual(false);
            } else {
                toast.error(data.error || 'Update failed');
            }
        } catch {
            toast.error('Error updating status');
        } finally {
            setIsManualUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Admin Actions</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
                {canAutoCheck && (
                    <button
                        onClick={handleCheckStatus}
                        disabled={isPending}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm w-fit"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Check {provider} Status
                    </button>
                )}

                {!showManual ? (
                    <button
                        onClick={() => setShowManual(true)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors w-fit"
                    >
                        <Edit2 className="w-4 h-4" />
                        Manual Status Update
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <select
                            value={manualStatus}
                            onChange={e => setManualStatus(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {VALID_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleManualUpdate}
                            disabled={isManualUpdating}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            {isManualUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Save
                        </button>
                        <button
                            onClick={() => setShowManual(false)}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
