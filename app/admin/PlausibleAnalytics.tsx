'use client';

import React, { useState } from 'react';
import {
    TrendingUp, Eye, MousePointerClick, Clock,
    Globe, FileText, Settings, MapPin, Monitor
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PlausibleAggregate {
    visitors: { value: number };
    pageviews: { value: number };
    bounce_rate: { value: number };
    visit_duration: { value: number };
}

export interface PlausibleTimeseriesPoint {
    date: string;
    visitors: number;
}

export interface PlausibleBreakdownItem {
    page?: string;
    referrer?: string;
    country?: string;
    browser?: string;
    visitors: number;
}

export interface PlausibleData {
    aggregate: PlausibleAggregate | null;
    timeseries: PlausibleTimeseriesPoint[];
    topPages: PlausibleBreakdownItem[];
    topReferrers: PlausibleBreakdownItem[];
    countries: PlausibleBreakdownItem[];
    browsers: PlausibleBreakdownItem[];
    domain: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Convert ISO 3166-1 alpha-2 code to flag emoji */
function countryFlag(code: string): string {
    if (!code || code.length !== 2) return '🌐';
    return code.toUpperCase().split('').map(c =>
        String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join('');
}

/** Full country name from ISO code */
const COUNTRY_NAMES: Record<string, string> = {
    ID: 'Indonesia', US: 'United States', SG: 'Singapore', MY: 'Malaysia',
    GB: 'United Kingdom', AU: 'Australia', IN: 'India', DE: 'Germany',
    FR: 'France', JP: 'Japan', CA: 'Canada', BR: 'Brazil', NL: 'Netherlands',
    PH: 'Philippines', TH: 'Thailand', VN: 'Vietnam', KR: 'South Korea',
    RU: 'Russia', IT: 'Italy', ES: 'Spain', SA: 'Saudi Arabia', AE: 'UAE',
    PK: 'Pakistan', NG: 'Nigeria', ZA: 'South Africa', TR: 'Turkey',
    MX: 'Mexico', AR: 'Argentina', EG: 'Egypt', BD: 'Bangladesh',
};

function countryName(code: string): string {
    return COUNTRY_NAMES[code?.toUpperCase()] || code || 'Unknown';
}

/** Browser icon color */
const BROWSER_COLORS: Record<string, string> = {
    Chrome: '#4285F4',
    Firefox: '#FF6611',
    Safari: '#1AC8ED',
    Edge: '#0078D4',
    Opera: '#FF1B2D',
    Samsung: '#1428A0',
    'Mobile Safari': '#1AC8ED',
    'Internet Explorer': '#0076D6',
};

function browserColor(name: string): string {
    return BROWSER_COLORS[name] || '#94a3b8';
}

// ── SVG Line Chart ─────────────────────────────────────────────────────────────

function LineChart({ data }: { data: PlausibleTimeseriesPoint[] }) {
    const W = 600, H = 120;
    const PAD = { top: 10, right: 10, bottom: 28, left: 36 };
    const values = data.map(d => d.visitors);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    const toX = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * (W - PAD.left - PAD.right);
    const toY = (v: number) => PAD.top + (1 - (v - minVal) / range) * (H - PAD.top - PAD.bottom);

    const points = data.map((d, i) => `${toX(i)},${toY(d.visitors)}`).join(' ');
    const areaPoints = [`${toX(0)},${H - PAD.bottom}`, ...data.map((d, i) => `${toX(i)},${toY(d.visitors)}`), `${toX(data.length - 1)},${H - PAD.bottom}`].join(' ');
    const yLabels = [maxVal, Math.round((maxVal + minVal) / 2), minVal];
    const step = Math.max(1, Math.floor(data.length / 6));
    const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
            <defs>
                <linearGradient id="plausible-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {yLabels.map((v, i) => {
                const y = toY(v);
                return (
                    <g key={i}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 2" />
                        <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
                            {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                        </text>
                    </g>
                );
            })}
            <polygon points={areaPoints} fill="url(#plausible-grad)" />
            <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
            {data.map((d, i) => <circle key={i} cx={toX(i)} cy={toY(d.visitors)} r="2.5" fill="#fff" stroke="#6366f1" strokeWidth="1.5" />)}
            {xLabels.map((d, i) => (
                <text key={i} x={toX(data.indexOf(d))} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
                    {d.date.slice(5)}
                </text>
            ))}
        </svg>
    );
}

// ── Browser Donut Chart ────────────────────────────────────────────────────────

