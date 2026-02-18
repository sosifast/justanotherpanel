'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

type ApiProviderDeleteModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    providerName: string;
    loading: boolean;
};

const ApiProviderDeleteModal = ({ isOpen, onClose, onConfirm, providerName, loading }: ApiProviderDeleteModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Deletion</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        Are you sure you want to delete <span className="font-semibold text-slate-800">"{providerName}"</span>?
                        This action cannot be undone and may affect services using this provider.
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Provider'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiProviderDeleteModal;
