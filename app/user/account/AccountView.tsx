'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  User, 
  Settings, 
  ShieldCheck, 
  Bell, 
  Globe, 
  HelpCircle, 
  ShieldAlert, 
  LogOut, 
  ChevronRight,
  BadgeCheck,
  Smartphone,
  CreditCard,
  MapPin,
  Camera,
  Save,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Key,
  CheckCircle,
  Copy,
  ArrowUpRight,
  Info,
  RotateCcw,
  CircleDollarSign,
  TrendingUp,
  Headset,
  Ticket,
  Moon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type UserProfile = {
    id: number;
    full_name: string;
    username: string;
    email: string;
    profile_imagekit_url: string | null;
    balance: number | string;
    webhook_url: string | null;
    created_at: string;
};

type NotificationPrefs = {
    email_order_updates: boolean;
    email_deposit_updates: boolean;
    email_ticket_updates: boolean;
    email_marketing: boolean;
};

const AccountView = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [subView, setSubView] = useState<'menu' | 'profile' | 'security' | 'notifications' | 'reseller'>('menu');

    // Profile State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [profileForm, setProfileForm] = useState({ name: '', username: '' });

    // Security State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    // Reseller State
    const [isReseller, setIsReseller] = useState(false);
    const [resellerFee, setResellerFee] = useState(0);

    // Notifications State
    const [notifications, setNotifications] = useState<NotificationPrefs>({
        email_order_updates: true,
        email_deposit_updates: true,
        email_ticket_updates: true,
        email_marketing: false,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, notifyRes, apiRes, resellerRes] = await Promise.all([
                fetch('/api/user/profile'),
                fetch('/api/user/notifications'),
                fetch('/api/user/apikey'),
                fetch('/api/user/reseller/register')
            ]);

            if (profileRes.ok) {
                const data = await profileRes.json();
                setUserProfile(data.user);
                setProfileForm({ name: data.user.full_name, username: data.user.username });
            }
            if (notifyRes.ok) {
                const data = await notifyRes.json();
                setNotifications(data.preferences);
            }
            if (apiRes.ok) {
                const data = await apiRes.json();
                setApiKey(data.apikey);
                setHasApiKey(data.has_apikey);
            }
            if (resellerRes.ok) {
                const data = await resellerRes.json();
                setIsReseller(data.is_reseller);
                setResellerFee(parseFloat(data.reseller_fee));
            }
        } catch (e) {
            toast.error('Failed to sync account metrics');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: profileForm.name })
            });
            if (response.ok) {
                const data = await response.json();
                setUserProfile(data.user);
                toast.success('Identity protocols updated');
                setSubView('menu');
            } else {
                toast.error('Failed to update identity record');
            }
        } catch (e) {
            toast.error('Temporal sync failure');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return toast.error('Encryption keys mismatch');
        try {
            setSaving(true);
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
            });
            if (res.ok) {
                toast.success('Security core updated successfully');
                setPasswords({ current: '', new: '', confirm: '' });
                setSubView('menu');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Security update rejected');
            }
        } catch (e) {
            toast.error('Security protocol failure');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleNotification = async (key: keyof NotificationPrefs) => {
        const newValue = !notifications[key];
        setNotifications({ ...notifications, [key]: newValue });
        try {
            const response = await fetch('/api/user/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: newValue })
            });
            if (!response.ok) {
                setNotifications({ ...notifications, [key]: !newValue });
                toast.error('Preference sync rejected');
            }
        } catch (e) {
            setNotifications({ ...notifications, [key]: !newValue });
            toast.error('Network sync failure');
        }
    };

    const handleRegisterReseller = async () => {
        if (!confirm(`Authorize reseller registration? $${resellerFee.toFixed(2)} will be deducted from your liquid assets.`)) return;
        try {
            setSaving(true);
            const res = await fetch('/api/user/reseller/register', { method: 'POST' });
            if (res.ok) {
                toast.success('Reseller status activated');
                fetchData();
                setSubView('menu');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Registration rejected');
            }
        } catch (e) {
            toast.error('Temporal registration failure');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateApiKey = async () => {
        if (hasApiKey && !confirm('Rotate encryption keys? Existing keys will be voided.')) return;
        try {
            const response = await fetch('/api/user/apikey', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                setApiKey(data.apikey);
                setHasApiKey(true);
                setShowApiKey(true);
                toast.success('API Access keys rotated');
                fetchData();
            }
        } catch (e) {
            toast.error('Key generation failure');
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                window.location.href = '/auth/login';
            } else {
                toast.error('Termination rejected');
            }
        } catch (e) {
            toast.error('Network failure during termination');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) return toast.error('Max file size is 5MB');
        if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');

        try {
            setUploading(true);
            const authRes = await fetch('/api/imagekit/auth');
            const { token, expire, signature } = await authRes.json();

            const settingsRes = await fetch('/api/admin/settings');
            const settings = await settingsRes.json();

            if (!settings.imagekit_publickey || !settings.imagekit_url) throw new Error('Storage not configured');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('publicKey', settings.imagekit_publickey);
            formData.append('signature', signature);
            formData.append('expire', expire.toString());
            formData.append('token', token);
            formData.append('fileName', `user-${userProfile?.id}-${Date.now()}`);
            formData.append('folder', '/profile_photos');

            const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();

            const patchRes = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile_imagekit_url: uploadData.url })
            });

            if (patchRes.ok) {
                toast.success('Profile avatar updated');
                fetchData();
            }
        } catch (err: any) {
            toast.error(err.message || 'Transmission failure');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-emerald-50 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
    );

    const initials = userProfile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-10 select-none relative">
            
            {/* Header Navigasi */}
            <div className="p-6 bg-white sticky top-0 z-50 border-b border-emerald-50">
                <div className="flex items-center">
                    <button 
                        onClick={() => subView === 'menu' ? router.push('/user') : setSubView('menu')}
                        className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight uppercase italic">
                        {subView === 'menu' ? 'MY PROFILE' : subView.toUpperCase()}
                    </h2>
                </div>
            </div>

            {subView === 'menu' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
                    {/* Bagian Profil (Modern & Integrated) */}
                    <div className="px-6 py-4">
                        <input 
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div className="flex items-center space-x-5">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-2xl shadow-emerald-200">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                                        {userProfile?.profile_imagekit_url ? (
                                            <img src={userProfile.profile_imagekit_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-emerald-600 text-2xl font-black uppercase text-center">{initials}</span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center border-2 border-white active:scale-90 transition-all disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                                </button>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{userProfile?.full_name}</h2>
                                    <BadgeCheck size={22} className="text-blue-500 fill-blue-50" fill="currentColor" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium">{userProfile?.email}</p>
                                <div className="mt-2 flex items-center space-x-2">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-100">
                                        Active Account
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Daftar Navigasi Menu */}
                    <div className="px-6 mt-6 space-y-10">
                        {/* Grup: Pengaturan Akun */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Account Settings</h4>
                            </div>
                            <div className="bg-slate-50/50 rounded-[2.5rem] p-2 space-y-1">
                                <ActionBtn icon={<User size={22} />} label="Profile Information" desc="Change your details and photo" color="text-blue-500" onClick={() => setSubView('profile')} />
                                <ActionBtn icon={<TrendingUp size={22} />} label="Become Reseller" desc={isReseller ? "Partnership Active" : "Scale your business uplink"} color="text-amber-500" onClick={() => setSubView('reseller')} />
                                <ActionBtn icon={<CreditCard size={22} />} label="Payment Methods" desc="Manage cards & balance" color="text-emerald-500" onClick={() => router.push('/user/add-funds')} />
                                <ActionBtn icon={<Ticket size={22} />} label="Redeem Credits" desc="Claim access vouchers" color="text-orange-500" onClick={() => router.push('/user/redeem/claim')} />
                            </div>
                        </section>

                        {/* Grup: Preferences */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Preferences</h4>
                            </div>
                            <div className="bg-slate-50/50 rounded-[2.5rem] p-2 space-y-1">
                                <ActionBtn icon={<Bell size={22} />} label="Notifications" desc="Set app alerts" color="text-purple-500" onClick={() => setSubView('notifications')} />
                                <ActionBtn icon={<Globe size={22} />} label="Language" desc="English (US)" color="text-indigo-500" />
                                <ActionBtn icon={<Moon size={22} />} label="App Theme" desc="Light Mode" color="text-slate-700" />
                            </div>
                        </section>

                        {/* Grup: Support */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Help & Security</h4>
                            </div>
                            <div className="bg-slate-50/50 rounded-[2.5rem] p-2 space-y-1">
                                <ActionBtn icon={<ShieldCheck size={22} />} label="Security Center" desc="Privacy & Passwords" color="text-teal-500" onClick={() => setSubView('security')} />
                                <ActionBtn icon={<HelpCircle size={22} />} label="Help Center" desc="Contact 24/7 support" color="text-rose-500" onClick={() => router.push('/user/tickets')} />
                            </div>
                        </section>

                        {/* Logout Button & Version Info */}
                        <div className="pt-6 pb-12 space-y-8">
                            <button 
                                onClick={handleLogout}
                                className="w-full py-5 rounded-[2rem] bg-white border-2 border-slate-100 text-slate-900 font-black text-sm flex items-center justify-center space-x-3 active:scale-[0.98] transition-all shadow-sm"
                            >
                                <LogOut size={20} className="text-rose-500" />
                                <span>Log Out Now</span>
                            </button>
                            
                            <div className="flex flex-col items-center space-y-2">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">App Version 2.4.0</p>
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Made with ❤️ by Team</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-Views */}
            {subView === 'profile' && (
                <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300">
                    <section>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Update record</h4>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 space-y-4">
                                <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/10">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Full Identity Name</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none"
                                    />
                                </div>
                                <div className="px-6 py-2">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">Email: {userProfile?.email}<br/>Username: {userProfile?.username}</p>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full bg-emerald-600 text-white py-5 rounded-[2.5rem] font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                <span>Commit Changes</span>
                            </button>
                        </form>
                    </section>
                </div>
            )}

            {subView === 'notifications' && (
                <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
                    <section className="space-y-4">
                        <NotifyToggle label="Order Status Updates" desc="Acquisition milestones" active={notifications.email_order_updates} onToggle={() => handleToggleNotification('email_order_updates')} />
                        <NotifyToggle label="Financial Influx" desc="Deposit verification" active={notifications.email_deposit_updates} onToggle={() => handleToggleNotification('email_deposit_updates')} />
                        <NotifyToggle label="Support Transmissions" desc="Ticket resolution alerts" active={notifications.email_ticket_updates} onToggle={() => handleToggleNotification('email_ticket_updates')} />
                        <NotifyToggle label="Broadcast Matrix" desc="Marketing protocols" active={notifications.email_marketing} onToggle={() => handleToggleNotification('email_marketing')} />
                    </section>
                </div>
            )}

            {subView === 'security' && (
                <div className="p-6 space-y-10 animate-in slide-in-from-right duration-300">
                    <section>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Password Rotation</h4>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-3">
                                <SettingsInp type={showCurrentPassword ? 'text' : 'password'} label="Current Passkey" value={passwords.current} onChange={(v: string) => setPasswords({...passwords, current: v})} show={showCurrentPassword} toggle={() => setShowCurrentPassword(!showCurrentPassword)} />
                                <SettingsInp type={showNewPassword ? 'text' : 'password'} label="New Passkey" value={passwords.new} onChange={(v: string) => setPasswords({...passwords, new: v})} show={showNewPassword} toggle={() => setShowNewPassword(!showNewPassword)} />
                                <SettingsInp type="password" label="Confirm Passkey" value={passwords.confirm} onChange={(v: string) => setPasswords({...passwords, confirm: v})} />
                            </div>
                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full bg-slate-900 text-white py-5 rounded-[2.5rem] font-black text-sm flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-xl shadow-slate-100"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                                <span>Authorize Rotation</span>
                            </button>
                        </form>
                    </section>

                    <section className="pt-6 border-t border-slate-50">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">API Access Protocols</h4>
                            <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 overflow-hidden">
                                {hasApiKey ? (
                                    <div className="space-y-4">
                                        <div className="p-5 bg-white rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                                            <code className="text-[10px] font-black tracking-widest text-slate-500 truncate mr-2">
                                                {showApiKey ? apiKey : '••••••••••••••••••••••••'}
                                            </code>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => setShowApiKey(!showApiKey)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                                                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(apiKey || '');
                                                        toast.success('Key copied to vault');
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleGenerateApiKey}
                                            className="w-full py-4 bg-white border border-emerald-100 text-emerald-600 rounded-3xl font-black text-[10px] uppercase tracking-widest active:bg-emerald-50 transition-colors shadow-sm"
                                        >
                                            Rotate API Key
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 space-y-4">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto">
                                            <Info className="text-emerald-500" size={32} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active API Key Registered</p>
                                        <button 
                                            onClick={handleGenerateApiKey}
                                            className="w-full py-4 bg-emerald-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100"
                                        >
                                            Initiate API Integration
                                        </button>
                                    </div>
                                )}
                            </div>
                    </section>
                </div>
            )}

            {subView === 'reseller' && (
                <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300">
                    <section>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Reseller Matrix</h4>
                        {isReseller ? (
                            <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-center space-y-6 shadow-xl shadow-emerald-100 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full opacity-30"></div>
                                <BadgeCheck size={64} className="mx-auto text-white opacity-90" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-white uppercase italic">Status: Active</h3>
                                    <p className="text-xs text-emerald-100 font-bold uppercase tracking-widest opacity-80 leading-relaxed px-4">You have full access to our proprietary service network and priority fulfillment protocols.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-2 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 space-y-1">
                                    <div className="p-5 bg-white rounded-3xl flex items-center space-x-4 border border-slate-50 shadow-sm">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><CircleDollarSign size={24} /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight">Preferential Pricing</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Locked acquisition rates</p>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-3xl flex items-center space-x-4 border border-slate-50 shadow-sm">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><TrendingUp size={24} /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight">Growth Acceleration</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unlimited temporal scale</p>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-3xl flex items-center space-x-4 border border-slate-50 shadow-sm">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Headset size={24} /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight">Priority Uplink</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instant support mediation</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-center space-y-2">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Registration Fee</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">${resellerFee.toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">One-time authorization charge</p>
                                </div>

                                <button 
                                    onClick={handleRegisterReseller}
                                    disabled={saving}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[2.5rem] font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-slate-100 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                                    <span>Initiate Partnership</span>
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            )}

        </div>
    );
};

const ActionBtn = ({ icon, label, desc, color, onClick }: { icon: any, label: string, desc: string, color: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full p-4 bg-white rounded-3xl flex items-center justify-between active:scale-[0.98] transition-all border border-slate-100/50 shadow-sm">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-50 ${color}`}>
                {icon}
            </div>
            <div className="text-left">
                <p className="text-sm font-bold text-slate-900">{label}</p>
                <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-300" />
    </button>
);

const NotifyToggle = ({ label, desc, active, onToggle }: { label: string, desc: string, active: boolean, onToggle: () => void }) => (
    <button onClick={onToggle} className="w-full p-5 bg-white border border-slate-100 shadow-sm rounded-3xl flex items-center justify-between transition-all active:scale-[0.98]">
        <div className="text-left">
            <p className="text-sm font-bold text-slate-900">{label}</p>
            <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
        </div>
        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${active ? 'translate-x-6' : 'translate-x-0'} shadow-sm`}></div>
        </div>
    </button>
);

const SettingsInp = ({ label, type, value, onChange, show, toggle }: { label: string, type: string, value: string, onChange: (v: string) => void, show?: boolean, toggle?: () => void }) => (
    <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col relative focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">{label}</label>
        <div className="flex items-center">
            <input 
                type={type} 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold tracking-widest outline-none focus:ring-0 placeholder:text-slate-200 flex-1"
                placeholder="••••••••"
            />
            {toggle && (
                <button type="button" onClick={toggle} className="p-1 text-slate-300 hover:text-emerald-500 transition-colors">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    </div>
);

export default AccountView;
