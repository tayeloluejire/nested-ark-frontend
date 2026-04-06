'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import {
  TrendingUp, DollarSign, Zap, ShieldCheck, Package,
  RefreshCw, Wifi, BarChart3, Activity, ArrowUpRight,
  Clock, Globe, Loader2, AlertCircle, Building2, CircleDollarSign
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface PortfolioSummary {
  total_invested_ngn:        number;
  estimated_earnings_ngn:    number;
  available_to_withdraw_ngn: number;
  escrow_held_ngn:           number;
  portfolio_value_ngn:       number;
  active_positions:          number;
  roi_rate:                  number;
  milestones_paid:           number;
  kyc_status:                string;
}

interface Investment {
  id: string; project_id: string; project_title: string; amount: number;
  status: string; created_at: string;
}

interface Payment {
  id: string; paystack_reference: string; amount_ngn: number; amount_usd: number;
  status: string; channel: string; project_title: string; country: string;
  paid_at: string; created_at: string;
}

// ── Formatters ─────────────────────────────────────────────────────────────────
function fmtNgn(raw: any): string {
  const n = Number(raw);
  if (!Number.isFinite(n) || isNaN(n)) return '₦0';
  if (n === 0) return '₦0';
  if (n > 0 && n < 100) return `₦${n.toFixed(2)}`;   // show cents for tiny accruals
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(1)}k`;
  return `₦${Math.round(n).toLocaleString()}`;
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)    return `${Math.floor(diff / 1_000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

// ── ROI Calculator ─────────────────────────────────────────────────────────────
function RoiCalc({ roiRate }: { roiRate: number }) {
  const [amount, setAmount] = useState(50000);
  const yield6m = amount * (roiRate / 100) * 0.5;
  const yieldAnn = amount * (roiRate / 100);

  return (
    <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
      <h3 className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-2">
        <BarChart3 size={12} className="text-teal-500" /> ROI Calculator
        <span className="ml-auto text-teal-500 font-mono">{roiRate}% p.a.</span>
      </h3>
      <div>
        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-2">
          Investment Amount (NGN)
        </label>
        <input
          type="range" min={5000} max={5_000_000} step={5000}
          value={amount} onChange={e => setAmount(Number(e.target.value))}
          className="w-full accent-teal-500"
        />
        <div className="flex justify-between text-[9px] text-zinc-700 mt-1">
          <span>₦5,000</span>
          <span className="text-white font-mono font-bold">{fmtNgn(amount)}</span>
          <span>₦5,000,000</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 text-center">
          <p className="text-[8px] text-zinc-500 uppercase font-bold">6-month Yield</p>
          <p className="text-teal-400 font-mono font-black text-lg mt-1">+{fmtNgn(yield6m)}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
          <p className="text-[8px] text-zinc-500 uppercase font-bold">Annual ROI</p>
          <p className="text-emerald-400 font-mono font-black text-lg mt-1">+{roiRate}% Est.</p>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { format } = useCurrency();

  const [summary,     setSummary]     = useState<PortfolioSummary | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payments,    setPayments]    = useState<Payment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [lastSync,    setLastSync]    = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    if (!authLoading && user && !['INVESTOR', 'ADMIN', 'DEVELOPER'].includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [sumRes, invRes, payRes] = await Promise.all([
        api.get('/api/portfolio/summary'),
        api.get('/api/investments/my'),
        api.get('/api/payments/history'),
      ]);
      setSummary(sumRes.data.summary);
      setInvestments(invRes.data.investments ?? []);
      setPayments(payRes.data.transactions ?? []);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Portfolio load failed', e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  useEffect(() => {
    if (!autoRefresh) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => load(true), 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh, load]);

  if (authLoading || !user) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  const roi  = summary?.roi_rate ?? 12;
  const kycOk = summary?.kyc_status === 'VERIFIED';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      {/* Live pulse bar */}
      <div className="border-b border-zinc-800 bg-black px-6 py-2 flex items-center gap-5 text-[9px] font-mono uppercase tracking-widest overflow-x-auto">
        <span className="flex items-center gap-1.5 text-teal-500 flex-shrink-0">
          <Wifi size={8} className="animate-pulse" /> Portfolio Live
        </span>
        {lastSync && <span className="text-zinc-600 flex-shrink-0">Synced {lastSync}</span>}
        <button
          onClick={() => setAutoRefresh(v => !v)}
          className={`flex items-center gap-1 flex-shrink-0 transition-colors ${autoRefresh ? 'text-teal-500' : 'text-zinc-600 hover:text-white'}`}
        >
          <Activity size={8} /> {autoRefresh ? 'Live' : 'Paused'}
        </button>
        <span className="text-zinc-700 flex-shrink-0">·</span>
        <span className="text-zinc-500 flex-shrink-0">{summary?.active_positions ?? 0} positions</span>
        {summary && (
          <span className={`flex-shrink-0 font-bold ${kycOk ? 'text-teal-500' : 'text-amber-400'}`}>
            KYC: {summary.kyc_status}
            {!kycOk && (
              <Link href="/kyc" className="ml-2 underline text-amber-400 hover:text-white">
                Verify →
              </Link>
            )}
          </span>
        )}
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8">

        {/* Header */}
        <header className="border-l-2 border-teal-500 pl-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[9px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-1">Investor Command</p>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">My Portfolio</h1>
            <p className="text-zinc-500 text-sm mt-1">Welcome, {user.full_name?.split(' ')[0] ?? 'Investor'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(v => !v)}
              className={`p-2 border rounded-xl transition-all ${autoRefresh ? 'border-teal-500/40 text-teal-500' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
            >
              <Activity size={14} />
            </button>
            <button
              onClick={() => load(false)} disabled={loading}
              className="p-2 border border-zinc-800 rounded-xl text-zinc-500 hover:text-teal-500 hover:border-teal-500/40 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {loading && !summary && (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={32} />
            <p className="text-zinc-500 text-sm">Loading portfolio…</p>
          </div>
        )}

        {summary && (
          <>
            {/* ── KPI Cards ──────────────────────────────────────────────── */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Portfolio Value',
                  value: fmtNgn(summary.portfolio_value_ngn),
                  sub:   'Escrow secured',
                  icon:  DollarSign,
                  color: 'text-teal-400',
                },
                {
                  label: `Realized Earnings (${roi}%)`,
                  value: fmtNgn(summary.estimated_earnings_ngn),
                  sub:   `Above inflation yield\n6-month accrual on committed capital`,
                  icon:  TrendingUp,
                  color: 'text-emerald-400',
                },
                {
                  label: 'Available Liquidity',
                  value: fmtNgn(summary.available_to_withdraw_ngn),
                  sub:   kycOk ? 'Ready for withdrawal' : 'Verify KYC first',
                  icon:  CircleDollarSign,
                  color: kycOk ? 'text-white' : 'text-amber-400',
                },
                {
                  label: 'Escrow Secured',
                  value: fmtNgn(summary.escrow_held_ngn),
                  sub:   `Tri-layer verified escrow\n${summary.milestones_paid} milestones paid out`,
                  icon:  ShieldCheck,
                  color: 'text-teal-400',
                },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest leading-tight">{card.label}</p>
                      <Icon size={13} className={card.color} />
                    </div>
                    <p className={`text-2xl font-black font-mono ${card.color}`}>{card.value}</p>
                    <p className="text-[9px] text-zinc-600 whitespace-pre-line">{card.sub}</p>
                  </div>
                );
              })}
            </section>

            {/* ── ROI Calculator ─────────────────────────────────────────── */}
            <RoiCalc roiRate={roi} />

            {/* ── Quick actions ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Fund a Project',   href: '/investments',  icon: TrendingUp,       color: 'text-teal-500'   },
                { label: 'Browse Nodes',     href: '/projects',     icon: Building2,        color: 'text-emerald-500'},
                { label: 'KYC Verification', href: '/kyc',          icon: ShieldCheck,      color: 'text-amber-400'  },
                { label: 'Global Ledger',    href: '/ledger',       icon: BarChart3,        color: 'text-purple-400' },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all text-center space-y-2">
                    <Icon size={18} className={`${a.color} mx-auto`} />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{a.label}</p>
                  </Link>
                );
              })}
            </div>

            {/* ── Active Positions ───────────────────────────────────────── */}
            <section className="space-y-3">
              <h2 className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-2">
                <Activity size={12} className="text-teal-500" /> My Active Positions ({investments.length})
              </h2>
              {investments.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center">
                  <Building2 className="text-zinc-700 mx-auto mb-3" size={32} />
                  <p className="text-zinc-500 text-sm font-bold">No active positions yet</p>
                  <p className="text-zinc-700 text-xs mt-1">Fund a project to start earning</p>
                  <Link href="/projects"
                    className="inline-block mt-4 px-6 py-2.5 bg-teal-500 text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white transition-all">
                    Browse Investment Nodes
                  </Link>
                </div>
              ) : (
                investments.map(inv => (
                  <div key={inv.id} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase truncate">{inv.project_title ?? 'Project'}</p>
                      <p className="text-[9px] text-zinc-600 mt-0.5">
                        {relTime(inv.created_at)} · {inv.status}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-teal-400">{format(Number(inv.amount))}</p>
                      <p className="text-[8px] text-emerald-400 font-bold">+{roi}% p.a.</p>
                    </div>
                    <Link href={`/projects/${inv.project_id}`}
                      className="p-2 border border-zinc-800 rounded-lg hover:border-teal-500/40 transition-all flex-shrink-0">
                      <ArrowUpRight size={12} className="text-zinc-500" />
                    </Link>
                  </div>
                ))
              )}
            </section>

            {/* ── Payment History ────────────────────────────────────────── */}
            <section className="space-y-3">
              <h2 className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-2">
                <Clock size={12} className="text-teal-500" /> Payment History
              </h2>
              {payments.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-700 text-xs">
                  No payment records yet
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 overflow-hidden">
                  <table className="w-full text-[10px]">
                    <thead className="bg-zinc-900/40 border-b border-zinc-800">
                      <tr>
                        {['Date', 'Project', 'Amount (NGN)', 'Channel', 'Status', 'Reference'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-zinc-500 uppercase font-bold tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={p.id} className={`border-b border-zinc-900 ${i % 2 === 0 ? 'bg-zinc-900/10' : ''}`}>
                          <td className="px-4 py-3 text-zinc-400 font-mono whitespace-nowrap">
                            {new Date(p.paid_at || p.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-white font-bold truncate max-w-[120px]">
                            {p.project_title ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-teal-400 font-mono font-bold">
                            {fmtNgn(p.amount_ngn)}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 uppercase">{p.channel ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              p.status === 'SUCCESS'
                                ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20'
                                : p.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-700 font-mono text-[8px] truncate max-w-[120px]">
                            {p.paystack_reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
