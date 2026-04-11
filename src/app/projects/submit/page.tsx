'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FileUploader from '@/components/FileUploader';
import api from '@/lib/api';
import {
  Loader2, ShieldCheck, Plus, Trash2, ArrowRight,
  Building2, CheckCircle2, Globe, DollarSign, FileText, Image as ImageIcon
} from 'lucide-react';

const CATEGORIES = ['Roads','Energy','Water','Bridges','Technology','Railways','Ports','Healthcare','Housing','Agriculture','Education','Telecommunications'];
const PROJECT_TYPES = ['INFRASTRUCTURE','RESIDENTIAL','COMMERCIAL','INDUSTRIAL','RENOVATION','LANDSCAPE'];
const TRADES = ['Civil Engineering','Electrical','Plumbing','Architecture','Mechanical','Structural','Landscaping','Interior Design','Solar/Renewable','IT/Telecoms'];
const CURRENCIES = ['USD','NGN','GBP','EUR','GHS','KES','ZAR','AED'];
const OWNER_TYPES = [
  { id:'INDIVIDUAL',       label:'Individual',       emoji:'👤', desc:'Personal home, land development or private project' },
  { id:'CORPORATE',        label:'Corporate',        emoji:'🏢', desc:'Company-owned or corporate real estate' },
  { id:'PRIVATE_BUSINESS', label:'Private Business', emoji:'💼', desc:'SME, startup or privately-held business' },
  { id:'DEVELOPER',        label:'Developer / Builder',emoji:'🏠',desc:'Professional property developer' },
  { id:'GOVERNMENT',       label:'Government',        emoji:'🏛', desc:'Government-sponsored public infrastructure' },
];

interface Milestone { title: string; description: string; budget_allocation: string; required_trade: string; }

