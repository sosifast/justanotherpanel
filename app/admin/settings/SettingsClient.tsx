'use client';

import React, { useState } from 'react';
import { Save, Globe2, DollarSign, Clock, Mail, Shield } from 'lucide-react';

type SettingData = {
  id: number;
  site_name: string;
  email: string | null;
  // Add other fields if matched later
};

const SettingsClient = ({ initialSettings }: { initialSettings: SettingData | null }) => {
  // Using partial state for what we have, others static for now as they miss schema
  const [siteName, setSiteName] = useState(initialSettings?.site_name || '');
  const [email, setEmail] = useState(initialSettings?.email || '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Panel</h1>
          <p className="text-slate-500 text-sm">
            Atur informasi utama panel, mata uang, dan preferensi sistem.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-lg shadow-blue-900/20 transition-colors">
          <Save className="w-4 h-4" />
          Simpan Pengaturan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe2 className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-slate-800 text-sm">Informasi Umum</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Nama Panel</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contoh: JustAnotherPanel"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Domain Utama</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://panelanda.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Email Support</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="support@panelanda.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Bahasa Default</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Indonesia</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h2 className="font-semibold text-slate-800 text-sm">Mata Uang dan Harga</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Mata Uang</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>USD ($)</option>
                  <option>IDR (Rp)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Minimum Deposit</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Markup Otomatis (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="font-semibold text-slate-800 text-sm">Waktu dan Order</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Zona Waktu</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Asia/Jakarta (GMT+7)</option>
                  <option>UTC</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Auto Cancel Pending (jam)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="24"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-slate-800 text-sm">Notifikasi</h2>
            </div>
            <div className="space-y-3 mt-2">
              <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
                <span>Email untuk order baru</span>
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              </label>
              <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
                <span>Email untuk tiket baru</span>
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              </label>
              <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
                <span>Notifikasi low balance provider</span>
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              </label>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold">Keamanan</h2>
            </div>
            <p className="text-xs text-slate-300">
              Untuk keamanan maksimal, pastikan API key provider dan kredensial payment gateway disimpan di environment variable.
            </p>
            <button className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium border border-white/10">
              Buka Dokumentasi Keamanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsClient;
