import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getUserIdFromAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    ExternalLink,
    Hash,
    Calendar,
    Layers,
    Globe,
    Package,
    Receipt,
    Zap,
    RefreshCw,
    Server
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Detail',
};

type Props = {
    params: Promise<{ id: string }>;
};

function getStatusStyle(status: string) {
    switch (status) {
        case 'COMPLETED':
        case 'SUCCESS':
            return { badge: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> };
        case 'IN_PROGRESS':
        case 'PROCESSING':
            return { badge: 'bg-blue-100 text-blue-700', icon: <Clock className="w-4 h-4" /> };
        case 'PENDING':
            return { badge: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> };
        case 'PARTIAL':
            return { badge: 'bg-purple-100 text-purple-700', icon: <AlertCircle className="w-4 h-4" /> };
        case 'ERROR':
        case 'CANCELED':
            return { badge: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> };
        default:
            return { badge: 'bg-slate-100 text-slate-700', icon: <Clock className="w-4 h-4" /> };
    }
}

function getStatusLabel(status: string) {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

export default async function OrderDetailPage({ params }: Props) {
    await cookies();
    const userId = await getUserIdFromAuth();
    if (!userId) redirect('/auth/login');

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) notFound();

    const order = await prisma.order.findFirst({
        where: { id: orderId, id_user: userId },
        include: {
            service: {
                include: {
                    category: {
                        include: { platform: true }
                    }
                }
            },
            api_provider: { select: { id: true, name: true } },
            discount_usages: {
                include: {
                    discount: { select: { name_discount: true, type: true, amount: true } }
                }
            }
        }
    });

    if (!order) notFound();

    const { badge, icon } = getStatusStyle(order.status);
    const discount = order.discount_usages?.[0]?.discount ?? null;
    const priceApi = Number(order.price_api);
    const priceSale = Number(order.price_sale);
    const priceSeller = Number(order.price_seller);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back */}
            <div className="mb-6">
                <Link
                    href="/user/history/order"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Order History
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Order #{order.id}</h1>
                    <p className="text-slate-500 text-sm mt-1 font-mono">{order.invoice_number}</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${badge}`}>
                    {icon}
                    {getStatusLabel(order.status)}
                </span>
            </div>

            <div className="grid gap-4">
                {/* Service Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 text-sm">Service Information</h2>
                    </div>
                    <div className="p-5 grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Globe className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Platform</p>
                                <p className="text-sm font-medium text-slate-900">{order.service.category.platform.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Layers className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Category</p>
                                <p className="text-sm font-medium text-slate-900">{order.service.category.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 sm:col-span-2">
                            <Package className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Service</p>
                                <p className="text-sm font-medium text-slate-900">[ID: {order.service.id}] {order.service.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 sm:col-span-2">
                            <ExternalLink className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Link / Target</p>
                                <a
                                    href={order.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline break-all"
                                >
                                    {order.link}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Stats */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 text-sm">Order Stats</h2>
                    </div>
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">Quantity</p>
                            <p className="text-lg font-bold text-slate-900">{order.quantity.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">Start Count</p>
                            <p className="text-lg font-bold text-slate-900">{order.start_count?.toLocaleString() ?? '—'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">Remains</p>
                            <p className={`text-lg font-bold ${(order.remains ?? 0) > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                                {order.remains?.toLocaleString() ?? '—'}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">Refill</p>
                            <p className="text-lg font-bold text-slate-900">{order.refill ? '✓' : '—'}</p>
                        </div>
                    </div>

                    {(order.runs || order.interval) && (
                        <div className="px-5 pb-5 grid grid-cols-2 gap-4">
                            {order.runs && (
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-slate-500 mb-1">Runs</p>
                                    <p className="text-lg font-bold text-slate-900">{order.runs}</p>
                                </div>
                            )}
                            {order.interval && (
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-slate-500 mb-1">Interval (min)</p>
                                    <p className="text-lg font-bold text-slate-900">{order.interval}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Payment Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 text-sm">Payment</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal (sale rate)</span>
                            <span className="font-medium text-slate-900">${priceSale.toFixed(4)}</span>
                        </div>
                        {discount && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>Discount ({discount.name_discount})</span>
                                <span className="font-medium">
                                    -{discount.type === 'PERCENTAGE'
                                        ? `${Number(discount.amount)}%`
                                        : `$${Number(discount.amount).toFixed(4)}`}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm pt-3 border-t border-dashed border-slate-200">
                            <span className="font-semibold text-slate-900">Total Charged</span>
                            <span className="font-bold text-emerald-600 text-base">${priceSale.toFixed(4)}</span>
                        </div>

                    </div>
                </div>

                {/* Meta */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 text-sm">Details</h2>
                    </div>
                    <div className="p-5 grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Created At</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <RefreshCw className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Last Updated</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {new Date(order.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
