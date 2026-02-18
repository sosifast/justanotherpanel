'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { Search, Filter, MoreVertical, Download, DollarSign, User, Calendar, CreditCard, CheckCircle, XCircle, Clock, RefreshCw, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { checkDepositStatus } from './actions';
import toast from 'react-hot-toast';
import Link from 'next/link';

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
  const [isPending, startTransition] = useTransition();
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getMethod = (detail: any) => {
    return detail?.provider || detail?.method || 'Manual';
  };

  const getTxnId = (detail: any) => {
    return detail?.transactionId || detail?.txn_id || '-';
  };

  const handleCheckStatus = async (id: number) => {
    setCheckingId(id);
    startTransition(async () => {
      try {
        const result = await checkDepositStatus(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to check status');
      } finally {
        setCheckingId(null);
      }
    });
  };

  const handleUpdateAll = async () => {
    setIsUpdatingAll(true);
    const pendingAuto = deposits.filter(d =>
      ['PAYPAL', 'CRYPTOMUS'].includes(getMethod(d.detail_transaction)) &&
      !['PAYMENT', 'CANCELED', 'ERROR'].includes(d.status)
    );

    if (pendingAuto.length === 0) {
      toast.error('No pending auto-check deposits found');
      setIsUpdatingAll(false);
      return;
    }

    toast.loading(`Updating ${pendingAuto.length} deposits...`, { id: 'update-all' });

    let successCount = 0;

    for (const deposit of pendingAuto) {
      try {
        const result = await checkDepositStatus(deposit.id);
        if (result.success) successCount++;
      } catch (e) {
        console.error(e);
      }
    }

    toast.dismiss('update-all');
    toast.success(`Updated ${successCount}/${pendingAuto.length} deposits`);
    setIsUpdatingAll(false);
  };

  const filteredDeposits = useMemo(() => {
    return deposits.filter(d => {
      const method = getMethod(d.detail_transaction);
      const txnId = getTxnId(d.detail_transaction);
      const matchSearch = search === '' ||
        d.id.toString().includes(search) ||
        d.user.username.toLowerCase().includes(search.toLowerCase()) ||
        txnId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [deposits, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Deposit History</h1>
          <p className="text-slate-500 text-sm">View and manage user deposit transactions.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUpdateAll}
            disabled={isUpdatingAll || isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Update All (PayPal + Cryptomus)
          </button>
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search ID, user or transaction..."
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="all">All Status</option>
              <option value="PAYMENT">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="ERROR">Error</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
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
              {filteredDeposits.map((deposit) => (
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
                    <div className="flex items-center justify-end gap-2">
                      {['PAYPAL', 'CRYPTOMUS'].includes(getMethod(deposit.detail_transaction)) && !['PAYMENT', 'CANCELED', 'ERROR'].includes(deposit.status) && (
                        <button
                          onClick={() => handleCheckStatus(deposit.id)}
                          disabled={checkingId === deposit.id}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={`Check ${getMethod(deposit.detail_transaction)} Status`}
                        >
                          {checkingId === deposit.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <Link
                        href={`/admin/deposit_history/${deposit.id}`}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDeposits.length === 0 && (
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
