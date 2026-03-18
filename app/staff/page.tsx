import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import StaffDashboardClient from './StaffDashboardClient';
import { getSettings } from '@/lib/settings';

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

  return orders.map((order: any) => ({
    ...order,
    price_api: Number(order.price_api),
    price_sale: Number(order.price_sale),
    price_seller: Number(order.price_seller),
    created_at: order.created_at.toISOString(),
    updated_at: order.updated_at.toISOString(),
  }));
}


export default async function StaffPage() {
  const session = await getCurrentUser();

  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/auth/login');
  }

  const [stats, recentOrders, settings] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getSettings(),
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
    </div>
  );
}
