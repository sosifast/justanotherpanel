'use client';

import React, { useState } from 'react';
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
    Send,
    Paperclip,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const TicketsPage = () => {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [newMessage, setNewMessage] = useState('');

    // Form state
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('medium');
    const [message, setMessage] = useState('');

    const tickets = [
        {
            id: 1001,
            subject: 'Order #45210 not delivered',
            category: 'Order Issue',
            status: 'Open',
            priority: 'High',
            createdAt: '2024-01-15 14:30',
            updatedAt: '2024-01-15 15:45',
            messages: [
                { id: 1, sender: 'user', content: 'Hi, my order #45210 has been pending for over 24 hours. Can you please check?', time: '14:30' },
                { id: 2, sender: 'support', content: 'Hello! Thank you for contacting us. Let me check your order status.', time: '15:00' },
                { id: 3, sender: 'support', content: 'I found the issue - there was a temporary delay with the provider. Your order should be completed within the next 2 hours.', time: '15:45' },
            ]
        },
        {
            id: 1002,
            subject: 'Refund request for cancelled order',
            category: 'Refund',
            status: 'Answered',
            priority: 'Medium',
            createdAt: '2024-01-14 10:15',
            updatedAt: '2024-01-14 11:30',
            messages: [
                { id: 1, sender: 'user', content: 'I need a refund for order #45150 which was cancelled.', time: '10:15' },
                { id: 2, sender: 'support', content: 'Your refund has been processed. The balance has been credited to your account.', time: '11:30' },
            ]
        },
        {
            id: 1003,
            subject: 'How to use API?',
            category: 'General',
            status: 'Closed',
            priority: 'Low',
            createdAt: '2024-01-13 09:00',
            updatedAt: '2024-01-13 10:00',
            messages: [
                { id: 1, sender: 'user', content: 'Can you explain how to integrate the API?', time: '09:00' },
                { id: 2, sender: 'support', content: 'Sure! You can find the complete API documentation in the API section of your dashboard. Let me know if you need any specific help.', time: '10:00' },
            ]
        },
        {
            id: 1004,
            subject: 'Payment not credited',
            category: 'Payment',
            status: 'Pending',
            priority: 'High',
            createdAt: '2024-01-12 16:45',
            updatedAt: '2024-01-12 16:45',
            messages: [
                { id: 1, sender: 'user', content: 'I made a payment of $100 via PayPal but it has not been credited to my account.', time: '16:45' },
            ]
        },
    ];

    const categories = ['Order Issue', 'Refund', 'Payment', 'Technical', 'General'];
    const statuses = ['all', 'Open', 'Pending', 'Answered', 'Closed'];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Open':
                return 'bg-blue-100 text-blue-700';
            case 'Pending':
                return 'bg-amber-100 text-amber-700';
            case 'Answered':
                return 'bg-green-100 text-green-700';
            case 'Closed':
                return 'bg-slate-100 text-slate-600';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Open':
                return <AlertCircle className="w-3 h-3" />;
            case 'Pending':
                return <Clock className="w-3 h-3" />;
            case 'Answered':
                return <CheckCircle className="w-3 h-3" />;
            case 'Closed':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'text-red-600';
            case 'Medium':
                return 'text-amber-600';
            case 'Low':
                return 'text-green-600';
            default:
                return 'text-slate-600';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
            ticket.id.toString().includes(search);
        const matchesStatus = status === 'all' || ticket.status === status;
        return matchesSearch && matchesStatus;
    });

    const currentTicket = tickets.find(t => t.id === selectedTicket);

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle ticket creation
        setView('list');
        setSubject('');
        setCategory('');
        setPriority('medium');
        setMessage('');
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle sending message
        setNewMessage('');
    };

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
                            <p className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'Open').length}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">{tickets.filter(t => t.status === 'Pending').length}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500 mb-1">Answered</p>
                            <p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'Answered').length}</p>
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
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
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
                                            onClick={() => { setSelectedTicket(ticket.id); setView('detail'); }}
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
                                                {ticket.updatedAt}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredTickets.length === 0 && (
                            <div className="p-12 text-center">
                                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No tickets found</p>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="text-sm text-slate-500">
                                Showing {filteredTickets.length} of {tickets.length} tickets
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50" disabled>
                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                </button>
                                <button className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg">1</button>
                                <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
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

                            <div className="grid grid-cols-2 gap-4">
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
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                                    <div className="relative">
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
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

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    Attach File
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Detail View */}
            {view === 'detail' && currentTicket && (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Messages */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h2 className="font-semibold text-slate-900">{currentTicket.subject}</h2>
                                <p className="text-sm text-slate-500">Ticket #{currentTicket.id}</p>
                            </div>

                            {/* Messages List */}
                            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                                {currentTicket.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : ''}`}>
                                            <div className={`px-4 py-3 rounded-2xl ${msg.sender === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-md'
                                                    : 'bg-slate-100 text-slate-700 rounded-bl-md'
                                                }`}>
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-right' : ''} text-slate-400`}>
                                                {msg.sender === 'support' ? 'Support • ' : ''}{msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Form */}
                            {currentTicket.status !== 'Closed' && (
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-semibold text-slate-900">Ticket Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(currentTicket.status)}`}>
                                        {getStatusIcon(currentTicket.status)}
                                        {currentTicket.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Category</p>
                                    <p className="text-sm text-slate-900">{currentTicket.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Priority</p>
                                    <p className={`text-sm font-medium ${getPriorityStyle(currentTicket.priority)}`}>
                                        {currentTicket.priority}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Created</p>
                                    <p className="text-sm text-slate-900">{currentTicket.createdAt}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Last Updated</p>
                                    <p className="text-sm text-slate-900">{currentTicket.updatedAt}</p>
                                </div>
                            </div>
                        </div>

                        {currentTicket.status !== 'Closed' && (
                            <button className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                <X className="w-4 h-4" />
                                Close Ticket
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketsPage;
