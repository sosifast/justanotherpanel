import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                Your payment has been processed successfully. Your balance will be updated shortly.
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
