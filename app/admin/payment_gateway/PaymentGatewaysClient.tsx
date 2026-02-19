'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, CreditCard, DollarSign, CheckCircle, XCircle, Settings, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import GatewayModal from './GatewayModal';
import { useRouter } from 'next/navigation';

type PaymentGatewayData = {
  id: number;
  provider: string; // Enum
  api_config: any; // Json
  min_deposit: any; // Decimal
  status: string;
};

const PaymentGatewaysClient = ({ initialGateways }: { initialGateways: PaymentGatewayData[] }) => {
  const router = useRouter();
  const [gateways, setGateways] = useState(initialGateways);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayData | undefined>(undefined);

  const getFee = (config: any) => {
    return config?.fee ? `${config.fee}%` : '0%';
  };

  const getType = (gateway: PaymentGatewayData) => {
    return gateway.provider === 'MANUAL' ? 'Manual' : 'Automatic';
  };

  const handleAddGateway = () => {
    setSelectedGateway(undefined);
    setIsModalOpen(true);
  };

  const handleEditGateway = (gateway: PaymentGatewayData) => {
    setSelectedGateway(gateway);
    setIsModalOpen(true);
  };

  const handleSaveGateway = async (data: any) => {
    try {
      if (selectedGateway) {
        // Edit
        const res = await fetch(`/api/admin/payment-gateways/${selectedGateway.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update');
        toast.success('Gateway updated successfully');
      } else {
        // Create
        const res = await fetch('/api/admin/payment-gateways', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create');
        toast.success('Gateway created successfully');
      }
      router.refresh();
      // Update local state loosely (refresh handles it but state update is faster feedback if needed, 
      // but we rely on refresh mainly for server data. For now let's just refresh. 
      // Actually updating state is better for strict React)
      // For simplicity we rely on nextjs refresh or would fetch again.
      // Let's just wait for refresh.
      // window.location.reload(); // Force reload to get fresh data is robust here
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Operation failed');
      throw error; // Re-throw for modal to handle if needed
    }
  };

  const handleDeleteGateway = async (id: number) => {
    if (!confirm('Are you sure you want to delete this gateway?')) return;

    try {
      const res = await fetch(`/api/admin/payment-gateways/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Gateway deleted');
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payment Gateways</h1>
          <p className="text-slate-500 text-sm">Configure payment methods for user deposits.</p>
        </div>
        <button
          onClick={handleAddGateway}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Add Gateway
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search gateways..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <select className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Gateway Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Min Deposit</th>
                <th className="px-6 py-4 font-semibold">Fee</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gateways.map((gateway) => (
                <tr key={gateway.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="font-medium text-slate-900">{gateway.provider}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getType(gateway) === 'Automatic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                      {getType(gateway)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">${Number(gateway.min_deposit).toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500">{getFee(gateway.api_config)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${gateway.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                      {gateway.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {gateway.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditGateway(gateway)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGateway(gateway.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {gateways.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No payment gateways found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{gateways.length}</span> of <span className="font-medium text-slate-900">{gateways.length}</span> results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm">Next</button>
          </div>
        </div>
      </div>

      <GatewayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveGateway}
        gateway={selectedGateway}
      />
    </div>
  );
};

export default PaymentGatewaysClient;
