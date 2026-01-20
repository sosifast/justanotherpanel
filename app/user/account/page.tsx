'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Shield,
    Eye,
    EyeOff,
    Save,
    Camera,
    Key,
    Globe,
    CheckCircle,
    AlertCircle,
    Copy,
    Loader2,
    Monitor,
    RefreshCw,
    Trash2,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/ui/ImageUpload';

type UserProfile = {
    id: number;
    full_name: string;
    username: string;
    email: string;
    profile_imagekit_url: string | null;
    balance: number | string;
    created_at: string;
};

type Session = {
    id: number;
    ip_address: string | null;
    user_agent: string | null;
    device: string | null;
    location: string | null;
    last_active: string;
    created_at: string;
    is_current: boolean;
};

type NotificationPrefs = {
    email_order_updates: boolean;
    email_deposit_updates: boolean;
    email_ticket_updates: boolean;
    email_marketing: boolean;
};

const AccountPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Real profile data from API
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Profile form state
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        username: '',
        phone: '',
        skype: '',
        timezone: 'UTC-5',
    });

    // Password form state
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    // Real notification settings from API
    const [notifications, setNotifications] = useState<NotificationPrefs>({
        email_order_updates: true,
        email_deposit_updates: true,
        email_ticket_updates: true,
        email_marketing: false,
    });

    // Real sessions from API
    const [sessions, setSessions] = useState<Session[]>([]);

    // Real API key from API
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [maskedApiKey, setMaskedApiKey] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    // Reseller state
    const [isReseller, setIsReseller] = useState(false);
    const [resellerData, setResellerData] = useState<any>(null);
    const [resellerFee, setResellerFee] = useState(0);
    const [registering, setRegistering] = useState(false);

    // Profile picture upload state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchSessions();
        fetchNotifications();
        fetchApiKey();
        fetchResellerStatus();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/user/profile');
            const data = await response.json();
            if (response.ok) {
                setUserProfile(data.user);
                setProfile({
                    name: data.user.full_name,
                    email: data.user.email,
                    username: data.user.username,
                    phone: '',
                    skype: '',
                    timezone: 'UTC-5'
                });
            }
        } catch (error) {
            console.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/user/sessions');
            const data = await response.json();
            if (response.ok) {
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error('Failed to load sessions');
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/user/notifications');
            const data = await response.json();
            if (response.ok) {
                setNotifications({
                    email_order_updates: data.preferences.email_order_updates,
                    email_deposit_updates: data.preferences.email_deposit_updates,
                    email_ticket_updates: data.preferences.email_ticket_updates,
                    email_marketing: data.preferences.email_marketing
                });
            }
        } catch (error) {
            console.error('Failed to load notifications');
        }
    };

    const fetchApiKey = async () => {
        try {
            const response = await fetch('/api/user/apikey');
            const data = await response.json();
            if (response.ok) {
                setApiKey(data.apikey);
                setMaskedApiKey(data.masked_apikey);
                setHasApiKey(data.has_apikey);
            }
        } catch (error) {
            console.error('Failed to load API key');
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: profile.name,
                    username: profile.username
                })
            });
            const data = await response.json();

            if (response.ok) {
                setUserProfile(data.user);
                toast.success('Profile updated successfully!');
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
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
                toast.error('Failed to update preference');
            }
        } catch (error) {
            setNotifications({ ...notifications, [key]: !newValue });
            toast.error('Failed to update preference');
        }
    };

    const handleRevokeSession = async (sessionId: number) => {
        if (!confirm('Are you sure you want to revoke this session?')) return;

        try {
            const response = await fetch(`/api/user/sessions/${sessionId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Session revoked successfully');
                fetchSessions();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to revoke session');
            }
        } catch (error) {
            toast.error('Failed to revoke session');
        }
    };

    const handleGenerateApiKey = async () => {
        if (hasApiKey && !confirm('This will revoke your current API key. Continue?')) return;

        try {
            const response = await fetch('/api/user/apikey', {
                method: 'POST'
            });
            const data = await response.json();

            if (response.ok) {
                setApiKey(data.apikey);
                setHasApiKey(true);
                setShowApiKey(true);
                toast.success('API key generated successfully!');
                fetchApiKey();
            } else {
                toast.error('Failed to generate API key');
            }
        } catch (error) {
            toast.error('Failed to generate API key');
        }
    };

    const handleProfileImageChange = async (url: string) => {
        try {
            setUploadingImage(true);
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile_imagekit_url: url })
            });
            const data = await response.json();

            if (response.ok) {
                setUserProfile(data.user);
                setShowUploadModal(false);
                toast.success('Profile picture updated successfully!');
                // Update local profile state as well
                setProfile(prev => ({ ...prev, profile_imagekit_url: data.user.profile_imagekit_url }));
                // Fetch again to sync everything
                fetchProfile();
            } else {
                toast.error(data.error || 'Failed to update profile picture');
            }
        } catch (error) {
            toast.error('Failed to update profile picture');
        } finally {
            setUploadingImage(false);
        }
    };

    const copyApiKey = () => {
        const keyToCopy = showApiKey ? apiKey : maskedApiKey;
        if (keyToCopy) {
            navigator.clipboard.writeText(apiKey || '');
            setCopiedKey(true);
            toast.success('API key copied to clipboard!');
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const fetchResellerStatus = async () => {
        try {
            const response = await fetch('/api/user/reseller/register');
            const data = await response.json();
            if (response.ok) {
                setIsReseller(data.is_reseller);
                setResellerData(data.reseller);
                setResellerFee(parseFloat(data.reseller_fee));
            }
        } catch (error) {
            console.error('Failed to load reseller status');
        }
    };

    const handleRegisterReseller = async () => {
        if (!confirm(`Are you sure you want to become a reseller? This will deduct $${resellerFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from your balance.`)) {
            return;
        }

        try {
            setRegistering(true);
            const response = await fetch('/api/user/reseller/register', {
                method: 'POST'
            });
            const data = await response.json();

            if (response.ok) {
                toast.success('Successfully registered as reseller!');
                setIsReseller(true);
                setResellerData(data.reseller);
                // Refresh profile to update balance
                fetchProfile();
                fetchResellerStatus();
            } else {
                toast.error(data.error || 'Failed to register as reseller');
            }
        } catch (error) {
            toast.error('Failed to register as reseller');
        } finally {
            setRegistering(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
        { id: 'reseller', label: 'Reseller', icon: <Shield className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'api', label: 'API Access', icon: <Key className="w-4 h-4" /> },
    ];

    const timezones = [
        'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5',
        'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3',
        'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-slate-500">Manage your profile and preferences</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* User Info */}
                        <div className="p-6 border-b border-slate-100 text-center">
                            <div className="relative inline-block mb-4">
                                {userProfile?.profile_imagekit_url ? (
                                    <img
                                        src={userProfile.profile_imagekit_url}
                                        alt={userProfile.full_name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-slate-100"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg"
                                >
                                    <Camera className="w-3 h-3" />
                                </button>
                            </div>
                            <h3 className="font-semibold text-slate-900">{profile.name}</h3>
                            <p className="text-sm text-slate-500">{profile.email}</p>
                            <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors text-left ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Account Stats */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-lg font-bold text-slate-900">$1,240.50</p>
                                    <p className="text-xs text-slate-500">Balance</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">8,542</p>
                                    <p className="text-xs text-slate-500">Orders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h2 className="font-semibold text-slate-900">Profile Information</h2>
                                <p className="text-sm text-slate-500">Update your personal details</p>
                            </div>
                            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={profile.username}
                                                disabled
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Change Password */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                    <h2 className="font-semibold text-slate-900">Change Password</h2>
                                    <p className="text-sm text-slate-500">Update your password regularly to keep your account secure</p>
                                </div>
                                <form className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="password"
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Two-Factor Authentication */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                    <h2 className="font-semibold text-slate-900">Two-Factor Authentication</h2>
                                    <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <Shield className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">This feature is under development</p>
                                                <p className="text-sm text-slate-500">Two-factor authentication will be available soon</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                            Coming Soon
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                    <h2 className="font-semibold text-slate-900">Active Sessions</h2>
                                    <p className="text-sm text-slate-500">Manage your active login sessions</p>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <Monitor className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm flex items-center gap-2">
                                                        {session.device || 'Unknown Device'}
                                                        {session.is_current && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {session.ip_address} • {session.location || 'Unknown'} • {new Date(session.last_active).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {!session.is_current && (
                                                <button
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {sessions.length === 0 && (
                                        <div className="p-8 text-center text-slate-500">
                                            No active sessions
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reseller Tab */}
                    {activeTab === 'reseller' && (
                        <div className="space-y-6">
                            {!isReseller ? (
                                /* Not a Reseller - Registration UI */
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                        <h2 className="font-semibold text-slate-900">Become a Reseller</h2>
                                        <p className="text-sm text-slate-500">Join our reseller program and unlock exclusive benefits</p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Benefits */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900 mb-4">Reseller Benefits</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {[
                                                    { icon: <CheckCircle className="w-5 h-5 text-green-600" />, text: 'Special pricing on all services' },
                                                    { icon: <CheckCircle className="w-5 h-5 text-green-600" />, text: 'Priority customer support' },
                                                ].map((benefit, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                        {benefit.icon}
                                                        <span className="text-sm text-slate-700">{benefit.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Registration Fee */}
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900">Registration Fee</p>
                                                    <p className="text-sm text-slate-600">One-time payment to become a reseller</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        ${resellerFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Current Balance */}
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-600">Your Current Balance</p>
                                                <p className="text-lg font-semibold text-slate-900">
                                                    ${userProfile?.balance ? parseFloat(userProfile.balance.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Register Button */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <button
                                                onClick={handleRegisterReseller}
                                                disabled={registering}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {registering ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="w-5 h-5" />
                                                        Become a Reseller
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Already a Reseller - Status Display */
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                        <h2 className="font-semibold text-slate-900">Reseller Status</h2>
                                        <p className="text-sm text-slate-500">Your reseller account information</p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Status Badge */}
                                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Shield className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Active Reseller</p>
                                                    <p className="text-sm text-slate-600">You are an active reseller member</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                {resellerData?.status}
                                            </span>
                                        </div>

                                        {/* Reseller Info */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-500 mb-1">Reseller ID</p>
                                                <p className="font-semibold text-slate-900">#{resellerData?.id}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-500 mb-1">Member Since</p>
                                                <p className="font-semibold text-slate-900">
                                                    {resellerData?.created_at ? new Date(resellerData.created_at).toLocaleDateString('id-ID') : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Benefits */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Your Benefits</h3>
                                            <div className="space-y-2">
                                                {[
                                                    'Special pricing on all services',
                                                    'Priority customer support'
                                                ].map((benefit, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        {benefit}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h2 className="font-semibold text-slate-900">Notification Preferences</h2>
                                <p className="text-sm text-slate-500">Choose what notifications you want to receive</p>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Order Notifications */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Order Notifications</h3>
                                    <div className="space-y-4">
                                        {[
                                            { key: 'email_order_updates' as keyof NotificationPrefs, label: 'Order Updates', desc: 'Get notified when your order status changes' },
                                            { key: 'email_deposit_updates' as keyof NotificationPrefs, label: 'Deposit Updates', desc: 'Get notified about deposit confirmations' },
                                            { key: 'email_ticket_updates' as keyof NotificationPrefs, label: 'Ticket Replies', desc: 'Get notified when support replies to your tickets' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications[item.key]}
                                                        onChange={() => handleToggleNotification(item.key)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Marketing Notifications */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Marketing & Updates</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">Marketing Emails</p>
                                                <p className="text-xs text-slate-500">Receive promotional offers and updates</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.email_marketing}
                                                    onChange={() => handleToggleNotification('email_marketing')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* API Access Tab */}
                    {activeTab === 'api' && (
                        <div className="space-y-6">
                            {/* API Key */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                    <h2 className="font-semibold text-slate-900">API Key</h2>
                                    <p className="text-sm text-slate-500">Use this key to authenticate API requests</p>
                                </div>
                                <div className="p-6">
                                    {hasApiKey ? (
                                        <>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="flex-1 px-4 py-3 bg-slate-900 rounded-lg flex items-center justify-between">
                                                    <code className="text-amber-400 font-mono text-sm truncate">
                                                        {showApiKey ? apiKey : maskedApiKey}
                                                    </code>
                                                </div>
                                                <button
                                                    onClick={() => setShowApiKey(!showApiKey)}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                                >
                                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    {showApiKey ? 'Hide' : 'Show'}
                                                </button>
                                                <button
                                                    onClick={copyApiKey}
                                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${copiedKey
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {copiedKey ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-4 h-4" />
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                                <div className="flex gap-3">
                                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-amber-800">Keep your API key secret</p>
                                                        <p className="text-amber-700">Do not share your API key in public repositories or client-side code.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600 mb-4">You don't have an API key yet</p>
                                            <button
                                                onClick={handleGenerateApiKey}
                                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                Generate API Key
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Regenerate Key */}
                            {hasApiKey && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                        <h2 className="font-semibold text-slate-900">Regenerate API Key</h2>
                                        <p className="text-sm text-slate-500">Generate a new API key if your current one is compromised</p>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm text-slate-600 mb-4">
                                            Generating a new API key will immediately invalidate your old key. All applications using the old key will stop working.
                                        </p>
                                        <button
                                            onClick={handleGenerateApiKey}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Regenerate Key
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* API Usage Stats */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                    <h2 className="font-semibold text-slate-900">API Usage</h2>
                                    <p className="text-sm text-slate-500">Your API usage statistics for this month</p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                                            <p className="text-2xl font-bold text-slate-900">1,542</p>
                                            <p className="text-sm text-slate-500">Total Requests</p>
                                        </div>
                                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                                            <p className="text-2xl font-bold text-green-600">1,498</p>
                                            <p className="text-sm text-slate-500">Successful</p>
                                        </div>
                                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                                            <p className="text-2xl font-bold text-red-600">44</p>
                                            <p className="text-sm text-slate-500">Failed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Picture Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Update Profile Picture</h3>
                            <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-sm text-slate-500 mb-6">Choose a new photo to update your profile. Max size 5MB.</p>
                            <div className="flex justify-center">
                                <ImageUpload
                                    value={userProfile?.profile_imagekit_url || ''}
                                    onChange={handleProfileImageChange}
                                    folder="profile_pictures"
                                    label="Click to upload new photo"
                                    previewClassName="h-32 w-32 rounded-full mx-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountPage;
