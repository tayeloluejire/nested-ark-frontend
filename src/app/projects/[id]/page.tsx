'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import {
  ShieldCheck, TrendingUp, FileText, Users, Building2, Loader2,
  MapPin, Calendar, BarChart3, Lock, CheckCircle2, ArrowUpRight,
  ChevronRight, Globe, Download, Eye, AlertTriangle, Wifi, DollarSign
} from 'lucide-react';

type Tab = 'overview' | 'financials' | 'documents' | 'team';

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
];

const MOCK_FLOOR_PLANS = [
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80',
];

export default function ProjectPitchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (!id) return;
    (async () => {
      try {
        const [p, m, inv] = await Promise.allSettled([
          api.get(`/api/projects/${id}`),
          api.get(`/api/milestones?project_id=${id}`),
          api.get('/api/investments'),
        ]);
        if (p.status === 'fulfilled') setProject(p.value.data.project ?? p.value.data);
        if (m.status === 'fulfilled') setMilestones(m.value.data.milestones ?? []);
        if (inv.status === 'fulfilled') {
          const all = inv.value.data.investments ?? [];
          setInvestments(all.filter((i: any) => i.project_id === id));
        }
        // mock documents — replace with real API when available
        setDocuments([
          { id: '1', doc_type: 'GOVT_APPROVAL', title: 'Federal Ministry of Works — Project Authorization', is_public: true, requires_kyc: false, description: 'Official government approval letter and project mandate document.' },
          { id: '2', doc_type: 'EIA', title: 'Environmental Impact Assessment Report', is_public: true, requires_kyc: false, description: 'Full EIA conducted by certified environmental consultants.' },
          { id: '3', doc_type: 'FEASIBILITY', title: 'Technical Feasibility & ROI Analysis', is_public: false, requires_kyc: true, description: 'Detailed engineering feasibility study with cost projections and IRR calculations.' },
          { id: '4', doc_type: 'FLOOR_PLAN', title: 'Site Layout & Infrastructure Drawings', is_public: false, requires_kyc: true, description: 'Certified engineering drawings, CAD layouts, and site blueprints.' },
          { id: '5', doc_type: 'CONTRACTOR_PACK', title: 'Contractor Qualification & Tender Documents', is_public: false, requires_kyc: true, description: 'Contractor vetting files, bill of quantities, and scope of work.' },
        ]);
      } finally { setLoading(false); }
    })();
  }, [id, user, authLoading, router]);

  if (authLoading || loading || !project) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  const totalInvested = investments.reduce((s: number, i: any) => s + Number(i.amount), 0);
  const budget = Number(project.budget);
  const fundingPct = budget > 0 ? Math.min((totalInvested / budget) * 100, 100) : 0;
  const roiPct = project.expected_roi ?? 12;
  const milestonesPaid = milestones.filter(m => m.status === 'PAID').length;
  const isKycVerified = true; // TODO: check real KYC from context/API

  const docTypeLabel: Record<string, string> = {
    GOVT_APPROVAL: '🏛 Govt Approval',
    EIA: '🌿 EIA Report',
    FEASIBILITY: '📊 Feasibility',
    FLOOR_PLAN: '📐 Floor Plan',
    CONTRACTOR_PACK: '📁 Contractor Pack',
    '3D_MODEL': '🏗 3D Model',
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview',   label: 'Overview',    icon: Eye },
    { id: 'financials', label: 'Financials',  icon: BarChart3 },
    { id: 'documents',  label: 'Documents',   icon: FileText },
    { id: 'team',       label: 'Team',        icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      {/* Pulse bar */}
      <div className="border-b border-zinc-800 bg-black px-6 py-2 flex items-center gap-5 text-[9px] font-mono uppercase tracking-widest overflow-x-auto">
        <span className="flex items-center gap-1.5 text-teal-500 flex-shrink-0"><Wifi size={8} /> Live Project Data</span>
        {project.gov_verified && <span className="flex items-center gap-1.5 text-emerald-400 flex-shrink-0"><ShieldCheck size={8} /> Government Verified</span>}
        <span className="text-zinc-600 flex-shrink-0">{project.country} · {project.category}</span>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── LEFT: Main content ────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-3">
                <Link href="/investments" className="hover:text-teal-500">Investments</Link>
                <ChevronRight size={10} />
                <span className="text-white">{project.title}</span>
              </div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-3xl font-black tracking-tighter uppercase italic flex-1">{project.title}</h1>
                {project.gov_verified && (
                  <span className="flex items-center gap-1 text-[9px] bg-teal-500/10 border border-teal-500/30 text-teal-500 px-3 py-1 rounded-full font-bold uppercase">
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-zinc-500 text-sm">
                <span className="flex items-center gap-1"><MapPin size={12} /> {project.location}, {project.country}</span>
                {project.timeline_months && <span className="flex items-center gap-1"><Calendar size={12} /> {project.timeline_months} months</span>}
              </div>
            </div>

            {/* Image gallery */}
            <div className="space-y-3">
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-zinc-800">
                <Image
                  src={project.hero_image_url ?? MOCK_IMAGES[activeImg]}
                  alt={project.title}
                  fill className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                <div className="absolute bottom-4 right-4 text-[9px] font-mono bg-black/60 px-2 py-1 rounded border border-zinc-700 text-zinc-400">
                  Site Render · {project.location}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MOCK_IMAGES.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative h-20 rounded-xl overflow-hidden border transition-all ${activeImg === i ? 'border-teal-500' : 'border-zinc-800 hover:border-zinc-600'}`}>
                    <Image src={img} alt="" fill className="object-cover" sizes="200px" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 border-b border-zinc-800">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all -mb-px ${
                    activeTab === tab.id ? 'border-teal-500 text-teal-500' : 'border-transparent text-zinc-500 hover:text-white'
                  }`}>
                  <tab.icon size={12} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Project Description</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">{project.description}</p>
                  {project.pitch_summary && (
                    <p className="text-zinc-500 text-sm mt-3 leading-relaxed italic">{project.pitch_summary}</p>
                  )}
                </div>

                {/* Milestone progress */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Milestone Progress ({milestonesPaid}/{milestones.length} completed)</h3>
                  {milestones.map((m, i) => (
                    <div key={m.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 flex items-center gap-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        m.status === 'PAID' ? 'bg-teal-500 text-black' : 'bg-zinc-800 text-zinc-500'
                      }`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-tight">{m.title}</p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">
                          ${Number(m.budget_allocation).toLocaleString()} · {m.status}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-1 flex-shrink-0">
                        {[{ l: 'AI', s: m.ai_status }, { l: 'H', s: m.human_status }, { l: 'D', s: m.drone_status }].map(v => (
                          <span key={v.l} className={`text-[7px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            v.s === 'VERIFIED' ? 'bg-teal-500/20 text-teal-500' : 'bg-zinc-800 text-zinc-600'
                          }`}>{v.l}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3D / Floor plan previews */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Site Plans & Renders</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {MOCK_FLOOR_PLANS.map((img, i) => (
                      <div key={i} className="relative h-40 rounded-xl overflow-hidden border border-zinc-800 group">
                        <Image src={img} alt="Floor plan" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="400px" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                          <span className="text-[9px] text-zinc-300 font-mono uppercase">{i === 0 ? 'Site Layout Plan' : '3D Infrastructure Render'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Financials */}
            {activeTab === 'financials' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Budget', value: format(budget), color: 'text-white' },
                    { label: 'Raised So Far', value: `${fundingPct.toFixed(1)}%`, color: 'text-teal-400' },
                    { label: 'Expected ROI', value: `${roiPct}% p.a.`, color: 'text-emerald-400' },
                    { label: 'Risk Grade', value: project.risk_grade ?? 'B+', color: 'text-amber-400' },
                    { label: 'Milestones', value: `${milestones.length} phases`, color: 'text-white' },
                    { label: 'Timeline', value: `${project.timeline_months ?? 24} months`, color: 'text-white' },
                  ].map(item => (
                    <div key={item.label} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{item.label}</p>
                      <p className={`text-xl font-black font-mono mt-1 ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Escrow mechanics */}
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Escrow Release Flow</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { step: '1', label: 'Investor Commits', desc: 'Capital locked in escrow via Paystack' },
                      { step: '2', label: 'AI + Drone Verify', desc: 'Automated evidence validation' },
                      { step: '3', label: 'Human Audit', desc: 'Government/ADMIN sign-off' },
                      { step: '4', label: 'Funds Released', desc: 'Direct to contractor node' },
                    ].map(s => (
                      <div key={s.step} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl border border-zinc-800">
                        <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-500 text-[10px] font-black">{s.step}</div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white">{s.label}</p>
                        <p className="text-[8px] text-zinc-500">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Partner info */}
                {(project.assigned_bank || project.primary_supplier) && (
                  <div className="grid grid-cols-2 gap-4">
                    {project.assigned_bank && (
                      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Assigned Bank</p>
                        <p className="text-sm font-bold text-white">{project.assigned_bank}</p>
                        <p className="text-[9px] text-teal-500 mt-1 uppercase">{project.bank_status ?? 'PENDING'}</p>
                      </div>
                    )}
                    {project.primary_supplier && (
                      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Primary Supplier</p>
                        <p className="text-sm font-bold text-white">{project.primary_supplier}</p>
                        <p className="text-[9px] text-amber-400 mt-1 uppercase">{project.supply_status ?? 'PENDING'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-400 uppercase font-bold tracking-widest flex items-center gap-2">
                  <Lock size={10} /> Some documents require KYC verification to access
                </div>
                {documents.map(doc => {
                  const locked = doc.requires_kyc && !isKycVerified;
                  return (
                    <div key={doc.id} className={`p-5 rounded-xl border transition-all ${locked ? 'border-zinc-800 bg-zinc-900/10 opacity-60' : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] text-teal-500 font-bold uppercase">{docTypeLabel[doc.doc_type] ?? doc.doc_type}</span>
                            {doc.is_public && <span className="text-[8px] border border-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded uppercase">Public</span>}
                            {doc.requires_kyc && <span className="text-[8px] border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded uppercase flex items-center gap-1"><Lock size={7} /> KYC Required</span>}
                          </div>
                          <p className="text-sm font-bold text-white">{doc.title}</p>
                          <p className="text-[10px] text-zinc-500 mt-1">{doc.description}</p>
                        </div>
                        {!locked ? (
                          <button className="flex items-center gap-1 px-3 py-2 border border-zinc-700 text-zinc-400 font-bold rounded-lg text-[9px] uppercase hover:text-white transition-all flex-shrink-0">
                            <Download size={10} /> Download
                          </button>
                        ) : (
                          <Link href="/kyc" className="flex items-center gap-1 px-3 py-2 border border-amber-500/30 text-amber-400 font-bold rounded-lg text-[9px] uppercase hover:bg-amber-500/10 transition-all flex-shrink-0">
                            <Lock size={10} /> Verify KYC
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Team */}
            {activeTab === 'team' && (
              <div className="space-y-4">
                {[
                  { role: 'Government Sponsor', name: 'Federal Ministry of Works', desc: 'Project mandate and regulatory oversight authority', badge: 'VERIFIED', color: 'teal' },
                  { role: 'Lead Contractor', name: project.vendor ?? 'Julius Berger Nigeria PLC', desc: 'Primary infrastructure contractor — 40+ years of civil engineering excellence', badge: 'LICENSED', color: 'white' },
                  { role: 'Funding Bank', name: project.funding_bank ?? project.assigned_bank ?? 'Access Bank (Corporate Lending)', desc: 'Institutional capital provider — project tranche management and disbursement', badge: 'INSTITUTIONAL', color: 'white' },
                  { role: 'Materials Supplier', name: project.primary_supplier ?? 'Dangote Cement PLC', desc: 'Authorized supply chain partner — bulk materials, delivery tracking, and quality certification', badge: 'PARTNER', color: 'white' },
                ].map(member => (
                  <div key={member.role} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Building2 size={16} className="text-teal-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{member.role}</p>
                        <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold uppercase ${
                          member.color === 'teal' ? 'border-teal-500/40 text-teal-500' : 'border-zinc-700 text-zinc-400'
                        }`}>{member.badge}</span>
                      </div>
                      <p className="text-sm font-bold text-white">{member.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{member.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="p-5 rounded-xl border border-teal-500/20 bg-teal-500/5 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Platform Guarantees</h4>
                  {[
                    'Funds held in Paystack-secured escrow until milestone verification',
                    'AI + Human + Drone tri-layer evidence validation before any release',
                    'All transactions logged in immutable SHA-256 hash chain ledger',
                    'Government authorization required for every milestone payout',
                  ].map((g, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-zinc-400">
                      <CheckCircle2 size={10} className="text-teal-500 mt-0.5 flex-shrink-0" />
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: CTA sidebar ────────────────────────── */}
          <div className="space-y-6">
            {/* Funding progress card */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-5 sticky top-24">
              <div>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-zinc-400">Funding Progress</span>
                  <span className="text-teal-500">{fundingPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 transition-all duration-700" style={{ width: `${fundingPct}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-zinc-600">
                  <span>{format(totalInvested)} raised</span>
                  <span>{format(budget)} target</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-[8px] text-zinc-500 uppercase font-bold">ROI</p>
                  <p className="text-teal-400 font-black text-base">{roiPct}%</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-[8px] text-zinc-500 uppercase font-bold">Tenure</p>
                  <p className="text-white font-black text-base">{project.timeline_months ?? 24}mo</p>
                </div>
              </div>

              {user?.role === 'INVESTOR' && (
                <Link href="/investments"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.15em] rounded-xl hover:bg-teal-500 transition-all">
                  <DollarSign size={14} /> Fund This Project
                </Link>
              )}

              <div className="space-y-2 text-[9px] text-zinc-500">
                {project.gov_verified && (
                  <div className="flex items-center gap-2 text-teal-500"><ShieldCheck size={10} /> Government Verified</div>
                )}
                <div className="flex items-center gap-2"><Globe size={10} /> {project.country}</div>
                <div className="flex items-center gap-2"><Calendar size={10} /> Created {new Date(project.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
