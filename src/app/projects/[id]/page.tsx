'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import {
  MapPin, ShieldCheck, TrendingUp, Calendar, Building2, Users,
  Loader2, ArrowLeft, Briefcase, DollarSign, FileText, Globe,
  CheckCircle2, AlertCircle, Clock, Eye, Star, ArrowRight
} from 'lucide-react';

interface Milestone {
  id: string; title: string; description: string; budget_allocation: number;
  status: string; progress_percentage: number; milestone_number: number;
  required_trade: string; ai_status: string; human_status: string; drone_status: string;
}

interface Project {
  id: string; project_number: string; title: string; description: string;
  location: string; country: string; budget: number; currency: string;
  category: string; project_type: string; owner_type: string; status: string;
  gov_verified: boolean; expected_roi: number; timeline_months: number;
  progress_percentage: number; pitch_summary: string; hero_image_url: string;
  sponsor_name: string; sponsor_email: string; sponsor_id: string;
  bid_count: number; investor_count: number; total_raised_usd: number;
  view_count: number; created_at: string;
  milestones: Milestone[] | null;
  documents: any[] | null;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:     'text-teal-400 border-teal-500/30 bg-teal-500/10',
  PENDING:    'text-amber-400 border-amber-500/30 bg-amber-500/10',
  COMPLETED:  'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  PAUSED:     'text-zinc-400 border-zinc-700 bg-zinc-800/30',
  CANCELLED:  'text-red-400 border-red-500/30 bg-red-500/10',
};

const VERIFY_ICONS: Record<string, React.ReactNode> = {
  PASS:    <CheckCircle2 size={10} className="text-teal-500" />,
  FAIL:    <AlertCircle  size={10} className="text-red-400"  />,
  PENDING: <Clock        size={10} className="text-amber-400" />,
};

