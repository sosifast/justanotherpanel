'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    Loader2,
    Paperclip,
    X,
    ImageIcon,
    Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

type TicketMessage = {
    id: number;
    id_ticket: number;
    sender: string;
    content: string;
    image_url?: string | null;
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
    _count?: { messages: number };
};

// ─── Upload progress bar component ───────────────────────────────────────────
function UploadProgress({ progress }: { progress: number }) {
    return (
        <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
            <Upload className="w-4 h-4 text-blue-500 shrink-0 animate-bounce" />
            <div className="flex-1">
                <div className="flex justify-between text-xs text-blue-600 mb-1">
                    <span>Uploading image...</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                    <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── File preview component ───────────────────────────────────────────────────
function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
    const [previewUrl, setPreviewUrl] = useState('');
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div className="relative inline-block">
            {previewUrl && <img src={previewUrl} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />}
            <button
                type="button"
                onClick={onRemove}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

// ─── ImageKit upload via XHR (for progress tracking) ─────────────────────────
function uploadToImageKit(
    file: File,
    authData: { token: string; expire: string; signature: string; publicKey: string; urlEndpoint: string },
    onProgress: (pct: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `ticket_${Date.now()}_${file.name}`);
        formData.append('folder', '/tickets');
        formData.append('token', authData.token);
        formData.append('expire', String(authData.expire));
        formData.append('signature', authData.signature);
        formData.append('publicKey', authData.publicKey);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    resolve(result.url);
                } catch {
                    reject(new Error('Invalid response from ImageKit'));
                }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText || '{}');
                    reject(new Error(err.message || `Upload failed (HTTP ${xhr.status})`));
                } catch {
                    reject(new Error(`Upload failed (HTTP ${xhr.status})`));
                }
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload — check CORS or internet connection')));
        xhr.send(formData);
    });
}

