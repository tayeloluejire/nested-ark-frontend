'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import {
  TrendingUp, DollarSign, Zap, ShieldCheck, Package, Megaphone,
  RefreshCw, Wifi, BarChart3, Activity, ArrowUpRight, ArrowDownRight,
  Clock, Hash, Globe, ChevronRight, Loader2, AlertCircle, Settings,
  Building2, FileText, CircleDollarSign
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface RevenueStream { source: string; total: number; count: number; avg_per_event: number; }
interface DailyPoint   { day: string; revenue: number; events: number; }
interface TopProject   { project_id: string; title: string; country: string; project_number: string; project_revenue: number; events: number; }
interface RecentEvent  { id: string; source: string; amount_usd: number; project_title: string; project_number: string; created_at: string; pct_applied: number; gross_amount: number; metadata: any; }
interface RevenueData {
  total_all_time: number; total_period: number; total_events: number;
  gross_infrastructure_volume: number;
  streams: { escrow_fees: number; listing_fees: number; investment_fees: number; supply_commissions: number; ad_revenue: number; vaas_subscriptions: number; };
  by_source: RevenueStream[];
  daily_trend: DailyPoint[];
  top_projects: TopProject[];
  recent_events: RecentEvent[];
}

type Range = '7d' | '30d' | '90d' | 'all';

