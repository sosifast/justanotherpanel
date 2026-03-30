"use client";

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Filter,
  Download,
  Wallet,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { getFinancialReport } from './actions';
import { toast } from 'react-hot-toast';

interface ReportStats {
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
}

const ReportMoneyClient = ({ initialData }: { initialData: any }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [customReport, setCustomReport] = useState<ReportStats | null>(null);

  const fetchCustomReport = async () => {
    setLoading(true);
    try {
      const response = await getFinancialReport(dateRange.start, dateRange.end);
      if (response.success && response.data) {
        setCustomReport(response.data);
      } else {
        toast.error("Failed to fetch report");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const stats = [
    {
      label: "Today's Revenue",
      value: formatCurrency(initialData.today.revenue),
      subtext: `${initialData.today.orderCount} orders today`,
      icon: <Activity className="w-5 h-5" />,
      color: "blue",
      bg: "bg-blue-50",
      text: "text-blue-600"
    },
    {
      label: "Last 7 Days",
      value: formatCurrency(initialData.last7Days.revenue),
      subtext: `Profit: ${formatCurrency(initialData.last7Days.profit)}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "emerald",
      bg: "bg-emerald-50",
      text: "text-emerald-600"
    },
    {
      label: "Last 30 Days",
      value: formatCurrency(initialData.last30Days.revenue),
      subtext: `${initialData.last30Days.orderCount} total orders`,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "indigo",
      bg: "bg-indigo-50",
      text: "text-indigo-600"
    },
    {
      label: "Yearly Performance",
      value: formatCurrency(initialData.thisYear.revenue),
      subtext: `Year to date`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-600"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Insights</h1>
          <p className="text-slate-500 font-medium">Monitor your SMM panel revenue and profit margins.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={fetchCustomReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Run Analysis
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.text} w-fit mb-4 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-xs text-slate-400 font-medium italic">{stat.subtext}</p>
            
            {/* Decorative background circle */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] ${stat.text.replace('text', 'bg')} group-hover:scale-150 transition-transform duration-700`} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Date Range Analysis
              </h3>
              <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-inner">
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 outline-none bg-transparent"
                />
                <span className="text-slate-300 font-black">→</span>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 outline-none bg-transparent"
                />
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                 <div className="space-y-1">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Gross Revenue</p>
                    <h4 className="text-3xl font-black text-slate-900">
                      {customReport ? formatCurrency(customReport.revenue) : formatCurrency(initialData.last30Days.revenue)}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Selected Range Total</p>
                 </div>
                 <div className="space-y-1 py-4 md:py-0 border-y md:border-y-0 md:border-x border-slate-100">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">API Costs</p>
                    <h4 className="text-3xl font-black text-red-500">
                      {customReport ? formatCurrency(customReport.cost) : formatCurrency(initialData.last30Days.cost)}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">External SMM Providers</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Net Profit</p>
                    <h4 className="text-3xl font-black text-blue-600">
                      {customReport ? formatCurrency(customReport.profit) : formatCurrency(initialData.last30Days.profit)}
                    </h4>
                    <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase mt-1">
                       {customReport && customReport.revenue > 0 
                        ? ((customReport.profit / customReport.revenue) * 100).toFixed(1)
                        : ((initialData.last30Days.profit / initialData.last30Days.revenue) * 100).toFixed(1)}% ROI
                    </div>
                 </div>
              </div>

              {/* Status Message */}
              {customReport && (
                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 rounded-xl text-white">
                         <Activity className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-emerald-900 text-xs font-black uppercase tracking-tighter">Reporting Completed</p>
                         <p className="text-emerald-600 text-[10px] font-bold">Successfully analyzed {customReport.orderCount} orders in specified range.</p>
                      </div>
                   </div>
                   <button onClick={() => setCustomReport(null)} className="text-[10px] font-black text-emerald-800 uppercase hover:underline">Reset Views</button>
                </div>
              )}

              {/* Placeholder for Chart */}
              <div className="mt-12 w-full h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group cursor-pointer hover:border-blue-200 transition-colors">
                 <Activity className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Revenue Analytics Visualization</p>
                 <p className="text-[10px] text-slate-300 mt-1">Real-time data synchronization active</p>
              </div>
            </div>
          </div>

          {/* Breakdown Table Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/20">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Comparison Breakdown</h3>
            </div>
            <div className="p-0 overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                     <tr>
                        <th className="px-8 py-3">Timeframe</th>
                        <th className="px-8 py-3">Orders</th>
                        <th className="px-8 py-3 text-right">Revenue</th>
                        <th className="px-8 py-3 text-right">Net Profit</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 font-bold text-slate-700">Today</td>
                        <td className="px-8 py-4 font-medium text-slate-500">{initialData.today.orderCount}</td>
                        <td className="px-8 py-4 text-right font-bold text-slate-900">{formatCurrency(initialData.today.revenue)}</td>
                        <td className="px-8 py-4 text-right font-black text-blue-600">{formatCurrency(initialData.today.profit)}</td>
                     </tr>
                     <tr className="hover:bg-slate-50/50 transition-colors bg-blue-50/10">
                        <td className="px-8 py-4 font-bold text-slate-700">This Month (30D)</td>
                        <td className="px-8 py-4 font-medium text-slate-500">{initialData.last30Days.orderCount}</td>
                        <td className="px-8 py-4 text-right font-bold text-slate-900">{formatCurrency(initialData.last30Days.revenue)}</td>
                        <td className="px-8 py-4 text-right font-black text-blue-600">{formatCurrency(initialData.last30Days.profit)}</td>
                     </tr>
                     <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 font-bold text-slate-700">YTD Performance</td>
                        <td className="px-8 py-4 font-medium text-slate-500">{initialData.thisYear.orderCount}</td>
                        <td className="px-8 py-4 text-right font-bold text-slate-900">{formatCurrency(initialData.thisYear.revenue)}</td>
                        <td className="px-8 py-4 text-right font-black text-blue-600">{formatCurrency(initialData.thisYear.profit)}</td>
                     </tr>
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportMoneyClient;
