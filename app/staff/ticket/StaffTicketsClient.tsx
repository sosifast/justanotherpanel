'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Filter,
    MessageSquare,
    User,
    Clock,
    ChevronDown,
    Loader2,
    Send,
    AlertCircle,
    CheckCircle,
    XCircle,
    Image as ImageIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { IKContext, IKUpload } from 'imagekitio-react';

type TicketMessage = {
    id: number;
    id_ticket: number;
    sender: string;
    content: string;
    image_url?: string | null;
    created_at: string;
};

type TicketUser = {
    id: number;
    username: string;
    full_name: string;
    email: string;
};

type Ticket = {
    id: number;
    id_user: number;
    subject: string;
    category: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    user: TicketUser;
    messages?: TicketMessage[];
    _count?: {
        messages: number;
    };
};

const StaffTicketsClient = () => {
    const router = useRouter();
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    // Form state
    const [newMessage, setNewMessage] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [newPriority, setNewPriority] = useState('');

    // Image Upload State
    const [imageUploading, setImageUploading] = useState(false);
    const [newMessageImage, setNewMessageImage] = useState<string | null>(null);
    const [settings, setSettings] = useState<any>(null);

    const statuses = ['all', 'OPEN', 'PENDING', 'ANSWERED', 'CLOSED'];
    const priorities = ['all', 'HIGH', 'MEDIUM', 'LOW'];
    const PER_PAGE_OPTIONS = [10, 20, 50, 100, 200];
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return tickets.slice(start, start + perPage);
    }, [tickets, currentPage, perPage]);
    const totalPages = Math.max(1, Math.ceil(tickets.length / perPage));

    const handlePerPage = (val: number) => { setPerPage(val); setCurrentPage(1); };

    // Fetch settings for ImageKit
    useEffect(() => {
        fetch('/api/settings/public')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error('Failed to load settings', err));
    }, []);

    // Fetch tickets
    useEffect(() => {
        if (view === 'list') {
            setCurrentPage(1);
            fetchTickets();
        }
    }, [view, statusFilter, priorityFilter, search]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (priorityFilter !== 'all') params.append('priority', priorityFilter);
            if (search) params.append('search', search);

            const response = await fetch(`/api/admin/tickets?${params}`);
            const data = await response.json();

            if (response.ok) {
                setTickets(data.tickets);
            } else {
                toast.error(data.error || 'Failed to fetch tickets');
            }
        } catch (error) {
            toast.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetail = async (ticketId: number) => {
        try {
            const response = await fetch(`/api/admin/tickets/${ticketId}`);
            const data = await response.json();

            if (response.ok) {
                setSelectedTicket(data.ticket);
                setNewStatus(data.ticket.status);
                setNewPriority(data.ticket.priority);
                setView('detail');
            } else {
                toast.error(data.error || 'Failed to fetch ticket details');
            }
        } catch (error) {
            toast.error('Failed to fetch ticket details');
        }
    };

    const handleUploadDefaultError = (err: any) => {
        setImageUploading(false);
        toast.error('Image upload failed');
        console.log(err);
    };

    const handleUploadDefaultSuccess = (res: any) => {
        setImageUploading(false);
        setNewMessageImage(res.url);
        toast.success('Image uploaded');
    };

    const authenticator = async () => {
        try {
            const response = await fetch('/api/imagekit/auth');
            if (!response.ok) throw new Error('Authentication failed');
            return await response.json();
        } catch (error) {
            throw error;
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTicket || (!newMessage.trim() && !newMessageImage)) return;

        try {
            setSending(true);
            const response = await fetch(`/api/admin/tickets/${selectedTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    image_url: newMessageImage
                })
            });

            const data = await response.json();

            if (response.ok) {
                setNewMessage('');
                setNewMessageImage(null);
                await fetchTicketDetail(selectedTicket.id);
                toast.success('Reply sent!');
            } else {
                toast.error(data.error || 'Failed to send reply');
            }
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleUpdateTicket = async () => {
        if (!selectedTicket) return;

        try {
            const response = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    priority: newPriority
                })
            });

            if (response.ok) {
                toast.success('Ticket updated successfully!');
                await fetchTicketDetail(selectedTicket.id);
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update ticket');
            }
        } catch (error) {
            toast.error('Failed to update ticket');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'bg-blue-100 text-blue-700';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700';
            case 'ANSWERED':
                return 'bg-green-100 text-green-700';
            case 'CLOSED':
                return 'bg-slate-100 text-slate-600';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <AlertCircle className="w-3 h-3" />;
            case 'PENDING':
                return <Clock className="w-3 h-3" />;
            case 'ANSWERED':
                return <CheckCircle className="w-3 h-3" />;
            case 'CLOSED':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-700';
            case 'MEDIUM':
                return 'bg-amber-100 text-amber-700';
            case 'LOW':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="space-y-6">
            {view === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support Tickets</h1>
                            <p className="text-slate-500 font-medium">Manage and respond to user support requests.</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search by subject, user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                            />
                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-slate-600 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                >
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative flex-1 md:flex-none">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-slate-600 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                >
                                    {priorities.map((p) => (
                                        <option key={p} value={p}>{p === 'all' ? 'All Priority' : p}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Tickets Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-16 text-center">
                                <Loader2 className="w-10 h-10 text-indigo-600 mx-auto mb-4 animate-spin" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading tickets...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100 font-black tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Ticket Info</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Priority</th>
                                            <th className="px-6 py-4">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedTickets.map((ticket) => (
                                            <tr
                                                key={ticket.id}
                                                onClick={() => fetchTicketDetail(ticket.id)}
                                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                            <MessageSquare className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{ticket.subject}</div>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">#{ticket.id} • {ticket.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                                                        @{ticket.user.username}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(ticket.status)}`}>
                                                        {getStatusIcon(ticket.status)}
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${getPriorityStyle(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                                                    {new Date(ticket.updated_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {tickets.length === 0 && !loading && (
                                    <div className="p-16 text-center">
                                        <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tickets found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Ticket Detail View */
                selectedTicket && (
                    <div className="max-w-6xl mx-auto">
                        <button
                            onClick={() => { setView('list'); setSelectedTicket(null); }}
                            className="mb-8 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                        >
                            ← Back to Tickets
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Chat Area */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h2 className="font-black text-slate-900 tracking-tight">{selectedTicket.subject}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Ticket #{selectedTicket.id}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{selectedTicket.category}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]">
                                        {selectedTicket.messages && selectedTicket.messages.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${msg.sender === 'support'
                                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                                        : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-4 mb-1.5">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${msg.sender === 'support' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                            {msg.sender === 'support' ? 'Staff Response' : `@${selectedTicket.user.username}`}
                                                        </span>
                                                        <span className={`text-[9px] font-bold ${msg.sender === 'support' ? 'text-indigo-300' : 'text-slate-300'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {msg.image_url && (
                                                        <div className="mb-3 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                                            <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                                                                <img
                                                                    src={msg.image_url}
                                                                    alt="Attachment"
                                                                    className="max-w-full max-h-64 object-cover hover:scale-105 transition-transform duration-500"
                                                                />
                                                            </a>
                                                        </div>
                                                    )}

                                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 border-t border-slate-100 bg-white">
                                        {newMessageImage && (
                                            <div className="mb-3 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="relative">
                                                    <img src={newMessageImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                                    <button
                                                        onClick={() => setNewMessageImage(null)}
                                                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-600">Image attached</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black">Ready to send</p>
                                                </div>
                                            </div>
                                        )}
                                        <form onSubmit={handleSendReply} className="flex gap-3">
                                            {settings?.imagekit_publickey && (
                                                <div className="flex items-center">
                                                    <IKContext
                                                        publicKey={settings.imagekit_publickey}
                                                        urlEndpoint={settings.imagekit_url}
                                                        authenticator={authenticator}
                                                    >
                                                        <IKUpload
                                                            onError={handleUploadDefaultError}
                                                            onSuccess={handleUploadDefaultSuccess}
                                                            style={{ display: 'none' }}
                                                            id="chat-file-upload"
                                                            onUploadStart={() => setImageUploading(true)}
                                                        />
                                                        <label
                                                            htmlFor="chat-file-upload"
                                                            className={`p-3 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-center shadow-sm ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                                            title="Upload Image"
                                                        >
                                                            {imageUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                                        </label>
                                                    </IKContext>
                                                </div>
                                            )}

                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Write your staff response..."
                                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium shadow-inner"
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || (!newMessage.trim() && !newMessageImage)}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
                                            >
                                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                Send
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-4 text-slate-400">User Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Username</p>
                                            <p className="text-sm font-bold text-slate-900 font-mono tracking-tighter">@{selectedTicket.user.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Full Name</p>
                                            <p className="text-sm font-bold text-slate-900">{selectedTicket.user.full_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Email</p>
                                            <p className="text-xs font-medium text-slate-500">{selectedTicket.user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-2xl p-6 shadow-xl">
                                    <h3 className="font-black text-white uppercase tracking-widest text-[10px] mb-6 opacity-40">Ticket Management</h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-2">Update Status</label>
                                            <div className="relative">
                                                <select
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pointer-events-auto"
                                                >
                                                    <option value="OPEN">OPEN</option>
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="ANSWERED">ANSWERED</option>
                                                    <option value="CLOSED">CLOSED</option>
                                                </select>
                                                <ChevronDown className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-2">Set Priority</label>
                                            <div className="relative">
                                                <select
                                                    value={newPriority}
                                                    onChange={(e) => setNewPriority(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                                >
                                                    <option value="HIGH">HIGH</option>
                                                    <option value="MEDIUM">MEDIUM</option>
                                                    <option value="LOW">LOW</option>
                                                </select>
                                                <ChevronDown className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUpdateTicket}
                                            className="w-full py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all shadow-lg"
                                        >
                                            Apply Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default StaffTicketsClient;