// ─── Main component ───────────────────────────────────────────────────────────
const TicketsView = () => {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Create form
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [createImageFile, setCreateImageFile] = useState<File | null>(null);
    const createFileRef = useRef<HTMLInputElement>(null);

    // Reply
    const [newMessage, setNewMessage] = useState('');
    const [replyImageFile, setReplyImageFile] = useState<File | null>(null);
    const replyFileRef = useRef<HTMLInputElement>(null);

    // Lightbox
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const categories = ['General', 'Billing', 'Technical', 'Order Issue', 'Other'];
    const statuses = ['all', 'OPEN', 'PENDING', 'ANSWERED', 'CLOSED'];

    useEffect(() => {
        if (view === 'list') fetchTickets();
    }, [view, statusFilter]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            const res = await fetch(`/api/user/tickets?${params}`);
            const data = await res.json();
            if (res.ok) setTickets(data.tickets);
            else toast.error(data.error || 'Failed to fetch tickets');
        } catch { toast.error('Failed to fetch tickets'); }
        finally { setLoading(false); }
    };

    const fetchTicketDetail = async (ticketId: number) => {
        try {
            const res = await fetch(`/api/user/tickets/${ticketId}`);
            const data = await res.json();
            if (res.ok) { setSelectedTicket(data.ticket); setView('detail'); }
            else toast.error(data.error || 'Failed to fetch ticket details');
        } catch { toast.error('Failed to fetch ticket details'); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
        const file = e.target.files?.[0] ?? null;
        if (file && file.size > MAX_FILE_SIZE) {
            toast.error('Image must be smaller than 5 MB');
            e.target.value = '';
            return;
        }
        setter(file);
    };

    // ── Upload helper ────────────────────────────────────────────────────────
    const doUpload = async (file: File): Promise<string> => {
        const authRes = await fetch('/api/imagekit/auth');
        const authData = await authRes.json();
        if (!authRes.ok) {
            throw new Error(authData.error || 'Failed to get ImageKit auth');
        }
        setUploadProgress(0);
        const url = await uploadToImageKit(file, authData, (pct) => setUploadProgress(pct));
        setUploadProgress(null);
        return url;
    };

    // ── Create ticket ────────────────────────────────────────────────────────
    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSending(true);
            let image_url: string | null = null;
            if (createImageFile) image_url = await doUpload(createImageFile);

            const res = await fetch('/api/user/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, category, message, image_url })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Ticket created successfully!');
                setSubject(''); setCategory(''); setMessage('');
                setCreateImageFile(null);
                setView('list'); fetchTickets();
            } else {
                toast.error(data.error || 'Failed to create ticket');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create ticket');
        } finally {
            setSending(false);
            setUploadProgress(null);
        }
    };

    // ── Send reply ───────────────────────────────────────────────────────────
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || (!newMessage.trim() && !replyImageFile)) return;
        try {
            setSending(true);
            let image_url: string | null = null;
            if (replyImageFile) image_url = await doUpload(replyImageFile);

            const res = await fetch(`/api/user/tickets/${selectedTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage, image_url })
            });
            const data = await res.json();
            if (res.ok) {
                setNewMessage('');
                setReplyImageFile(null);
                if (replyFileRef.current) replyFileRef.current.value = '';
                await fetchTicketDetail(selectedTicket.id);
                toast.success('Message sent!');
            } else {
                toast.error(data.error || 'Failed to send message');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to send message');
        } finally {
            setSending(false);
            setUploadProgress(null);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;
        try {
            const res = await fetch(`/api/user/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CLOSED' })
            });
            if (res.ok) { toast.success('Ticket closed!'); await fetchTicketDetail(selectedTicket.id); }
            else { const d = await res.json(); toast.error(d.error || 'Failed to close ticket'); }
        } catch { toast.error('Failed to close ticket'); }
    };

    const getStatusStyle = (s: string) => ({ OPEN: 'bg-blue-100 text-blue-700', PENDING: 'bg-amber-100 text-amber-700', ANSWERED: 'bg-green-100 text-green-700', CLOSED: 'bg-slate-100 text-slate-600' }[s] ?? 'bg-slate-100 text-slate-600');
    const getStatusIcon = (s: string) => ({ OPEN: <AlertCircle className="w-3 h-3" />, PENDING: <Clock className="w-3 h-3" />, ANSWERED: <CheckCircle className="w-3 h-3" />, CLOSED: <XCircle className="w-3 h-3" /> }[s] ?? null);
    const getPriorityStyle = (p: string) => ({ HIGH: 'text-red-600', MEDIUM: 'text-amber-600', LOW: 'text-green-600' }[p] ?? 'text-slate-600');

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toString().includes(search)
    );

    return (
        <div>
            {/* Lightbox */}
            {lightboxUrl && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
                    <button className="absolute top-4 right-4 text-white hover:text-slate-300" onClick={() => setLightboxUrl(null)}>
                        <X className="w-8 h-8" />
                    </button>
                    <img src={lightboxUrl} alt="full size" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
                    <p className="text-slate-500">Get help from our support team</p>
                </div>
                {view === 'list' && (
                    <button onClick={() => setView('create')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                        <Plus className="w-4 h-4" /> New Ticket
                    </button>
                )}
                {(view === 'create' || view === 'detail') && (
                    <button onClick={() => { setView('list'); setSelectedTicket(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to Tickets
                    </button>
                )}
            </div>

            {/* ── List View ── */}
            {view === 'list' && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Tickets', value: tickets.length, color: 'text-slate-900' },
                            { label: 'Open', value: tickets.filter(t => t.status === 'OPEN').length, color: 'text-blue-600' },
                            { label: 'Pending', value: tickets.filter(t => t.status === 'PENDING').length, color: 'text-amber-600' },
                            { label: 'Answered', value: tickets.filter(t => t.status === 'ANSWERED').length, color: 'text-green-600' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
                                <p className="text-sm text-slate-500 mb-1">{label}</p>
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                        <div className="p-4 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Search by ticket ID or subject..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm min-w-[150px]">
                                    {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

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
                                            {filteredTickets.map(ticket => (
                                                <tr key={ticket.id} onClick={() => fetchTicketDetail(ticket.id)} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-slate-900 mb-1">#{ticket.id}</p>
                                                        <p className="text-slate-600 truncate max-w-[300px]">{ticket.subject}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{ticket.category}</td>
                                                    <td className="px-6 py-4 text-center"><span className={`font-medium ${getPriorityStyle(ticket.priority)}`}>{ticket.priority}</span></td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(ticket.status)}`}>
                                                            {getStatusIcon(ticket.status)} {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">{new Date(ticket.updated_at).toLocaleString()}</td>
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
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ── Create Ticket View ── */}
            {view === 'create' && (
                <div className="max-w-2xl">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h2 className="font-semibold text-slate-900">Create New Ticket</h2>
                            <p className="text-sm text-slate-500">Describe your issue and we&apos;ll get back to you as soon as possible</p>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of your issue" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                <div className="relative">
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" required>
                                        <option value="">Select category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Describe your issue in detail..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm resize-none" />
                            </div>

                            {/* Attachment */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Attachment <span className="text-slate-400 font-normal">(optional, max 5 MB)</span>
                                </label>
                                <input ref={createFileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, setCreateImageFile)} />
                                {createImageFile ? (
                                    <div className="flex items-center gap-3">
                                        <FilePreview file={createImageFile} onRemove={() => { setCreateImageFile(null); if (createFileRef.current) createFileRef.current.value = ''; }} />
                                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{createImageFile.name}</span>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => createFileRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                                        <Paperclip className="w-4 h-4" /> Attach image
                                    </button>
                                )}
                            </div>

                            {/* Upload progress */}
                            {uploadProgress !== null && <UploadProgress progress={uploadProgress} />}

                            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                                <button type="submit" disabled={sending || (!message.trim() && !createImageFile)} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Ticket Detail View ── */}
            {view === 'detail' && selectedTicket && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-900">Conversation</h2>
                                <span className="text-xs text-slate-500">ID: #{selectedTicket.id}</span>
                            </div>

                            {/* Messages */}
                            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                                {selectedTicket.messages?.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                            {msg.content && <p className="text-sm">{msg.content}</p>}
                                            {msg.image_url && (
                                                <img
                                                    src={msg.image_url}
                                                    alt="attachment"
                                                    className={`max-w-[240px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${msg.content ? 'mt-2' : ''}`}
                                                    onClick={() => setLightboxUrl(msg.image_url!)}
                                                />
                                            )}
                                            <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                                                {new Date(msg.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply box */}
                            {selectedTicket.status !== 'CLOSED' && (
                                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                                    {/* Upload progress */}
                                    {uploadProgress !== null && <UploadProgress progress={uploadProgress} />}

                                    {/* Image preview */}
                                    {replyImageFile && (
                                        <div className="flex items-center gap-3">
                                            <FilePreview file={replyImageFile} onRemove={() => { setReplyImageFile(null); if (replyFileRef.current) replyFileRef.current.value = ''; }} />
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{replyImageFile.name}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                            disabled={sending}
                                        />
                                        {/* Attach */}
                                        <button
                                            type="button"
                                            onClick={() => replyFileRef.current?.click()}
                                            disabled={sending}
                                            title="Attach image (max 5 MB)"
                                            className={`p-2.5 border rounded-lg transition-colors ${replyImageFile ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-500'}`}
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                        </button>
                                        <input ref={replyFileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, setReplyImageFile)} />
                                        {/* Send */}
                                        <button
                                            type="submit"
                                            disabled={sending || (!newMessage.trim() && !replyImageFile)}
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
                    <div>
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
                                            {getStatusIcon(selectedTicket.status)} {selectedTicket.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Priority</p>
                                        <span className={`font-medium ${getPriorityStyle(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
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
                                        <button onClick={handleCloseTicket} className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
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
