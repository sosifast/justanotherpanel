'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Package,
  Clock,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

const Dashboard = () => {
  const [category, setCategory] = useState('instagram');
  const [service, setService] = useState('');

  // Mock Data
  const stats = [
    { label: "Total Balance", value: "$1,240.50", icon: <Wallet className="w-5 h-5 text-emerald-600" />, change: "+12%" },
    { label: "Total Spent", value: "$45,231.00", icon: <TrendingUp className="w-5 h-5 text-blue-600" />, change: "+5%" },
    { label: "Total Orders", value: "8,542", icon: <ShoppingCart className="w-5 h-5 text-purple-600" />, change: "+124" },
    { label: "Active Orders", value: "12", icon: <Clock className="w-5 h-5 text-amber-600" />, change: "-2" },
  ];

  const recentOrders = [
    { id: 4521, service: "Instagram Followers [Real]", link: "https://inst...", quantity: 1000, status: "Completed", date: "2 mins ago" },
    { id: 4522, service: "TikTok Views [Instant]", link: "https://tiktok...", quantity: 5000, status: "Processing", date: "15 mins ago" },
    { id: 4523, service: "Youtube Likes", link: "https://youtu...", quantity: 200, status: "Pending", date: "1 hour ago" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, John! Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-slate-500 text-sm">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" /> New Order
              </h2>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Single Order</span>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  >
                    <option value="instagram">Instagram Services (Followers, Likes, Views)</option>
                    <option value="tiktok">TikTok Services (Exclusive)</option>
                    <option value="youtube">YouTube Growth</option>
                    <option value="twitter">Twitter / X Boost</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
                <div className="relative">
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  >
                    <option value="">Choose a service...</option>
                    <option value="1">[ID: 402] Instagram Followers | Max 500k | No Refill | Instant</option>
                    <option value="2">[ID: 405] Instagram Followers | Refill 30D | High Quality</option>
                    <option value="3">[ID: 890] Instagram Likes | Real Accounts | Instant</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> Start: 0-1 hr
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    <TrendingUp className="w-3 h-3" /> Speed: 10k/day
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Link</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourusername"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    placeholder="Min: 100 - Max: 500,000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Charge</label>
                  <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm font-medium cursor-not-allowed">
                    $0.00
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Place Order
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-semibold text-slate-900">Recent Orders</h2>
              <a href="#" className="text-xs text-blue-600 font-medium hover:underline">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">Link</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                      <td className="px-6 py-4 truncate max-w-[200px]" title={order.service}>{order.service}</td>
                      <td className="px-6 py-4 truncate max-w-[150px] text-blue-500">{order.link}</td>
                      <td className="px-6 py-4 text-center">{order.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            <h3 className="text-lg font-bold mb-1">Elite Status</h3>
            <p className="text-slate-300 text-sm mb-4">You receive 5% discount on all orders.</p>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div className="bg-blue-500 h-2 rounded-full w-[75%]"></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Current: $45k</span>
              <span>Goal: $60k</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> News &amp; Updates
              </h2>
            </div>
            <div className="p-0">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">New Service</span>
                    <span className="text-xs text-slate-400">2 hours ago</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-snug">
                    We have added new Exclusive TikTok services with instant start and high retention. Check ID 502-505.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Need Help?</h3>
            <p className="text-sm text-slate-500 mb-4">Our support team is available 24/7 to assist you with any issues.</p>
            <button className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-all">
              Open Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
