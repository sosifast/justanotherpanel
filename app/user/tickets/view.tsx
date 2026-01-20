'use client';

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Plus,
    Search,
    Filter,
    ChevronDown,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    ChevronLeft,
    Send,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type TicketMessage = {
    id: number;
    id_ticket: number;
    sender: string;
    content: string;
    created_at: string;
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
    messages?: TicketMessage[];
    _count?: {
        messages: number;
    };
};

const TicketsView = () => {
    const router = useRouter();
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form state
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const categories = ['General', 'Billing', 'Technical', 'Order Issue', 'Other'];
    const statuses = ['all', 'OPEN', 'PENDING', 'ANSWERED', 'CLOSED'];

    // Fetch tickets
    useEffect(() => {
        if (view === 'list') {
            fetchTickets();
        }
    }, [view, statusFilter]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            const response = await fetch(`/api/user/tickets?${params}`);
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
            const response = await fetch(`/api/user/tickets/${ticketId}`);
            const data = await response.json();

            if (response.ok) {
                setSelectedTicket(data.ticket);
                setView('detail');
            } else {
                toast.error(data.error || 'Failed to fetch ticket details');
            }
        } catch (error) {
            toast.error('Failed to fetch ticket details');
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSending(true);
            const response = await fetch('/api/user/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, category, message })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Ticket created successfully!');
                setSubject('');
                setCategory('');
                setMessage('');
                setView('list');
                fetchTickets();
            } else {
                toast.error(data.error || 'Failed to create ticket');
            }
        } catch (error) {
            toast.error('Failed to create ticket');
        } finally {
            setSending(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTicket || !newMessage.trim()) return;

        try {
            setSending(true);
            const response = await fetch(`/api/user/tickets/${selectedTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });

            const data = await response.json();

            if (response.ok) {
                setNewMessage('');
                // Refresh ticket detail
                await fetchTicketDetail(selectedTicket.id);
                toast.success('Message sent!');
            } else {
                toast.error(data.error || 'Failed to send message');
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;

        try {
            const response = await fetch(`/api/user/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CLOSED' })
            });

            if (response.ok) {
                toast.success('Ticket closed successfully!');
                await fetchTicketDetail(selectedTicket.id);
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to close ticket');
            }
        } catch (error) {
            toast.error('Failed to close ticket');
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
                return 'text-red-600';
            case 'MEDIUM':
                return 'text-amber-600';
            case 'LOW':
                return 'text-green-600';
            default:
                return 'text-slate-600';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
            ticket.id.toString().includes(search);
        return matchesSearch;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
                    <p className="text-slate-500">Get help from our support team</p>
                </div>
                {view === 'list' && (
                    <button
                        onClick={() => setView('create')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Ticket
                    </button>
                )}
                {(view === 'create' || view === 'detail') && (
                    <button
                        onClick={() => { setView('list'); setSelectedTicket(null); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Tickets
                    </button>
                )}
            </div>

            {/* List View */}
            {view === 'list' && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500 mb-1">Total Tickets</p>
                            <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500 mb-1">Open</p>
                            <p className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'OPEN').length}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">{tickets.filter(t => t.status === 'PENDING').length}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500 mb-1">Answered</p>
                            <p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'ANSWERED').length}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                        <div className="p-4 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by ticket ID or subject..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm min-w-[150px]"
                                >
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Tickets Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                                <p className="text-slate-500">Loading tickets...</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4">Ticket</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4 text-center">Priority</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4">Last Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTickets.map((ticket) => (
                                                <tr
                                                    key={ticket.id}
                                                    onClick={() => fetchTicketDetail(ticket.id)}
                                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900 mb-1">#{ticket.id}</p>
                                                            <p className="text-slate-600 truncate max-w-[300px]">{ticket.subject}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-slate-600">{ticket.category}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`font-medium ${getPriorityStyle(ticket.priority)}`}>
                                                            {ticket.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(ticket.status)}`}>
                                                            {getStatusIcon(ticket.status)}
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {new Date(ticket.updated_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredTickets.length === 0 && !loading && (
                                    <div className="p-12 text-center">
                                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">No tickets found</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Create Ticket View */}
            {view === 'create' && (
                <div className="max-w-2xl">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h2 className="font-semibold text-slate-900">Create New Ticket</h2>
                            <p className="text-sm text-slate-500">Describe your issue and we&apos;ll get back to you as soon as possible</p>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief description of your issue"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                    placeholder="Describe your issue in detail..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm resize-none"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Detail View */}
            {view === 'detail' && selectedTicket && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-900">Conversation</h2>
                                <span className="text-xs text-slate-500">ID: #{selectedTicket.id}</span>
                            </div>

                            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                                {selectedTicket.messages && selectedTicket.messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.sender === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                                                }`}>
                                                {new Date(msg.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedTicket.status !== 'CLOSED' && (
                                <div className="p-4 border-t border-slate-100 bg-slate-50">
                                    <form onSubmit={handleSendMessage} className="flex gap-4">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            className="px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            Send
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Ticket Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Subject</p>
                                    <p className="text-sm font-medium text-slate-900">{selectedTicket.subject}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Category</p>
                                    <p className="text-sm font-medium text-slate-900">{selectedTicket.category}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Status</p>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedTicket.status)}`}>
                                            {getStatusIcon(selectedTicket.status)}
                                            {selectedTicket.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Priority</p>
                                        <span className={`font-medium ${getPriorityStyle(selectedTicket.priority)}`}>
                                            {selectedTicket.priority}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Created At</p>
                                    <p className="text-sm text-slate-900">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                                    <p className="text-sm text-slate-900">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
                                </div>

                                {selectedTicket.status !== 'CLOSED' && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <button
                                            onClick={handleCloseTicket}
                                            className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Close Ticket
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketsView;
