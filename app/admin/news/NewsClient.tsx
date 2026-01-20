'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Clock, Volume2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import NewsModal from './NewsModal';

type NewsData = {
    id: number;
    subject: string;
    content: string;
    status: 'ACTIVE' | 'NOT_ACTIVE';
    created_at: string | Date;
    updated_at: string | Date;
};

const NewsClient = ({ initialNews }: { initialNews: NewsData[] }) => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<NewsData | undefined>(undefined);

    const filteredNews = initialNews.filter(
        (item) =>
            item.subject.toLowerCase().includes(search.toLowerCase()) ||
            item.content.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedNews(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (news: NewsData) => {
        setSelectedNews(news);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this news?')) return;

        try {
            const res = await fetch(`/api/admin/news/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.success('News deleted successfully');
            router.refresh();
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete news');
        }
    };

    const handleSave = async (data: any) => {
        try {
            const url = selectedNews
                ? `/api/admin/news/${selectedNews.id}`
                : '/api/admin/news';

            const method = selectedNews ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save');
            }

            toast.success(`News ${selectedNews ? 'updated' : 'created'} successfully`);
            router.refresh();
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Volume2 className="w-6 h-6 text-blue-600" />
                        News & Announcements
                    </h1>
                    <p className="text-slate-500 text-sm">Manage platform announcements for users.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Add News
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search news..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                                <th className="px-6 py-4 font-semibold">Message</th>
                                <th className="px-6 py-4 font-semibold w-48">Date</th>
                                <th className="px-6 py-4 font-semibold text-center w-32">Status</th>
                                <th className="px-6 py-4 font-semibold text-right w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredNews.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-800 text-base mb-1">{item.subject}</p>
                                        <p className="text-slate-500 line-clamp-2">{item.content}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {format(new Date(item.created_at), 'dd MMM yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${item.status === 'ACTIVE'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}
                                        >
                                            {item.status === 'ACTIVE' ? (
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            ) : (
                                                <XCircle className="w-3.5 h-3.5" />
                                            )}
                                            {item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredNews.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        No news found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <NewsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                news={selectedNews as any}
            />
        </div>
    );
};

export default NewsClient;
