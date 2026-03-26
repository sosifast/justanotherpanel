'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ChevronRight,
  Filter,
  LifeBuoy,
  X,
  Send,
  Loader2,
  Paperclip,
  ImageIcon,
  ShieldAlert,
  Calendar,
  ArrowRight,
  Save,
  Trash2,
  Image as LucideImage
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

type TicketMessage = {
    id: number;
    id_ticket: number;
    sender: 'user' | 'admin';
    content: string;
    image_url?: string | null;
    created_at: string;
};

type Ticket = {
    id: number;
    id_user: number;
    subject: string;
    category: string;
    status: 'OPEN' | 'PENDING' | 'ANSWERED' | 'CLOSED';
    priority: string;
    created_at: string;
    updated_at: string;
    messages?: TicketMessage[];
    _count?: { messages: number };
};

// ── Shared UI Constants ───────────────────────────────────────
const CATEGORIES = ['General', 'Billing', 'Technical', 'Order Issue', 'Other'];
const STATUS_CHIPS = ['All', 'OPEN', 'PENDING', 'ANSWERED', 'CLOSED'];

const TicketsView = () => {
    const router = useRouter();
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // Create State
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [createImageFile, setCreateImageFile] = useState<File | null>(null);
    const createFileRef = useRef<HTMLInputElement>(null);

    // Reply State
    const [newMessage, setNewMessage] = useState('');
    const [replyImageFile, setReplyImageFile] = useState<File | null>(null);
    const replyFileRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Lightbox State
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (view === 'detail') scrollToBottom();
    }, [selectedTicket, view]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/user/tickets');
            const data = await res.json();
            if (res.ok) setTickets(data.tickets);
        } catch (e) {
            toast.error('Sync failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetail = async (ticketId: number) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/user/tickets/${ticketId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedTicket(data.ticket);
                setView('detail');
            }
        } catch (e) {
            toast.error('Detail fetch rejected');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
        const file = e.target.files?.[0] ?? null;
        if (file && file.size > MAX_FILE_SIZE) {
            toast.error('Max 5MB per upload');
            return;
        }
        setter(file);
    };

    const doUpload = async (file: File): Promise<string> => {
        const authRes = await fetch('/api/imagekit/auth');
        const authData = await authRes.json();
        
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', `tck_${Date.now()}_${file.name}`);
            formData.append('folder', '/tickets');
            formData.append('token', authData.token);
            formData.append('expire', String(authData.expire));
            formData.append('signature', authData.signature);
            formData.append('publicKey', authData.publicKey);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText).url);
                else reject(new Error('Upload rejected'));
            };
            xhr.send(formData);
        });
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return toast.error('Select category');
        try {
            setSending(true);
            let image_url = null;
            if (createImageFile) image_url = await doUpload(createImageFile);

            const res = await fetch('/api/user/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, category, message, image_url })
            });
            if (res.ok) {
                toast.success('Support ticket initiated');
                setSubject(''); setCategory(''); setMessage(''); setCreateImageFile(null);
                setView('list'); fetchTickets();
            }
        } catch (e) {
            toast.error('Temporal sync failure');
        } finally {
            setSending(false);
            setUploadProgress(null);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || (!newMessage.trim() && !replyImageFile)) return;
        try {
            setSending(true);
            let image_url = null;
            if (replyImageFile) image_url = await doUpload(replyImageFile);

            const res = await fetch(`/api/user/tickets/${selectedTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage, image_url })
            });
            if (res.ok) {
                setNewMessage(''); setReplyImageFile(null);
                await fetchTicketDetail(selectedTicket.id);
            }
        } catch (e) {
            toast.error('Transmission failure');
        } finally {
            setSending(false);
            setUploadProgress(null);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket || !confirm('Archive this conversation?')) return;
        try {
            const res = await fetch(`/api/user/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CLOSED' })
            });
            if (res.ok) {
                toast.success('Conversation archived');
                await fetchTicketDetail(selectedTicket.id);
            }
        } catch (e) {
            toast.error('Action rejected');
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toString().includes(searchQuery);
        const matchFilter = activeFilter === 'All' || t.status === activeFilter;
        return matchSearch && matchFilter;
    });

    const activeTicketsCount = tickets.filter(t => t.status !== 'CLOSED').length;
    const resolvedCount = tickets.filter(t => t.status === 'CLOSED').length;

    if (loading && view === 'list') return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-emerald-50 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none relative">
            
            {/* Header */}
            <div className="p-6 bg-white sticky top-0 z-40 border-b border-emerald-50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button 
                            onClick={() => view === 'list' ? router.push('/user') : setView('list')}
                            className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight uppercase italic">
                            {view === 'list' ? 'SUPPORT' : view === 'create' ? 'NEW TICKET' : 'CONVERSATION'}
                        </h2>
                    </div>
                </div>

                {view === 'list' && (
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input 
                            type="text"
                            placeholder="Trace ticket ID or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm font-bold placeholder:text-slate-300"
                        />
                    </div>
                )}
            </div>

            {/* ── LIST VIEW ── */}
            {view === 'list' && (
                <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Metrics Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full opacity-30 group-hover:scale-125 transition-transform"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest italic">In Progress</p>
                                <h3 className="text-3xl font-black mt-1 leading-none">{String(activeTicketsCount).padStart(2, '0')}</h3>
                                <div className="mt-4 flex items-center space-x-2">
                                    <div className="px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-wider">Active Protocols</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] relative group">
                            <div className="relative z-10 text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Archived</p>
                                <h3 className="text-3xl font-black text-slate-900 mt-1 leading-none">{String(resolvedCount).padStart(2, '0')}</h3>
                                <div className="mt-4 flex items-center space-x-2">
                                    <div className="px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-wider">Resolved</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Navigation */}
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
                        {STATUS_CHIPS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all uppercase tracking-widest ${
                                    activeFilter === filter 
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-100' 
                                    : 'bg-emerald-50/50 text-emerald-600 border border-emerald-100'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Ticket Grid */}
                    <div className="space-y-4">
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map((ticket) => (
                                <button 
                                    key={ticket.id} 
                                    onClick={() => fetchTicketDetail(ticket.id)}
                                    className="w-full bg-white border border-emerald-50 rounded-[2.2rem] p-6 shadow-sm active:scale-[0.98] hover:border-emerald-200 transition-all text-left flex flex-col group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                            ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-500' : 
                                            ticket.status === 'ANSWERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {ticket.status}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 tracking-widest group-hover:text-emerald-400 transition-colors uppercase italic">#TCK-{ticket.id}</span>
                                    </div>
                                    
                                    <h4 className="text-[15px] font-black text-slate-800 leading-snug mb-5 tracking-tight group-hover:text-emerald-700 transition-colors">
                                        {ticket.subject}
                                    </h4>

                                    <div className="flex items-center justify-between pt-5 border-t border-emerald-50/50">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                                                <Clock size={12} className="mr-1.5" />
                                                {new Date(ticket.updated_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                                                <LifeBuoy size={12} className="mr-1.5" />
                                                {ticket.category}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-emerald-100 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-200 mb-6 drop-shadow-sm">
                                    <ShieldAlert size={48} />
                                </div>
                                <h3 className="font-black text-slate-800 uppercase italic tracking-tight">No Tickets Located</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-12 leading-relaxed">The support matrix is currently empty.<br/>Initiate a new ticket below.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── CREATE VIEW ── */}
            {view === 'create' && (
                <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300 pb-40">
                    <form onSubmit={handleCreateTicket} className="space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">New transmission</h4>
                            
                            <div className="p-6 bg-slate-50 rounded-[1.8rem] border border-slate-100 space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 ml-1">Issue Subject</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Concise summary..."
                                        className="w-full bg-transparent border-none p-0 text-sm font-black tracking-tight outline-none focus:ring-0 placeholder:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[1.8rem] border border-slate-100 space-y-2">
                                <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 ml-1">Category Core</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button 
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                category === cat ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-white border-slate-100 text-slate-400'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                                <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 ml-1">Full Description</label>
                                <textarea 
                                    rows={6}
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Explain your case in detail..."
                                    className="w-full bg-transparent border-none p-0 text-sm font-bold tracking-tight outline-none focus:ring-0 placeholder:text-slate-200 resize-none min-h-[120px]"
                                />
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                                <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 ml-1 block">Attachment (Max 5MB)</label>
                                <div className="flex items-center space-x-4">
                                    <button 
                                        type="button"
                                        onClick={() => createFileRef.current?.click()}
                                        className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl border-2 border-dashed transition-all ${
                                            createImageFile ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-white text-slate-400'
                                        }`}
                                    >
                                        <ImageIcon size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{createImageFile ? 'Change File' : 'Pick Image'}</span>
                                    </button>
                                    <input ref={createFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setCreateImageFile)} />
                                    
                                    {createImageFile && (
                                        <div className="relative w-12 h-12">
                                            <img src={URL.createObjectURL(createImageFile)} className="w-full h-full object-cover rounded-xl" />
                                            <button onClick={() => setCreateImageFile(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600"><X size={10} /></button>
                                        </div>
                                    )}
                                </div>
                                {uploadProgress !== null && (
                                    <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-emerald-50/50 p-6 z-40 rounded-t-[2.5rem]">
                            <button 
                                type="submit"
                                disabled={sending}
                                className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-emerald-200 active:scale-[0.97] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                <span>Commit Transmission</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── DETAIL VIEW (CHAT) ── */}
            {view === 'detail' && selectedTicket && (
                <div className="flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Ticket Summary Bar */}
                    <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedTicket.category} Matrix</p>
                            <h4 className="text-xs font-black text-slate-900 tracking-tight leading-none mt-1 uppercase italic">{selectedTicket.subject}</h4>
                        </div>
                        {selectedTicket.status !== 'CLOSED' && (
                            <button 
                                onClick={handleCloseTicket}
                                className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Archive
                            </button>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="p-6 space-y-6 overflow-y-auto pb-48 flex-grow min-h-[60vh]">
                        {selectedTicket.messages?.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="flex flex-col space-y-1">
                                    <div className={`max-w-[85vw] md:max-w-md rounded-[2rem] p-5 shadow-sm ${
                                        msg.sender === 'user' 
                                        ? 'bg-slate-900 text-white rounded-br-small rounded-tl-[2rem]' 
                                        : 'bg-emerald-50 text-emerald-900 rounded-bl-small border border-emerald-100'
                                    }`}>
                                        {msg.content && <p className="text-sm font-medium leading-relaxed">{msg.content}</p>}
                                        {msg.image_url && (
                                            <div className="mt-3 relative rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                                                <img 
                                                    src={msg.image_url} 
                                                    className="w-full h-auto cursor-pointer hover:scale-105 transition-transform" 
                                                    onClick={() => setLightboxUrl(msg.image_url!)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ${msg.sender === 'user' ? 'text-right mr-3' : 'text-left ml-3'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.sender.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Reply Input (Sticky Bottom) */}
                    {selectedTicket.status !== 'CLOSED' && (
                        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-emerald-50 z-50 rounded-t-[2.5rem] shadow-2xl">
                            <form onSubmit={handleSendMessage} className="space-y-4">
                                {replyImageFile && (
                                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-bottom-2">
                                        <div className="w-12 h-12 relative rounded-xl overflow-hidden">
                                            <img src={URL.createObjectURL(replyImageFile)} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setReplyImageFile(null)} className="absolute top-0 right-0 bg-rose-500 text-white p-1 rounded-bl-xl shadow-lg"><X size={10} /></button>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest truncate">{replyImageFile.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Ready for transmission</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-3">
                                    <button 
                                        type="button" 
                                        onClick={() => replyFileRef.current?.click()}
                                        className={`p-4 rounded-2xl border-2 border-dashed transition-all flex-shrink-0 ${
                                            replyImageFile ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-white text-slate-400'
                                        }`}
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <input ref={replyFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setReplyImageFile)} />
                                    
                                    <div className="flex-1 relative flex items-center">
                                        <input 
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Transmit message..."
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-300"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={sending || (!newMessage.trim() && !replyImageFile)}
                                            className="absolute right-2 p-3 bg-emerald-600 text-white rounded-[1.2rem] shadow-lg shadow-emerald-200 active:scale-90 transition-all disabled:opacity-40 disabled:grayscale disabled:scale-100"
                                        >
                                            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* List View Floating CTA */}
            {view === 'list' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-emerald-50/50 p-6 z-40 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => setView('create')}
                        className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-emerald-200 active:scale-[0.97] transition-all flex items-center justify-center space-x-3"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Open New Ticket</span>
                    </button>
                </div>
            )}

            {/* Lightbox for Images */}
            {lightboxUrl && (
                <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setLightboxUrl(null)}>
                    <button className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/20">
                        <X size={28} />
                    </button>
                    <img 
                        src={lightboxUrl} 
                        className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300" 
                        onClick={e => e.stopPropagation()} 
                    />
                </div>
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

        </div>
    );
};

export default TicketsView;
