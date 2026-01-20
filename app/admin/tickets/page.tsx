'use client';

import React, { useState, useEffect } from 'react';
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
  XCircle
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

const AdminTicketsPage = () => {
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

  const statuses = ['all', 'OPEN', 'PENDING', 'ANSWERED', 'CLOSED'];
  const priorities = ['all', 'HIGH', 'MEDIUM', 'LOW'];

  // Fetch tickets
  useEffect(() => {
    if (view === 'list') {
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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket || !newMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch(`/api/admin/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage('');
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
              <h1 className="text-2xl font-bold text-slate-800">Support Tickets</h1>
              <p className="text-slate-500 text-sm">Manage and respond to user support requests.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search by subject, user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative flex-1 md:flex-none">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p === 'all' ? 'All Priority' : p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Ticket Info</th>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Priority</th>
                      <th className="px-6 py-4 font-semibold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => fetchTicketDetail(ticket.id)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{ticket.subject}</div>
                              <div className="text-xs text-slate-500">#{ticket.id} • {ticket.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="font-medium">{ticket.user.username}</div>
                              <div className="text-xs text-slate-500">{ticket.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityStyle(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.updated_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {tickets.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No tickets found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Ticket Detail View */
        selectedTicket && (
          <div>
            <button
              onClick={() => { setView('list'); setSelectedTicket(null); }}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              ← Back to Tickets
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Area */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-semibold text-slate-900">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-500">Ticket #{selectedTicket.id} • {selectedTicket.category}</p>
                  </div>

                  <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                    {selectedTicket.messages && selectedTicket.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.sender === 'support'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}
                        >
                          <p className="text-xs font-medium mb-1 opacity-75">
                            {msg.sender === 'support' ? 'Support' : selectedTicket.user.username}
                          </p>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender === 'support' ? 'text-blue-200' : 'text-slate-400'
                            }`}>
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <form onSubmit={handleSendReply} className="flex gap-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Ticket Info & Actions */}
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">User Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Username</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTicket.user.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Full Name</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTicket.user.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTicket.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Ticket Management */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Ticket Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="PENDING">PENDING</option>
                        <option value="ANSWERED">ANSWERED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Priority</label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>
                    <button
                      onClick={handleUpdateTicket}
                      className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                      Update Ticket
                    </button>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Ticket Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Created At</p>
                      <p className="text-sm text-slate-900">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                      <p className="text-sm text-slate-900">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
                    </div>
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

export default AdminTicketsPage;
