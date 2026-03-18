'use client';

import React, { useState } from 'react';
import { Save, Globe2, Image, Instagram, Facebook, Mail, Phone, MessageCircle, Code, Key, CheckCircle, Loader2, DollarSign, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/ui/ImageUpload';

type SettingData = {
  id: number;
  site_name: string;
  favicon_imagekit_url: string | null;
  logo_imagekit_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  email: string | null;
  phone: string | null;
  telegram: string | null;
  imagekit_url: string | null;
  imagekit_publickey: string | null;
  imagekit_privatekey: string | null;
  google_analytic_code: string | null;
  google_search_code: string | null;
  reseller_fee: number;
  pusher_app_id: string | null;
  pusher_app_key: string | null;
  pusher_app_secret: string | null;
  pusher_app_cluster: string | null;
  plausible_domain: string | null;
  plausible_api_key: string | null;
  onesignal_app_id: string | null;
  onesignal_rest_api_key: string | null;
  firebase_service_account_json: string | null;
  posthog_api_key: string | null;
  posthog_host: string | null;
  posthog_personal_api_key: string | null;
  posthog_project_id: string | null;
} | null;

const SettingsClient = ({ initialSettings }: { initialSettings: SettingData }) => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    site_name: initialSettings?.site_name || '',
    favicon_imagekit_url: initialSettings?.favicon_imagekit_url || '',
    logo_imagekit_url: initialSettings?.logo_imagekit_url || '',
    instagram_url: initialSettings?.instagram_url || '',
    facebook_url: initialSettings?.facebook_url || '',
    email: initialSettings?.email || '',
    phone: initialSettings?.phone || '',
    telegram: initialSettings?.telegram || '',
    imagekit_url: initialSettings?.imagekit_url || '',
    imagekit_publickey: initialSettings?.imagekit_publickey || '',
    imagekit_privatekey: initialSettings?.imagekit_privatekey || '',
    google_analytic_code: initialSettings?.google_analytic_code || '',
    google_search_code: initialSettings?.google_search_code || '',
    reseller_fee: initialSettings?.reseller_fee || 100000,
    pusher_app_id: initialSettings?.pusher_app_id || '',
    pusher_app_key: initialSettings?.pusher_app_key || '',
    pusher_app_secret: initialSettings?.pusher_app_secret || '',
    pusher_app_cluster: initialSettings?.pusher_app_cluster || '',
    plausible_domain: initialSettings?.plausible_domain || '',
    plausible_api_key: initialSettings?.plausible_api_key || '',
    onesignal_app_id: initialSettings?.onesignal_app_id || '',
    onesignal_rest_api_key: initialSettings?.onesignal_rest_api_key || '',
    firebase_service_account_json: initialSettings?.firebase_service_account_json || '',
    posthog_api_key: initialSettings?.posthog_api_key || '',
    posthog_host: initialSettings?.posthog_host || '',
    posthog_personal_api_key: initialSettings?.posthog_personal_api_key || '',
    posthog_project_id: initialSettings?.posthog_project_id || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleImageChange = (field: string, url: string) => {
    setFormData(prev => ({ ...prev, [field]: url }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to save settings');
        return;
      }

      setSaved(true);
      toast.success('Settings saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Check if ImageKit is configured
  const isImageKitConfigured = formData.imagekit_url && formData.imagekit_publickey && formData.imagekit_privatekey;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel Settings</h1>
          <p className="text-slate-500 text-sm">
            Configure your panel information, branding, and integrations.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-lg shadow-blue-900/20 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-slate-800 text-sm">General Information</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Site Name *</label>
              <input
                type="text"
                name="site_name"
                value={formData.site_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="JustAnotherPanel"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Support Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="support@example.com"
                />
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+62 812 3456 7890"
                />
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Reseller Registration Fee (USD) *</label>
              <div className="relative">
                <input
                  type="number"
                  name="reseller_fee"
                  value={formData.reseller_fee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100000"
                />
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Branding with Image Upload */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-purple-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Branding</h2>
          </div>

          {!isImageKitConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                ⚠️ Please configure ImageKit settings below first to enable image uploads.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Logo</label>
              {isImageKitConfigured ? (
                <ImageUpload
                  value={formData.logo_imagekit_url}
                  onChange={(url) => handleImageChange('logo_imagekit_url', url)}
                  folder="branding"
                  label="Upload Logo"
                  previewClassName="h-20 w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                  <Image className="w-6 h-6 text-slate-300" />
                  <span className="text-xs text-slate-400">Configure ImageKit first</span>
                </div>
              )}
              {formData.logo_imagekit_url && (
                <p className="text-xs text-slate-400 truncate">{formData.logo_imagekit_url}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Favicon</label>
              {isImageKitConfigured ? (
                <ImageUpload
                  value={formData.favicon_imagekit_url}
                  onChange={(url) => handleImageChange('favicon_imagekit_url', url)}
                  folder="branding"
                  label="Upload Favicon"
                  previewClassName="h-20 w-20"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                  <Image className="w-6 h-6 text-slate-300" />
                  <span className="text-xs text-slate-400">Configure ImageKit first</span>
                </div>
              )}
              {formData.favicon_imagekit_url && (
                <p className="text-xs text-slate-400 truncate">{formData.favicon_imagekit_url}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Instagram className="w-4 h-4 text-pink-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Social Media</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Instagram URL</label>
              <div className="relative">
                <input
                  type="text"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://instagram.com/username"
                />
                <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Facebook URL</label>
              <div className="relative">
                <input
                  type="text"
                  name="facebook_url"
                  value={formData.facebook_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://facebook.com/username"
                />
                <Facebook className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Telegram</label>
              <div className="relative">
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://t.me/username"
                />
                <MessageCircle className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ImageKit Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-slate-800 text-sm">ImageKit Configuration</h2>
            {isImageKitConfigured && (
              <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Configured</span>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">ImageKit URL Endpoint *</label>
              <input
                type="text"
                name="imagekit_url"
                value={formData.imagekit_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ik.imagekit.io/your_id"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Public Key *</label>
              <input
                type="text"
                name="imagekit_publickey"
                value={formData.imagekit_publickey}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="public_xxxxxxxx"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Private Key *</label>
              <input
                type="password"
                name="imagekit_privatekey"
                value={formData.imagekit_privatekey}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="private_xxxxxxxx"
              />
              <p className="text-xs text-slate-400 mt-1">Keep this secret and never expose it publicly.</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              💡 After saving ImageKit settings, you can upload logo and favicon images above.
            </p>
          </div>
        </div>

        {/* Pusher Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="w-4 h-4 text-pink-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Pusher Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">App ID</label>
              <input
                type="text"
                name="pusher_app_id"
                value={formData.pusher_app_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 123456"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">App Key</label>
              <input
                type="text"
                name="pusher_app_key"
                value={formData.pusher_app_key}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: a1b2c3d4e5f6g7h8i9j0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">App Secret</label>
              <input
                type="password"
                name="pusher_app_secret"
                value={formData.pusher_app_secret}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: a1b2c3d4e5f6g7h8i9j0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">App Cluster</label>
              <input
                type="text"
                name="pusher_app_cluster"
                value={formData.pusher_app_cluster}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: ap1"
              />
            </div>
          </div>
        </div>

        {/* PostHog Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-slate-800 text-sm">PostHog Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Project API Key</label>
              <input
                type="text"
                name="posthog_api_key"
                value={formData.posthog_api_key}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="phc_xxxxxxxx"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">PostHog Host</label>
              <input
                type="text"
                name="posthog_host"
                value={formData.posthog_host}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://us.i.posthog.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Personal API Key (for Querying)</label>
              <input
                type="password"
                name="posthog_personal_api_key"
                value={formData.posthog_personal_api_key}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="phx_xxxxxxxx"
              />
              <p className="text-xs text-slate-400">Required to fetch analytics data for the dashboard.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Project ID</label>
              <input
                type="text"
                name="posthog_project_id"
                value={formData.posthog_project_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
              />
            </div>
          </div>
        </div>

        {/* Plausible Analytics */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Plausible Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Domain Name</label>
              <input
                type="text"
                name="plausible_domain"
                value={formData.plausible_domain}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example.com"
              />
              <p className="text-xs text-slate-400">The domain name you added in Plausible.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">API Key</label>
              <input
                type="password"
                name="plausible_api_key"
                value={formData.plausible_api_key}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Plausible API Key"
              />
              <p className="text-xs text-slate-400">Required to display stats in the dashboard.</p>
            </div>
          </div>
        </div>

        {/* Google Integration */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-green-600" />
            <h2 className="font-semibold text-slate-800 text-sm">Google Integration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Google Analytics Code</label>
              <textarea
                name="google_analytic_code"
                value={formData.google_analytic_code}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="<!-- Google Analytics -->"
              />
              <p className="text-xs text-slate-400">Paste your Google Analytics tracking code here.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Google Search Console Code</label>
              <textarea
                name="google_search_code"
                value={formData.google_search_code}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='<meta name="google-site-verification" content="..." />'
              />
              <p className="text-xs text-slate-400">Paste your Google Search Console verification code here.</p>
            </div>
          </div>
        </div>
        {/* OneSignal Push Notification */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-slate-800 text-sm">OneSignal Push Notification</h2>
            {(formData.onesignal_app_id && formData.onesignal_rest_api_key) && (
              <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Configured</span>
            )}
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Used for sending push notifications to mobile app users (iOS &amp; Android) via OneSignal.
            Get your keys from{' '}
            <a href="https://onesignal.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">onesignal.com</a>
            {' '}→ App Settings → Keys &amp; IDs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">App ID</label>
              <input
                type="text"
                name="onesignal_app_id"
                value={formData.onesignal_app_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              <p className="text-xs text-slate-400">OneSignal App ID (UUID format).</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">REST API Key</label>
              <input
                type="password"
                name="onesignal_rest_api_key"
                value={formData.onesignal_rest_api_key}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="REST API Key from OneSignal"
              />
              <p className="text-xs text-slate-400">Keep this secret — used server-side only to send notifications.</p>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-600 mb-1">📱 Mobile SDK Setup</p>
            <p className="text-xs text-slate-500 mb-2">In your mobile app (React Native / Expo), initialize OneSignal using the App ID above:</p>
            <pre className="text-xs bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto text-slate-700 font-mono leading-relaxed">{`OneSignal.initialize("${formData.onesignal_app_id || 'YOUR_APP_ID'}");
OneSignal.Notifications.requestPermission(true);`}</pre>
          </div>
        </div>

        {/* Firebase Push Notification */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔥</span>
            <h2 className="font-semibold text-slate-800 text-sm">Firebase Push Notification (FCM)</h2>
            {formData.firebase_service_account_json && (
              <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Configured</span>
            )}
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Used to send push notifications (order updates, deposits, tickets, articles) to mobile users via Firebase Cloud Messaging (FCM).
            Dapatkan file JSON dari{' '}
            <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a>
            {' '}→ Project Settings → Service Accounts → <strong>Generate new private key</strong>.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Service Account JSON</label>
            <textarea
              name="firebase_service_account_json"
              value={formData.firebase_service_account_json}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={'{ "type": "service_account", "project_id": "your-project", "private_key_id": "...", ... }'}
            />
            <p className="text-xs text-slate-400">Paste the entire JSON content of the service account file here. Disimpan di database, tidak di .env.</p>
          </div>
          <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-600 mb-2">📱 Push Notifications yang Dikirim Otomatis:</p>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li><strong>Order</strong> — order ditempatkan, status berubah (COMPLETED, CANCELLED, dll.)</li>
              <li><strong>Deposit</strong> — deposit masuk, status berubah (APPROVED/REJECTED)</li>
              <li><strong>Ticket</strong> — tiket baru dibuat, ada balasan dari admin</li>
              <li><strong>Blog/Article</strong> — artikel baru dipublikasikan (broadcast ke semua)</li>
              <li><strong>Announcement</strong> — pengumuman baru (broadcast ke semua)</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsClient;
