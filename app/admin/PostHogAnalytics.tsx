'use client';

import React, { useState } from 'react';
import {
    TrendingUp, Eye, Clock,
    Globe, Activity, Zap, Users,
    MapPin, MousePointer2, ExternalLink,
    Gauge, ShieldCheck, Smartphone, Monitor as MonitorIcon,
    ChevronRight, ArrowUpRight, Search
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PostHogTrendPoint {
    date: string;
    value: number;
}

export interface PostHogBreakdownItem {
    name: string;
    count: number;
}

export interface PostHogData {
    visitors: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
    trend: PostHogTrendPoint[];
    topPages: PostHogBreakdownItem[];
    topReferrers: PostHogBreakdownItem[];
    countries: PostHogBreakdownItem[];
    browsers: PostHogBreakdownItem[];
    devices: PostHogBreakdownItem[];
    webVitals: {
        lcp: number;
        fid: number;
        cls: number;
        fcp: number;
    };
    domain: string;
}

// ── World Map & Helpers ────────────────────────────────────────────────────────

const COUNTRY_COORDS: Record<string, { x: number, y: number }> = {
    ID: { x: 610, y: 260 }, US: { x: 150, y: 150 }, GB: { x: 380, y: 120 },
    IN: { x: 550, y: 195 }, DE: { x: 410, y: 125 }, FR: { x: 395, y: 135 },
    JP: { x: 690, y: 165 }, BR: { x: 280, y: 260 }, AU: { x: 670, y: 310 },
    CA: { x: 160, y: 100 }, SG: { x: 600, y: 245 }, RU: { x: 550, y: 100 },
    CN: { x: 610, y: 170 },
};

const COUNTRY_NAMES: Record<string, string> = {
    ID: 'Indonesia', US: 'USA', GB: 'UK', IN: 'India', DE: 'Germany',
    FR: 'France', JP: 'Japan', CA: 'Canada', BR: 'Brazil', NL: 'Netherlands',
    SG: 'Singapore', RU: 'Russia', CN: 'China', AU: 'Australia',
};

function countryFlag(code: string): string {
    if (!code || code.length !== 2) return '🌐';
    return code.toUpperCase().split('').map(c =>
        String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join('');
}

// ── Performance Color coding ───────────────────────────────────────────────────

function getVitalStatus(key: string, value: number) {
    if (value === 0) return { label: 'No Data', color: 'text-slate-400', bg: 'bg-slate-100' };
    
    const thresholds: Record<string, [number, number]> = {
        lcp: [2500, 4000], // ms
        fid: [100, 300],   // ms
        cls: [0.1, 0.25],  // score
        fcp: [1800, 3000], // ms
    };

    const [good, poor] = thresholds[key.toLowerCase()] || [0, 0];
    if (value <= good) return { label: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' };
    if (value <= poor) return { label: 'Needs Improvement', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' };
}

// ── Components ─────────────────────────────────────────────────────────────

function WorldMap({ data }: { data: PostHogBreakdownItem[] }) {
    return (
        <div className="relative w-full aspect-[2/1] bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 mt-4">
            <svg viewBox="0 0 800 400" className="w-full h-full fill-slate-200 opacity-60">
                <path d="M120,80 Q150,50 200,80 T250,120 Q220,180 180,220 T120,280 Q80,240 60,180 T120,80 Z" />
                <path d="M250,230 Q280,210 320,240 T340,300 Q310,360 270,380 T220,330 Q220,280 250,230 Z" />
                <path d="M400,60 Q450,40 550,60 T650,100 Q680,150 630,220 T520,260 Q480,240 420,260 T380,200 Q360,140 400,60 Z" />
                <path d="M380,210 Q420,190 470,220 T490,280 Q470,340 430,360 T360,320 Q350,270 380,210 Z" />
                <path d="M630,280 Q660,260 710,290 T730,350 Q700,380 650,370 T610,320 Q610,290 630,280 Z" />
                <circle cx="690" cy="165" r="10" />
                <circle cx="610" cy="260" r="8" />
                <circle cx="380" cy="120" r="12" />
            </svg>
            {data.slice(0, 10).map((c, i) => {
                const coords = COUNTRY_COORDS[c.name.toUpperCase()];
                if (!coords) return null;
                return (
                    <div key={i} className="absolute group" style={{ left: `${(coords.x / 800) * 100}%`, top: `${(coords.y / 400) * 100}%` }}>
                        <div className="relative -translate-x-1/2 -translate-y-1/2">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" style={{ padding: 12 }} />
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm ring-2 ring-red-500/10" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {countryFlag(c.name)} {COUNTRY_NAMES[c.name.toUpperCase()] || c.name}: {c.count.toLocaleString()}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function WebVitalItem({ name, value, unit = 'ms', desc }: { name: string; value: number; unit?: string; desc: string }) {
    const status = getVitalStatus(name, value);
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{name}</p>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${status.bg} ${status.color}`}>
                    {status.label}
                </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
                <h4 className="text-xl font-black text-slate-900">{value > 10 ? value.toFixed(0) : value.toFixed(2)}</h4>
                <span className="text-[10px] font-bold text-slate-400">{unit}</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${status.bar || 'bg-slate-300'}`} style={{ width: value > 0 ? '100%' : '0%' }} />
            </div>
            <p className="text-[9px] text-slate-500 leading-tight">{desc}</p>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PostHogAnalytics({ data }: { data: PostHogData | null }) {
    const [activeTab, setActiveTab] = useState<'countries' | 'browsers' | 'devices'>('countries');

    if (!data) return (
        <div className="mt-8 bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-slate-50 rounded-2xl mb-4"><Zap className="w-8 h-8 text-slate-300 animate-pulse" /></div>
            <h3 className="text-lg font-bold text-slate-800">Analytics Connection Required</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">Configure PostHog in settings to view Web Vitals and Page Reports.</p>
            <a href="/admin/settings" className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
                Configure Now <ExternalLink className="w-4 h-4" />
            </a>
        </div>
    );

    const stats = [
        { label: 'Visitors', value: data.visitors.toLocaleString(), icon: <Users className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Pageviews', value: data.pageviews.toLocaleString(), icon: <Eye className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'LCP (Avg)', value: `${(data.webVitals.lcp / 1000).toFixed(1)}s`, icon: <Gauge className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'FID (Avg)', value: `${data.webVitals.fid.toFixed(0)}ms`, icon: <ShieldCheck className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-slate-200 pb-4">
                <div>
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">PostHog Analytics Engine</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Performance & Page Insights</h2>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Project</p>
                    <p className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1 justify-end">{data.domain} <ExternalLink className="w-3 h-3" /></p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main: Web Vitals & Page Report */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Web Vitals Section */}
                    <section>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-slate-400" /> Core Web Vitals (30d)
                        </h3>
                        <div className="grid sm:grid-cols-4 gap-4">
                            <WebVitalItem name="LCP" value={data.webVitals.lcp} desc="Time it takes for the largest content element to be visible." />
                            <WebVitalItem name="FID" value={data.webVitals.fid} desc="Time from first interaction to browser processing." />
                            <WebVitalItem name="CLS" value={data.webVitals.cls} unit="" desc="Measurement of visual stability and unexpected shifts." />
                            <WebVitalItem name="FCP" value={data.webVitals.fcp} desc="First point where browser renders any part of the page." />
                        </div>
                    </section>

                    {/* Page Report Section */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4 text-slate-400" /> Page Visit Breakdown
                            </h3>
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Full Report</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-[9px] font-black uppercase text-slate-400 bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3">Page Path</th>
                                        <th className="px-6 py-3 text-right">Views</th>
                                        <th className="px-6 py-3 text-right">Contribution</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.topPages.map((p, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3 font-bold text-slate-700 truncate max-w-[200px]">{p.name}</td>
                                            <td className="px-6 py-3 text-right font-black text-slate-900">{p.count.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[9px] font-bold text-slate-400">{((p.count / data.pageviews) * 100).toFixed(1)}%</span>
                                                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-slate-900" style={{ width: `${(p.count / data.pageviews) * 100}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <ChevronRight className="w-3 h-3 text-slate-300 ml-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Sidebar: Audience & Map */}
                <div className="space-y-8">
                    {/* Device Distribution */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center justify-between">
                            Device Types
                            <Smartphone className="w-4 h-4 text-slate-400" />
                        </h3>
                        <div className="space-y-5">
                            {data.devices.map((d, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-500 uppercase flex items-center gap-2">
                                            {d.name.toLowerCase() === 'mobile' ? <Smartphone className="w-3 h-3" /> : <MonitorIcon className="w-3 h-3" />}
                                            {d.name}
                                        </span>
                                        <span className="text-slate-900">{((d.count / data.pageviews) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${(d.count / data.pageviews) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compact Map */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center justify-between">
                            Geo Analysis
                            <Globe className="w-4 h-4 text-slate-400" />
                        </h3>
                        <WorldMap data={data.countries} />
                        <div className="mt-4 space-y-2">
                            {data.countries.slice(0, 3).map((c, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-slate-500 uppercase">{countryFlag(c.name)} {COUNTRY_NAMES[c.name.toUpperCase()] || c.name}</span>
                                    <span className="font-black text-slate-800">{c.count.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
