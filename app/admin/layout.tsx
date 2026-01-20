'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Layers,
  LifeBuoy,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  AlertCircle,
  Server,
  CreditCard,
  Wallet,
  Globe,
  List,
  Download,
  MessageSquare,
  DollarSign,
  Shield
} from 'lucide-react';

type AdminLayoutProps = {
  children: React.ReactNode;
};

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
  isActive?: boolean;
};

const SidebarItem = ({ icon, label, href, badge, isActive = false }: SidebarItemProps) => (
  <Link
    href={href}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${isActive
          ? 'bg-white/20 text-white'
          : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
          }`}
      >
        {badge}
      </span>
    )}
  </Link>
);

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 w-72 h-screen bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="py-6 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/50">
              A
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">AdminPanel</h1>
              <p className="text-slate-500 text-xs">v2.4.0 Pro</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Main
          </p>
          <SidebarItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            href="/admin"
            isActive={isActive('/admin')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            SMM Management
          </p>
          <SidebarItem
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Orders"
            href="/admin/smm/history_order"
            isActive={isActive('/admin/smm/history_order')}
            badge="12 New"
          />
          <SidebarItem
            icon={<Layers className="w-5 h-5" />}
            label="Services"
            href="/admin/smm/service"
            isActive={isActive('/admin/smm/service')}
          />
          <SidebarItem
            icon={<List className="w-5 h-5" />}
            label="Categories"
            href="/admin/smm/category"
            isActive={isActive('/admin/smm/category')}
          />
          <SidebarItem
            icon={<Globe className="w-5 h-5" />}
            label="Platforms"
            href="/admin/smm/platform"
            isActive={isActive('/admin/smm/platform')}
          />
          <SidebarItem
            icon={<DollarSign className="w-5 h-5" />}
            label="Discounts"
            href="/admin/discount"
            isActive={isActive('/admin/discount')}
          />
          <SidebarItem
            icon={<Download className="w-5 h-5" />}
            label="Import Services"
            href="/admin/smm/import"
            isActive={isActive('/admin/smm/import')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            Users & Billing
          </p>
          <SidebarItem
            icon={<Users className="w-5 h-5" />}
            label="Users"
            href="/admin/user"
            isActive={isActive('/admin/user')}
          />
          <SidebarItem
            icon={<Shield className="w-5 h-5" />}
            label="Resellers"
            href="/admin/register-reseller"
            isActive={isActive('/admin/register-reseller')}
          />
          <SidebarItem
            icon={<Wallet className="w-5 h-5" />}
            label="Deposit History"
            href="/admin/deposit_history"
            isActive={isActive('/admin/deposit_history')}
          />
          <SidebarItem
            icon={<CreditCard className="w-5 h-5" />}
            label="Payment Gateways"
            href="/admin/payment_gateway"
            isActive={isActive('/admin/payment_gateway')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            Support
          </p>
          <SidebarItem
            icon={<LifeBuoy className="w-5 h-5" />}
            label="Tickets"
            href="/admin/tickets"
            isActive={isActive('/admin/tickets')}
            badge="5"
          />
          <SidebarItem
            icon={<MessageSquare className="w-5 h-5" />}
            label="News"
            href="/admin/news"
            isActive={isActive('/admin/news')}
          />

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-2">
            System
          </p>
          <SidebarItem
            icon={<Server className="w-5 h-5" />}
            label="API Providers"
            href="/admin/api_provider"
            isActive={isActive('/admin/api_provider')}
          />
          <SidebarItem
            icon={<DollarSign className="w-5 h-5" />}
            label="Report Money"
            href="/admin/report_money"
            isActive={isActive('/admin/report_money')}
          />
          <SidebarItem
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            href="/admin/settings"
            isActive={isActive('/admin/settings')}
          />
        </div>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-800 transition-colors group">
            <img
              src="https://i.pravatar.cc/150?u=admin"
              alt="Admin"
              className="w-9 h-9 rounded-full border-2 border-slate-700"
            />
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-white">Administrator</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen md:ml-72 relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <header className="py-6 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden md:block">Dashboard Overview</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <input
                type="text"
                placeholder="Search anything..."
                className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
            </div>

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 z-10">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
