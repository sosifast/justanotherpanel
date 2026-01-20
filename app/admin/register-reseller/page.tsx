import { prisma } from "@/lib/prisma";
import { Shield, Mail, Wallet, Calendar, Search, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default async function AdminResellerPage() {
    const resellers = await prisma.reseller.findMany({
        include: {
            user: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Reseller Management</h1>
                    <p className="text-slate-500 text-sm">
                        View and manage all registered resellers.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">{resellers.length} Total Resellers</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search resellers..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                <th className="px-6 py-4 border-b border-slate-100">Reseller</th>
                                <th className="px-6 py-4 border-b border-slate-100">Contact</th>
                                <th className="px-6 py-4 border-b border-slate-100">Balance</th>
                                <th className="px-6 py-4 border-b border-slate-100">Status</th>
                                <th className="px-6 py-4 border-b border-slate-100">Joined Date</th>
                                <th className="px-6 py-4 border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {resellers.map((reseller) => (
                                <tr key={reseller.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {reseller.user.profile_imagekit_url ? (
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                                                    <Image
                                                        src={reseller.user.profile_imagekit_url}
                                                        alt={reseller.user.full_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border border-blue-100">
                                                    {reseller.user.full_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{reseller.user.full_name}</p>
                                                <p className="text-xs text-slate-500">@{reseller.user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-sm">{reseller.user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-900">
                                                ${parseFloat(reseller.user.balance.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reseller.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                            {reseller.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-sm">
                                                {new Date(reseller.created_at).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {resellers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No resellers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
