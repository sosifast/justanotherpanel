import React from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info, X } from 'lucide-react';

type Variant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: Variant;
    loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <Trash2 className="w-6 h-6 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-6 h-6 text-amber-600" />;
            case 'success':
                return <CheckCircle className="w-6 h-6 text-emerald-600" />;
            default:
                return <Info className="w-6 h-6 text-blue-600" />;
        }
    };

    const getIconBg = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-100';
            case 'warning':
                return 'bg-amber-100';
            case 'success':
                return 'bg-emerald-100';
            default:
                return 'bg-blue-100';
        }
    };

    const getButtonColor = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
            case 'success':
                return 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';
            default:
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-20 outline-none">
            <div
                className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm"
                onClick={!loading ? onClose : undefined}
            />

            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-100">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                    <button
                        type="button"
                        className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <span className="sr-only">Close</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="sm:flex sm:items-start">
                        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getIconBg()} sm:mx-0 sm:h-10 sm:w-10`}>
                            {getIcon()}
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-lg font-semibold leading-6 text-slate-900" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2 text-wrap break-words">
                                <div className="text-sm text-slate-500">
                                    {message}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-100">
                    <button
                        type="button"
                        className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColor()} sm:ml-3 sm:w-auto transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-all"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
