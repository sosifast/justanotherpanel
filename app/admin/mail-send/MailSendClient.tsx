'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Users, Send, Loader2, Search, X, User as UserIcon, Check, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import dynamic from 'next/dynamic';

// Load React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-lg" />
});
import 'react-quill-new/dist/quill.snow.css';

const MailSendClient = () => {
    const [target, setTarget] = useState<'ALL_MEMBERS' | 'SELECTED_USERS'>('ALL_MEMBERS');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [foundUsers, setFoundUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // Modal States
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isRecipientsModalOpen, setIsRecipientsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number } | null>(null);

    // Search users for multiple select
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (userSearch.length < 2) {
                setFoundUsers([]);
                return;
            }
            setSearching(true);
            try {
                const res = await fetch(`/api/admin/mail-send?q=${encodeURIComponent(userSearch)}`);
                if (res.ok) {
                    const data = await res.json();
                    setFoundUsers(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [userSearch]);

    const handleSelectUser = (user: any) => {
        if (!selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setUserSearch('');
        setFoundUsers([]);
    };

    const handleRemoveUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    const handleOpenConfirm = () => {
        if (!subject || !content) {
            toast.error('Subject and content are required');
            return;
        }
        if (target === 'SELECTED_USERS' && selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }
        setIsConfirmModalOpen(true);
    };

    const handleSendBroadcast = async () => {
        setIsConfirmModalOpen(false);
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mail-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target,
                    subject,
                    content,
                    selectedUserIds: target === 'SELECTED_USERS' ? selectedUsers.map(u => u.id) : null
                })
            });

            const data = await res.json();
            if (res.ok) {
                setBroadcastResult({ sent: data.successCount, failed: data.failCount });
                setIsSuccessModalOpen(true);
                setSubject('');
                setContent('');
                setSelectedUsers([]);
            } else {
                toast.error(data.error || 'Failed to send broadcast');
            }
        } catch (err) {
            console.error(err);
            toast.error('Internal server error');
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
        ],
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Email Marketing</h1>
                    <p className="text-slate-500 text-sm">Send professional broadcast emails to your users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Recipients</label>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => setTarget('ALL_MEMBERS')}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${target === 'ALL_MEMBERS'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500/10'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${target === 'ALL_MEMBERS' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">All Members</p>
                                        <p className="text-xs opacity-70">Send to all active users</p>
                                    </div>
                                    {target === 'ALL_MEMBERS' && <Check className="ml-auto w-5 h-5" />}
                                </button>

                                <button
                                    onClick={() => setTarget('SELECTED_USERS')}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${target === 'SELECTED_USERS'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500/10'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${target === 'SELECTED_USERS' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Specific Users</p>
                                        <p className="text-xs opacity-70">Choose individual recipients</p>
                                    </div>
                                    {target === 'SELECTED_USERS' && <Check className="ml-auto w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {target === 'SELECTED_USERS' && (
                            <button
                                onClick={() => setIsRecipientsModalOpen(true)}
                                className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-800">Select Recipients</p>
                                        <p className="text-xs text-slate-500">{selectedUsers.length} users selected</p>
                                    </div>
                                </div>
                                <div className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                                    CHANGE
                                </div>
                            </button>
                        )}

                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100">
                                    <span>{user.username}</span>
                                    <button onClick={() => handleRemoveUser(user.id)} className="hover:text-blue-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 space-y-2">
                            <p className="text-xs font-bold text-yellow-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> Tip: Placeholders
                            </p>
                            <p className="text-[10px] text-yellow-700 leading-relaxed">
                                Use <code className="bg-yellow-100 px-1 rounded">{"{name}"}</code> or <code className="bg-yellow-100 px-1 rounded">{"{username}"}</code> to personalize your message.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Subject</label>
                            <input
                                type="text"
                                placeholder="e.g. Special Offer Just for You!"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message Content</label>
                            <div className="prose-slate">
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={modules}
                                    className="h-80 mb-12 rounded-xl overflow-hidden"
                                    placeholder="Write your professional email here..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleOpenConfirm}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all transform active:scale-95 shadow-lg shadow-slate-900/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                {loading ? 'Sending Broadcast...' : 'Start Broadcast'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recipients Modal */}
            {isRecipientsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRecipientsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Select Recipients</h3>
                            <button onClick={() => setIsRecipientsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or username..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                {searching && <Loader2 className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 animate-spin" />}
                            </div>

                            <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                                {foundUsers.length > 0 ? (
                                    foundUsers.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleSelectUser(user)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors font-bold text-xs uppercase">
                                                {user.username.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{user.full_name || user.username}</p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 text-transparent group-hover:text-blue-600">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                        </button>
                                    ))
                                ) : userSearch.length >= 2 ? (
                                    <div className="py-8 text-center text-slate-500">
                                        <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No users found matching "{userSearch}"</p>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-slate-400">
                                        <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs">Type at least 2 characters to search</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                                    SELECTED RECIPIENTS ({selectedUsers.length})
                                </p>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2">
                                    {selectedUsers.map(user => (
                                        <div key={user.id} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-bold border border-blue-100 animate-in fade-in zoom-in duration-200">
                                            <span>{user.username}</span>
                                            <button onClick={() => handleRemoveUser(user.id)} className="hover:text-blue-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedUsers.length === 0 && (
                                        <p className="text-[10px] text-slate-400 italic">No recipients selected yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setIsRecipientsModalOpen(false)}
                                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Broadcast Success/Summary Modal */}
            {isSuccessModalOpen && broadcastResult && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSuccessModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                                <Send className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Broadcast Complete!</h3>
                                <p className="text-slate-500 mt-2 text-sm">Your emails have been processed and sent.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <p className="text-2xl font-black text-emerald-700">{broadcastResult.sent}</p>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Successful</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                                    <p className="text-2xl font-black text-red-700">{broadcastResult.failed}</p>
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Failed</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-900/20"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleSendBroadcast}
                title="Send Broadcast Email?"
                variant="info"
                confirmText="Yes, Send Now"
                message={
                    <div className="space-y-4">
                        <p>You are about to send an email broadcast with the subject: <span className="font-bold text-slate-800 italic">"{subject}"</span></p>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-xs text-blue-700 leading-relaxed">
                                <strong>Recipients:</strong> {target === 'ALL_MEMBERS' ? 'All active members' : `${selectedUsers.length} selected users`}.
                                This action cannot be undone once the process starts.
                            </div>
                        </div>
                    </div>
                }
            />
        </div>
    );
};

export default MailSendClient;
