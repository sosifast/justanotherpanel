'use client';

import { useState } from 'react';
import { updateSeoPageData } from './actions';
import { toast } from 'react-hot-toast';
import { Loader2, Save, Globe, FileText, Lock, User, HelpCircle, Info } from 'lucide-react';

type SeoData = {
    home_title?: string | null;
    home_desc?: string | null;
    service_title?: string | null;
    service_desc?: string | null;
    term_title?: string | null;
    term_desc?: string | null;
    about_title?: string | null;
    about_desc?: string | null;
    forget_title?: string | null;
    forget_desc?: string | null;
    login_title?: string | null;
    login_desc?: string | null;
    privacy_title?: string | null;
    privacy_desc?: string | null;
    [key: string]: any;
};

export default function SeoForm({ initialData }: { initialData: SeoData }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SeoData>(initialData);
    const [activeTab, setActiveTab] = useState('home');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateSeoPageData(formData);
            toast.success('SEO Settings updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update SEO settings');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'home', label: 'Home Page', icon: Globe },
        { id: 'service', label: 'Service Page', icon: FileText },
        { id: 'term', label: 'Terms Page', icon: FileText },
        { id: 'about', label: 'About Page', icon: Info },
        { id: 'login', label: 'Login Page', icon: User },
        { id: 'forget', label: 'Forget Password', icon: HelpCircle },
        { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200 flex-wrap">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                    {activeTab === 'home' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium text-slate-900">Home Page SEO</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        name="home_title"
                                        value={formData.home_title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter home page title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea
                                        name="home_desc"
                                        value={formData.home_desc || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter home page description"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'service' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium text-slate-900">Service Page SEO</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        name="service_title"
                                        value={formData.service_title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter service page title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea
                                        name="service_desc"
                                        value={formData.service_desc || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter service page description"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'term' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium text-slate-900">Terms Page SEO</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        name="term_title"
                                        value={formData.term_title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter terms page title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea
                                        name="term_desc"
                                        value={formData.term_desc || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter terms page description"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium text-slate-900">About Page SEO</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        name="about_title"
                                        value={formData.about_title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter about page title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea
                                        name="about_desc"
                                        value={formData.about_desc || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter about page description"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'forget' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium text-slate-900">Forget Password Page SEO</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        name="forget_title"
                                        value={formData.forget_title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter forget password page title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea
                                        name="forget_desc"
                                        value={formData.forget_desc || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter forget password page description"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'login' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium text-slate-900">Login Page SEO</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        name="login_title"
                                        value={formData.login_title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter login page title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea
                                        name="login_desc"
                                        value={formData.login_desc || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter login page description"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium text-slate-900">Privacy Policy Page SEO</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        name="privacy_title"
                                        value={formData.privacy_title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter privacy policy page title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea
                                        name="privacy_desc"
                                        value={formData.privacy_desc || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter privacy policy page description"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? 'Saving Changes...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
