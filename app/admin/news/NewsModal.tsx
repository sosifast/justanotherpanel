'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Type, Activity } from 'lucide-react';

type NewsData = {
    id?: number;
    subject: string;
    content: string;
    status: 'ACTIVE' | 'NOT_ACTIVE';
};

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NewsData) => Promise<void>;
    news?: NewsData;
}

const NewsModal = ({ isOpen, onClose, onSubmit, news }: NewsModalProps) => {
    const [formData, setFormData] = useState<NewsData>({
        subject: '',
        content: '',
        status: 'ACTIVE',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (news) {
            setFormData(news);
        } else {
            setFormData({
                subject: '',
                content: '',
                status: 'ACTIVE',
            });
        }
    }, [news, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">
                        {news ? 'Edit News' : 'Add New Announcement'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Important Announcement..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <textarea
                                required
                                rows={5}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Enter the details..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="NOT_ACTIVE">Not Active</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsModal;
