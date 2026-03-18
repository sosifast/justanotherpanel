import React from 'react';
import { Users, ShoppingBag, LifeBuoy, DollarSign, AlertCircle, MoreVertical } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import PostHogAnalytics, { PostHogData } from './PostHogAnalytics';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: "Dashboard",
  description: "Monitor and manage your SMM panel operations."
};


async function getStats() {
  const totalRevenue = await prisma.deposits.aggregate({
    _sum: { amount: true },
    where: { status: 'PAYMENT' } // Assuming PAYMENT = Paid
  });

  const totalOrders = await prisma.order.count();
  const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });

  const pendingTickets = await prisma.ticket.count({ where: { status: 'OPEN' } });

  return {
    revenue: totalRevenue._sum.amount ? Number(totalRevenue._sum.amount).toFixed(2) : '0.00',
    orders: totalOrders,
    users: activeUsers,
    tickets: pendingTickets
  };
}

async function getRecentOrders() {
  return await prisma.order.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: {
      user: true,
      service: true,
      api_provider: true
    }
  });
}

async function getProviders() {
  return await prisma.apiProvider.findMany({
    where: { status: 'ACTIVE' }
  });
}


async function getCryptomusBalance() {
  try {
    const gateway = await prisma.paymentGateway.findFirst({
      where: {
        provider: 'CRYPTOMUS',
        status: 'ACTIVE'
      }
    });

    if (!gateway) return null;

    const config = gateway.api_config as any;
    if (!config.merchantId || !config.paymentKey) {
      return null;
    }

    const payload = {};
    const jsonPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(jsonPayload).toString('base64');
    const sign = crypto.createHash('md5').update(base64Payload + config.paymentKey).digest('hex');

    const response = await fetch('https://api.cryptomus.com/v1/balance', {
      method: 'POST',
      headers: {
        merchant: config.merchantId,
        sign: sign,
        'Content-Type': 'application/json'
      },
      body: jsonPayload
    });

    const data = await response.json();

    if (data.state === 0) {
      const result = data.result;

      if (Array.isArray(result) && result.length > 0 && result[0]?.balance?.merchant) {
        return result[0].balance.merchant; // This is the actual array of balances
      }

      if (Array.isArray(result)) return result;
      return [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

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

async function getPostHogData(): Promise<PostHogData | null> {
  const settingsResults = await prisma.$queryRaw<any[]>`SELECT posthog_api_key, posthog_host, posthog_personal_api_key, posthog_project_id, site_name FROM "setting" LIMIT 1`;
  const settings = settingsResults[0];

  if (!settings?.posthog_personal_api_key || !settings?.posthog_project_id) {
    return null;
  }

  const apiKey = settings.posthog_personal_api_key as string;
  const projectId = settings.posthog_project_id as string;
  const host = (settings.posthog_host as string) || 'https://us.i.posthog.com';
  const baseUrl = `${host}/api/projects/${projectId}/query/`;

  const fetchHogQL = async (query: string) => {
    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('PostHog fetch error:', e);
      return null;
    }
  };

  try {
    const [visitorsRes, pageviewsRes, trendRes, countriesRes, browsersRes, pagesRes, referrersRes, devicesRes, vitalsRes] = await Promise.all([
      fetchHogQL("SELECT count(DISTINCT distinct_id) FROM events WHERE timestamp > now() - interval 30 day"),
      fetchHogQL("SELECT count() FROM events WHERE event = '$pageview' AND timestamp > now() - interval 30 day"),
      fetchHogQL("SELECT toDate(timestamp) as d, count() FROM events WHERE event = '$pageview' AND timestamp > now() - interval 30 day GROUP BY d ORDER BY d ASC"),
      fetchHogQL("SELECT properties.$geoip_country_code, count() FROM events WHERE timestamp > now() - interval 30 day GROUP BY properties.$geoip_country_code ORDER BY count() DESC LIMIT 10"),
      fetchHogQL("SELECT properties.$browser, count() FROM events WHERE timestamp > now() - interval 30 day GROUP BY properties.$browser ORDER BY count() DESC LIMIT 10"),
      fetchHogQL("SELECT properties.$current_url, count() FROM events WHERE event = '$pageview' AND timestamp > now() - interval 30 day GROUP BY properties.$current_url ORDER BY count() DESC LIMIT 10"),
      fetchHogQL("SELECT properties.$referrer, count() FROM events WHERE timestamp > now() - interval 30 day GROUP BY properties.$referrer ORDER BY count() DESC LIMIT 10"),
      fetchHogQL("SELECT properties.$device_type, count() FROM events WHERE timestamp > now() - interval 30 day GROUP BY properties.$device_type ORDER BY count() DESC"),
      fetchHogQL("SELECT avg(properties.$web_vitals_LCP), avg(properties.$web_vitals_FID), avg(properties.$web_vitals_CLS), avg(properties.$web_vitals_FCP) FROM events WHERE event = '$pageview' AND timestamp > now() - interval 30 day"),
    ]);

    const visitors = visitorsRes?.results?.[0] || 0;
    const pageviews = pageviewsRes?.results?.[0] || 0;
    
    // Map trend
    const trend = (trendRes?.results || []).map((r: any) => ({
      date: new Date(r[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: r[1]
    }));

    // Map breakdowns
    const mapBreakdown = (res: any) => (res?.results || []).map((r: any) => ({ name: r[0] || 'Unknown', count: r[1] }));

    const vitalsResult = vitalsRes?.results?.[0] || [0, 0, 0, 0];

    return {
      visitors,
      pageviews,
      bounceRate: 0, // Simplified
      avgSessionDuration: 0, // Simplified
      trend,
      topPages: mapBreakdown(pagesRes),
      topReferrers: mapBreakdown(referrersRes),
      countries: mapBreakdown(countriesRes),
      browsers: mapBreakdown(browsersRes),
      devices: mapBreakdown(devicesRes),
      webVitals: {
          lcp: parseFloat(vitalsResult[0]) || 0,
          fid: parseFloat(vitalsResult[1]) || 0,
          cls: parseFloat(vitalsResult[2]) || 0,
          fcp: parseFloat(vitalsResult[3]) || 0,
      },
      domain: settings.site_name,
    };
  } catch (err) {
    console.error('Error processing PostHog data:', err);
    return null;
  }
}

const AdminDashboard = async () => {
  const session = await getCurrentUser();

  if (!session || session.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const [statsData, recentOrders, providers, cryptomusBalanceRaw, phData] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getProviders(),
    getCryptomusBalance(),
    getPostHogData(),
  ]);

  const cryptomusBalance = Array.isArray(cryptomusBalanceRaw)
    ? cryptomusBalanceRaw.filter((item: any) => parseFloat(item.balance) > 0)
    : [];

  const stats = [
    { label: "Total Revenue", value: `$${statsData.revenue}`, change: "30d", icon: <DollarSign className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-500/10" },
    { label: "Total Orders", value: statsData.orders.toLocaleString(), change: "all", icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, bg: "bg-blue-500/10" },
    { label: "Active Users", value: statsData.users.toLocaleString(), change: "all", icon: <Users className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-500/10" },
    { label: "Open Tickets", value: statsData.tickets.toLocaleString(), change: "live", icon: <LifeBuoy className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10" },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
              <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                {/* Placeholder change data */}
                {stat.change}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Orders
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Provider</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                    <td className="px-6 py-4">{order.user.username}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{order.service.name}</td>
                    <td className="px-6 py-4 font-medium">${Number(order.price_sale).toFixed(4)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{order.api_provider?.name || 'Manual'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'COMPLETED' || order.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'PROCESSING' || order.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-10 -mt-10 blur-xl" />
            <h3 className="text-slate-300 text-sm font-medium mb-1">Provider Balances</h3>
            {/* Total provider balance sum */}
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-3xl font-bold">
                ${providers.reduce((acc, curr) => acc + Number(curr.balance), 0).toFixed(2)}
              </h2>
            </div>
            <div className="space-y-3">
              {providers.map(provider => (
                <div key={provider.id}>
                  <div className="flex justify-between text-xs items-center mb-1">
                    <span className="text-slate-400">{provider.name}</span>
                    <span className="font-bold">${Number(provider.balance).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    {/* Visual bar just for effect, randomized width or full */}
                    <div className="bg-blue-500 h-full w-full" style={{ width: '100%' }} />
                  </div>
                </div>
              ))}
              {providers.length === 0 && <p className="text-slate-500 text-xs">No active providers.</p>}
            </div>

            {Array.isArray(cryptomusBalance) && cryptomusBalance.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">Cryptomus Balance</h4>
                <div className="space-y-3">
                  {cryptomusBalance.map((item: any, idx: number) => {
                    const balanceNum = parseFloat(item.balance);

                    // Only show balances > 0
                    if (isNaN(balanceNum) || balanceNum <= 0) return null;
                    return (
                      <div key={idx} className="flex justify-between text-xs items-center">
                        <span className="text-slate-400">{item.currency_code}</span>
                        <span className="font-bold">{item.balance}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
              Manage APIs
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> System Alerts
            </h3>
            <div className="space-y-3">
              {/* Low Balance Alerts */}
              {providers.filter(p => Number(p.balance) < 10).map(p => (
                <div key={p.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-700 font-medium mb-1">Low Balance</p>
                  <p className="text-xs text-amber-600/80">
                    {p.name} balance is low (${Number(p.balance).toFixed(2)}).
                  </p>
                </div>
              ))}
              {providers.filter(p => Number(p.balance) < 10).length === 0 && (
                <p className="text-sm text-slate-500 italic">No active alerts.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* PostHog Analytics Section */}
      <PostHogAnalytics data={phData} />
    </>
  );
};


export default AdminDashboard;
