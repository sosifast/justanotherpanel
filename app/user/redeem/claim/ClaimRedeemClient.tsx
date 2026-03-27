'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Gift, 
  Ticket, 
  ArrowRight, 
  Info,
  CheckCircle2,
  Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const ClaimRedeemClient = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ amount: number; new_balance: number | string } | null>(null);

    const handleClaim = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!code.trim()) return toast.error('Please enter a redeem code');

        setLoading(true);
        try {
            const res = await fetch('/api/user/redeem/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() })
            });

            const data = await res.json();

            if (res.ok) {
                setResult({ amount: data.amount, new_balance: data.new_balance });
                toast.success('Code claimed successfully!');
                setCode('');
            } else {
                toast.error(data.error || 'Failed to claim code');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans pb-32 select-none">
          
          {/* Header */}
          <div className="p-6 flex items-center bg-white sticky top-0 z-40 border-b border-emerald-50">
            <Link href="/user" className="p-2 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform">
              <ChevronLeft size={24} />
            </Link>
            <h2 className="ml-4 text-xl font-black text-slate-900 tracking-tight">Redeem Code</h2>
          </div>

          <div className="p-6 space-y-8 max-w-2xl mx-auto">
            
            {/* Illustration / Icon Section */}
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 relative shadow-inner">
                <Gift size={48} strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 bg-white p-2 rounded-2xl shadow-md border border-emerald-50 text-emerald-500">
                  <Ticket size={20} />
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-black text-slate-900">Claim Your Reward</h3>
                <p className="text-xs text-slate-400 font-medium mt-1 px-10 leading-relaxed">
                  Enter your unique voucher or promo code below to receive your special rewards.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleClaim} className="space-y-6">
              <div className="bg-white border border-emerald-100 rounded-[2.5rem] p-8 shadow-sm">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-6 text-center">
                  Enter Redemption Code
                </label>
                
                <div className="flex flex-col items-center">
                  <input 
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="EX: PROMO2026"
                    className="w-full bg-slate-50 border-2 border-dashed border-emerald-100 rounded-2xl py-5 px-6 text-center text-2xl font-black text-emerald-600 placeholder:text-emerald-100 outline-none focus:border-emerald-500 focus:bg-white transition-all uppercase tracking-widest"
                    disabled={loading}
                  />
                  
                  <div className="mt-6 flex items-start space-x-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <div className="mt-0.5 shrink-0">
                      <Info size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                      Code is usually 8-12 characters long and consists of letters and numbers. Please check your spelling carefully.
                    </p>
                  </div>
                </div>
              </div>
            </form>

            {/* Tips / Help */}
            <div className="px-2">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Redemption Tips</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3 text-xs font-bold text-slate-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Each code can only be used once</span>
                </li>
                <li className="flex items-center space-x-3 text-xs font-bold text-slate-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Check for expiration dates on your voucher</span>
                </li>
                <li className="flex items-center space-x-3 text-xs font-bold text-slate-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Rewards are added instantly to your account</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Success Overlay */}
          {result && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setResult(null)}></div>
              <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 flex flex-col items-center text-center animate-in zoom-in duration-300 shadow-2xl">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Redeem Successful!</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
                  Successfully claimed <span className="text-emerald-600 font-bold">${Number(result.amount).toFixed(2)}</span>.
                </p>
                <div className="w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-8">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">New Account Balance</p>
                    <p className="text-2xl font-black text-emerald-700">${Number(result.new_balance).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => setResult(null)}
                  className="w-full bg-emerald-600 text-white py-4 rounded-[1.5rem] font-black text-sm shadow-lg shadow-emerald-100 active:scale-[0.98] transition-transform"
                >
                  Great, thanks!
                </button>
              </div>
            </div>
          )}

          {/* Fixed Bottom CTA */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-emerald-50/50 p-6 z-40 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] max-w-2xl mx-auto">
            <button 
              onClick={() => handleClaim()}
              disabled={!code || loading}
              className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ${
                code && !loading
                ? 'bg-emerald-600 text-white shadow-emerald-200 active:scale-[0.97]' 
                : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                  <Loader className="w-6 h-6 animate-spin" />
              ) : (
                  <>
                    <span>Redeem Now</span>
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
              )}
            </button>
          </div>

        </div>
    );
};

export default ClaimRedeemClient;
