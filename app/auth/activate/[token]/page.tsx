import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default async function ActivatePage({
    params
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params;

    const user = await prisma.user.findUnique({
        where: { activation_token: token }
    });

    let success = false;
    let message = '';

    if (!user) {
        message = 'Invalid or expired activation link.';
    } else if (user.status === 'ACTIVE') {
        success = true;
        message = 'Your account is already active.';
    } else {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                status: 'ACTIVE',
                activation_token: null // Clear token after use
            }
        });
        success = true;
        message = 'Your account has been successfully activated!';
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                <div className="flex justify-center mb-6">
                    {success ? (
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                            <XCircle className="w-10 h-10" />
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4">
                    {success ? 'Account Activated' : 'Activation Failed'}
                </h1>

                <p className="text-slate-500 mb-8">
                    {message}
                </p>

                <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all"
                >
                    {success ? 'Proceed to Login' : 'Back to Login'}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
