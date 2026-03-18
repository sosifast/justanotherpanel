import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

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
    let description = '';

    if (!user) {
        message = 'Activation Failed';
        description = 'The security token is invalid or has already been used.';
    } else if (user.status === 'ACTIVE') {
        success = true;
        message = 'Already Verified';
        description = 'Your account is already active and ready for use.';
    } else {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                status: 'ACTIVE',
                activation_token: null // Clear token after use
            }
        });
        success = true;
        message = 'Identity Verified';
        description = 'Your account has been successfully initialized and activated.';
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative font-sans overflow-hidden uppercase-none">
            
            {/* Background Ambient Glows */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full -mr-64 -mt-64 ${success ? 'bg-emerald-600/10' : 'bg-red-600/10'}`} />
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] blur-[120px] rounded-full -ml-64 -mb-64 ${success ? 'bg-blue-600/10' : 'bg-indigo-600/10'}`} />
            
            <div className="max-w-md w-full relative">
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-10 lg:p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-500 text-center">
                    
                    <div className="flex justify-center mb-10">
                        {success ? (
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-400 relative z-10">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-bounce" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-black text-white tracking-tight mb-3">
                        {message}.
                    </h1>

                    <p className="text-slate-400 font-medium tracking-tight mb-10 leading-relaxed">
                        {description}
                    </p>

                    <Link
                        href="/auth/login"
                        className={`inline-flex items-center justify-center gap-3 w-full py-4.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all transform active:scale-[0.98] shadow-2xl ${
                            success 
                            ? 'bg-white text-slate-950 hover:bg-slate-100' 
                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                        }`}
                    >
                        {success ? 'Proceed to Intelligence' : 'Return to Login'}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                
                {/* Branding Below */}
                <p className="mt-8 text-center text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                    SECURE SYSTEM VERIFICATION
                </p>
            </div>
        </div>
    );
}
