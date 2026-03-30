import React from 'react';
import { Users, ShoppingBag, LifeBuoy, DollarSign, AlertCircle, MoreVertical, ArrowUpRight, ArrowDownRight, TrendingUp, CheckCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: "Dashboard",
  description: "Monitor and manage your SMM panel operations."
};


async function getStats() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // --- REVENUE ---
  const revenueThisMonth = await prisma.deposits.aggregate({
    _sum: { amount: true },
    where: { 
      status: 'PAYMENT',
      created_at: { gte: firstDayOfMonth }
    }
  });

  const revenueLastMonth = await prisma.deposits.aggregate({
    _sum: { amount: true },
    where: { 
      status: 'PAYMENT',
      created_at: { 
        gte: firstDayOfLastMonth,
        lt: firstDayOfMonth
      }
    }
  });

  const revThis = Number(revenueThisMonth._sum.amount || 0);
  const revLast = Number(revenueLastMonth._sum.amount || 0);
  const revChange = revLast === 0 ? 100 : ((revThis - revLast) / revLast) * 100;

  // --- ORDERS ---
  const ordersThisMonth = await prisma.order.count({
    where: { created_at: { gte: firstDayOfMonth } }
  });

  const ordersLastMonth = await prisma.order.count({
    where: { 
      created_at: { 
        gte: firstDayOfLastMonth,
        lt: firstDayOfMonth
      }
    }
  });

  const ordChange = ordersLastMonth === 0 ? 100 : ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;

  // --- ACTIVE USERS (Users who placed an order this month) ---
  const activeUsersThisMonth = await prisma.user.count({ 
    where: { 
      status: 'ACTIVE',
      orders: {
        some: {
          created_at: { gte: firstDayOfMonth }
        }
      }
    } 
  });

  const activeUsersLastMonth = await prisma.user.count({ 
    where: { 
      status: 'ACTIVE',
      orders: {
        some: {
          created_at: { 
            gte: firstDayOfLastMonth,
            lt: firstDayOfMonth
          }
        }
      }
    } 
  });

  const userChange = activeUsersLastMonth === 0 ? 100 : ((activeUsersThisMonth - activeUsersLastMonth) / activeUsersLastMonth) * 100;

  // --- OPEN TICKETS ---
  const openTickets = await prisma.ticket.count({ where: { status: 'OPEN' } });
  const totalTickets = await prisma.ticket.count();
  const ticketPercentage = totalTickets === 0 ? 0 : (openTickets / totalTickets) * 100;

  return {
    revenue: {
      value: revThis.toFixed(2),
      change: revChange.toFixed(1),
      isUp: revChange >= 0
    },
    orders: {
      value: ordersThisMonth,
      change: ordChange.toFixed(1),
      isUp: ordChange >= 0
    },
    users: {
      value: activeUsersThisMonth,
      change: userChange.toFixed(1),
      isUp: userChange >= 0
    },
    tickets: {
      value: openTickets,
      percentage: ticketPercentage.toFixed(1)
    }
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

async function getRecentDeposits() {
  return await prisma.deposits.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: {
      user: true
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




const AdminDashboard = async () => {
  const session = await getCurrentUser();

  if (!session || session.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const [statsData, recentOrders, recentDeposits, providers, cryptomusBalanceRaw] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getRecentDeposits(),
    getProviders(),
    getCryptomusBalance(),
  ]);

  const cryptomusBalance = Array.isArray(cryptomusBalanceRaw)
    ? cryptomusBalanceRaw.filter((item: any) => parseFloat(item.balance) > 0)
    : [];

  const stats = [
    {
      label: "Total Revenue",
      value: `$${statsData.revenue.value}`,
      change: `${statsData.revenue.change}%`,
      isUp: statsData.revenue.isUp,
      sublabel: "this month",
      icon: <DollarSign className="w-5 h-5" />,
      color: "emerald",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      iconBg: "text-emerald-900"
    },
    {
      label: "Total Order",
      value: statsData.orders.value.toLocaleString(),
      change: `${statsData.orders.change}%`,
      isUp: statsData.orders.isUp,
      sublabel: "this month",
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "blue",
      bg: "bg-blue-50",
      text: "text-blue-600",
      iconBg: "text-blue-900"
    },
    {
      label: "Active User",
      value: statsData.users.value.toLocaleString(),
      change: `${statsData.users.change}%`,
      isUp: statsData.users.isUp,
      sublabel: "ordered this month",
      icon: <Users className="w-5 h-5" />,
      color: "indigo",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      iconBg: "text-indigo-900"
    },
    {
      label: "Open Ticket",
      value: statsData.tickets.value.toLocaleString(),
      change: `${statsData.tickets.percentage}%`,
      isUp: false,
      sublabel: "of total tickets",
      icon: <LifeBuoy className="w-5 h-5" />,
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-600",
      iconBg: "text-amber-900"
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.text} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${stat.label === "Open Ticket"
                ? "bg-slate-100 text-slate-600"
                : stat.isUp
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
                }`}>
                {stat.label !== "Open Ticket" && (
                  stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{stat.sublabel}</p>
            </div>
            
            {/* Subtle decorative background icon */}
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] ${stat.iconBg} group-hover:opacity-[0.05] transition-opacity`}>
               {React.cloneElement(stat.icon as React.ReactElement, { className: "w-24 h-24" })}
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" /> Recent Orders
            </h3>
            <button className="text-[10px] uppercase tracking-wider text-blue-600 hover:text-blue-700 font-bold">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 font-bold">User</th>
                  <th className="px-6 py-3 font-bold">Service</th>
                  <th className="px-6 py-3 font-bold text-right">Price</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-700">{order.user.username}</div>
                      <div className="text-[10px] text-slate-400">#{order.id}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="truncate max-w-[120px] text-slate-600 font-medium">{order.service.name}</div>
                    </td>
                    <td className="px-6 py-3 font-bold text-right text-slate-900">${Number(order.price_sale).toFixed(3)}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${order.status === 'COMPLETED' || order.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Deposits */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Recent Deposits
            </h3>
            <button className="text-[10px] uppercase tracking-wider text-blue-600 hover:text-blue-700 font-bold">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 font-bold">User</th>
                  <th className="px-6 py-3 font-bold">Method</th>
                  <th className="px-6 py-3 font-bold text-right">Amount</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentDeposits.map((deposit: any) => {
                  const detail = deposit.detail_transaction as any;
                  return (
                    <tr key={deposit.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-bold text-slate-700">{deposit.user.username}</div>
                        <div className="text-[10px] text-slate-400">ID: {deposit.id}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-slate-600 font-medium capitalize">{detail?.payment_method || 'Deposit'}</div>
                      </td>
                      <td className="px-6 py-3 font-bold text-right text-emerald-600">${Number(deposit.amount).toFixed(2)}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${deposit.status === 'PAYMENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {deposit.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card 1: Total Provider Balance Summary */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Net Provider Equity</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-md border border-blue-500/20">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight leading-none">
                  ${providers.reduce((acc: number, curr: any) => acc + Number(curr.balance), 0).toFixed(2)}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">aggregated across {providers.length} APIs</p>
              </div>
            </div>
            
            {Array.isArray(cryptomusBalance) && cryptomusBalance.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-slate-500 text-[9px] font-black uppercase tracking-wider">Cryptomus Assets</h4>
                <div className="flex flex-wrap gap-2">
                  {cryptomusBalance.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="px-2 py-1 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                      <span className="text-blue-400 font-bold text-[10px]">{item.currency_code}</span>
                      <span className="text-white font-mono text-[10px]">{item.balance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="relative z-10 w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
            Analytics Report
          </button>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-10 -mt-10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/10 rounded-full -ml-8 -mb-8 blur-2xl" />
        </div>

        {/* Card 2: Detailed Provider Balances */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-black">
               API Provider Status
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full font-bold">Online</span>
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[250px] pr-2 scrollbar-hide">
            {providers.map((provider: any) => (
              <div key={provider.id} className="group cursor-default">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-600 font-bold text-xs group-hover:text-blue-600 transition-colors">{provider.name}</span>
                  <span className="text-xs font-black text-slate-900">${Number(provider.balance).toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${Number(provider.balance) < 10 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: '100%' }} />
                </div>
              </div>
            ))}
            {providers.length === 0 && <p className="text-slate-400 text-xs italic text-center py-4">No providers configured.</p>}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
             <p className="text-[9px] text-slate-400 font-medium text-center">Auto-syncing every 5 minutes</p>
          </div>
        </div>

        {/* Card 3: System Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-black">
            System Alerts
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
            {providers.filter((p: any) => Number(p.balance) < 10).map((p: any) => (
              <div key={p.id} className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3 animate-pulse">
                <div className="p-1.5 bg-red-100 rounded-lg text-red-600 h-fit">
                   <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-red-800 font-black mb-0.5 uppercase tracking-tighter">Low Funds</p>
                  <p className="text-[10px] text-red-600/80 leading-tight font-medium">
                     {p.name} needs top-up immediately.
                  </p>
                </div>
              </div>
            ))}
            {providers.filter((p: any) => Number(p.balance) < 10).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 opacity-40">
                 <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3 grayscale group-hover:grayscale-0 transition-all">
                    <CheckCircle className="w-5 h-5" />
                 </div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Engine Nominal</p>
                 <p className="text-[9px] text-slate-400 font-medium text-center mt-1">No critical issues detected</p>
              </div>
            )}
          </div>
          <div className="mt-4">
             <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200">
                Ignore All Alerts
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
