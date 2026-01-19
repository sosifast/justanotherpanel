'use client';

import React, { useState } from 'react';
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
    Copy
} from 'lucide-react';

const AccountPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    // Profile form state
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 234 567 8900',
        skype: 'john.doe.skype',
        timezone: 'UTC-5',
    });

    // Password form state
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        orderComplete: true,
        orderFailed: true,
        lowBalance: true,
        newServices: false,
        promotions: false,
        newsletter: false,
    });

    const apiKey = 'sk_live_abc123xyz789def456ghi012';

    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'api', label: 'API Access', icon: <Key className="w-4 h-4" /> },
    ];

    const timezones = [
        'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5',
        'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3',
        'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
    ];

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
                                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    JD
                                </div>
                                <button className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors">
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
                            <form className="p-6 space-y-6">
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
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Skype ID</label>
                                        <input
                                            type="text"
                                            value={profile.skype}
                                            onChange={(e) => setProfile({ ...profile, skype: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <select
                                            value={profile.timezone}
                                            onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                        >
                                            {timezones.map((tz) => (
                                                <option key={tz} value={tz}>{tz}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
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
                                                <p className="font-medium text-slate-900">2FA is not enabled</p>
                                                <p className="text-sm text-slate-500">Protect your account with two-factor authentication</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                                            Enable 2FA
                                        </button>
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
                                    {[
                                        { device: 'Windows PC - Chrome', location: 'New York, US', current: true, time: 'Now' },
                                        { device: 'iPhone 14 Pro - Safari', location: 'New York, US', current: false, time: '2 hours ago' },
                                    ].map((session, idx) => (
                                        <div key={idx} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <Globe className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm flex items-center gap-2">
                                                        {session.device}
                                                        {session.current && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{session.location} • {session.time}</p>
                                                </div>
                                            </div>
                                            {!session.current && (
                                                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                                            { key: 'orderComplete', label: 'Order Completed', desc: 'Get notified when your order is complete' },
                                            { key: 'orderFailed', label: 'Order Failed', desc: 'Get notified when an order fails or is cancelled' },
                                            { key: 'lowBalance', label: 'Low Balance Alert', desc: 'Get notified when your balance is below $10' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications[item.key as keyof typeof notifications]}
                                                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
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
                                        {[
                                            { key: 'newServices', label: 'New Services', desc: 'Get notified about new services and features' },
                                            { key: 'promotions', label: 'Promotions', desc: 'Receive promotional offers and discounts' },
                                            { key: 'newsletter', label: 'Newsletter', desc: 'Monthly newsletter with tips and updates' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications[item.key as keyof typeof notifications]}
                                                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Preferences
                                    </button>
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
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 px-4 py-3 bg-slate-900 rounded-lg flex items-center justify-between">
                                            <code className="text-amber-400 font-mono text-sm truncate">{apiKey}</code>
                                        </div>
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
                                </div>
                            </div>

                            {/* Regenerate Key */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                    <h2 className="font-semibold text-slate-900">Regenerate API Key</h2>
                                    <p className="text-sm text-slate-500">Generate a new API key if your current one is compromised</p>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-slate-600 mb-4">
                                        Generating a new API key will immediately invalidate your old key. All applications using the old key will stop working.
                                    </p>
                                    <button className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                        Regenerate Key
                                    </button>
                                </div>
                            </div>

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
        </div>
    );
};

export default AccountPage;
