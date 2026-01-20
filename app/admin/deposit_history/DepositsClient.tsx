'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Download, DollarSign, User, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

type DepositData = {
  id: number;
  user: { username: string };
  amount: any; // Decimal
  detail_transaction: any; // Json
  status: string;
  created_at: Date;
};

const DepositsClient = ({ initialDeposits }: { initialDeposits: DepositData[] }) => {
  const [deposits, setDeposits] = useState(initialDeposits);

  const getMethod = (detail: any) => {
    // Assuming detail_transaction has method/provider info. 
    // Adapting to schema structure which uses Json.
    // Defaulting to "Unknown" if structure varies.
    return detail?.provider || detail?.method || 'Manual';
  };

  const getTxnId = (detail: any) => {
    return detail?.transactionId || detail?.txn_id || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Deposit History</h1>
          <p className="text-slate-500 text-sm">View and manage user deposit transactions.</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search transaction ID or user..."
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
            <option>Completed</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">#{deposit.id}</div>
                    <div className="text-xs text-slate-500">{getTxnId(deposit.detail_transaction)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      {deposit.user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-emerald-600">${Number(deposit.amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      {getMethod(deposit.detail_transaction)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${deposit.status === 'PAYMENT' ? 'bg-emerald-100 text-emerald-800' :
                      deposit.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {deposit.status === 'PAYMENT' ? <CheckCircle className="w-3 h-3" /> :
                        deposit.status === 'PENDING' ? <Clock className="w-3 h-3" /> :
                          <XCircle className="w-3 h-3" />}
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {format(new Date(deposit.created_at), 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No deposits found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{deposits.length}</span> of <span className="font-medium text-slate-900">{deposits.length}</span> results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositsClient;
