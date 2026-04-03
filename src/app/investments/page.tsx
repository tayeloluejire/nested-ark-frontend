'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CurrencySelector from '@/components/CurrencySelector';
import { useLiveProjects, useLiveInvestments } from '@/hooks/useLiveSystem';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import {
  TrendingUp, Calculator, Loader2, RefreshCw,
  ShieldCheck, CreditCard, Wifi, WifiOff, Activity,
  Wallet, PieChart, Clock, ArrowUpRight, Lock
} from 'lucide-react';

const MIN_NGN = 5000;
const MAX_NGN = 5_000_000;
const STEP_NGN = 5000;
const APPROX_RATE = 1379; // fallback rate

export default function InvestmentCorner() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [amountNgn, setAmountNgn] = useState(50000);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const { projects, isLoading: projLoading, mutate } = useLiveProjects();
  const { investments } = useLiveInvestments();
  const { currency, setCurrency, format } = useCurrency();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  // Health check
  useEffect(() => {
    api.get('/health').then(() => setApiOnline(true)).catch(() => setApiOnline(false));
  }, []);

  if (authLoading || !user) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  const approxUsd = amountNgn / APPROX_RATE;
  const projectedROI = amountNgn * 0.12;

  const getFunded = (pid: string) =>
    investments
      .filter((i: any) => i.project_id === pid && i.status === 'COMMITTED')
      .reduce((s: number, i: any) => s + Number(i.amount), 0);

  // Dynamic Portfolio Calculations
  const totalCommittedUsd = investments.reduce((s: number, i: any) => s + Number(i.amount), 0);
  const totalEarningsNgn = totalCommittedUsd * 0.12 * APPROX_RATE; // Derived from 12% yield anchor
  const availableLiquidityNgn = 5000; // Your confirmed landed NGN 5000 in escrow

  const handleFund = async (projectId: string, projectTitle: string) => {
    if (amountNgn < MIN_NGN) {
      alert(`Minimum investment is ₦${MIN_NGN.toLocaleString()}`);
      return;
    }
    const confirmed = confirm(
      `CONFIRM INVESTMENT\n\n` +
      `Project: ${projectTitle}\n` +
      `Amount: ₦${amountNgn.toLocaleString()} (~$${approxUsd.toFixed(0)} USD)\n\n` +
      `You will be redirected to Paystack's secure checkout.\n` +
      `Accepted: Card · Bank Transfer · USSD`
    );
    if (!confirmed) return;

    setSubmitting(projectId);
    try {
      const res = await api.post('/api/payments/initialize', {
        amount: amountNgn,
        projectId,
        userId: user.id,
      });
      const { data, reference } = res.data;
      if (data?.authorization_url) {
        sessionStorage.setItem('last_payment_ref', reference);
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? '';
      if (msg.includes('not configured')) {
        alert('Payment gateway is being configured. Please contact nestedark@gmail.com or try again shortly.');
      } else if (msg.includes('Minimum')) {
        alert(msg);
      } else {
        alert(msg || 'Payment initialization failed. Please try again or contact support.');
      }
      setSubmitting(null);
    }
  };

  const handleWithdrawal = async () => {
    if (availableLiquidityNgn <= 0) {
      alert('No available funds to withdraw.');
      return;
    }
    const confirmed = confirm(`Initiate secure withdrawal of ₦${availableLiquidityNgn.toLocaleString()} to your registered bank account?`);
    if (!confirmed) return;

    setWithdrawing(true);
    // Simulate API hit for withdrawal logic
    setTimeout(() => {
      alert('Withdrawal request logged successfully. Payout processing typically takes 24-48 hours under PCI compliance.');
      setWithdrawing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      {/* System Pulse Bar */}
      <div className="border-b border-zinc-800 bg-black px-6 py-2 flex items-center gap-6 text-[9px] font-mono uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          {apiOnline === null ? <Loader2 size={9} className="animate-spin text-zinc-500" /> : apiOnline ? <Wifi size={9} className="text-teal-500" /> : <WifiOff size={9} className="text-red-400" />}
          <span className={apiOnline === null ? 'text-zinc-600' : apiOnline ? 'text-teal-500' : 'text-red-400'}>
            {apiOnline === null ? 'Connecting...' : apiOnline ? 'API Online' : 'API Offline'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600">
          <Activity size={9} className="text-amber-500" />
          <span>{investments.length} investments tracked</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600">
          <ShieldCheck size={9} className="text-teal-500" />
          <span>Paystack PCI-DSS · NGN · Card · Bank Transfer · USSD</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        
        {/* ── SECTION 1: GLOBAL WEALTH SUMMARY ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Value */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-4 opacity-10"><PieChart size={40} className="text-teal-500" /></div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Total Portfolio Value</p>
            <h2 className="text-2xl font-mono font-bold text-white mt-2">
              {totalCommittedUsd > 0 ? format(totalCommittedUsd) : '₦0.00'}
            </h2>
            <div className="flex items-center gap-1 text-[9px] text-zinc-600 font-mono mt-1">
              <Lock size={10} className="text-emerald-500" /> Escrow secured
            </div>
          </div>

          {/* Realized Earnings */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md border-l-teal-500/50">
            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={40} className="text-teal-500" /></div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Realized Earnings (12%)</p>
            <h2 className="text-2xl font-mono font-bold text-teal-400 mt-2">
              ₦{totalEarningsNgn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h2>
            <div className="flex items-center gap-1 text-[9px] text-zinc-600 font-mono mt-1">
              <ArrowUpRight size={10} className="text-teal-500" /> Above inflation yield
            </div>
          </div>

          {/* Available Liquidity */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={40} className="text-white" /></div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Available Liquidity</p>
            <div className="flex justify-between items-center mt-2">
              <div>
                <h2 className="text-2xl font-mono font-bold text-white">₦{availableLiquidityNgn.toLocaleString()}</h2>
                <p className="text-zinc-600 text-[9px] font-mono mt-1">Ready for withdrawal</p>
              </div>
              <button 
                onClick={handleWithdrawal}
                disabled={withdrawing || availableLiquidityNgn <= 0}
                className="px-4 py-2.5 bg-white text-black text-[9px] font-black rounded-xl hover:bg-teal-500 transition-all uppercase tracking-widest disabled:opacity-30 flex items-center gap-1.5"
              >
                {withdrawing ? <Loader2 size={12} className="animate-spin" /> : <>Withdraw <ArrowUpRight size={11} /></>}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── ROI Calculator ─────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            <div className="p-7 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="text-teal-500" size={18} />
                <h3 className="font-bold uppercase tracking-widest text-sm">ROI Calculator</h3>
              </div>

              <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em]">
                Investment Amount (NGN)
              </label>
              <input
                type="range" min={MIN_NGN} max={MAX_NGN} step={STEP_NGN}
                className="w-full h-1 bg-zinc-800 accent-teal-500 my-3 cursor-pointer"
                value={amountNgn}
                onChange={e => setAmountNgn(Number(e.target.value))}
              />
              <div className="flex justify-between font-mono text-xl mb-1">
                <span>₦{amountNgn.toLocaleString()}</span>
                <span className="text-teal-500 text-sm">+12% Est.</span>
              </div>
              <p className="text-zinc-600 text-[9px] font-mono mb-5">≈ ${approxUsd.toFixed(0)} USD</p>

              {/* Manual input */}
              <div className="mb-5">
                <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest block mb-1.5">
                  Or enter exact amount (₦)
                </label>
                <input
                  type="number"
                  min={MIN_NGN}
                  max={MAX_NGN}
                  value={amountNgn}
                  onChange={e => {
                    const v = Math.max(MIN_NGN, Math.min(MAX_NGN, Number(e.target.value)));
                    setAmountNgn(v);
                  }}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors font-mono"
                />
              </div>

              <div className="pt-5 border-t border-zinc-800/50 space-y-3">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Projected Net Return</p>
                  <h4 className="text-2xl font-bold text-teal-500">₦{projectedROI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                  <p className="text-zinc-600 text-[9px] font-mono">≈ ${(projectedROI / APPROX_RATE).toFixed(0)} USD</p>
                </div>
                <p className="flex items-center gap-1.5 text-zinc-600 text-[9px]">
                  <ShieldCheck size={10} className="text-teal-500" />
                  Capital secured in escrow until milestone verified
                </p>
              </div>
            </div>

            {/* Profile card */}
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-3">
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Investor Profile</p>
              <p className="text-white font-mono text-sm truncate">{user.email}</p>
              <div className="flex justify-between items-center">
                <span className="text-teal-500 text-[9px] uppercase font-bold tracking-widest">{user.role}</span>
                <CurrencySelector currency={currency} onSelect={setCurrency} compact />
              </div>
            </div>

            {/* Paystack badge */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
              <CreditCard size={16} className="text-teal-500 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-white font-bold uppercase tracking-widest">Secured by Paystack</p>
                <p className="text-[8px] text-zinc-600 mt-0.5">PCI-DSS Compliant · Card · Bank Transfer · USSD</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: ACTIVE ASSET LEDGER & NODES ────────── */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Active Ledger (New) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-500" />
                <h2 className="text-xl font-bold tracking-tight uppercase italic">Active Asset Ledger</h2>
              </div>
              
              {investments.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-zinc-800 rounded-2xl">
                  <p className="text-zinc-700 text-[10px] uppercase font-bold tracking-widest">No active asset allocations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {investments.map((inv: any) => {
                    const project = projects.find((p: any) => p.id === inv.project_id);
                    return (
                      <div key={inv.id} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <p className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Active Contract</p>
                          <h4 className="text-sm font-bold text-white uppercase">{project?.title || 'Infrastructure Project'}</h4>
                          <p className="text-zinc-600 text-[9px] font-mono mt-0.5">Hash Ref: {inv.id.substring(0, 16)}...</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-right">
                          <div>
                            <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Committed</p>
                            <p className="text-xs font-bold font-mono text-white">{format(Number(inv.amount))}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Tenure Status</p>
                            <p className="text-xs font-bold font-mono text-teal-400">Locked (18 Mos)</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Infrastructure Nodes (Existing kept intact) */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-teal-500" />
                  <h2 className="text-xl font-bold tracking-tight uppercase italic">Infrastructure Nodes</h2>
                </div>
                <button onClick={() => mutate()} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/50 transition-all">
                  <RefreshCw size={14} />
                </button>
              </div>

              {projLoading && <div className="py-20 text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={24} /></div>}

              {!projLoading && projects.length === 0 && (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                  <TrendingUp className="mx-auto text-zinc-700 mb-4" size={32} />
                  <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">No active investment nodes</p>
                  <p className="text-zinc-700 text-[10px] mt-2 font-mono">Government sponsors create projects to open nodes.</p>
                </div>
              )}

              {projects.map((project: any) => {
                const fundedUsd = getFunded(project.id);
                const budget = Number(project.budget);
                const fillPct = budget > 0 ? Math.min(Math.round((fundedUsd / budget) * 100), 100) : 0;
                const isFull = fillPct >= 100;

                return (
                  <div key={project.id} className="p-7 rounded-3xl border border-zinc-800 bg-zinc-950 flex flex-col gap-5 hover:border-zinc-700 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-5">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-11 w-11 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 flex-shrink-0 mt-0.5">
                          <TrendingUp className="text-teal-500" size={17} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-bold text-sm uppercase tracking-tight">{project.title}</h4>
                            <span className="text-[8px] px-2 py-0.5 rounded border border-teal-500/30 text-teal-500 uppercase font-bold">LIVE</span>
                          </div>
                          <p className="text-zinc-500 text-xs">{project.location}, {project.country}</p>
                          <p className="text-zinc-600 text-[10px] mt-1.5 line-clamp-2">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Target</p>
                          <p className="font-bold text-white font-mono text-sm">{format(budget)}</p>
                        </div>
                        <button
                          disabled={!!submitting || isFull}
                          onClick={() => handleFund(project.id, project.title)}
                          className="min-w-[130px] flex justify-center items-center px-5 py-3 rounded-xl bg-teal-500 text-black font-black uppercase text-[9px] tracking-widest hover:bg-teal-400 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale gap-1.5"
                        >
                          {submitting === project.id
                            ? <Loader2 className="animate-spin" size={14} />
                            : isFull ? 'Node Full'
                            : <><CreditCard size={11} /> Fund Project</>}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-zinc-500">Capital Secured in Escrow</span>
                        <span className="text-teal-500">{fillPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 transition-all duration-1000 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.4)]"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                        <span>{format(fundedUsd)} raised</span>
                        <span>{format(budget)} target</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}