'use client';

import React, { useState, useEffect } from 'react';
import {
    Code,
    Copy,
    CheckCircle2,
    Package,
    ShoppingCart,
    User,
    Clock,
    RefreshCw,
    ChevronLeft,
    AlertCircle,
    Globe,
    ChevronDown,
    Terminal,
    Key,
    Zap,
    Info,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ApiDocumentationPage = () => {
    const router = useRouter();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('services');
    const [activeLanguage, setActiveLanguage] = useState('curl');
    const [userData, setUserData] = useState<{ api_key: string; isReseller: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiEndpoint, setApiEndpoint] = useState('/api/v2');
    const [samples, setSamples] = useState<{ service: any; order: any; balance: any } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const apiKey = userData?.api_key || 'sk_xxxxxxxxxxxxxxxxxxxxxxxx';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setApiEndpoint(`${window.location.origin}/api/v2`);
        }
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setUserData({
                        api_key: data.user.apikey,
                        isReseller: data.user.reseller?.status === 'ACTIVE'
                    });
                }

                const sampleRes = await fetch('/api/user/api-docs/samples');
                if (sampleRes.ok) {
                    const sampleData = await sampleRes.json();
                    setSamples(sampleData);
                }
            } catch (error) { } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const languages = [
        { id: 'curl', name: 'cURL' },
        { id: 'php', name: 'PHP' },
        { id: 'node', name: 'Node.js' },
        { id: 'python', name: 'Python' },
    ];

    const endpoints = [
        {
            id: 'services',
            name: 'Get Services',
            method: 'POST',
            icon: <Package size={18} />,
            description: 'Fetch our real-time service matrix and acquisition rates.',
            params: [
                { name: 'key', type: 'string', required: true, description: 'Your secure API authentication key' },
                { name: 'action', type: 'string', required: true, description: 'services' },
            ],
            response: samples?.service ? JSON.stringify({ status: "success", data: [samples.service] }, null, 2) : `{ "status": "success", "data": [...] }`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\\n  -d "key=${apiKey}" \\\n  -d "action=services"`,
                php: `<?php\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, '${apiEndpoint}');\ncurl_setopt($ch, CURLOPT_POST, true);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['key' => '${apiKey}', 'action' => 'services']));\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$res = curl_exec($ch);\nprint_r(json_decode($res, true));\n?>`,
                node: `const axios = require('axios');\nconst params = new URLSearchParams();\nparams.append('key', '${apiKey}');\nparams.append('action', 'services');\n\naxios.post('${apiEndpoint}', params).then(res => console.log(res.data));`,
                python: `import requests\ndata = {'key': '${apiKey}', 'action': 'services'}\nres = requests.post('${apiEndpoint}', data=data)\nprint(res.json())`,
            },
        },
        {
            id: 'order',
            name: 'Add Order',
            method: 'POST',
            icon: <ShoppingCart size={18} />,
            description: 'Initiate a new order acquisition protocol.',
            params: [
                { name: 'key', type: 'string', required: true, description: 'API Authentication Key' },
                { name: 'action', type: 'string', required: true, description: 'add' },
                { name: 'service', type: 'int', required: true, description: 'Target Service ID' },
                { name: 'link', type: 'string', required: true, description: 'Endpoint URL' },
                { name: 'quantity', type: 'int', required: true, description: 'Required quantity' },
            ],
            response: `{ "status": "success", "order": 123456 }`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\\n  -d "key=${apiKey}" \\\n  -d "action=add" \\\n  -d "service=1" \\\n  -d "link=https://example.com" \\\n  -d "quantity=1000"`,
                php: `// Similar to above with extra params`,
                node: `// Similar to above with extra params`,
                python: `// Similar to above with extra params`,
            },
        },
        {
            id: 'status',
            name: 'Order Status',
            method: 'POST',
            icon: <Clock size={18} />,
            description: 'Monitor the temporal status of your active orders.',
            params: [
                { name: 'key', type: 'string', required: true, description: 'API Key' },
                { name: 'action', type: 'string', required: true, description: 'status' },
                { name: 'order', type: 'int', required: true, description: 'Order ID' },
            ],
            response: `{ "status": "success", "charge": "0.50", "status": "Completed" }`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\\n  -d "key=${apiKey}" \\\n  -d "action=status" \\\n  -d "order=123456"`,
                php: ``, node: ``, python: ``
            },
        },
        {
            id: 'balance',
            name: 'Account',
            method: 'POST',
            icon: <User size={18} />,
            description: 'Retrieve your liquid assets and account telemetry.',
            params: [
                { name: 'key', type: 'string', required: true, description: 'API Key' },
                { name: 'action', type: 'string', required: true, description: 'balance' },
            ],
            response: `{ "status": "success", "balance": "1240.50" }`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\\n  -d "key=${apiKey}" \\\n  -d "action=balance"`,
                php: ``, node: ``, python: ``
            },
        },
        {
            id: 'webhook',
            name: 'Webhooks',
            method: 'WEBHOOK',
            icon: <Globe size={18} />,
            description: 'Configure external endpoints for real-time order updates.',
            params: [
                { name: 'order', type: 'int', required: true, description: 'Order ID' },
                { name: 'status', type: 'string', required: true, description: 'New Status code' },
            ],
            response: `HTTP 200 OK`,
            examples: {
                curl: `{\n  "order": 123456,\n  "status": "COMPLETED",\n  "charge": "0.50"\n}`,
                php: ``, node: ``, python: ``
            },
        },
    ];

    const activeEndpoint = endpoints.find(e => e.id === activeSection) || endpoints[0];

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-emerald-50 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Syncing API Matrix...</p>
        </div>
    );

    return (
        <div className="min-h-screen font-sans pb-32 select-none relative overflow-x-hidden">
            {/* Background Layers */}
            <div className="fixed inset-0 bg-slate-50 -z-30"></div>
            <div className="fixed top-0 left-0 w-full h-44 bg-emerald-600 rounded-b-[2.5rem] -z-10 shadow-2xl shadow-emerald-100/50"></div>
            
            {/* Navigation Header */}
            <div className="p-5 flex items-center justify-between text-white sticky top-0 z-50">
                <button 
                  onClick={() => router.push('/user/account')}
                  className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 active:scale-90 transition-all flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft size={22} strokeWidth={3} />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-xs font-black tracking-[0.2em] uppercase drop-shadow-sm">REST API</h1>
                    <p className="text-[8px] font-bold text-emerald-100 uppercase tracking-widest opacity-80">Documentation</p>
                </div>
                <div className="w-12"></div>
            </div>

            <div className="px-6 space-y-6 mt-4">
                
                {/* API Key Section */}
                <section className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-emerald-900/5 border border-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-40"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-4">
                            <Key size={16} className="text-emerald-500" />
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authentication Key</label>
                        </div>
                        <div className="flex space-x-2">
                            <div className="flex-1 bg-slate-50 border border-emerald-50 rounded-2xl p-4 flex items-center justify-between overflow-hidden group">
                                <code className="text-xs font-black text-slate-600 truncate mr-2 tracking-tighter">
                                    {apiKey}
                                </code>
                                <button 
                                  onClick={() => copyText(apiKey, 'key')}
                                  className="p-2 bg-white rounded-xl shadow-sm border border-emerald-50 text-emerald-600 hover:scale-110 active:scale-90 transition-all"
                                >
                                    {copiedCode === 'key' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Keep this terminal key secure. Do not expose in client-side code.</p>
                    </div>
                </section>

                {/* API Endpoint & Selector */}
                <section className="relative">
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-emerald-900/5 border border-white">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 ml-1">Select Endpoint</label>
                        
                        <button 
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                          className={`w-full flex items-center justify-between p-4 bg-slate-50 border-2 rounded-2xl transition-all ${
                            isMenuOpen ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/5' : 'border-emerald-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                                {activeEndpoint.icon}
                            </div>
                            <div className="text-left">
                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">
                                  {activeEndpoint.name}
                                </span>
                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                                  {activeEndpoint.method}
                                </span>
                            </div>
                          </div>
                          <ChevronDown className={`text-slate-300 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} size={20} />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute left-6 right-6 mt-3 bg-white rounded-[2.5rem] shadow-2xl border border-emerald-50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            {endpoints.map((e) => (
                              <button
                                key={e.id}
                                onClick={() => {
                                  setActiveSection(e.id);
                                  setIsMenuOpen(false);
                                }}
                                className="w-full px-6 py-4 text-left hover:bg-emerald-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                              >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-xl transition-all ${activeSection === e.id ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
                                        {e.icon}
                                    </div>
                                    <div>
                                      <p className={`text-xs font-black uppercase tracking-tight ${activeSection === e.id ? 'text-emerald-600' : 'text-slate-700'}`}>
                                        {e.name}
                                      </p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{e.description}</p>
                                    </div>
                                </div>
                                {activeSection === e.id && <CheckCircle2 size={16} className="text-emerald-500" />}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 p-4 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-100 flex items-center space-x-3">
                            <Terminal size={16} className="text-emerald-500 shrink-0" />
                            <code className="text-[10px] font-black text-emerald-700 tracking-tighter truncate">{apiEndpoint}</code>
                        </div>
                    </div>
                </section>

                {/* Parameters Table */}
                <section>
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-emerald-900/5 border border-white">
                        <div className="flex items-center space-x-2 mb-6">
                            <Info size={16} className="text-emerald-500" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Request Parameters</h3>
                        </div>
                        <div className="space-y-4">
                            {activeEndpoint.params.map((p, i) => (
                                <div key={i} className="flex items-start justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <code className="text-xs font-black text-emerald-600">{p.name}</code>
                                            <span className="text-[9px] font-black text-slate-300 uppercase italic">{p.type}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold leading-tight">{p.description}</p>
                                    </div>
                                    {p.required && (
                                        <span className="bg-rose-50 text-rose-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-rose-100">Req</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Example Request Section */}
                <section>
                    <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200 border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <Zap size={16} className="text-amber-400" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Sample</h3>
                            </div>
                            <div className="flex bg-slate-800 p-1 rounded-xl">
                                {languages.map(lang => (
                                    <button 
                                      key={lang.id}
                                      onClick={() => setActiveLanguage(lang.id)}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                                        activeLanguage === lang.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                      }`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-black/40 rounded-2xl p-5 border border-white/5 overflow-x-auto custom-scrollbar">
                                <pre className="text-[10px] font-bold text-emerald-400/90 leading-relaxed font-mono whitespace-pre">
                                    {activeEndpoint.examples[activeLanguage as keyof typeof activeEndpoint.examples] || '// No sample available'}
                                </pre>
                            </div>
                            <button 
                              onClick={() => copyText(activeEndpoint.examples[activeLanguage as keyof typeof activeEndpoint.examples], 'sample')}
                              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl active:scale-90 transition-all border border-white/10"
                            >
                                {copiedCode === 'sample' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Example Response */}
                <section>
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-emerald-900/5 border border-white">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Expected Response</h3>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">HTTPS 200 OK</span>
                        </div>
                        <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-50/50">
                            <pre className="text-[10px] font-black text-slate-600 font-mono whitespace-pre-wrap">
                                {activeEndpoint.response}
                            </pre>
                        </div>
                    </div>
                </section>

                {/* Quick Support Link */}
                <section className="bg-emerald-600 rounded-[2.5rem] p-6 shadow-xl shadow-emerald-100 flex items-center justify-between group active:scale-95 transition-all cursor-pointer" onClick={() => router.push('/user/tickets')}>
                    <div className="space-y-1">
                        <h4 className="text-white font-black text-sm tracking-tight italic">NEED INTEGRATION HELP?</h4>
                        <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Our engineering team is at baseline.</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <ArrowRight size={20} />
                    </div>
                </section>

            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 20px; }
            `}</style>

        </div>
    );
};

export default ApiDocumentationPage;
