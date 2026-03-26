'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Plus, 
  QrCode, 
  Building2, 
  SmartphoneNfc, 
  CheckCircle2, 
  ArrowUpRight,
  Info,
  Loader2,
  Bitcoin,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Gateway = {
    id: number;
    provider: string; // 'PAYPAL' | 'CRYPTOMUS' | 'MANUAL'
    min_deposit: number;
    api_config: any;
};

const AddFundsClient = ({ gateways, userBalance }: { gateways: Gateway[], userBalance: number }) => {
    const router = useRouter();
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(gateways.length > 0 ? gateways[0].id : null);
    const [loading, setLoading] = useState(false);

    const quickAmounts = ['10', '25', '50', '100', '250', '500'];

    const selectedGateway = gateways.find(g => g.id === selectedMethodId);

    const getIcon = (provider: string) => {
        switch (provider) {
            case 'PAYPAL': return <SmartphoneNfc size={20} />;
            case 'CRYPTOMUS': return <QrCode size={20} />;
            case 'MANUAL': return <Building2 size={20} />;
            default: return <Plus size={20} />;
        }
    };

    const getDesc = (provider: string) => {
        switch (provider) {
            case 'PAYPAL': return 'Pay with Cards or Balance';
            case 'CRYPTOMUS': return 'Crypto (USDT, BTC, etc.)';
            case 'MANUAL': return 'Bank Transfer / Manual';
            default: return 'Instant Deposit';
        }
    };

    const handleAmountClick = (amount: string) => {
        setDepositAmount(amount);
    };

    const handleSubmit = async () => {
        if (!selectedGateway || !depositAmount) return;

        setLoading(true);
        try {
            if (selectedGateway.provider === 'MANUAL') {
                const res = await fetch('/api/user/deposits/manual', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gatewayId: selectedGateway.id,
                        amount: parseFloat(depositAmount)
                    })
                });
                if (!res.ok) throw new Error('Failed to create deposit request');
                toast.success('Deposit request created. Please follow instructions.');
                // Maybe redirect to history or success page?
                router.push('/user/history/order');
            } else if (selectedGateway.provider === 'PAYPAL') {
                const res = await fetch('/api/user/deposits/paypal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gatewayId: selectedGateway.id,
                        amount: parseFloat(depositAmount)
                    })
                });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.error('Failed to initialize PayPal payment');
                }
            } else if (selectedGateway.provider === 'CRYPTOMUS') {
                const res = await fetch('/api/user/deposits/cryptomus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gatewayId: selectedGateway.id,
                        amount: parseFloat(depositAmount)
                    })
                });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.error('Failed to initialize Cryptomus payment');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none mx-auto w-full md:max-w-3xl lg:max-w-4xl shadow-2xl relative transition-all duration-300">
          
          {/* Header */}
          <div className="p-6 flex items-center bg-white sticky top-0 z-40 border-b border-emerald-50">
            <Link href="/user" className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform">
              <ChevronLeft size={24} />
            </Link>
            <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight uppercase italic">DEPOSIT</h2>
          </div>
    
          <div className="p-6 space-y-8">
            
            {/* Current Balance Info */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-200">
                  <Plus size={16} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Available Balance</p>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{formatCurrency(userBalance)}</p>
                </div>
              </div>
              <Info size={18} className="text-emerald-300" />
            </div>
    
            {/* Amount Input Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white border border-emerald-50 rounded-[2rem] p-8 shadow-xl shadow-emerald-50/50">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-6 text-center">
                  Set Your Deposit Amount
                </label>
                
                <div className="flex items-center justify-center border-b-2 border-emerald-500/30 pb-4 mb-8 focus-within:border-emerald-500 transition-colors">
                  <span className="text-3xl font-black text-emerald-600 mr-3">$</span>
                  <input 
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-4xl font-black outline-none placeholder:text-emerald-100 text-emerald-600 selection:bg-emerald-100"
                  />
                </div>
    
                {/* Quick Select Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {quickAmounts.map((amt) => (
                    <button 
                      key={amt}
                      onClick={() => handleAmountClick(amt)}
                      className={`py-3.5 rounded-2xl text-[11px] font-black transition-all border ${
                        depositAmount === amt 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-200 scale-[1.05]' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-50 hover:bg-emerald-100 hover:border-emerald-100'
                      }`}
                    >
                      {parseInt(amt).toLocaleString('en-US')}
                    </button>
                  ))}
                </div>
              </div>
            </section>
    
            {/* Payment Methods Section */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
                Preferred Gateway
              </h3>
              <div className="space-y-4 pb-8">
                {gateways.map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`w-full p-5 rounded-[2rem] flex items-center justify-between border transition-all duration-300 ${
                      selectedMethodId === method.id 
                      ? 'bg-white border-emerald-500 shadow-xl ring-1 ring-emerald-500 scale-[1.02]' 
                      : 'bg-white border-emerald-50 hover:bg-emerald-50/50 hover:border-emerald-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl transition-all duration-500 ${selectedMethodId === method.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-600'}`}>
                        {getIcon(method.provider)}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black text-slate-800">{method.provider === 'MANUAL' ? (method.api_config?.bankName || 'Direct Transfer') : (method.provider.charAt(0) + method.provider.slice(1).toLowerCase())}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide opacity-70">{getDesc(method.provider)}</p>
                      </div>
                    </div>
                    {selectedMethodId === method.id && (
                      <div className="bg-emerald-500 rounded-full p-1 animate-in zoom-in duration-300 shadow-md">
                        <CheckCircle2 size={18} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
                {gateways.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Gateways</p>
                  </div>
                )}
              </div>
            </section>
          </div>
    
          {/* Fixed Bottom CTA Container */}
          <div className="fixed bottom-0 left-0 right-0 max-w-3xl lg:max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border-t border-emerald-50/50 p-6 z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <button 
              onClick={handleSubmit}
              disabled={loading || !depositAmount || (selectedGateway && parseFloat(depositAmount) < selectedGateway.min_deposit)}
              className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ${
                depositAmount && (!selectedGateway || parseFloat(depositAmount) >= selectedGateway.min_deposit)
                ? 'bg-emerald-600 text-white shadow-emerald-200 active:scale-[0.97]' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span>Initialize Deposit</span>
                  <ArrowUpRight size={20} strokeWidth={3} />
                </>
              )}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest leading-relaxed px-4 opacity-60">
              Processing <span className="text-emerald-600">1-5 minutes</span>. Security verified.
            </p>
          </div>
    
          {/* Hide Spin Buttons */}
          <style dangerouslySetInnerHTML={{ __html: `
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
          `}} />
    
        </div>
      );
};

export default AddFundsClient;
