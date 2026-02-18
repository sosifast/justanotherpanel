import React from 'react';
import { Trash2 } from 'lucide-react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    sliderName: string;
    loading: boolean;
};

const SliderDeleteModal = ({ isOpen, onClose, onConfirm, sliderName, loading }: Props) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Delete Slider</h2>
                    <p className="text-center text-slate-500 text-sm">
                        Are you sure you want to delete <span className="font-semibold text-slate-700">"{sliderName}"</span>?
                        This action cannot be undone.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete Slider
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SliderDeleteModal;
