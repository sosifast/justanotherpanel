import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import StaffDashboardClient from './StaffDashboardClient';
import { getSettings } from '@/lib/settings';
import PlausibleAnalytics, { PlausibleData } from '../admin/PlausibleAnalytics';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Staff Dashboard",
  description: "Monitor panel operations as staff member."
};

async function getStats() {
  const [revenue, orders, users, tickets] = await Promise.all([
    prisma.deposits.aggregate({
      _sum: { amount: true },
      where: {
        status: 'PAYMENT',
        created_at: {
          gt: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.order.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.ticket.count({ where: { status: 'OPEN' } })
  ]);

  return {
    revenue: revenue._sum.amount ? Number(revenue._sum.amount).toFixed(2) : '0.00',
    orders,
    users,
    tickets
  };
}

async function getRecentOrders() {
  const orders = await prisma.order.findMany({
    take: 10,
    orderBy: { created_at: 'desc' },
    include: {
      user: { select: { username: true } },
      service: { select: { name: true } }
    }
  });

  return orders.map(order => ({
    ...order,
    price_api: Number(order.price_api),
    price_sale: Number(order.price_sale),
    price_seller: Number(order.price_seller),
    created_at: order.created_at.toISOString(),
    updated_at: order.updated_at.toISOString(),
  }));
}

async function getPlausibleData(): Promise<PlausibleData | null> {
  const settings = await prisma.setting.findFirst({
    select: { plausible_domain: true, plausible_api_key: true }
  });

  if (!settings?.plausible_domain || !settings?.plausible_api_key) {
    return null;
  }

  const domain = settings.plausible_domain;
  const apiKey = settings.plausible_api_key;
  const base = 'https://plausible.io/api/v1';
  const headers = { Authorization: `Bearer ${apiKey}` };
  const opts = { headers, next: { revalidate: 3600 } } as RequestInit;

  try {
    const [aggRes, tsRes, pagesRes, refRes, countriesRes, browsersRes] = await Promise.allSettled([
      fetch(`${base}/stats/aggregate?site_id=${domain}&period=30d&metrics=visitors,pageviews,bounce_rate,visit_duration`, opts),
      fetch(`${base}/stats/timeseries?site_id=${domain}&period=30d&metrics=visitors`, opts),
      fetch(`${base}/stats/breakdown?site_id=${domain}&period=30d&property=event:page&limit=5`, opts),
      fetch(`${base}/stats/breakdown?site_id=${domain}&period=30d&property=visit:referrer&limit=10`, opts),
      fetch(`${base}/stats/breakdown?site_id=${domain}&period=30d&property=visit:country&limit=10`, opts),
      fetch(`${base}/stats/breakdown?site_id=${domain}&period=30d&property=visit:browser&limit=8`, opts),
    ]);

    const toJson = async (r: PromiseSettledResult<Response>) => {
      if (r.status === 'rejected' || !r.value.ok) return null;
      return r.value.json().catch(() => null);
    };

    const [aggData, tsData, pagesData, refData, countriesData, browsersData] = await Promise.all([
      toJson(aggRes), toJson(tsRes), toJson(pagesRes), toJson(refRes), toJson(countriesRes), toJson(browsersRes),
    ]);

    return {
      domain,
      aggregate: aggData?.results ?? null,
      timeseries: tsData?.results ?? [],
      topPages: pagesData?.results ?? [],
      topReferrers: refData?.results ?? [],
      countries: countriesData?.results ?? [],
      browsers: browsersData?.results ?? [],
    };
  } catch (err) {
    console.error('Plausible fetch error:', err);
    return null;
  }
}

export default async function StaffPage() {
  const session = await getCurrentUser();

  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/auth/login');
  }

  const [stats, recentOrders, settings, plausibleData] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getSettings(),
    getPlausibleData(),
  ]);

  const pusherSettings = settings ? {
    key: settings.pusher_app_key || process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
    cluster: settings.pusher_app_cluster || process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || '',
  } : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Overview</h1>
        <p className="text-slate-500 font-medium">Welcome back. Here's what's happening with the panel today.</p>
      </div>

      <StaffDashboardClient
        initialStats={stats}
        initialOrders={recentOrders as any}
        pusherSettings={pusherSettings}
      />

      <div className="mt-12">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Traffic Analytics</h2>
        <PlausibleAnalytics data={plausibleData} />
      </div>
    </div>
  );
}
