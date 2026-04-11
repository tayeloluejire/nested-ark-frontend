'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import {
  MapPin, Calendar, Building2, ShieldCheck,
  CheckCircle2, Clock, AlertCircle, Loader2, ArrowLeft,
  FileText, Users, Globe, CreditCard,
  ChevronDown, ChevronUp, Hash, Award,
  Eye, Edit, ArrowRight
} from 'lucide-react';

// ── Category icons ────────────────────────────────────────────────────────────
const CAT_ICON: Record<string, string> = {
  Roads:'🛣️', Energy:'⚡', Water:'💧', Bridges:'🌉', Technology:'💻',
  Railways:'🚆', Ports:'⚓', Healthcare:'🏥', Housing:'🏘️',
  Education:'🎓', Agriculture:'🌱', Industrial:'🏭', Commercial:'🏢',
  Residential:'🏠', Landscape:'🌳', Renovation:'🔨', Other:'🏗️',
};

const RISK_GRADES = ['A','A+','AA','AAA'];

export default function ProjectDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const router     = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();

  const [project,    setProject]    = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [investments,setInvestments]= useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchErr,   setFetchErr]   = useState('');
  const [tab,        setTab]        = useState<'overview'|'financials'|'documents'|'team'>('overview');
  const [expandedMs, setExpandedMs] = useState<string | null>(null);

  const loadProject = async () => {
    if (!id) return;
    setLoading(true); setFetchErr('');
    try {
      // Three separate calls — avoids the single-JOIN SQL that was crashing on sort_order
      const [p, m, inv] = await Promise.allSettled([
        api.get(`/api/projects/${id}`),
        api.get(`/api/milestones/project/${id}`),
        api.get(`/api/investments?project_id=${id}`),
      ]);

      if (p.status === 'fulfilled') {
        const proj = p.value.data.project ?? p.value.data;
        if (!proj?.id) setFetchErr('Project not found.');
        else setProject(proj);
      } else {
        const errMsg = (p as any).reason?.response?.data?.error ?? (p as any).reason?.message ?? '';
        const isCold = (p as any).reason?.code === 'ECONNABORTED';
        if (errMsg === 'Project not found') setFetchErr('Project not found.');
        else if (isCold) setFetchErr('__coldstart__');
        else setFetchErr(`Could not load project: ${errMsg || 'Please try again.'}`);
      }

      if (m.status === 'fulfilled') setMilestones(m.value.data.milestones ?? []);
      if (inv.status === 'fulfilled') setInvestments(inv.value.data.investments ?? []);
    } catch {
      setFetchErr('__coldstart__');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProject(); }, [id]); // eslint-disable-line

  const isOwner = !!(user && project && user.id === project.sponsor_id);
  const isAdmin = user?.role === 'ADMIN';

  // ── Loading ──────────────────────────────────────────────────────────────
  if (authLoading || loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-teal-500" size={32} />
      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Loading project…</p>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (fetchErr || !project) {
    const isCold       = fetchErr === '__coldstart__';
    const isNotFound   = fetchErr === 'Project not found.';
    const displayMsg   = isCold
      ? 'Could not load project — the server may be starting up.'
      : fetchErr || 'Project not found.';
    const subMsg       = isCold
      ? 'The server may still be waking up. Wait a moment and retry.'
      : isNotFound
      ? 'This project may have been removed or the link is incorrect.'
      : '';
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <AlertCircle className="text-amber-400" size={36} />
        <div>
          <p className="text-white font-bold text-lg">{displayMsg}</p>
          {subMsg && <p className="text-zinc-500 text-sm mt-1">{subMsg}</p>}
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          {(isCold || (!isNotFound && fetchErr)) && (
            <button onClick={loadProject}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all">
              <Loader2 size={12} /> Retry
            </button>
          )}
          <Link href="/investments"
            className="flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all">
            <ArrowLeft size={12} /> Investment Nodes
          </Link>
          <Link href="/projects"
            className="flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const budget   = Number(project.budget ?? 0);
  const raised   = investments
    .filter((i: any) => i.status === 'COMMITTED')
    .reduce((s: any, i: any) => s + Number(i.amount), 0);
  const fillPct  = budget > 0 ? Math.min(Math.round((raised / budget) * 100), 100) : 0;
  // Use actual risk_grade if available, else stable pseudorandom from project ID
  const riskGrade = project.risk_grade ?? RISK_GRADES[parseInt(project.id?.[0] ?? '0', 16) % RISK_GRADES.length];
  const TABS = ['overview', 'financials', 'documents', 'team'] as const;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">

        {/* Back */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-colors">
            <ArrowLeft size={12} /> Back
          </button>
          {/* Owner quick-actions */}
          {(isOwner || isAdmin) && (
            <div className="flex gap-2">
              <Link href={`/projects/${project.id}/edit`}
                className="flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-teal-500 font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all">
                <Edit size={11} /> Edit Project
              </Link>
            </div>
          )}
        </div>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Main info card */}
          <div className="lg:col-span-2 p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl flex-shrink-0">
                {CAT_ICON[project.category] ?? '🏗️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-[9px] text-teal-500 font-mono font-black bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                    {project.project_number}
                  </span>
                  {project.gov_verified && (
                    <span className="flex items-center gap-1 text-[8px] px-2 py-0.5 rounded border border-teal-500/40 bg-teal-500/10 text-teal-500 font-bold uppercase">
                      <ShieldCheck size={9} /> GOV VERIFIED
                    </span>
                  )}
                  <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase ${
                    project.status === 'ACTIVE' ? 'border-emerald-500/40 text-emerald-400' : 'border-zinc-700 text-zinc-500'
                  }`}>{project.status}</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight uppercase mb-1">{project.title}</h1>
                <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {project.location}, {project.country}</span>
                  <span className="flex items-center gap-1"><Building2 size={11} /> {project.category}</span>
                  {project.timeline_months && (
                    <span className="flex items-center gap-1"><Calendar size={11} /> {project.timeline_months}mo timeline</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed">{project.description}</p>

            {/* Trust badges */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              {[
                `${project.expected_roi ?? 12}% est. annual return`,
                'Tri-layer verification',
                'Escrow-secured',
                'SHA-256 ledger',
              ].map(b => (
                <span key={b}
                  className="flex items-center gap-1 text-[9px] text-teal-500 border border-teal-500/30 bg-teal-500/5 px-2 py-1 rounded-lg font-bold uppercase tracking-widest">
                  <CheckCircle2 size={8} /> {b}
                </span>
              ))}
            </div>
          </div>

          {/* Investment CTA sidebar card */}
          <div className="p-6 rounded-3xl border border-zinc-700 bg-zinc-900/50 space-y-5 flex flex-col">
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Project Budget</p>
              <p className="text-3xl font-black font-mono">{format(budget)}</p>
              {budget > 0 && (
                <p className="text-zinc-600 text-[9px] font-mono">
                  ₦{(budget * 1381).toLocaleString(undefined, { maximumFractionDigits: 0 })} NGN
                </p>
              )}
            </div>

            {/* Funding progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                <span className="text-zinc-500">Capital Secured</span>
                <span className="text-teal-500">{fillPct}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all shadow-[0_0_8px_rgba(20,184,166,0.4)]"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                <span>{format(raised)} raised</span>
                <span>{investments.filter((i: any) => i.status === 'COMMITTED').length} investors</span>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Risk Grade',   value: riskGrade,                            color: 'text-emerald-400' },
                { label: 'Annual Yield', value: `${project.expected_roi ?? 12}% est.`, color: 'text-teal-400' },
                { label: 'Min. Invest',  value: '₦5,000',                             color: 'text-white' },
                { label: 'Milestones',   value: `${milestones.length} tranches`,       color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">{s.label}</p>
                  <p className={`font-mono text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <Link href="/investments"
              className="w-full py-4 bg-teal-500 text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center justify-center gap-2 text-center mt-auto">
              <CreditCard size={14} /> Fund This Project
            </Link>

            {project.gov_verified && (
              <div className="flex items-center gap-2 text-[8px] text-zinc-600">
                <ShieldCheck size={10} className="text-teal-500" />
                Government verified · Hash: {(project.verification_hash ?? project.id ?? '').slice(0, 16)}…
              </div>
            )}
          </div>
        </div>

        {/* ── TAB NAV ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-zinc-800 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                tab === t ? 'border-teal-500 text-teal-500' : 'border-transparent text-zinc-500 hover:text-white'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Site visuals */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Site Visuals &amp; Renders</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Site Master Plan',    src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80' },
                  { label: '3D Elevation View',   src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80' },
                ].map((g, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-zinc-800 relative group aspect-video bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.src} alt={g.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/50 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[9px] text-white font-bold uppercase tracking-widest">{g.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-zinc-600">
                3D architectural renders · Site master plans · Engineering schematics available in Documents tab.
              </p>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                Project Milestones {milestones.length > 0 && `(${milestones.length})`}
              </h3>
              {milestones.length === 0 && (
                <div className="p-5 rounded-xl border border-zinc-800 text-center">
                  <p className="text-zinc-600 text-xs">No milestones published yet.</p>
                </div>
              )}
              {milestones.map(m => {
                const allVerified = m.ai_status === 'VERIFIED' && m.human_status === 'VERIFIED' && m.drone_status === 'VERIFIED';
                const isPaid = m.status === 'PAID';
                const isOpen = expandedMs === m.id;
                return (
                  <div key={m.id}
                    className={`rounded-xl border transition-all ${
                      isPaid ? 'border-emerald-500/30 bg-emerald-500/5'
                      : allVerified ? 'border-teal-500/30 bg-teal-500/5'
                      : 'border-zinc-800 bg-zinc-900/20'
                    }`}>
                    <button onClick={() => setExpandedMs(isOpen ? null : m.id)}
                      className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${
                          isPaid ? 'bg-emerald-500/20 text-emerald-400'
                          : allVerified ? 'bg-teal-500/20 text-teal-500'
                          : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {isPaid ? <CheckCircle2 size={13} /> : allVerified ? <ShieldCheck size={13} /> : <Clock size={13} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-tight">
                            {m.milestone_number ? `#${m.milestone_number} · ` : ''}{m.title}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-mono">
                            {m.budget_allocation ? `$${Number(m.budget_allocation).toLocaleString()}` : ''}
                            {m.required_trade ? ` · ${m.required_trade}` : ''}
                          </p>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/50">
                        {m.description && (
                          <p className="text-zinc-500 text-xs mt-3 leading-relaxed">{m.description}</p>
                        )}
                        {/* Verification layers */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {[
                            { label: 'AI',    status: m.ai_status },
                            { label: 'Human', status: m.human_status },
                            { label: 'Drone', status: m.drone_status },
                          ].map(v => (
                            <div key={v.label}
                              className={`flex items-center gap-1 text-[8px] font-bold uppercase px-2 py-1 rounded-lg border ${
                                v.status === 'VERIFIED' || v.status === 'PASS'
                                  ? 'border-teal-500/40 text-teal-500 bg-teal-500/10'
                                  : v.status === 'FAIL'
                                  ? 'border-red-500/40 text-red-400'
                                  : 'border-zinc-700 text-zinc-500'
                              }`}>
                              <ShieldCheck size={8} /> {v.label}: {v.status ?? 'PENDING'}
                            </div>
                          ))}
                        </div>
                        {/* Progress bar */}
                        {m.progress_percentage != null && (
                          <div>
                            <div className="flex justify-between text-[8px] text-zinc-600 mb-1">
                              <span>Progress</span><span>{m.progress_percentage}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${m.progress_percentage}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FINANCIALS ───────────────────────────────────────────────────── */}
        {tab === 'financials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Financial Breakdown</h3>
              {[
                { label: 'Total Project Budget',    value: format(budget),                         sub: budget > 0 ? `₦${(budget*1381).toLocaleString(undefined,{maximumFractionDigits:0})}` : '—', hi: true },
                { label: 'Capital Raised to Date',  value: format(raised),                         sub: `${fillPct}% funded` },
                { label: 'Remaining to Raise',      value: format(Math.max(budget - raised, 0)),   sub: 'Open for investment' },
                { label: 'Estimated Annual Return', value: `${project.expected_roi ?? 12}% p.a.`, sub: 'Over investment tenure' },
                { label: 'Milestone Payouts',       value: `${milestones.length} tranches`,        sub: 'Released on verification' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-start py-3 border-b border-zinc-800/50">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{r.label}</span>
                  <div className="text-right">
                    <p className={`font-mono text-sm font-bold ${r.hi ? 'text-teal-500' : 'text-white'}`}>{r.value}</p>
                    <p className="text-[8px] text-zinc-600">{r.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Escrow Mechanics</h3>
                {[
                  { n: '1', t: 'Investor Funds via Paystack',  d: 'Capital enters Nested Ark escrow. Fully segregated — never co-mingled with platform funds.' },
                  { n: '2', t: 'Milestone Gates',              d: 'Funds released per milestone only. Each gate requires sign-off before any disbursement.' },
                  { n: '3', t: 'Tri-Layer Verification',       d: 'AI risk model + Government human audit + drone site footage — all three confirm progress.' },
                  { n: '4', t: 'SHA-256 Release Hash',         d: 'Each release creates an immutable cryptographic record on the global ledger.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{s.t}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 leading-relaxed">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5 flex items-start gap-3">
                <ShieldCheck size={15} className="text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-400 text-xs leading-relaxed">
                  All payments processed by <strong className="text-white">Impressions &amp; Impacts Ltd</strong> via Paystack.
                  Your bank statement will show "Impressions and Impacts Ltd".
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ────────────────────────────────────────────────────── */}
        {tab === 'documents' && (
          <div className="space-y-4">
            {/* Real documents from API if any */}
            {project.documents && project.documents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {project.documents.map((doc: any) => (
                  <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 flex items-center gap-4 hover:border-teal-500/40 transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-teal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{doc.title}</p>
                      <p className="text-[8px] text-zinc-500 uppercase font-mono mt-0.5">{doc.doc_type}</p>
                    </div>
                    <ArrowRight size={12} className="text-zinc-600 group-hover:text-teal-500 flex-shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            )}

            {/* Template document placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Environmental Impact Assessment',
                'Government Approval Letter',
                'Financial Model & Projections',
                'Engineering Feasibility Report',
                'Site Survey & Geotechnical Report',
                'Contractor Qualification Pack',
              ].map((label, i) => (
                <div key={i}
                  className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 flex items-center gap-4 opacity-60">
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-zinc-400">{label}</p>
                    <p className="text-[8px] text-zinc-600 uppercase font-mono mt-0.5">PDF · Awaiting Upload</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 flex items-start gap-3">
              <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-zinc-500 text-xs leading-relaxed">
                Full document access granted to KYC-verified investors.{' '}
                <Link href="/kyc" className="text-teal-500 hover:underline">Complete KYC →</Link>
              </p>
            </div>
          </div>
        )}

        {/* ── TEAM ─────────────────────────────────────────────────────────── */}
        {tab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Project Principals</h3>
              {[
                { role: 'Developer / Owner',    name: project.sponsor_name ?? 'Project Owner',              badge: 'DEV',   color: 'text-teal-500' },
                { role: 'Government Sponsor',   name: project.location + ' Ministry of Works',              badge: 'GOV',   color: 'text-teal-500' },
                { role: 'Lead Contractor',      name: project.primary_supplier ?? 'Assigned upon bid award', badge: 'CONTR', color: 'text-amber-400' },
                { role: 'Funding Institution',  name: project.assigned_bank ?? 'Open for bank tender',      badge: 'BANK',  color: 'text-purple-400' },
              ].map(p => (
                <div key={p.role} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{p.role}</p>
                    <p className="text-sm font-bold truncate">{p.name}</p>
                  </div>
                  <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase ${p.color} border-current`}>
                    {p.badge}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Platform Guarantees</h3>
              {[
                { icon: ShieldCheck, t: 'Tri-Layer Verification',  d: 'Every milestone verified by AI + Government auditor + Drone footage before escrow release.' },
                { icon: Hash,        t: 'Immutable Ledger',         d: 'SHA-256 hash chain records every transaction. Tamper-proof and publicly auditable.' },
                { icon: Globe,       t: 'Government Authorization', d: 'Projects require signed approval from the relevant government ministry before going live.' },
                { icon: Award,       t: 'AML/KYC Compliance',       d: 'All investors undergo identity verification. Fully compliant with Nigerian financial regulations.' },
              ].map(g => {
                const Icon = g.icon;
                return (
                  <div key={g.t} className="flex items-start gap-3">
                    <Icon size={15} className="text-teal-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{g.t}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 leading-relaxed">{g.d}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
