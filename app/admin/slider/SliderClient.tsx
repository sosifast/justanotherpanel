'use client';

import React, { useState } from 'react';
import { Search, Plus, Image as ImageIcon, Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import SliderModal from './SliderModal';
import SliderDeleteModal from './SliderDeleteModal';
import { useRouter } from 'next/navigation';

type SliderData = {
    id: number;
    name: string;
    slug: string;
    imagekit_url_banner: string;
    created_at: Date;
    updated_at: Date;
};

const SliderClient = ({ initialSliders }: { initialSliders: SliderData[] }) => {
    const [sliders, setSliders] = useState(initialSliders);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedSlider, setSelectedSlider] = useState<SliderData | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Filter sliders based on search
    const filteredSliders = sliders.filter(slider =>
        slider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slider.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setModalMode('add');
        setSelectedSlider(null);
        setIsModalOpen(true);
    };

    const handleEdit = (slider: SliderData) => {
        setModalMode('edit');
        setSelectedSlider(slider);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (slider: SliderData) => {
        setSelectedSlider(slider);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedSlider) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/slider/${selectedSlider.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete');

            setSliders(prev => prev.filter(s => s.id !== selectedSlider.id));
            toast.success('Slider deleted successfully');
            setDeleteModalOpen(false);
            setSelectedSlider(null);
            router.refresh();
        } catch (error) {
            toast.error('Failed to delete slider');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (data: any) => {
        const url = modalMode === 'add' ? '/api/admin/slider' : `/api/admin/slider/${selectedSlider?.id}`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to save');
        }

        const savedSlider = await res.json();

        if (modalMode === 'add') {
            setSliders(prev => [savedSlider, ...prev]);
            toast.success('Slider created successfully');
        } else {
            setSliders(prev => prev.map(s => s.id === savedSlider.id ? savedSlider : s));
            toast.success('Slider updated successfully');
        }
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sliders</h1>
                    <p className="text-slate-500 text-sm">Manage homepage banners and sliders.</p>
                </div>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                    onClick={handleAdd}
                >
                    <Plus className="w-4 h-4" />
                    Add Slider
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search sliders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm text-slate-500">
                    Total Sliders: <span className="font-semibold text-slate-900">{filteredSliders.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Banner</th>
                                <th className="px-6 py-4 font-semibold">Name / Slug</th>
                                <th className="px-6 py-4 font-semibold">Created At</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSliders.map((slider) => (
                                <tr key={slider.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-32 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                                            {slider.imagekit_url_banner ? (
                                                <img
                                                    src={slider.imagekit_url_banner}
                                                    alt={slider.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{slider.name}</div>
                                        <code className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                                            {slider.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>{format(new Date(slider.created_at), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(slider)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(slider)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSliders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        {searchTerm ? 'No sliders match your search.' : 'No sliders found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SliderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                slider={selectedSlider}
                mode={modalMode}
            />

            <SliderDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                sliderName={selectedSlider?.name || ''}
                loading={isDeleting}
            />
        </div>
    );
};

export default SliderClient;