export default function ProjectSubmitPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState<{ project_number: string; id: string } | null>(null);

  const [form, setForm] = useState({
    owner_type: 'INDIVIDUAL',
    owner_name: '', owner_email: '', owner_phone: '', owner_country: 'Nigeria',
    title: '', description: '', pitch_summary: '',
    category: 'Roads', project_type: 'INFRASTRUCTURE',
    location: '', country: 'Nigeria',
    budget: '', currency: 'USD', timeline_months: '24', expected_roi: '12',
    hero_image_url: '',
    tags: '',
    visibility: 'PUBLIC',
    permit_ref: '',       // LASG / Government digital permit reference number
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', description: '', budget_allocation: '', required_trade: 'Civil Engineering' },
  ]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    if (!authLoading && user) {
      setForm(f => ({ ...f, owner_name: user.full_name || '', owner_email: user.email || '' }));
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  const addMilestone = () => setMilestones(ms => [...ms, { title:'', description:'', budget_allocation:'', required_trade:'Civil Engineering' }]);
  const removeMilestone = (i: number) => setMilestones(ms => ms.filter((_, idx) => idx !== i));
  const updateMilestone = (i: number, field: keyof Milestone, value: string) =>
    setMilestones(ms => ms.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location || !form.country || !form.budget || !form.category) {
      alert('Please fill in all required fields'); return;
    }
    if (milestones.some(m => !m.title)) { alert('Each milestone must have a title'); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        budget: parseFloat(form.budget),
        timeline_months: parseInt(form.timeline_months) || 24,
        expected_roi: parseFloat(form.expected_roi) || 12,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        permit_ref: form.permit_ref || undefined,
        milestones: milestones.map((m, i) => ({
          ...m,
          milestone_number: i + 1,
          budget_allocation: m.budget_allocation ? parseFloat(m.budget_allocation) : null,
        })),
      };
      const res = await api.post('/api/projects', payload);
      setSubmitted({ project_number: res.data.project_number, id: res.data.project.id });
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500/40">
              <CheckCircle2 className="text-teal-500" size={36} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Project Submitted!</h1>
            <p className="text-teal-500 text-sm mt-2">Your project is now live on the marketplace</p>
          </div>
          <div className="p-6 rounded-2xl border border-teal-500/30 bg-teal-500/5 space-y-3">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Your Project ID</p>
            <p className="text-3xl font-black font-mono text-teal-400">{submitted.project_number}</p>
            <p className="text-[10px] text-zinc-500">Share this ID — investors and contractors can search for your project globally using this code</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/projects/${submitted.id}`}
              className="flex items-center gap-2 justify-center px-6 py-3 bg-teal-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all">
              View Project <ArrowRight size={13} />
            </Link>
            <Link href="/projects/my"
              className="flex items-center gap-2 justify-center px-6 py-3 border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all">
              My Projects
            </Link>
            <Link href="/investments"
              className="flex items-center gap-2 justify-center px-6 py-3 border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all">
              Investment Nodes
            </Link>
          </div>
        </div>
      </main>
    </div>
  );

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">

        <header className="mb-10 border-l-2 border-teal-500 pl-6">
          <p className="text-[10px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-2">Project Marketplace</p>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Submit a Project</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Individuals, corporates, developers and governments can post projects.
            Contractors bid on milestones. Investors fund them.
          </p>
        </header>

        {/* What happens after submission */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { n:'1', label:'NAP ID Generated',   desc:'Unique project identifier issued instantly' },
            { n:'2', label:'Live on Marketplace', desc:'Contractors and investors can find your project' },
            { n:'3', label:'Investors Fund It',   desc:'Capital held in Paystack escrow' },
            { n:'4', label:'Milestones Verified', desc:'Funds released per verified milestone' },
          ].map(s => (
            <div key={s.n} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 text-center">
              <p className="text-2xl font-black font-mono text-teal-500/30 mb-1">{s.n}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
              <p className="text-[9px] text-zinc-600 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── OWNER TYPE ── */}
          <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Building2 size={14} className="text-teal-500" /> Who is submitting?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {OWNER_TYPES.map(ot => (
                <button key={ot.id} type="button" onClick={() => set('owner_type', ot.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${form.owner_type === ot.id ? 'border-teal-500 bg-teal-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
                  <span className="text-lg">{ot.emoji}</span>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${form.owner_type === ot.id ? 'text-teal-400' : 'text-zinc-400'}`}>{ot.label}</p>
                  <p className="text-[9px] text-zinc-600 mt-0.5">{ot.desc}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Field label="Contact Name *" value={form.owner_name} onChange={v => set('owner_name',v)} placeholder="Your name or representative" />
              <Field label="Contact Email" value={form.owner_email} onChange={v => set('owner_email',v)} placeholder="contact@company.com" type="email" />
              <Field label="Contact Phone" value={form.owner_phone} onChange={v => set('owner_phone',v)} placeholder="+234 800 000 0000" />
              <Field label="Owner's Country" value={form.owner_country} onChange={v => set('owner_country',v)} placeholder="Nigeria" />
            </div>
          </section>

          {/* ── PROJECT DETAILS ── */}
          <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <FileText size={14} className="text-teal-500" /> Project Details
            </h2>
            <Field label="Project Title *" value={form.title} onChange={v => set('title',v)} placeholder="e.g. 4-Bedroom Detached House — Lekki Phase 2" required />
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Full Description *</label>
              <textarea required rows={4} value={form.description} onChange={e => set('description',e.target.value)}
                placeholder="Describe the project scope, what needs to be built, key requirements and goals..."
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Investor Pitch</label>
              <textarea rows={3} value={form.pitch_summary} onChange={e => set('pitch_summary',e.target.value)}
                placeholder="Why should investors fund this? What is the economic impact, ROI potential, or social value?"
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Category *</label>
                <select required value={form.category} onChange={e => set('category',e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Project Type *</label>
                <select required value={form.project_type} onChange={e => set('project_type',e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors">
                  {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <Field label="City / Location *" value={form.location} onChange={v => set('location',v)} placeholder="e.g. Lekki, Lagos" required />
              <Field label="Country *" value={form.country} onChange={v => set('country',v)} placeholder="Nigeria" required />
            </div>
          </section>

          {/* ── FINANCIALS ── */}
          <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <DollarSign size={14} className="text-teal-500" /> Finance & Timeline
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Total Budget *" value={form.budget} onChange={v => set('budget',v)} placeholder="500000" type="number" required />
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Currency</label>
                <select value={form.currency} onChange={e => set('currency',e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field label="Timeline (months)" value={form.timeline_months} onChange={v => set('timeline_months',v)} placeholder="24" type="number" />
              <Field label="Expected ROI % p.a." value={form.expected_roi} onChange={v => set('expected_roi',v)} placeholder="12" type="number" />
              <Field label="Tags" value={form.tags} onChange={v => set('tags',v)} placeholder="residential, concrete, lekki" />
              {/* ── Digital Permit Reference ── */}
              <div className="md:col-span-2">
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider bg-blue-500 text-white">PERMIT</span>
                  Digital Permit Reference Number
                  <span className="text-[8px] text-blue-400 font-normal normal-case tracking-normal">LASG / Government Issued</span>
                </label>
                <input
                  type="text"
                  value={form.permit_ref}
                  onChange={e => set('permit_ref', e.target.value)}
                  placeholder="e.g. LASG-EPPPS-2026-000123"
                  className="w-full bg-black border border-blue-500/30 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors font-mono"
                />
                <p className="text-[9px] text-zinc-600 mt-1.5 leading-relaxed">
                  <span className="text-blue-400 font-bold">Lagos State Government now requires digital permits for all construction projects.</span>{' '}
                  Enter your LASG e-Planning Portal reference or any government-issued permit number.
                  This is displayed on your project listing and boosts investor trust scoring.
                  Optional during Pilot Phase — required for live projects.
                </p>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Visibility</label>
                <select value={form.visibility} onChange={e => set('visibility',e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors">
                  <option value="PUBLIC">Public — visible to all contractors and investors</option>
                  <option value="PRIVATE">Private — invite only</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── HERO IMAGE — FileUploader replaces URL text input ── */}
          <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <ImageIcon size={14} className="text-teal-500" /> Project Hero Image
            </h2>
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              Upload a main photo, render, or site image for your project. This appears at the top of your project page and in the marketplace listing.
            </p>

            {/* FileUploader — click to upload or take photo */}
            <FileUploader
              label="Hero Image"
              hint="Main project photo, architectural render, or site image — tap to take a photo or choose from your gallery"
              accept="image"
              folder="project-hero-images"
              value={form.hero_image_url}
              onUpload={url => set('hero_image_url', url)}
              disabled={submitting}
            />

            {/* URL fallback — shown below the uploader */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">
                Or paste an image URL directly
              </label>
              <input
                type="url"
                value={form.hero_image_url}
                onChange={e => set('hero_image_url', e.target.value)}
                placeholder="https://cloudinary.com/your-image.jpg"
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors font-mono"
              />
              <p className="text-[9px] text-zinc-700 mt-1">
                The upload above sets this URL automatically. Only use this if you already have a hosted image link.
              </p>
            </div>
          </section>

          {/* ── MILESTONES ── */}
          <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck size={14} className="text-teal-500" /> Project Milestones / Phases
              </h2>
              <button type="button" onClick={addMilestone}
                className="flex items-center gap-1.5 px-3 py-2 border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 font-bold rounded-lg text-[9px] uppercase tracking-widest transition-all">
                <Plus size={11} /> Add Phase
              </button>
            </div>
            <p className="text-[10px] text-zinc-600">
              Break your project into phases. Contractors bid on individual milestones.
              Funds are released per milestone after tri-layer verification.
            </p>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="p-5 rounded-xl border border-zinc-700 bg-black/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] text-teal-500 uppercase font-black tracking-widest">Phase {i + 1}</p>
                    {milestones.length > 1 && (
                      <button type="button" onClick={() => removeMilestone(i)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1.5">Milestone title *</label>
                      <input required value={m.title} onChange={e => updateMilestone(i,'title',e.target.value)}
                        placeholder="e.g. Foundation & Ground Floor"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1.5">Budget allocation (USD)</label>
                      <input type="number" value={m.budget_allocation} onChange={e => updateMilestone(i,'budget_allocation',e.target.value)}
                        placeholder="e.g. 150000"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors font-mono" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1.5">Required trade</label>
                      <select value={m.required_trade} onChange={e => updateMilestone(i,'required_trade',e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors">
                        {TRADES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1.5">Milestone scope / deliverables</label>
                      <input value={m.description} onChange={e => updateMilestone(i,'description',e.target.value)}
                        placeholder="What specifically needs to be completed in this phase?"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <div className="p-5 rounded-xl border border-teal-500/10 bg-teal-500/5 space-y-2.5 text-[10px] text-zinc-500">
            {[
              'Your project will receive a unique ID (e.g. NAP-2026-00042) visible on the marketplace',
              'Contractors worldwide can search by ID, category, country or trade and submit bids',
              'Investors can browse and fund your project — funds held in escrow until milestones are verified',
              'Diaspora contacts can search by project ID from anywhere in the world',
            ].map((t,i) => (
              <div key={i} className="flex items-start gap-2">
                <ShieldCheck size={10} className="text-teal-500 flex-shrink-0 mt-0.5" /> {t}
              </div>
            ))}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-4 bg-teal-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting
              ? <><Loader2 className="animate-spin" size={16} /> Submitting…</>
              : <><Globe size={14} /> Submit Project to Nested Ark Marketplace</>
            }
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

// Reusable field component for this form
function Field({ label, value, onChange, placeholder, type='text', required=false }: {
  label:string; value:string; onChange:(v:string)=>void;
  placeholder?:string; type?:string; required?:boolean;
}) {
  return (
    <div>
      <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">{label}</label>
      <input required={required} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
    </div>
  );
}
