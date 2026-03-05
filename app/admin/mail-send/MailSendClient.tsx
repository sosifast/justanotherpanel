'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mail, Users, Send, Loader2, Search, X, User as UserIcon, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Load React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-lg" />
});
import 'react-quill/dist/quill.snow.css';

const MailSendClient = () => {
    const [target, setTarget] = useState<'ALL_MEMBERS' | 'SELECTED_USERS'>('ALL_MEMBERS');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [foundUsers, setFoundUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

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

    const handleSendBroadcast = async () => {
        if (!subject || !content) {
            toast.error('Subject and content are required');
            return;
        }

        if (target === 'SELECTED_USERS' && selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        if (!confirm(`Are you sure you want to send this broadcast to ${target === 'ALL_MEMBERS' ? 'all active members' : selectedUsers.length + ' selected users'}?`)) {
            return;
        }

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
                toast.success(data.message);
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
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />

                                    {searching && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 animate-spin" />}

                                    {foundUsers.length > 0 && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-1 max-h-48 overflow-y-auto">
                                            {foundUsers.map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleSelectUser(user)}
                                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 text-xs font-bold">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || user.username}</p>
                                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(user => (
                                        <div key={user.id} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100">
                                            <span>{user.username}</span>
                                            <button onClick={() => handleRemoveUser(user.id)} className="hover:text-blue-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedUsers.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">No users selected.</p>
                                    )}
                                </div>
                            </div>
                        )}

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
                                onClick={handleSendBroadcast}
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
        </div>
    );
};

export default MailSendClient;