export default function ProjectDetailPage() {
  const { id }     = useParams();
  const router     = useRouter();
  const { user }   = useAuth();
  const { format } = useCurrency();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [retries, setRetries] = useState(0);

  const load = async () => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      // NOTE: api.ts baseURL is already set to the backend URL, so /api/projects/:id is correct
      const res = await api.get(`/api/projects/${id}`);
      setProject(res.data.project ?? res.data);
    } catch (ex: any) {
      const msg = ex?.response?.data?.error ?? ex?.message ?? 'Unknown error';
      if (ex.code === 'ECONNABORTED') {
        setError('Could not load project — the server may be starting up. Please try again.');
      } else if (ex?.response?.status === 404) {
        setError('Project not found in the Nested Ark Ledger.');
      } else {
        setError(`Could not load project: ${msg}`);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const isOwner = user && project && user.id === project.sponsor_id;
  const isAdmin = user?.role === 'ADMIN';

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-teal-500 mx-auto" size={32} />
          <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest">Loading project…</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !project) return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-40 text-center space-y-6">
        <AlertCircle className="text-red-400 mx-auto" size={40} />
        <div>
          <h2 className="text-xl font-black uppercase">Could Not Load Project</h2>
          <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{error}</p>
          {error.includes('starting up') && (
            <p className="text-zinc-600 text-xs mt-1">The server may still be waking up. Wait a moment and retry.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => { setRetries(r => r + 1); load(); }}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all"
          >
            <Loader2 size={12} className={retries > 0 ? 'animate-spin' : ''} /> Retry
          </button>
          <Link href="/investments"
            className="flex items-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:border-teal-500 hover:text-white transition-all">
            Investment Nodes
          </Link>
          <Link href="/projects"
            className="flex items-center gap-2 px-6 py-3 border border-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:border-zinc-600 transition-all">
            Browse Marketplace
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  const raised    = Number(project.total_raised_usd ?? 0);
  const budget    = Number(project.budget ?? 0);
  const pctRaised = budget > 0 ? Math.min((raised / budget) * 100, 100) : 0;
  const milestones = project.milestones ?? [];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* Hero / header */}
      <div className="border-b border-zinc-900 bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* Back + breadcrumb */}
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mb-6">
            <ArrowLeft size={13} /> Back
          </button>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="space-y-3 flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] text-teal-500 font-mono font-black bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded">
                  {project.project_number}
                </span>
                <span className={`text-[8px] px-2 py-1 rounded border font-bold uppercase ${STATUS_COLORS[project.status] ?? STATUS_COLORS.PENDING}`}>
                  {project.status}
                </span>
                {project.gov_verified && (
                  <span className="flex items-center gap-1 text-[8px] text-teal-400 border border-teal-500/20 px-2 py-1 rounded font-bold">
                    <ShieldCheck size={8} /> Gov Verified
                  </span>
                )}
                <span className="text-[8px] text-zinc-500 border border-zinc-800 px-2 py-1 rounded">
                  {project.project_type?.replace('_', ' ')}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><MapPin size={11} /> {project.location}, {project.country}</span>
                <span className="flex items-center gap-1.5"><Building2 size={11} /> {project.category}</span>
                {project.timeline_months && (
                  <span className="flex items-center gap-1.5"><Calendar size={11} /> {project.timeline_months} month timeline</span>
                )}
                <span className="flex items-center gap-1.5"><Eye size={11} /> {Number(project.view_count ?? 0).toLocaleString()} views</span>
              </div>
            </div>

            {/* Owner / admin actions */}
            {(isOwner || isAdmin) && (
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/projects/${project.id}/edit`}
                  className="px-5 py-2.5 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:border-teal-500 hover:text-white transition-all">
                  Edit
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        {/* ── LEFT: main content ────────────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-8">

          {/* Description */}
          {project.description && (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">About This Project</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">{project.description}</p>
            </div>
          )}

          {project.pitch_summary && project.pitch_summary !== project.description && (
            <div className="p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5 space-y-2">
              <p className="text-[9px] text-teal-500 uppercase font-bold tracking-widest">Developer Pitch</p>
              <p className="text-zinc-300 text-sm leading-relaxed italic">{project.pitch_summary}</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">Project Progress</h2>
              <span className="text-teal-400 font-mono text-sm font-bold">{project.progress_percentage ?? 0}%</span>
            </div>
            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${project.progress_percentage ?? 0}%` }} />
            </div>
          </div>

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                Milestones ({milestones.length})
              </h2>
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      m.status === 'COMPLETED'
                        ? 'border-teal-500/30 bg-teal-500/5'
                        : m.status === 'IN_PROGRESS'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-zinc-800 bg-zinc-900/20'
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-black text-zinc-400 flex-shrink-0 mt-0.5">
                          {m.milestone_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{m.title}</p>
                          {m.description && <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{m.description}</p>}
                          {m.required_trade && (
                            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mt-1.5">
                              Trade: {m.required_trade}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        {m.budget_allocation && (
                          <p className="font-mono text-sm font-bold text-white">
                            {format(Number(m.budget_allocation))}
                          </p>
                        )}
                        <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase ${STATUS_COLORS[m.status] ?? STATUS_COLORS.PENDING}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>

                    {/* Verification layers */}
                    {(m.ai_status || m.human_status || m.drone_status) && (
                      <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-800/60">
                        {[
                          { label: 'AI', status: m.ai_status },
                          { label: 'Human', status: m.human_status },
                          { label: 'Drone', status: m.drone_status },
                        ].map(v => (
                          <div key={v.label} className="flex items-center gap-1 text-[8px] text-zinc-500">
                            {VERIFY_ICONS[v.status ?? 'PENDING']}
                            <span className="font-bold">{v.label}:</span>
                            <span className={v.status === 'PASS' ? 'text-teal-400' : v.status === 'FAIL' ? 'text-red-400' : 'text-amber-400'}>
                              {v.status ?? 'PENDING'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {project.documents && project.documents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                Project Documents ({project.documents.length})
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {project.documents.map((doc: any) => (
                  <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800 hover:border-teal-500/40 bg-zinc-900/20 transition-all group">
                    <FileText size={16} className="text-teal-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{doc.title}</p>
                      <p className="text-[9px] text-zinc-600 uppercase font-bold mt-0.5">{doc.doc_type}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: sidebar ─────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Budget / raise card */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Total Budget</p>
              <p className="text-3xl font-black font-mono tabular-nums mt-1">{format(budget)}</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-500 font-bold">Capital Raised</span>
                <span className="font-mono text-teal-400">{pctRaised.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `${pctRaised}%` }} />
              </div>
              <p className="text-xs font-mono text-white mt-1.5">{format(raised)} raised</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'ROI p.a.',    value: `${project.expected_roi ?? 12}%`, color: 'text-teal-400' },
                { label: 'Investors',   value: project.investor_count ?? 0,       color: 'text-white' },
                { label: 'Bids',        value: project.bid_count ?? 0,            color: 'text-white' },
                { label: 'Milestones', value: milestones.length,                 color: 'text-white' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl border border-zinc-800 bg-black/20 text-center">
                  <p className={`text-lg font-black font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-[8px] text-zinc-600 uppercase font-bold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Invest CTA */}
            <Link href={`/investments?project=${project.id}`}
              className="block w-full py-4 bg-teal-500 text-black font-black uppercase text-xs tracking-widest rounded-xl text-center hover:bg-white transition-all">
              💰 Invest in This Project
            </Link>
            {user?.role === 'CONTRACTOR' && (
              <Link href={`/projects/${project.id}/bid`}
                className="block w-full py-3 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-widest rounded-xl text-center hover:border-amber-500/50 hover:text-white transition-all">
                🏗 Submit a Bid
              </Link>
            )}
          </div>

          {/* Owner info */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-3">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Project Owner</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-black text-teal-500 flex-shrink-0">
                {(project.sponsor_name ?? 'O')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold">{project.sponsor_name ?? 'Owner'}</p>
                <p className="text-[9px] text-zinc-600 font-mono">{project.owner_type?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Platform trust */}
          <div className="p-5 rounded-2xl border border-zinc-800/50 bg-zinc-900/10 space-y-3">
            <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Platform Guarantees</p>
            {[
              { icon: <ShieldCheck size={11} />, text: 'Funds held in Paystack escrow' },
              { icon: <CheckCircle2 size={11} />, text: 'Tri-layer verification required' },
              { icon: <Globe size={11} />, text: 'SHA-256 immutable ledger' },
              { icon: <Star size={11} />, text: 'Investment certificate on commit' },
            ].map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span className="text-teal-500/70">{g.icon}</span> {g.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