function BrowserDonut({ browsers }: { browsers: PlausibleBreakdownItem[] }) {
    const total = browsers.reduce((s, b) => s + b.visitors, 0) || 1;
    const R = 50, CX = 60, CY = 60, strokeW = 18;
    const circumference = 2 * Math.PI * R;

    let offset = 0;
    const segments = browsers.slice(0, 6).map((b) => {
        const pct = b.visitors / total;
        const seg = { pct, offset, color: browserColor(b.browser ?? '') };
        offset += pct;
        return seg;
    });

    return (
        <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
            {segments.map((seg, i) => (
                <circle
                    key={i}
                    cx={CX} cy={CY} r={R}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeW}
                    strokeDasharray={`${seg.pct * circumference} ${circumference}`}
                    strokeDashoffset={-seg.offset * circumference}
                    transform={`rotate(-90 ${CX} ${CY})`}
                    strokeLinecap="butt"
                />
            ))}
            <text x={CX} y={CY + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">
                {browsers.length}
            </text>
            <text x={CX} y={CY + 15} textAnchor="middle" fontSize="7" fill="#94a3b8">browsers</text>
        </svg>
    );
}

// ── Shared Progress Row ────────────────────────────────────────────────────────

function ProgressRow({ label, value, max, prefix = '' }: { label: string; value: number; max: number; prefix?: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    const display = label.startsWith('http') ? label.replace(/^https?:\/\//, '') : label;
    return (
        <div className="flex items-center gap-2 text-sm py-1.5">
            {prefix && <span className="text-base shrink-0">{prefix}</span>}
            <span className="flex-1 truncate text-slate-700 font-medium min-w-0" title={label}>
                {display || '(direct)'}
            </span>
            <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden shrink-0">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 text-right text-slate-500 text-xs shrink-0">{value.toLocaleString()}</span>
        </div>
    );
}

// ── World Map (simplified dot-matrix style) ────────────────────────────────────

/**
 * Approximate lat/lon → SVG x/y using equirectangular projection.
 * We render top countries as glowing dots on a simplified world silhouette bg.
 */
const COUNTRY_COORDS: Record<string, [number, number]> = {
    US: [-100, 38], CA: [-96, 57], BR: [-52, -10], AR: [-64, -34], MX: [-102, 24],
    GB: [-3, 54], FR: [2, 47], DE: [10, 51], IT: [12, 42], ES: [-4, 40],
    NL: [5, 52], RU: [100, 60], TR: [35, 39], SA: [45, 24], AE: [54, 24],
    EG: [30, 27], NG: [8, 10], ZA: [25, -29],
    IN: [79, 21], PK: [70, 30], BD: [90, 24], JP: [138, 36], KR: [128, 37],
    CN: [105, 35], TH: [101, 15], VN: [108, 14], PH: [122, 13], MY: [110, 4],
    SG: [104, 1], ID: [118, -5], AU: [133, -25],
};

function WorldMap({ countries }: { countries: PlausibleBreakdownItem[] }) {
    const W = 600, H = 280;
    const maxVisitors = countries[0]?.visitors || 1;

    // Equirectangular projection
    const toSvg = (lon: number, lat: number): [number, number] => [
        ((lon + 180) / 360) * W,
        ((90 - lat) / 180) * H,
    ];

    const dots = countries
        .filter(c => c.country && COUNTRY_COORDS[c.country.toUpperCase()])
        .map(c => {
            const code = c.country!.toUpperCase();
            const [lon, lat] = COUNTRY_COORDS[code];
            const [x, y] = toSvg(lon, lat);
            const r = 4 + (c.visitors / maxVisitors) * 14;
            return { code, x, y, r, visitors: c.visitors };
        });

    return (
        <div className="relative w-full overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
                {/* Ocean background */}
                <rect width={W} height={H} fill="#f8fafc" />

                {/* Simplified continent outlines — very rough polygons */}
                {/* North America */}
                <path d="M80,40 L170,40 L190,80 L180,130 L150,160 L110,150 L70,120 L60,80 Z" fill="#e2e8f0" />
                {/* South America */}
                <path d="M120,170 L160,165 L175,200 L170,240 L145,255 L115,250 L100,220 L105,185 Z" fill="#e2e8f0" />
                {/* Europe */}
                <path d="M240,30 L290,28 L305,50 L300,80 L275,90 L250,85 L235,65 Z" fill="#e2e8f0" />
                {/* Africa */}
                <path d="M250,95 L300,90 L320,110 L325,160 L310,210 L280,225 L255,210 L240,170 L235,130 Z" fill="#e2e8f0" />
                {/* Asia */}
                <path d="M305,25 L500,20 L520,70 L510,120 L480,140 L430,150 L390,130 L340,110 L310,85 L300,55 Z" fill="#e2e8f0" />
                {/* Middle East */}
                <path d="M300,80 L350,75 L370,100 L355,130 L310,130 L295,110 Z" fill="#e2e8f0" />
                {/* Southeast Asia */}
                <path d="M420,130 L480,125 L500,150 L490,170 L450,175 L420,165 L410,145 Z" fill="#e2e8f0" />
                {/* Australia */}
                <path d="M430,175 L510,170 L530,200 L525,235 L490,250 L445,245 L420,215 L415,185 Z" fill="#e2e8f0" />

                {/* Country dots */}
                {dots.map((d) => (
                    <g key={d.code}>
                        <circle cx={d.x} cy={d.y} r={d.r + 4} fill="#6366f1" opacity="0.15" />
                        <circle cx={d.x} cy={d.y} r={d.r} fill="#6366f1" opacity="0.75" />
                        <circle cx={d.x} cy={d.y} r={Math.min(d.r * 0.4, 4)} fill="#fff" opacity="0.9" />
                    </g>
                ))}
            </svg>
            {/* Legend overlay */}
            <div className="absolute bottom-2 right-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 opacity-75" /> More visitors
            </div>
        </div>
    );
}

// ── Tab Button ─────────────────────────────────────────────────────────────────

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
                }`}
        >
            {children}
        </button>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PlausibleAnalytics({ data }: { data: PlausibleData | null }) {
    const [activeTab, setActiveTab] = useState<'pages' | 'referrers' | 'countries' | 'browsers'>('countries');

    if (!data || !data.aggregate) {
        return (
            <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4 text-slate-500">
                <Settings className="w-5 h-5 shrink-0 text-slate-400" />
                <div>
                    <p className="font-medium text-slate-700">Plausible Analytics not configured</p>
                    <p className="text-sm">
                        Add your <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">plausible_domain</span> and{' '}
                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">plausible_api_key</span> in{' '}
                        <a href="/admin/settings" className="text-indigo-600 hover:underline font-medium">Settings</a>.
                    </p>
                </div>
            </div>
        );
    }

    const { aggregate, timeseries, topPages, topReferrers, countries, browsers, domain } = data;

    const metricCards = [
        { label: 'Visitors', value: aggregate.visitors.value.toLocaleString(), icon: <TrendingUp className="w-4 h-4 text-indigo-500" />, bg: 'bg-indigo-50' },
        { label: 'Pageviews', value: aggregate.pageviews.value.toLocaleString(), icon: <Eye className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50' },
        { label: 'Bounce Rate', value: `${aggregate.bounce_rate.value}%`, icon: <MousePointerClick className="w-4 h-4 text-rose-500" />, bg: 'bg-rose-50' },
        {
            label: 'Avg Duration',
            value: aggregate.visit_duration.value >= 60
                ? `${Math.floor(aggregate.visit_duration.value / 60)}m ${aggregate.visit_duration.value % 60}s`
                : `${aggregate.visit_duration.value}s`,
            icon: <Clock className="w-4 h-4 text-amber-500" />,
            bg: 'bg-amber-50'
        },
    ];

    const maxCountry = countries[0]?.visitors ?? 1;
    const maxPage = topPages[0]?.visitors ?? 1;
    const maxRef = topReferrers[0]?.visitors ?? 1;
    const maxBrowser = browsers[0]?.visitors ?? 1;
    const totalBrowserVisitors = browsers.reduce((s, b) => s + b.visitors, 0) || 1;

    return (
        <div className="mt-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <h2 className="font-bold text-slate-800">Website Analytics</h2>
                    <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">{domain}</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Last 30 days</span>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metricCards.map((m, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${m.bg} shrink-0`}>{m.icon}</div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium">{m.label}</p>
                            <p className="text-xl font-bold text-slate-900 leading-tight">{m.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Visitors Chart + Breakdown tabs */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        <h3 className="font-semibold text-slate-800 text-sm">Visitors Trend</h3>
                    </div>
                    <div className="p-4">
                        {timeseries.length > 0
                            ? <LineChart data={timeseries} />
                            : <p className="text-sm text-slate-400 text-center py-10">No timeseries data</p>}
                    </div>
                </div>

                {/* Right: Tabbed breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    {/* Tab bar */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1 flex-wrap">
                        <Tab active={activeTab === 'countries'} onClick={() => setActiveTab('countries')}>
                            <MapPin className="w-3 h-3 inline mr-1" />Countries
                        </Tab>
                        <Tab active={activeTab === 'browsers'} onClick={() => setActiveTab('browsers')}>
                            <Monitor className="w-3 h-3 inline mr-1" />Browsers
                        </Tab>
                        <Tab active={activeTab === 'referrers'} onClick={() => setActiveTab('referrers')}>
                            <Globe className="w-3 h-3 inline mr-1" />Referrers
                        </Tab>
                        <Tab active={activeTab === 'pages'} onClick={() => setActiveTab('pages')}>
                            <FileText className="w-3 h-3 inline mr-1" />Pages
                        </Tab>
                    </div>

                    <div className="px-4 py-3 flex-1 overflow-y-auto" style={{ maxHeight: 220 }}>
                        {/* Countries tab */}
                        {activeTab === 'countries' && (
                            countries.length > 0
                                ? countries.map((c, i) => (
                                    <ProgressRow
                                        key={i}
                                        label={countryName(c.country ?? '')}
                                        value={c.visitors}
                                        max={maxCountry}
                                        prefix={countryFlag(c.country ?? '')}
                                    />
                                ))
                                : <p className="text-sm text-slate-400 py-6 text-center">No country data</p>
                        )}

                        {/* Browsers tab */}
                        {activeTab === 'browsers' && (
                            browsers.length > 0
                                ? browsers.map((b, i) => {
                                    const pct = Math.round((b.visitors / totalBrowserVisitors) * 100);
                                    return (
                                        <div key={i} className="flex items-center gap-2 text-sm py-1.5">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ background: browserColor(b.browser ?? '') }}
                                            />
                                            <span className="flex-1 truncate text-slate-700 font-medium">{b.browser || 'Unknown'}</span>
                                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden shrink-0">
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: browserColor(b.browser ?? '') }} />
                                            </div>
                                            <span className="w-8 text-right text-slate-500 text-xs shrink-0">{pct}%</span>
                                        </div>
                                    );
                                })
                                : <p className="text-sm text-slate-400 py-6 text-center">No browser data</p>
                        )}

                        {/* Referrers tab */}
                        {activeTab === 'referrers' && (
                            topReferrers.length > 0
                                ? topReferrers.map((r, i) => (
                                    <ProgressRow key={i} label={r.referrer ?? ''} value={r.visitors} max={maxRef} />
                                ))
                                : <p className="text-sm text-slate-400 py-6 text-center">No referrer data</p>
                        )}

                        {/* Pages tab */}
                        {activeTab === 'pages' && (
                            topPages.length > 0
                                ? topPages.map((p, i) => (
                                    <ProgressRow key={i} label={p.page ?? ''} value={p.visitors} max={maxPage} />
                                ))
                                : <p className="text-sm text-slate-400 py-6 text-center">No page data</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── World Map + Browsers Row ─────────────────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6 mt-6">
                {/* World Map */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <h3 className="font-semibold text-slate-800 text-sm">Geographic Distribution</h3>
                        <span className="ml-auto text-xs text-slate-400">{countries.length} countries</span>
                    </div>
                    <div className="p-4">
                        <WorldMap countries={countries} />
                        {/* Top 5 countries below map */}
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {countries.slice(0, 5).map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg px-2 py-1.5">
                                    <span className="text-base">{countryFlag(c.country ?? '')}</span>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{countryName(c.country ?? '')}</p>
                                        <p className="text-slate-400">{c.visitors.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Browser Breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-blue-500" />
                        <h3 className="font-semibold text-slate-800 text-sm">Browsers</h3>
                    </div>
                    <div className="p-4">
                        {browsers.length > 0 ? (
                            <div className="flex items-center gap-4">
                                <BrowserDonut browsers={browsers} />
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    {browsers.slice(0, 6).map((b, i) => {
                                        const pct = Math.round((b.visitors / totalBrowserVisitors) * 100);
                                        return (
                                            <div key={i} className="flex items-center gap-2 text-xs py-1">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: browserColor(b.browser ?? '') }} />
                                                <span className="flex-1 truncate text-slate-700">{b.browser || 'Unknown'}</span>
                                                <span className="text-slate-500 font-medium">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No browser data</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
