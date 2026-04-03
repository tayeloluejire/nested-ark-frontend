'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, canAccess } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLiveInvestments } from '@/hooks/useLiveSystem';
import { useCurrency } from '@/hooks/useCurrency';
import CurrencySelector from '@/components/CurrencySelector';
import api from '@/lib/api';
import {
  TrendingUp, ShieldCheck, Lock, Wallet, BarChart3,
  Loader2, RefreshCw, ArrowUpRight, AlertTriangle,
  CreditCard, FileText, Eye, Download, Activity,
  Wifi, CheckCircle2, Clock, X
} from 'lucide-react';

const NGN_RATE = 1381;
const ANNUAL_RETURN = 0.12;
const TENURE_MONTHS = 24;

export default function InvestorPortfolio() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { investments, isLoading: invLoading, mutate } = useLiveInvestments();
  const { format, currency, setCurrency } = useCurrency();
  const [payHistory, setPayHistory] = useState<any[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, any>>({});
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: '', account_number: '', account_name: '' });
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  /* ── auth guard ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (!authLoading && user && !canAccess(user.role, '/portfolio')) {
      router.replace(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  }, [user, authLoading, router]);

  /* ── load payment history + projects + KYC ─────────────────────────── */
  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [hist, proj, kyc] = await Promise.allSettled([
        api.get('/api/payments/history'),
        api.get('/api/projects'),
        api.get('/api/kyc/status'),
      ]);
      if (hist.status === 'fulfilled') setPayHistory(hist.value.data.transactions ?? []);
      if (proj.status === 'fulfilled') {
        const map: Record<string, any> = {};
        (proj.value.data.projects ?? []).forEach((p: any) => { map[p.id] = p; });
        setProjectMap(map);
      }
      if (kyc.status === 'fulfilled') setKycStatus(kyc.value.data);
    } finally { setDataLoading(false); }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  if (authLoading || !user) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  /* ── derived numbers ─────────────────────────────────────────────────── */
  const totalPaidNgn = payHistory.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + Number(t.amount_ngn), 0);
  const totalPaidUsd = totalPaidNgn / NGN_RATE;
  const committedUsd = investments.reduce((s: number, i: any) => s + Number(i.amount), 0);
  const committedNgn = committedUsd * NGN_RATE;
  const earnedUsd   = totalPaidUsd * ANNUAL_RETURN * 0.5;  // 6-month accrual
  const earnedNgn   = earnedUsd * NGN_RATE;
  const kycOk = kycStatus?.kyc_status === 'VERIFIED';

  /* ── withdrawal handler ─────────────────────────────────────────────── */
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycOk) { alert('Complete KYC first.'); return; }
    setWithdrawing(true);
    await new Promise(r => setTimeout(r, 1800)); // simulate async call
    setWithdrawing(false);
    setWithdrawSuccess(true);
    setShowWithdraw(false);
  };

  /* ── helpers ─────────────────────────────────────────────────────────── */
  const tenure = (inv: any) => {
    const days = Math.floor((Date.now() - new Date(inv.created_at).getTime()) / 86400000);
    const elapsed = Math.min(Math.floor(days / 30), TENURE_MONTHS);
    const left = TENURE_MONTHS - elapsed;
    const pct  = Math.round((elapsed / TENURE_MONTHS) * 100);
    return { elapsed, left, pct };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      {/* ── pulse bar ─────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-800 bg-black px-6 py-2 flex items-center gap-5 text-[9px] font-mono uppercase tracking-widest overflow-x-auto">
        <span className="flex items-center gap-1.5 text-teal-500 flex-shrink-0"><Wifi size={8}/> Portfolio Live</span>
        <span className="flex items-center gap-1.5 text-zinc-600 flex-shrink-0"><Activity size={8} className="text-amber-500"/> {investments.length} positions</span>
        <span className={`flex items-center gap-1.5 flex-shrink-0 ${kycOk ? 'text-teal-500' : 'text-amber-400'}`}>
          <ShieldCheck size={8}/> KYC: {kycStatus?.kyc_status ?? 'NOT SUBMITTED'}
        </span>
        {!kycOk && (
          <Link href="/kyc" className="text-amber-400 font-bold hover:underline flex-shrink-0">
            Complete KYC to unlock withdrawals →
          </Link>
        )}
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8">

        {/* ── header ──────────────────────────────────────────────────────── */}
        <header className="border-l-2 border-emerald-500 pl-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[9px] text-emerald-400 uppercase font-bold tracking-[0.2em] mb-1">Investor Command Center</p>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">My Portfolio</h1>
            <p className="text-zinc-500 text-sm mt-1">{user.full_name} · {user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <CurrencySelector currency={currency} onSelect={setCurrency} compact={false}/>
            <button onClick={() => { mutate(); loadData(); }} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/40 transition-all">
              <RefreshCw size={14}/>
            </button>
          </div>
        </header>

        {/* ── 4-card capital summary ───────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Portfolio Value', main: format(committedUsd), sub: `₦${committedNgn.toLocaleString(undefined,{maximumFractionDigits:0})}`, icon: BarChart3, color: 'text-emerald-400', accent: 'border-l-emerald-500' },
            { label: 'Estimated Earnings (12%)', main: `+${format(earnedUsd)}`, sub: `+₦${earnedNgn.toLocaleString(undefined,{maximumFractionDigits:0})}`, icon: TrendingUp, color: 'text-teal-400', accent: 'border-l-teal-500' },
            { label: 'Capital in Escrow', main: format(committedUsd), sub: 'Tri-layer secured', icon: Lock, color: 'text-amber-400', accent: 'border-l-amber-500' },
            { label: 'Available to Withdraw', main: `+${format(earnedUsd)}`, sub: kycOk ? 'KYC Verified ✓' : 'Complete KYC first', icon: Wallet, color: kycOk ? 'text-teal-500' : 'text-zinc-500', accent: kycOk ? 'border-l-teal-500' : 'border-l-zinc-700', cta: true },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} className={`p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 border-l-2 ${c.accent} relative overflow-hidden`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest leading-tight">{c.label}</p>
                  <Icon size={14} className={c.color}/>
                </div>
                <p className={`text-xl font-black font-mono ${c.color}`}>{invLoading ? '…' : c.main}</p>
                <p className="text-[8px] text-zinc-600 font-mono mt-0.5">{c.sub}</p>
                {(c as any).cta && (
                  <button onClick={() => setShowWithdraw(!showWithdraw)} disabled={!kycOk}
                    className={`mt-3 w-full py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${kycOk ? 'bg-white text-black hover:bg-teal-500' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
                    <ArrowUpRight size={10}/> {kycOk ? 'Withdraw Returns' : 'KYC Required'}
                  </button>
                )}
              </div>
            );
          })}
        </section>

        {/* ── withdrawal success banner ─────────────────────────────────── */}
        {withdrawSuccess && (
          <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-teal-500"/>
              <p className="text-teal-400 text-sm font-bold">Withdrawal request submitted. Processing 1–3 business days via Paystack Transfer.</p>
            </div>
            <button onClick={() => setWithdrawSuccess(false)}><X size={16} className="text-zinc-500 hover:text-white"/></button>
          </div>
        )}

        {/* ── withdrawal form ──────────────────────────────────────────── */}
        {showWithdraw && kycOk && (
          <section className="p-6 rounded-2xl border border-teal-500/30 bg-teal-500/5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <Wallet size={15} className="text-teal-500"/> Withdraw Realized Returns
              </h2>
              <button onClick={() => setShowWithdraw(false)} className="text-zinc-500 hover:text-white"><X size={16}/></button>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-2 text-xs">
              <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5"/>
              <p className="text-zinc-400 leading-relaxed">
                Only <strong className="text-white">realized returns (12% p.a.)</strong> are available. Principal stays locked in escrow until project tenure ends. Paystack Transfer handles disbursement in NGN. Processing: 1–3 business days.
              </p>
            </div>
            <form onSubmit={handleWithdraw} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'bank_name',       label: 'Bank Name',       ph: 'e.g. Access Bank', type: 'text' },
                { key: 'account_number',  label: 'Account Number',  ph: '10-digit NUBAN',   type: 'text', mono: true },
                { key: 'account_name',    label: 'Account Name',    ph: 'As registered',    type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1.5">{f.label} *</label>
                  <input required type={f.type} value={(bankForm as any)[f.key]}
                    onChange={e => setBankForm({...bankForm, [f.key]: e.target.value})}
                    placeholder={f.ph}
                    className={`w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors ${f.mono ? 'font-mono' : ''}`}/>
                </div>
              ))}
              <div className="md:col-span-3 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Withdrawal Amount</span>
                  <span className="font-mono text-teal-500 text-xl font-bold">₦{earnedNgn.toLocaleString(undefined,{maximumFractionDigits:0})}</span>
                </div>
                <button type="submit" disabled={withdrawing}
                  className="w-full py-4 bg-teal-500 text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {withdrawing ? <Loader2 className="animate-spin" size={15}/> : <><ArrowUpRight size={13}/> Submit Withdrawal Request</>}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── active positions ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Active Positions</h2>
            <Link href="/investments" className="text-[9px] text-teal-500 font-bold uppercase tracking-widest hover:underline">+ Fund New Node</Link>
          </div>

          {invLoading && <div className="py-12 text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={22}/></div>}

          {!invLoading && investments.length === 0 && (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl">
              <TrendingUp className="mx-auto text-zinc-700 mb-3" size={28}/>
              <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">No active positions</p>
              <p className="text-zinc-700 text-[10px] mt-2 mb-5">Fund a project to start earning infrastructure returns.</p>
              <Link href="/investments" className="px-6 py-3 bg-teal-500 text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-teal-400 transition-all">Browse Investment Nodes</Link>
            </div>
          )}

          {investments.map((inv: any) => {
            const proj = projectMap[inv.project_id];
            const principalUsd = Number(inv.amount);
            const principalNgn = principalUsd * NGN_RATE;
            const yieldUsd     = principalUsd * ANNUAL_RETURN;
            const yieldNgn     = principalNgn * ANNUAL_RETURN;
            const { elapsed, left, pct } = tenure(inv);

            return (
              <div key={inv.id} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all">
                {/* top row */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-5 mb-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold uppercase tracking-tight text-sm">
                        {proj?.title ?? ('Position ' + inv.id.slice(0,8))}
                      </h3>
                      <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase ${
                        inv.status === 'COMMITTED' ? 'border-teal-500/40 text-teal-500' : 'border-zinc-700 text-zinc-500'
                      }`}>{inv.status}</span>
                    </div>
                    {proj && <p className="text-zinc-500 text-xs">{proj.location}, {proj.country} · {proj.category}</p>}
                    <p className="text-zinc-600 text-[9px] font-mono mt-1">Committed {new Date(inv.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* metric tiles */}
                  <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                    {[
                      { label: 'Principal',   v1: format(principalUsd), v2: `₦${principalNgn.toLocaleString(undefined,{maximumFractionDigits:0})}`, color: 'text-white' },
                      { label: 'Est. Yield',  v1: `+${format(yieldUsd)}`, v2: `+₦${yieldNgn.toLocaleString(undefined,{maximumFractionDigits:0})}`, color: 'text-teal-400' },
                      { label: 'Tenure Left', v1: `${left}mo`, v2: `of ${TENURE_MONTHS}mo`, color: 'text-amber-400' },
                    ].map(m => (
                      <div key={m.label} className="text-center p-3 rounded-xl bg-zinc-900 border border-zinc-800 min-w-[84px]">
                        <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest mb-1">{m.label}</p>
                        <p className={`font-mono text-sm font-bold ${m.color}`}>{m.v1}</p>
                        <p className="text-[7px] text-zinc-600 font-mono">{m.v2}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* tenure bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-500">Investment Tenure</span>
                    <span className="text-teal-500">{pct}% · {elapsed}mo elapsed</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all" style={{width:`${pct}%`}}/>
                  </div>
                </div>

                {/* footer row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-[9px] text-teal-500 font-bold"><ShieldCheck size={10}/> Tri-Layer Escrow Active</span>
                  <div className="h-3 w-px bg-zinc-800"/>
                  <span className="flex items-center gap-1.5 text-[9px] text-zinc-500"><Lock size={9}/> Principal locked until tenure end</span>
                  <div className="ml-auto flex items-center gap-2">
                    {proj && (
                      <Link href={`/projects/${inv.project_id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white font-bold rounded-lg text-[9px] uppercase tracking-widest transition-all">
                        <Eye size={10}/> View Pitch
                      </Link>
                    )}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-teal-500 font-bold rounded-lg text-[9px] uppercase tracking-widest transition-all">
                      <Download size={10}/> Statement
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── payment history ─────────────────────────────────────────────── */}
        {payHistory.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Payment History</h2>
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
              <div className="grid grid-cols-5 gap-3 p-3 bg-zinc-900/50 border-b border-zinc-800">
                {['Date','Project','Amount','Channel','Status'].map(h => (
                  <span key={h} className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-zinc-800/50">
                {payHistory.slice(0,20).map(tx => (
                  <div key={tx.id} className="grid grid-cols-5 gap-3 p-3 font-mono text-[10px] hover:bg-zinc-900/20 transition-colors">
                    <span className="text-zinc-500">{new Date(tx.paid_at || tx.created_at).toLocaleDateString()}</span>
                    <span className="text-zinc-300 truncate">{tx.project_title ?? tx.project_id?.slice(0,10)+'…'}</span>
                    <span className="text-white font-bold">₦{Number(tx.amount_ngn).toLocaleString()}</span>
                    <span className="text-zinc-400 uppercase">{tx.channel ?? 'Card'}</span>
                    <span className={`font-bold uppercase ${tx.status==='SUCCESS'?'text-teal-500':tx.status==='PENDING'?'text-amber-400':'text-red-400'}`}>{tx.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── quick actions ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/investments" className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-teal-500/50 transition-all">
            <CreditCard className="text-teal-500 flex-shrink-0" size={20}/>
            <div><p className="font-bold text-sm uppercase tracking-tight">Fund New Project</p><p className="text-zinc-500 text-xs mt-0.5">Browse live infrastructure nodes</p></div>
          </Link>
          <Link href="/kyc" className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${kycOk ? 'border-teal-500/30 bg-teal-500/5' : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'}`}>
            <ShieldCheck className={kycOk ? 'text-teal-500 flex-shrink-0' : 'text-amber-400 flex-shrink-0'} size={20}/>
            <div><p className="font-bold text-sm uppercase tracking-tight">KYC Verification</p><p className={`text-xs mt-0.5 ${kycOk ? 'text-teal-500' : 'text-zinc-500'}`}>{kycOk ? 'Verified ✓ — Withdrawals Unlocked' : 'Required for withdrawals'}</p></div>
          </Link>
          <Link href="/ledger" className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-teal-500/50 transition-all">
            <FileText className="text-teal-500 flex-shrink-0" size={20}/>
            <div><p className="font-bold text-sm uppercase tracking-tight">Transaction Ledger</p><p className="text-zinc-500 text-xs mt-0.5">Immutable record of all events</p></div>
          </Link>
        </section>
      </main>
      <Footer/>
    </div>
  );
}
