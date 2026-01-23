'use client';

import React, { useState, useEffect } from 'react';
import {
    Code,
    Copy,
    CheckCircle,
    Key,
    Package,
    ShoppingCart,
    User,
    Clock,
    RefreshCw,
    ChevronRight,
    AlertCircle,
    Loader2,
    Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ApiDocumentationPage = () => {
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('services');
    const [activeLanguage, setActiveLanguage] = useState('curl');
    const [userData, setUserData] = useState<{ api_key: string; isReseller: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiEndpoint, setApiEndpoint] = useState('https://justanotherpanel.com/api/v2');
    const [samples, setSamples] = useState<{ service: any; order: any; balance: any } | null>(null);

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
            } catch (error) {
                // Silently fail or handle error appropriately in UI
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const copyApiKey = () => {
        if (!userData?.api_key) {
            toast.error('API key not found. Please generate one in Account settings.');
            return;
        }
        navigator.clipboard.writeText(apiKey);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
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
            icon: <Package className="w-4 h-4" />,
            description: 'Get a list of all available services',
            params: [
                { name: 'key', type: 'string', required: true, description: 'Your API key' },
                { name: 'action', type: 'string', required: true, description: 'services' },
            ],
            response: samples?.service ? JSON.stringify({
                status: "success",
                data: [samples.service]
            }, null, 2) : `{
  "status": "success",
  "data": [
    {
      "service": 1,
      "name": "Instagram Followers",
      "type": "Default",
      "category": "Instagram",
      "rate": "0.50",
      "min": 100,
      "max": 500000,
      "note": "Super fast delivery",
      "refill": true,
      "cancel": false
    }
  ]
}`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=services"`,
                php: `<?php
$api_url = '${apiEndpoint}';

$post_data = [
    'key' => 'YOUR_API_KEY',
    'action' => 'services'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`,
                node: `const axios = require('axios');

const apiUrl = 'https://justanotherpanel.com/api/v2';

const params = new URLSearchParams();
params.append('key', 'YOUR_API_KEY');
params.append('action', 'services');

axios.post(apiUrl, params)
  .then(response => {
    // Handle response
  })
  .catch(error => {
    console.error('Error:', error);
  });`,
                python: `import requests

api_url = 'https://justanotherpanel.com/api/v2'

data = {
    'key': 'YOUR_API_KEY',
    'action': 'services'
}

response = requests.post(api_url, data=data)
result = response.json()
print(result)`,
            },
        },
        {
            id: 'order',
            name: 'Add Order',
            method: 'POST',
            icon: <ShoppingCart className="w-4 h-4" />,
            description: 'Create a new order',
            params: [
                { name: 'key', type: 'string', required: true, description: 'Your API key' },
                { name: 'action', type: 'string', required: true, description: 'add' },
                { name: 'service', type: 'integer', required: true, description: 'Service ID' },
                { name: 'link', type: 'string', required: true, description: 'Link to page' },
                { name: 'quantity', type: 'integer', required: true, description: 'Quantity needed' },
            ],
            response: samples?.order ? JSON.stringify({
                status: "success",
                order: samples.order.order
            }, null, 2) : `{
  "status": "success",
  "order": 123456
}`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=add" \\
  -d "service=${samples?.service?.service || 1}" \\
  -d "link=https://instagram.com/username" \\
  -d "quantity=1000"`,
                php: `<?php
$api_url = '${apiEndpoint}';

$post_data = [
    'key' => 'YOUR_API_KEY',
    'action' => 'add',
    'service' => ${samples?.service?.service || 1},
    'link' => 'https://instagram.com/username',
    'quantity' => 1000
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`,
                node: `const axios = require('axios');

const apiUrl = 'https://justanotherpanel.com/api/v2';

const params = new URLSearchParams();
params.append('key', 'YOUR_API_KEY');
params.append('action', 'add');
params.append('service', '1');
params.append('link', 'https://instagram.com/username');
params.append('quantity', '1000');

axios.post(apiUrl, params)
  .then(response => {
    // Handle response
  })
  .catch(error => {
    console.error('Error:', error);
  });`,
                python: `import requests

api_url = 'https://justanotherpanel.com/api/v2'

data = {
    'key': 'YOUR_API_KEY',
    'action': 'add',
    'service': 1,
    'link': 'https://instagram.com/username',
    'quantity': 1000
}

response = requests.post(api_url, data=data)
result = response.json()
print(result)`,
            },
        },
        {
            id: 'status',
            name: 'Order Status',
            method: 'POST',
            icon: <Clock className="w-4 h-4" />,
            description: 'Check the status of an order',
            params: [
                { name: 'key', type: 'string', required: true, description: 'Your API key' },
                { name: 'action', type: 'string', required: true, description: 'status' },
                { name: 'order', type: 'integer', required: true, description: 'Order ID' },
            ],
            response: samples?.order ? JSON.stringify({
                status: "success",
                ...samples.order
            }, null, 2) : `{
  "status": "success",
  "charge": "0.50",
  "start_count": "1000",
  "status": "Completed",
  "remains": "0",
  "currency": "USD"
}`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=status" \\
  -d "order=${samples?.order?.order || 123456}"`,
                php: `<?php
$api_url = '${apiEndpoint}';

$post_data = [
    'key' => 'YOUR_API_KEY',
    'action' => 'status',
    'order' => ${samples?.order?.order || 123456}
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`,
                node: `const axios = require('axios');

const apiUrl = 'https://justanotherpanel.com/api/v2';

const params = new URLSearchParams();
params.append('key', 'YOUR_API_KEY');
params.append('action', 'status');
params.append('order', '123456');

axios.post(apiUrl, params)
  .then(response => {
    // Handle response
  })
  .catch(error => {
    console.error('Error:', error);
  });`,
                python: `import requests

api_url = 'https://justanotherpanel.com/api/v2'

data = {
    'key': 'YOUR_API_KEY',
    'action': 'status',
    'order': 123456
}

response = requests.post(api_url, data=data)
result = response.json()
print(result)`,
            },
        },
        {
            id: 'profile',
            name: 'User Profile',
            method: 'POST',
            icon: <User className="w-4 h-4" />,
            description: 'Get your account balance and information',
            params: [
                { name: 'key', type: 'string', required: true, description: 'Your API key' },
                { name: 'action', type: 'string', required: true, description: 'balance' },
            ],
            response: samples?.balance ? JSON.stringify({
                status: "success",
                ...samples.balance
            }, null, 2) : `{
  "status": "success",
  "balance": "1240.50",
  "currency": "USD"
}`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=balance"`,
                php: `<?php
$api_url = '${apiEndpoint}';

$post_data = [
    'key' => 'YOUR_API_KEY',
    'action' => 'balance'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`,
                node: `const axios = require('axios');

const apiUrl = 'https://justanotherpanel.com/api/v2';

const params = new URLSearchParams();
params.append('key', 'YOUR_API_KEY');
params.append('action', 'balance');

axios.post(apiUrl, params)
  .then(response => {
    // Handle response
  })
  .catch(error => {
    console.error('Error:', error);
  });`,
                python: `import requests

api_url = 'https://justanotherpanel.com/api/v2'

data = {
    'key': 'YOUR_API_KEY',
    'action': 'balance'
}

response = requests.post(api_url, data=data)
result = response.json()
print(result)`,
            },
        },
        {
            id: 'refill',
            name: 'Refill Order',
            method: 'POST',
            icon: <RefreshCw className="w-4 h-4" />,
            description: 'Request a refill for an order (if available)',
            params: [
                { name: 'key', type: 'string', required: true, description: 'Your API key' },
                { name: 'action', type: 'string', required: true, description: 'refill' },
                { name: 'order', type: 'integer', required: true, description: 'Order ID' },
            ],
            response: `{
  "status": "success",
  "refill": 1
}`,
            examples: {
                curl: `curl -X POST ${apiEndpoint} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=refill" \\
  -d "order=123456"`,
                php: `<?php
$api_url = '${apiEndpoint}';

$post_data = [
    'key' => 'YOUR_API_KEY',
    'action' => 'refill',
    'order' => 123456
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`,
                node: `const axios = require('axios');

const apiUrl = 'https://justanotherpanel.com/api/v2';

const params = new URLSearchParams();
params.append('key', 'YOUR_API_KEY');
params.append('action', 'refill');
params.append('order', '123456');

axios.post(apiUrl, params)
  .then(response => {
    // Handle response
  })
  .catch(error => {
    console.error('Error:', error);
  });`,
                python: `import requests

api_url = 'https://justanotherpanel.com/api/v2'

data = {
    'key': 'YOUR_API_KEY',
    'action': 'refill',
    'order': 123456
}

response = requests.post(api_url, data=data)
result = response.json()
print(result)`,
            },
        },
        {
            id: 'webhook',
            name: 'Webhooks',
            method: 'POST (Incoming)',
            icon: <Globe className="w-4 h-4" />,
            description: 'Receive real-time updates for your orders',
            params: [
                { name: 'order', type: 'integer', required: true, description: 'Order ID' },
                { name: 'status', type: 'string', required: true, description: 'New Status (COMPLETED, PARTIAL, CANCELED)' },
                { name: 'charge', type: 'decimal', required: false, description: 'Final charge amount' },
                { name: 'remains', type: 'integer', required: false, description: 'Remaining quantity' },
            ],
            response: `{
  "status": "success"
}
// Note: Your server must respond with 200 OK`,
            examples: {
                curl: `// Incoming JSON Payload
{
  "order": 123456,
  "status": "COMPLETED",
  "charge": "0.50",
  "start_count": 1000,
  "remains": 0,
  "currency": "USD"
}`,
                php: `// Handle Incoming Webhook using PHP
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    $order_id = $data['order'];
    $status = $data['status'];
    
    // Update your database
    // ...
    
    echo json_encode(['status' => 'success']);
}`,
                node: `// Handle Incoming Webhook using Express
app.post('/webhook', (req, res) => {
    const { order, status, charge } = req.body;
    
    // Update your database
    
    res.json({ status: 'success' });
});`,
                python: `// Handle Incoming Webhook using Flask
@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    order_id = data.get('order')
    status = data.get('status')
    
    print(f"Order {order_id} updated to {status}")
    
    return jsonify({"status": "success"})`
            },
        },
    ];

    const activeEndpoint = endpoints.find(e => e.id === activeSection);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">API Documentation</h1>
                <p className="text-slate-500">Integrate our services into your own platform</p>
            </div>

            {/* API Key Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="w-5 h-5 text-amber-400" />
                            <h2 className="text-lg font-semibold text-white">Your API Key</h2>
                        </div>
                        <p className="text-slate-300 text-sm">Keep this key secret. Do not share it publicly.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <code className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-amber-400 font-mono text-sm">
                            {apiKey}
                        </code>
                        <button
                            onClick={copyApiKey}
                            className={`p-2.5 rounded-lg transition-colors ${copiedKey
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {copiedKey ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* API Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">API Endpoint</p>
                        <code className="text-blue-600 bg-blue-100 px-2 py-1 rounded">{apiEndpoint}</code>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-blue-700">Method: <span className="font-bold">POST</span></p>
                            <span className="text-blue-300">|</span>
                            <p className="text-blue-700">Pricing Tier: <span className="font-bold underline decoration-indigo-500 decoration-2">{userData?.isReseller ? 'RESELLER' : 'STANDARD'}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-900 text-sm">Endpoints</h3>
                        </div>
                        <nav className="p-2">
                            {endpoints.map((endpoint) => (
                                <button
                                    key={endpoint.id}
                                    onClick={() => setActiveSection(endpoint.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${activeSection === endpoint.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {endpoint.icon}
                                    <span className="flex-1">{endpoint.name}</span>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === endpoint.id ? 'rotate-90' : ''}`} />
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    {activeEndpoint && (
                        <>
                            {/* Endpoint Header */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            {activeEndpoint.icon}
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-slate-900">{activeEndpoint.name}</h2>
                                            <p className="text-sm text-slate-500">{activeEndpoint.description}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                        {activeEndpoint.method}
                                    </span>
                                </div>

                                {/* Parameters */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-slate-900 mb-4">Parameters</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-500 border-b border-slate-100">
                                                    <th className="pb-3 font-medium">Parameter</th>
                                                    <th className="pb-3 font-medium">Type</th>
                                                    <th className="pb-3 font-medium">Required</th>
                                                    <th className="pb-3 font-medium">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeEndpoint.params.map((param, idx) => (
                                                    <tr key={idx} className="border-b border-slate-50">
                                                        <td className="py-3">
                                                            <code className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-mono text-xs">
                                                                {param.name}
                                                            </code>
                                                        </td>
                                                        <td className="py-3 text-slate-600">{param.type}</td>
                                                        <td className="py-3">
                                                            {param.required ? (
                                                                <span className="text-red-600 font-medium">Yes</span>
                                                            ) : (
                                                                <span className="text-slate-400">No</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-slate-600">{param.description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Example Request with Language Tabs */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900">Example Request</h3>
                                    <div className="flex items-center gap-2">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => setActiveLanguage(lang.id)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeLanguage === lang.id
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                                    }`}
                                            >
                                                {lang.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => copyCode(activeEndpoint.examples[activeLanguage as keyof typeof activeEndpoint.examples], `${activeEndpoint.id}-${activeLanguage}`)}
                                        className={`absolute top-3 right-3 p-2 rounded-lg transition-colors z-10 ${copiedCode === `${activeEndpoint.id}-${activeLanguage}`
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {copiedCode === `${activeEndpoint.id}-${activeLanguage}` ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                    <div className="p-4 bg-slate-900 overflow-x-auto">
                                        <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                                            {activeEndpoint.examples[activeLanguage as keyof typeof activeEndpoint.examples]}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Example Response */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900">Example Response</h3>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                        200 OK
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-900 overflow-x-auto">
                                    <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap">
                                        {activeEndpoint.response}
                                    </pre>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Error Codes */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Error Codes</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {[
                                    { code: 'invalid_api_key', description: 'The API key provided is invalid' },
                                    { code: 'insufficient_balance', description: 'Not enough balance to place order' },
                                    { code: 'invalid_service', description: 'The service ID does not exist' },
                                    { code: 'invalid_link', description: 'The link provided is invalid or private' },
                                    { code: 'order_not_found', description: 'The order ID does not exist' },
                                    { code: 'refill_not_available', description: 'Refill is not available for this order' },
                                ].map((error, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                        <code className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">
                                            {error.code}
                                        </code>
                                        <span className="text-sm text-slate-600">{error.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiDocumentationPage;
