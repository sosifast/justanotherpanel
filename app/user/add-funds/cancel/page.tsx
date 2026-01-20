import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                You have cancelled the payment process. No funds have been deducted.
            </p>
            <Link
                href="/user/add-funds"
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
                Return to Add Funds
            </Link>
        </div>
    );
}
