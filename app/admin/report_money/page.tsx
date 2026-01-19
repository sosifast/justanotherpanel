import React from 'react';
import { DollarSign, ArrowDownRight, ArrowUpRight, CreditCard, Wallet } from 'lucide-react';

const AdminReportMoneyPage = () => {
  const summary = {
    totalRevenue: 124592,
    totalDeposit: 98540,
    totalPayout: 24300,
    balance: 14250
  };

  const daily = [
    { date: '2026-01-15', orders: 245, revenue: 1245.5, deposit: 980, payout: 200 },
    { date: '2026-01-14', orders: 198, revenue: 980.2, deposit: 750, payout: 150 },
    { date: '2026-01-13', orders: 310, revenue: 1520.75, deposit: 1120, payout: 320 },
    { date: '2026-01-12', orders: 172, revenue: 720.1, deposit: 540, payout: 90 },
    { date: '2026-01-11', orders: 201, revenue: 880.45, deposit: 640, payout: 110 }
  ];

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h1>
        <p className="text-slate-600 text-sm">
          Ringkasan pemasukan, deposit, dan pengeluaran panel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">{formatMoney(summary.totalRevenue)}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Deposit</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">{formatMoney(summary.totalDeposit)}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Payout</span>
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">{formatMoney(summary.totalPayout)}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Saldo Panel</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">{formatMoney(summary.balance)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-800">Laporan Harian</h2>
          </div>
          <select className="px-3 py-1 border border-slate-200 rounded text-xs text-slate-700 bg-white">
            <option>7 hari terakhir</option>
            <option>30 hari terakhir</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Jumlah Order</th>
                <th className="px-4 py-2">Revenue</th>
                <th className="px-4 py-2">Deposit</th>
                <th className="px-4 py-2">Payout</th>
                <th className="px-4 py-2">Net</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((row) => {
                const net = row.revenue + row.deposit - row.payout;
                return (
                  <tr key={row.date} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-xs text-slate-600">{row.date}</td>
                    <td className="px-4 py-2 text-xs text-slate-700">{row.orders}</td>
                    <td className="px-4 py-2 text-xs text-slate-700">{formatMoney(row.revenue)}</td>
                    <td className="px-4 py-2 text-xs text-slate-700">{formatMoney(row.deposit)}</td>
                    <td className="px-4 py-2 text-xs text-slate-700">{formatMoney(row.payout)}</td>
                    <td className="px-4 py-2 text-xs font-semibold text-slate-800">
                      {formatMoney(net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportMoneyPage;
