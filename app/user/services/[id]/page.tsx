import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft,
    ShoppingCart,
    Hash,
    RefreshCw,
    Info,
    Globe,
    Layers,
    Package,
    Clock,
    CheckCircle2,
    Tag,
    Smartphone,
    TrendingUp,
    Zap,
    ShieldCheck,
    SmartphoneIcon
} from 'lucide-react';
import { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) }, select: { name: true } });
    return { title: service ? `${service.name} — Service Detail` : 'Service Detail' };
}

const TYPE_LABELS: Record<string, string> = {
    DEFAULT: 'Default Flow',
    CUSTOM_COMMENTS: 'Custom Remarks',
    MENTIONS: 'Target Engagement',
    PACKAGE: 'Bundle Node',
    SUBSCRIPTIONS: 'Recurring Active',
};

export default async function ServiceDetailPage({ params }: Props) {
    const session = await getCurrentUser();
    if (!session) redirect('/auth/login');

    const { id } = await params;
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) notFound();

    const service = await prisma.service.findFirst({
        where: { id: serviceId, status: 'ACTIVE' },
        include: {
            category: { include: { platform: true } }
        }
    });

    if (!service) notFound();

    const isReseller = ['RESELLER', 'STAFF', 'ADMIN'].includes(session.role);
    const displayPrice = isReseller
        ? Number(service.price_reseller)
        : Number(service.price_sale);

    // Avg completion time from completed orders
    const avgRows = await prisma.$queryRaw<{ avg_minutes: number }[]>`
        SELECT ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60))::int AS avg_minutes
        FROM "order"
        WHERE id_service = ${serviceId}
          AND status IN ('COMPLETED', 'SUCCESS', 'PARTIAL')
    `;
    const avgMinutes = avgRows[0]?.avg_minutes ?? null;

    function formatAvgTime(minutes: number | null) {
        if (!minutes) return 'BASE-0 (N/A)';
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none relative max-w-2xl mx-auto shadow-2xl">
            {/* Header Sticky Container */}
            <div className="bg-white sticky top-0 z-40 border-b border-emerald-50 shadow-sm p-6">
                <div className="flex items-center">
                    <Link
                        href="/user/services"
                        className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight uppercase italic truncate">Service Detail</h2>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Hero Section Card */}
                <div className="bg-emerald-600 p-8 rounded-[3rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                    <div className="relative z-10 space-y-5">
                       <div className="flex items-center justify-between">

                            <span className="text-xl font-black italic opacity-60">#{service.id}</span>
                       </div>
                       
                       <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight italic">
                           {service.name}
                       </h1>
                       
                       <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                               {service.category.platform.icon_imagekit_url ? (
                                   <img src={service.category.platform.icon_imagekit_url} className="w-6 h-6 object-contain" alt="pf" />
                               ) : (
                                   <SmartphoneIcon size={20} />
                               )}
                           </div>
                           <div className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-tight">
                               <p className="text-white">{service.category.platform.name}</p>
                               <p className="text-emerald-300">{service.category.name}</p>
                           </div>
                       </div>
                    </div>
                    
                    {/* Abstract Circle Backgrounds */}
                    <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-emerald-500 rounded-full opacity-40 blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-700 rounded-full opacity-20"></div>
                </div>

                {/* Specs Section Grid */}
                <div className="space-y-6">
                   

                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-emerald-50 rounded-[2rem] p-4 shadow-sm flex flex-col items-center">
                            <Tag className="text-emerald-500 mb-1" size={20} />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Price</p>
                            <p className="text-lg font-black text-slate-900">${displayPrice.toFixed(4)}</p>
                        </div>
                        <div className="bg-white border border-emerald-50 rounded-[2rem] p-4 shadow-sm flex flex-col items-center">
                            <Clock className="text-emerald-500 mb-1" size={20} />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-1">AVG Time</p>
                            <p className="text-lg font-black text-slate-900">{formatAvgTime(avgMinutes)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-emerald-50 rounded-[2rem] p-4 shadow-sm flex flex-col items-center">
                            <TrendingUp className="text-emerald-500 mb-1" size={20} />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Min Order</p>
                            <p className="text-lg font-black text-slate-900">{service.min.toLocaleString()}</p>
                        </div>
                        <div className="bg-white border border-emerald-50 rounded-[2rem] p-4 shadow-sm flex flex-col items-center">
                            <ShieldCheck className="text-emerald-500 mb-1" size={20} />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Max Order</p>
                            <p className="text-lg font-black text-slate-900">{service.max.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Additional Metadata */}
                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner space-y-6">
                    <div className="flex items-start space-x-4">
                        <Info className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-2">Information</h4>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <p className="text-xs font-bold text-slate-700">Service Type: {TYPE_LABELS[service.type] ?? service.type}</p>
                                </div>
                                {service.refill && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <p className="text-xs font-bold text-slate-700">Refill Protocol: Guaranteed Active</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {service.note && (
                        <div className="flex items-start space-x-4 pt-4 border-t border-slate-200">
                           <Zap className="text-amber-500 shrink-0 mt-0.5" size={20} />
                           <div className="space-y-2">
                               <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-[0.2em]">Note</h4>
                               <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic">
                                   "{service.note}"
                               </p>
                           </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Action Area */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-emerald-50/50 z-50 rounded-t-[3.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] max-w-2xl mx-auto">
                <Link
                    href={`/user/new-order?service=${service.id}`}
                    className="w-full py-5 rounded-[2.5rem] bg-emerald-600 text-white font-black text-sm tracking-widest flex items-center justify-center space-x-4 shadow-2xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all uppercase italic"
                >
                    <ShoppingCart size={22} strokeWidth={3} />
                    <span>Order Now</span>
                </Link>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
}
