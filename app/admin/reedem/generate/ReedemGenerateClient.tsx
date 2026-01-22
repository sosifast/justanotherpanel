'use client';

import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Edit, Trash2, X, Ticket, Calendar, DollarSign, Users, Info, Loader, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';

type RedeemCode = {
    id: number;
    name_code: string;
    quota: number;
    expired_date: string;
    get_balance: number;
    status: 'ACTIVE' | 'NOT_ACTIVE';
    total_info: string | null;
    created_at: string;
    _count: {
        used_by: number;
    };
};

const ReedemGenerateClient = ({ initialCodes }: { initialCodes: RedeemCode[] }) => {
    const [codes, setCodes] = useState(initialCodes);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedCode, setSelectedCode] = useState<RedeemCode | null>(null);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name_code: '',
        quota: '100',
        get_balance: '1.00',
        expired_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        status: 'ACTIVE',
        total_info: ''
    });

    const filteredCodes = codes.filter(code =>
        code.name_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddModal = () => {
        setFormData({
            name_code: '',
            quota: '100',
            get_balance: '1.00',
            expired_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            status: 'ACTIVE',
            total_info: ''
        });
        setModalType('add');
    };

    const openEditModal = (code: RedeemCode) => {
        setSelectedCode(code);
        setFormData({
            name_code: code.name_code,
            quota: code.quota.toString(),
            get_balance: code.get_balance.toString(),
            expired_date: format(new Date(code.expired_date), 'yyyy-MM-dd'),
            status: code.status,
            total_info: code.total_info || ''
        });
        setModalType('edit');
        setDropdownOpen(null);
    };

    const openDeleteModal = (code: RedeemCode) => {
        setSelectedCode(code);
        setModalType('delete');
        setDropdownOpen(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name_code.trim()) return toast.error('Code name is required');

        setLoading(true);
        try {
            const url = modalType === 'add' ? '/api/admin/reedem' : `/api/admin/reedem/${selectedCode?.id}`;
            const method = modalType === 'add' ? 'POST' : 'PATCH';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                if (modalType === 'add') {
                    setCodes([data, ...codes]);
                    toast.success('Code generated successfully');
                } else {
                    setCodes(codes.map(c => c.id === data.id ? data : c));
                    toast.success('Code updated successfully');
                }
                setModalType(null);
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCode) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reedem/${selectedCode.id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                setCodes(codes.filter(c => c.id !== selectedCode.id));
                toast.success('Code deleted successfully');
                setModalType(null);
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Redeem Codes</h1>
                    <p className="text-slate-500 text-sm">Create and manage top-up codes for users.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-4 h-4" />
                    Generate Code
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search code name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Code Name</th>
                                <th className="px-6 py-4 font-semibold">Value</th>
                                <th className="px-6 py-4 font-semibold">Usage</th>
                                <th className="px-6 py-4 font-semibold">Expiry</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCodes.map((code) => (
                                <tr key={code.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                <Ticket className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-900">{code.name_code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-emerald-600">${code.get_balance.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="font-bold">{code._count.used_by}</span> / {code.quota}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(code.expired_date), 'MMM dd, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${code.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {code.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => setDropdownOpen(dropdownOpen === code.id ? null : code.id)}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {dropdownOpen === code.id && (
                                            <div className="absolute right-6 top-10 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                                                <button onClick={() => openEditModal(code)} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                    <Edit className="w-3 h-3" /> Edit
                                                </button>
                                                <button onClick={() => openDeleteModal(code)} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredCodes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No codes found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !loading && setModalType(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">{modalType === 'add' ? 'Generate New Code' : modalType === 'edit' ? 'Edit Code' : 'Delete Code'}</h3>
                            <button onClick={() => setModalType(null)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
                        </div>

                        {modalType !== 'delete' ? (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Code Name</label>
                                    <input type="text" name="name_code" value={formData.name_code} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Quota</label>
                                        <input type="number" name="quota" value={formData.quota} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Balance ($)</label>
                                        <input type="number" step="0.01" name="get_balance" value={formData.get_balance} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Expiry Date</label>
                                    <input type="date" name="expired_date" value={formData.expired_date} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="NOT_ACTIVE">NOT_ACTIVE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Info (Notes)</label>
                                    <textarea name="total_info" value={formData.total_info} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><Trash2 className="w-6 h-6" /></div>
                                <h4 className="font-bold text-slate-800">Are you sure?</h4>
                                <p className="text-sm text-slate-500 mt-2">This will permanently delete code <span className="font-bold text-slate-700">{selectedCode?.name_code}</span>. This action cannot be undone.</p>
                            </div>
                        )}

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button disabled={loading} onClick={() => setModalType(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Cancel</button>
                            <button disabled={loading} onClick={modalType === 'delete' ? handleDelete : handleSubmit} className={`px-6 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${modalType === 'delete' ? 'bg-red-600 shadow-red-900/20' : 'bg-blue-600 shadow-blue-900/20'}`}>
                                {loading && <Loader className="w-4 h-4 animate-spin" />}
                                {modalType === 'delete' ? 'Delete' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReedemGenerateClient;