// ── Constants ─────────────────────────────────────────────────────────────────
const STREAM_META: Record<string, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  ESCROW_FEE:        { label: 'Escrow Service Fee',      icon: ShieldCheck,       color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   desc: '2% on every milestone payout' },
  LISTING_FEE:       { label: 'Project Listing Fee',      icon: FileText,          color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  desc: '$49 flat per NAP ID generated' },
  INVESTMENT_FEE:    { label: 'Investment Placement Fee', icon: TrendingUp,        color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',desc: '0.5% on each investor commitment' },
  SUPPLY_COMMISSION: { label: 'Supply Chain Commission',  icon: Package,           color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   desc: '3% rebate on material dispatches' },
  AD_REVENUE:        { label: 'Ad / Ticker Revenue',      icon: Megaphone,         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', desc: 'CPM/CPA on market ticker placements' },
  VAAS_SUBSCRIPTION: { label: 'VaaS Subscription',        icon: Zap,               color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   desc: 'Verification-as-a-Service subscriptions' },
};

const RANGE_LABELS: Record<Range, string> = { '7d': '7 Days', '30d': '30 Days', '90d': '90 Days', 'all': 'All Time' };

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt   = (n: number, d = 2) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const fmtM  = (n: number)        => `$${(Number(n || 0) / 1_000_000).toFixed(2)}M`;
const fmtK  = (n: number)        => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n);
const pct   = (part: number, total: number) => total ? ((part / total) * 100).toFixed(1) : '0.0';
const relTime = (iso: string)    => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)   return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000)return `${Math.floor(diff / 3600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
};

// ── Mini sparkline using SVG ──────────────────────────────────────────────────
function Sparkline({ data, color = '#14b8a6', height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data, 0.01);
  const W = 120; const H = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * W} cy={H - (data[data.length - 1] / max) * H} r="2.5" fill={color} />
    </svg>
  );
}

// ── Revenue bar chart (daily trend) ──────────────────────────────────────────
function DailyChart({ data }: { data: DailyPoint[] }) {
  if (!data.length) return <div className="h-32 flex items-center justify-center text-zinc-700 text-xs">No data yet for this period</div>;
  const max = Math.max(...data.map(d => d.revenue), 0.01);
  const last7 = data.slice(-30); // show max 30 bars
  return (
    <div className="flex items-end gap-0.5 h-32 w-full">
      {last7.map((d, i) => {
        const h = Math.max((d.revenue / max) * 100, d.revenue > 0 ? 4 : 0);
        const isLast = i === last7.length - 1;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative" title={`${new Date(d.day).toLocaleDateString()} — ${fmt(d.revenue)} (${d.events} events)`}>
            <div
              className={`w-full rounded-t transition-all ${isLast ? 'bg-teal-500' : 'bg-teal-500/30 group-hover:bg-teal-500/60'}`}
              style={{ height: `${h}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-[8px] whitespace-nowrap">
                <p className="text-teal-400 font-bold">{fmt(d.revenue)}</p>
                <p className="text-zinc-500">{d.events} event{d.events !== 1 ? 's' : ''}</p>
                <p className="text-zinc-600">{new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function RevenueDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [data,      setData]      = useState<RevenueData | null>(null);
  const [range,     setRange]     = useState<Range>('30d');
  const [loading,   setLoading]   = useState(true);
  const [lastSync,  setLastSync]  = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    if (!authLoading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, authLoading, router]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/api/admin/revenue?range=${range}`);
      setData(res.data.revenue);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Revenue load failed', e);
    } finally { if (!silent) setLoading(false); }
  }, [range]);

  // Initial load + range change
  useEffect(() => { if (user?.role === 'ADMIN') load(); }, [user, load]);

  // Auto-refresh every 30 seconds
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

  const sparkData = data?.daily_trend.map(d => d.revenue) ?? [];
  const GIV       = data?.gross_infrastructure_volume ?? 0;
  const totalAT   = data?.total_all_time ?? 0;
  const takeRate  = GIV > 0 ? ((totalAT / GIV) * 100).toFixed(3) : '—';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      {/* Live pulse bar */}
      <div className="border-b border-zinc-800 bg-black px-6 py-2 flex items-center gap-5 text-[9px] font-mono uppercase tracking-widest overflow-x-auto">
        <span className="flex items-center gap-1.5 text-teal-500 flex-shrink-0"><Wifi size={8} className="animate-pulse" /> Revenue Engine</span>
        {lastSync && <span className="text-zinc-600 flex-shrink-0">Synced {lastSync}</span>}
        <button onClick={() => setAutoRefresh(v => !v)}
          className={`flex items-center gap-1 flex-shrink-0 transition-colors ${autoRefresh ? 'text-teal-500' : 'text-zinc-600 hover:text-white'}`}>
          <Activity size={8} /> {autoRefresh ? 'Live' : 'Paused'}
        </button>
        <span className="text-zinc-700 flex-shrink-0">·</span>
        <span className="text-zinc-500 flex-shrink-0">Escrow 2% · Listing $49 · Investment 0.5% · Supply 3%</span>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8">

        {/* Header */}
        <header className="border-l-2 border-teal-500 pl-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[9px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-1">Admin Command Center</p>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Revenue Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Multi-stream income · Real-time fee capture · Immutable audit trail</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Range selector */}
            <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
              {(Object.keys(RANGE_LABELS) as Range[]).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                    range === r ? 'bg-teal-500 text-black' : 'text-zinc-500 hover:text-white'
                  }`}>
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>
            <button onClick={() => load(false)} disabled={loading}
              className="p-2 border border-zinc-800 rounded-xl text-zinc-500 hover:text-teal-500 hover:border-teal-500/40 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Loading state */}
        {loading && !data && (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={32} />
            <p className="text-zinc-500 text-sm">Loading revenue data…</p>
          </div>
        )}

        {data && (
          <>
            {/* ── KPI Strip ─────────────────────────────────────────────────── */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: `Revenue (${RANGE_LABELS[range]})`,
                  value: fmtK(data.total_period),
                  sub:   `${data.total_events} events`,
                  icon:  DollarSign,
                  color: 'text-teal-400',
                  spark: sparkData,
                  sparkColor: '#14b8a6',
                },
                {
                  label: 'All-Time Revenue',
                  value: fmtK(data.total_all_time),
                  sub:   `Platform take rate ${takeRate}%`,
                  icon:  TrendingUp,
                  color: 'text-emerald-400',
                  spark: [],
                  sparkColor: '#10b981',
                },
                {
                  label: 'Gross Infrastructure Volume',
                  value: fmtM(GIV),
                  sub:   'Total active project budgets',
                  icon:  Building2,
                  color: 'text-white',
                  spark: [],
                  sparkColor: '#ffffff',
                },
                {
                  label: `Escrow Fees (${RANGE_LABELS[range]})`,
                  value: fmtK(data.streams.escrow_fees),
                  sub:   '2% on milestone payouts',
                  icon:  ShieldCheck,
                  color: 'text-teal-400',
                  spark: [],
                  sparkColor: '#14b8a6',
                },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest leading-tight">{card.label}</p>
                      <Icon size={13} className={card.color} />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <p className={`text-2xl font-black font-mono ${card.color}`}>{card.value}</p>
                      {card.spark.length > 1 && <Sparkline data={card.spark} color={card.sparkColor} height={32} />}
                    </div>
                    <p className="text-[9px] text-zinc-600">{card.sub}</p>
                  </div>
                );
              })}
            </section>

            {/* ── Revenue Streams ────────────────────────────────────────────── */}
            <section className="space-y-3">
              <h2 className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-2">
                <BarChart3 size={12} className="text-teal-500" /> Revenue Streams — {RANGE_LABELS[range]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(data.streams).map(([key, val]) => {
                  const sourceKey = key.replace('_fees', '_FEE').replace('_commissions', '_COMMISSION').replace('_revenue', '_REVENUE').replace('_subscriptions', '_SUBSCRIPTION').toUpperCase()
                    .replace('ESCROW_FEE', 'ESCROW_FEE')
                    .replace('LISTING_FEE', 'LISTING_FEE')
                    .replace('INVESTMENT_FEE', 'INVESTMENT_FEE')
                    .replace('SUPPLY_COMMISSION', 'SUPPLY_COMMISSION')
                    .replace('AD_REVENUE', 'AD_REVENUE')
                    .replace('VAAS_SUBSCRIPTION', 'VAAS_SUBSCRIPTION');
                  const meta = STREAM_META[sourceKey] ?? STREAM_META['AD_REVENUE'];
                  const Icon = meta.icon;
                  const share = pct(val, data.total_period);
                  const fromSource = data.by_source.find(s => s.source === sourceKey);
                  return (
                    <div key={key} className={`p-5 rounded-2xl border ${meta.border} ${meta.bg}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${meta.border} ${meta.bg}`}>
                            <Icon size={12} className={meta.color} />
                          </div>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${meta.color}`}>{meta.label}</p>
                            <p className="text-[8px] text-zinc-600 mt-0.5">{meta.desc}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-bold ${meta.color}`}>{share}%</span>
                      </div>
                      <p className={`text-2xl font-black font-mono ${meta.color}`}>{fmtK(val)}</p>
                      {fromSource && (
                        <div className="flex items-center gap-3 mt-2 text-[8px] text-zinc-600">
                          <span>{fromSource.count} events</span>
                          <span>·</span>
                          <span>avg {fmtK(fromSource.avg_per_event)}/event</span>
                        </div>
                      )}
                      {/* Share bar */}
                      <div className="mt-3 h-1 w-full bg-zinc-800/60 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${meta.color.replace('text-', 'bg-')}`}
                          style={{ width: `${Math.min(parseFloat(share), 100)}%`, opacity: 0.7 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Daily Trend Chart ──────────────────────────────────────────── */}
            <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-teal-500" /> Daily Revenue — {RANGE_LABELS[range]}
                </h2>
                <div className="flex items-center gap-2 text-[8px] text-zinc-600">
                  <div className="w-3 h-0.5 bg-teal-500" /> Revenue
                </div>
              </div>
              <DailyChart data={data.daily_trend} />
              {/* X-axis labels — first and last */}
              {data.daily_trend.length > 1 && (
                <div className="flex justify-between text-[8px] text-zinc-700 font-mono">
                  <span>{new Date(data.daily_trend[0].day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(data.daily_trend[data.daily_trend.length - 1].day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </section>

            {/* ── Top Projects + Recent Events ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top Projects */}
              <section className="space-y-3">
                <h2 className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-2">
                  <Globe size={12} className="text-teal-500" /> Top Revenue Projects
                </h2>
                {data.top_projects.length === 0 && (
                  <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-700 text-xs">
                    No project revenue recorded yet
                  </div>
                )}
                {data.top_projects.map((p, i) => (
                  <div key={p.project_id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <span className="text-[8px] font-black text-teal-500">#{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-tight truncate">{p.title ?? 'Unnamed Project'}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[8px] text-zinc-600">
                        <span className="font-mono text-teal-500/70">{p.project_number}</span>
                        {p.country && <span>· {p.country}</span>}
                        <span>· {p.events} event{p.events !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-sm text-teal-400">{fmtK(p.project_revenue)}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Recent Events */}
              <section className="space-y-3">
                <h2 className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-2">
                  <Clock size={12} className="text-teal-500" /> Recent Revenue Events
                </h2>
                <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                  {data.recent_events.length === 0 && (
                    <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-700 text-xs">
                      No revenue events yet. Fees will appear here in real-time.
                    </div>
                  )}
                  {data.recent_events.map(ev => {
                    const meta = STREAM_META[ev.source] ?? STREAM_META['AD_REVENUE'];
                    const Icon = meta.icon;
                    return (
                      <div key={ev.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800/60 bg-zinc-900/10 hover:bg-zinc-900/30 transition-all">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${meta.bg} border ${meta.border}`}>
                          <Icon size={10} className={meta.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-[9px] font-black uppercase tracking-wider ${meta.color}`}>{meta.label}</p>
                          </div>
                          <p className="text-[8px] text-zinc-600 truncate mt-0.5">
                            {ev.project_title ?? 'Platform'} {ev.project_number ? `· ${ev.project_number}` : ''}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono font-bold text-xs text-white">{fmt(ev.amount_usd, 4)}</p>
                          <p className="text-[8px] text-zinc-600">{relTime(ev.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* ── Fee Configuration Panel ────────────────────────────────────── */}
            <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 space-y-4">
              <h2 className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-2">
                <Settings size={12} className="text-teal-500" /> Current Fee Configuration
                <span className="text-[7px] text-zinc-600 normal-case font-normal ml-2">Set via Render environment variables</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { var: 'PLATFORM_FEE_PCT',      label: 'Escrow Fee',          val: '2.0%',  desc: 'On milestone payouts' },
                  { var: 'INVESTMENT_FEE_PCT',     label: 'Investment Fee',      val: '0.5%',  desc: 'On each fund commitment' },
                  { var: 'SUPPLY_COMMISSION_PCT',  label: 'Supply Commission',   val: '3.0%',  desc: 'On material dispatches' },
                  { var: 'LISTING_FEE_USD',        label: 'Listing Fee',         val: '$49',   desc: 'Flat per NAP ID' },
                ].map(c => (
                  <div key={c.var} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                    <p className="text-[8px] text-zinc-600 font-mono mb-1">{c.var}</p>
                    <p className="text-xl font-black text-white font-mono">{c.val}</p>
                    <p className="text-[8px] text-zinc-500 mt-1 font-bold uppercase tracking-wider">{c.label}</p>
                    <p className="text-[7px] text-zinc-700 mt-0.5">{c.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-[9px] text-zinc-500">
                <AlertCircle size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                To change rates: Render → Your Service → Environment → Edit variables → Redeploy. Changes take effect instantly on next transaction.
              </div>
            </section>

            {/* ── Quick Actions ──────────────────────────────────────────────── */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'View Ledger',       href: '/ledger',          icon: Hash,              desc: 'All immutable events' },
                { label: 'Approval Queue',    href: '/admin/approval',  icon: ShieldCheck,       desc: 'Pending verifications' },
                { label: 'User Management',   href: '/admin/users',     icon: Activity,          desc: 'Roles & access' },
                { label: 'Project Overview',  href: '/admin/projects',  icon: Building2,         desc: 'All marketplace listings' },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href}
                    className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/10 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all group">
                    <Icon size={14} className="text-teal-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest group-hover:text-teal-500 transition-colors">{a.label}</p>
                      <p className="text-[8px] text-zinc-600">{a.desc}</p>
                    </div>
                    <ChevronRight size={11} className="text-zinc-700 ml-auto group-hover:text-teal-500 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
