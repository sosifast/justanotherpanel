import React from 'react';
import { Users, ShoppingBag, LifeBuoy, DollarSign, TrendingUp, AlertCircle, MoreVertical } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: "Total Revenue", value: "$124,592.00", change: "+14.5%", icon: <DollarSign className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-500/10" },
    { label: "Total Orders", value: "85,246", change: "+2.4%", icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, bg: "bg-blue-500/10" },
    { label: "Active Users", value: "12,304", change: "+12%", icon: <Users className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-500/10" },
    { label: "Pending Tickets", value: "24", change: "-5%", icon: <LifeBuoy className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10" },
  ];

  const recentOrders = [
    { id: "ORD-7782", user: "alex_marketing", service: "Instagram Followers [Real]", amount: "$12.50", provider: "Medusa API", status: "Completed" },
    { id: "ORD-7783", user: "brand_boost", service: "TikTok Views [Instant]", amount: "$4.20", provider: "SMM King", status: "Processing" },
    { id: "ORD-7784", user: "johndoe99", service: "YouTube Likes", amount: "$1.50", provider: "Main Provider", status: "Pending" },
    { id: "ORD-7785", user: "crypto_news", service: "Twitter Retweets", amount: "$8.00", provider: "Medusa API", status: "Completed" },
    { id: "ORD-7786", user: "sarah_vlogs", service: "Instagram Likes", amount: "$0.50", provider: "SMM King", status: "Canceled" },
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
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.change.startsWith('+')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {stat.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : null}
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
                {recentOrders.map((order, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                    <td className="px-6 py-4">{order.user}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{order.service}</td>
                    <td className="px-6 py-4 font-medium">{order.amount}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{order.provider}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'Pending'
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
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-10 -mt-10 blur-xl" />
            <h3 className="text-slate-300 text-sm font-medium mb-1">Provider Balances</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-3xl font-bold">$4,250.00</h2>
              <span className="text-xs text-green-400 font-medium">+ $1,200 deposited</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs items-center">
                <span className="text-slate-400">Medusa API</span>
                <span className="font-bold">$1,205.50</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[70%]" />
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-slate-400">SMM King</span>
                <span className="font-bold">$402.10</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[20%]" />
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
              Manage APIs
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> System Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs text-red-700 font-medium mb-1">Provider Error</p>
                <p className="text-xs text-red-600/80">
                  &quot;Main Provider&quot; is returning 502 Errors. Auto-switch enabled.
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs text-amber-700 font-medium mb-1">Low Balance</p>
                <p className="text-xs text-amber-600/80">
                  SMM King balance is below threshold ($50.00).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
