import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ShoppingCart,
    Hash,
    RefreshCw,
    Info,
    Globe,
    Layers,
    Package,
    Clock,
    CheckCircle,
    Tag
} from 'lucide-react';
import { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) }, select: { name: true } });
    return { title: service ? `${service.name} — Service Detail` : 'Service Detail' };
}

const TYPE_LABELS: Record<string, string> = {
    DEFAULT: 'Default',
    CUSTOM_COMMENTS: 'Custom Comments',
    MENTIONS: 'Mentions',
    PACKAGE: 'Package',
    SUBSCRIPTIONS: 'Subscriptions',
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
        if (!minutes) return 'N/A';
        if (minutes < 60) return `~${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back */}
            <div className="mb-6">
                <Link
                    href="/user/services"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Services
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 leading-snug">{service.name}</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {service.category.platform.name} &rsaquo; {service.category.name}
                    </p>
                </div>
                <Link
                    href={`/user/new-order?service=${service.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm shadow-blue-200 flex-shrink-0"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Order Now
                </Link>
            </div>

            <div className="grid gap-4">
                {/* Pricing & Limits */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 text-sm">Pricing & Limits</h2>
                    </div>
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-emerald-600 mb-1 font-medium">Price / 1k</p>
                            <p className="text-xl font-bold text-emerald-700">${displayPrice.toFixed(4)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-slate-500 mb-1">Min Order</p>
                            <p className="text-xl font-bold text-slate-900">{service.min.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-slate-500 mb-1">Max Order</p>
                            <p className="text-xl font-bold text-slate-900">{service.max.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-slate-500 mb-1">Avg. Time</p>
                            <p className="text-xl font-bold text-slate-900">{formatAvgTime(avgMinutes)}</p>
                        </div>
                    </div>
                </div>

                {/* Service Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 text-sm">Service Info</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Globe className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Platform</p>
                                    <p className="text-sm font-medium text-slate-900">{service.category.platform.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Layers className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Category</p>
                                    <p className="text-sm font-medium text-slate-900">{service.category.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Hash className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Service ID</p>
                                    <p className="text-sm font-mono font-medium text-slate-900">#{service.id}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Package className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Type</p>
                                    <p className="text-sm font-medium text-slate-900">{TYPE_LABELS[service.type] ?? service.type}</p>
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {service.refill && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    <RefreshCw className="w-3 h-3" /> Refill Guaranteed
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" /> Active
                            </span>
                            {avgMinutes && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    <Clock className="w-3 h-3" /> Avg {formatAvgTime(avgMinutes)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Note */}
                {service.note && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 mb-1">Important Note</p>
                                <p className="text-sm text-amber-700 leading-relaxed">{service.note}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA */}
                <Link
                    href={`/user/new-order?service=${service.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm shadow-blue-200"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Order This Service
                </Link>
            </div>
        </div>
    );
}
