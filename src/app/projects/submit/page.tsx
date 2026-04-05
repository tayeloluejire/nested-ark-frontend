'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import {
  Plus, Trash2, Loader2, Upload, Building2, User, Briefcase,
  Globe, FileText, Camera, ChevronDown, ChevronUp, CheckCircle2,
  Info, ShieldCheck, ArrowRight
} from 'lucide-react';

// ── constants ─────────────────────────────────────────────────────────────────
const OWNER_TYPES = [
  { value: 'INDIVIDUAL',       label: 'Individual',        icon: User,      desc: 'Personal home, land development or private project' },
  { value: 'CORPORATE',        label: 'Corporate',          icon: Building2, desc: 'Company-owned infrastructure or real estate' },
  { value: 'PRIVATE_BUSINESS', label: 'Private Business',   icon: Briefcase, desc: 'SME, developer or private contractor project' },
  { value: 'DEVELOPER',        label: 'Developer / Builder', icon: Globe,    desc: 'Property developer or construction company' },
  { value: 'GOVERNMENT',       label: 'Government',          icon: ShieldCheck, desc: 'Public sector, ministry or municipal project' },
];

const CATEGORIES = [
  'Roads', 'Bridges', 'Water', 'Energy', 'Technology', 'Housing',
  'Healthcare', 'Education', 'Agriculture', 'Telecommunications',
  'Industrial', 'Commercial', 'Residential', 'Landscape', 'Renovation', 'Other',
];

const PROJECT_TYPES = [
  'INFRASTRUCTURE', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'RENOVATION', 'LANDSCAPE', 'OTHER',
];

const DOC_TYPES = [
  { value: 'FLOOR_PLAN',         label: 'Floor Plan' },
  { value: '2D_DRAWING',         label: '2D Architectural Drawing' },
  { value: '3D_MODEL',           label: '3D Model / Render' },
  { value: 'GOVT_APPROVAL',      label: 'Government Approval / Permit' },
  { value: 'EIA',                label: 'Environmental Impact Assessment' },
  { value: 'FEASIBILITY',        label: 'Feasibility Study / Report' },
  { value: 'BILL_OF_QUANTITIES', label: 'Bill of Quantities (BOQ)' },
  { value: 'CONTRACTOR_PACK',    label: 'Contractor Information Pack' },
  { value: 'PHOTOS',             label: 'Site Photos / Drone Footage' },
  { value: 'OTHER',              label: 'Other Document' },
];

const TRADES = [
  'Civil Engineering', 'Structural Engineering', 'Electrical', 'Plumbing',
  'Architecture', 'Interior Design', 'Landscaping', 'Mechanical', 'IT / Smart Systems', 'General Contractor',
];

interface Milestone { title: string; description: string; budget_allocation: string; required_trade: string; }
interface Document  { doc_type: string; title: string; file_url: string; thumbnail_url: string; is_public: boolean; requires_kyc: boolean; description: string; }

function SectionCard({ title, icon: Icon, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-zinc-900/40 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Icon size={14} className="text-teal-500" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">{title}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
      </button>
      {open && <div className="px-5 pb-6 space-y-4 border-t border-zinc-800/50 pt-4">{children}</div>}
    </div>
  );
}

function Field({ label, required, hint, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-zinc-600 normal-case font-normal ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors placeholder:text-zinc-700";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

export default function SubmitProjectPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // ── form state ──────────────────────────────────────────────────────────────
  const [ownerType,    setOwnerType]    = useState('INDIVIDUAL');
  const [projectType,  setProjectType]  = useState('INFRASTRUCTURE');
  const [category,     setCategory]     = useState('Roads');
  const [visibility,   setVisibility]   = useState('PUBLIC');
  const [tags,         setTags]         = useState('');
  const [milestones,   setMilestones]   = useState<Milestone[]>([
    { title: '', description: '', budget_allocation: '', required_trade: '' }
  ]);
  const [documents,    setDocuments]    = useState<Document[]>([]);
  const [busy,         setBusy]         = useState(false);
  const [error,        setError]        = useState('');
  const [submitted,    setSubmitted]    = useState<{ project_number: string; id: string } | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', location: '', country: '', budget: '',
    currency: 'USD', timeline_months: '24', pitch_summary: '', expected_roi: '12',
    hero_image_url: '',
    // Owner
    owner_name: '', owner_email: '', owner_phone: '', owner_company: '', owner_country: '',
    // Partners
    assigned_bank: '', primary_supplier: '',
  });
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // ── milestone helpers ───────────────────────────────────────────────────────
  const addMilestone    = () => setMilestones(m => [...m, { title: '', description: '', budget_allocation: '', required_trade: '' }]);
  const removeMilestone = (i: number) => setMilestones(m => m.filter((_, j) => j !== i));
  const editMilestone   = (i: number, k: keyof Milestone, v: string) =>
    setMilestones(m => m.map((ms, j) => j === i ? { ...ms, [k]: v } : ms));

  // ── document helpers ────────────────────────────────────────────────────────
  const addDocument    = () => setDocuments(d => [...d, { doc_type: 'FLOOR_PLAN', title: '', file_url: '', thumbnail_url: '', is_public: true, requires_kyc: false, description: '' }]);
  const removeDocument = (i: number) => setDocuments(d => d.filter((_, j) => j !== i));
  const editDocument   = (i: number, k: keyof Document, v: any) =>
    setDocuments(d => d.map((doc, j) => j === i ? { ...doc, [k]: v } : doc));

  // ── submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description || !form.location || !form.country || !form.budget || !category)
      return setError('Please fill all required fields (marked with *)');

    if (milestones.some(m => !m.title))
      return setError('All milestones need a title. Remove empty ones or fill them in.');

    const validDocs = documents.filter(d => d.title && d.file_url);
    const tagArr    = tags.split(',').map(t => t.trim()).filter(Boolean);

    setBusy(true);
    try {
      const res = await api.post('/api/projects', {
        ...form,
        budget:          parseFloat(form.budget),
        timeline_months: parseInt(form.timeline_months) || 24,
        expected_roi:    parseFloat(form.expected_roi)   || 12,
        category,
        owner_type:     ownerType,
        project_type:   projectType,
        visibility,
        tags:           tagArr,
        milestones:     milestones.filter(m => m.title).map(m => ({
          ...m, budget_allocation: parseFloat(m.budget_allocation) || null,
        })),
      });

      // Upload documents one by one
      if (validDocs.length > 0) {
        for (const doc of validDocs) {
          await api.post(`/api/projects/${res.data.project.id}/documents`, doc).catch(() => {});
        }
      }

      setSubmitted({ project_number: res.data.project_number, id: res.data.project.id });
    } catch (ex: any) {
      setError(ex?.response?.data?.error ?? 'Submission failed. Please try again.');
    } finally { setBusy(false); }
  };

  // ── success screen ──────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/40">
              <CheckCircle2 className="text-teal-500" size={40} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Project Submitted!</h1>
            <p className="text-teal-500 text-sm mt-2">Your project is now live on the marketplace</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-teal-500/30 space-y-3">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Your Unique Project ID</p>
            <p className="text-4xl font-black font-mono text-teal-500 tracking-widest">{submitted.project_number}</p>
            <p className="text-zinc-400 text-xs">Share this ID with contractors, investors and diaspora contacts so they can search and find your project instantly.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/projects/${submitted.id}`}
              className="flex items-center justify-center gap-2 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-teal-500 transition-all">
              <ArrowRight size={12} /> View Project
            </Link>
            <Link href="/projects"
              className="flex items-center justify-center gap-2 py-4 border border-zinc-700 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:text-white transition-all">
              Browse Projects
            </Link>
          </div>
          <div className="space-y-2 text-[10px] text-zinc-500">
            <div className="flex items-center gap-2"><CheckCircle2 size={10} className="text-teal-500" /> Contractors can now search and bid on your milestones</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={10} className="text-teal-500" /> Investors can browse and fund your project</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={10} className="text-teal-500" /> Logged to the immutable Nested Ark ledger</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  // ── loading / unauth ────────────────────────────────────────────────────────
  if (authLoading) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={32} /></div>;
  if (!user) {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">

        {/* Header */}
        <header className="border-l-2 border-teal-500 pl-6 mb-10">
          <p className="text-[9px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-1">Project Marketplace</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Submit a Project</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Individuals, corporates, developers and governments can post projects. Contractors bid on milestones. Investors fund them. Anyone in the diaspora can search by Project ID.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Owner Type */}
          <SectionCard title="Who is submitting?" icon={User}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:grid-cols-5">
              {OWNER_TYPES.map(ot => (
                <button key={ot.value} type="button" onClick={() => setOwnerType(ot.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                    ownerType === ot.value
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}>
                  <ot.icon size={18} className={ownerType === ot.value ? 'text-teal-500' : 'text-zinc-500'} />
                  <p className="text-[9px] font-black uppercase tracking-wider">{ot.label}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500">{OWNER_TYPES.find(o => o.value === ownerType)?.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Field label="Contact Name" required><input value={form.owner_name} onChange={e => f('owner_name', e.target.value)} placeholder="Your name or representative" className={inputCls} /></Field>
              <Field label="Contact Email"><input type="email" value={form.owner_email} onChange={e => f('owner_email', e.target.value)} placeholder="contact@company.com" className={inputCls} /></Field>
              <Field label="Contact Phone"><input value={form.owner_phone} onChange={e => f('owner_phone', e.target.value)} placeholder="+234 800 000 0000" className={inputCls} /></Field>
              {['CORPORATE','PRIVATE_BUSINESS','DEVELOPER','GOVERNMENT'].includes(ownerType) && (
                <Field label="Company / Organisation"><input value={form.owner_company} onChange={e => f('owner_company', e.target.value)} placeholder="Company name" className={inputCls} /></Field>
              )}
              <Field label="Owner's Country"><input value={form.owner_country} onChange={e => f('owner_country', e.target.value)} placeholder="Nigeria" className={inputCls} /></Field>
            </div>
          </SectionCard>

          {/* Project Details */}
          <SectionCard title="Project Details" icon={Briefcase}>
            <Field label="Project Title" required>
              <input required value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. 4-Bedroom Detached House — Lekki Phase 2" className={inputCls} />
            </Field>
            <Field label="Full Description" required hint="scope, objectives, special requirements">
              <textarea required rows={4} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Describe the project scope, what needs to be built, key requirements and goals..." className={`${inputCls} resize-none`} />
            </Field>
            <Field label="Investor Pitch" hint="one paragraph for investors and diaspora funders">
              <textarea rows={3} value={form.pitch_summary} onChange={e => f('pitch_summary', e.target.value)} placeholder="Why should investors fund this? What is the economic impact, ROI potential, or social value?" className={`${inputCls} resize-none`} />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Category" required>
                <select required value={category} onChange={e => setCategory(e.target.value)} className={selectCls}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Project Type" required>
                <select value={projectType} onChange={e => setProjectType(e.target.value)} className={selectCls}>
                  {PROJECT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </Field>
              <Field label="City / Location" required>
                <input required value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Lekki, Lagos" className={inputCls} />
              </Field>
              <Field label="Country" required>
                <input required value={form.country} onChange={e => f('country', e.target.value)} placeholder="Nigeria" className={inputCls} />
              </Field>
              <Field label="Total Budget (USD)" required>
                <input required type="number" value={form.budget} onChange={e => f('budget', e.target.value)} placeholder="500000" className={inputCls} />
              </Field>
              <Field label="Currency">
                <select value={form.currency} onChange={e => f('currency', e.target.value)} className={selectCls}>
                  {['USD','NGN','GBP','EUR','GHS','KES','ZAR'].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Timeline (months)">
                <input type="number" value={form.timeline_months} onChange={e => f('timeline_months', e.target.value)} placeholder="24" className={inputCls} />
              </Field>
              <Field label="Expected ROI % p.a.">
                <input type="number" value={form.expected_roi} onChange={e => f('expected_roi', e.target.value)} placeholder="12" className={inputCls} />
              </Field>
            </div>

            <Field label="Hero Image URL" hint="main project image or render">
              <input value={form.hero_image_url} onChange={e => f('hero_image_url', e.target.value)} placeholder="https://cloudinary.com/your-image.jpg" className={inputCls} />
            </Field>
            <Field label="Tags" hint="comma-separated keywords for search">
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="residential, concrete, lekki, 4-bedroom" className={inputCls} />
            </Field>
            <Field label="Visibility">
              <select value={visibility} onChange={e => setVisibility(e.target.value)} className={selectCls}>
                <option value="PUBLIC">Public — visible to all contractors and investors</option>
                <option value="PRIVATE">Private — only you can see it</option>
              </select>
            </Field>
          </SectionCard>

          {/* Milestones */}
          <SectionCard title="Project Milestones / Phases" icon={CheckCircle2}>
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-[10px] text-zinc-400 flex items-start gap-2">
              <Info size={11} className="text-teal-500 mt-0.5 flex-shrink-0" />
              Break your project into phases. Contractors bid on individual milestones. Funds are released per milestone after verification.
            </div>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Phase {i + 1}</span>
                    {milestones.length > 1 && (
                      <button type="button" onClick={() => removeMilestone(i)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required value={m.title} onChange={e => editMilestone(i, 'title', e.target.value)}
                      placeholder="Milestone title e.g. Foundation & Ground Floor*" className={inputCls} />
                    <input value={m.budget_allocation} onChange={e => editMilestone(i, 'budget_allocation', e.target.value)}
                      type="number" placeholder="Budget allocation (USD)" className={inputCls} />
                    <select value={m.required_trade} onChange={e => editMilestone(i, 'required_trade', e.target.value)} className={selectCls}>
                      <option value="">Select required trade</option>
                      {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input value={m.description} onChange={e => editMilestone(i, 'description', e.target.value)}
                      placeholder="Milestone scope / deliverables" className={inputCls} />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addMilestone}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 font-bold text-[10px] uppercase rounded-xl hover:text-teal-500 hover:border-teal-500/40 transition-all">
              <Plus size={12} /> Add Phase
            </button>
          </SectionCard>

          {/* Documents */}
          <SectionCard title="Documents, Plans & Drawings" icon={FileText} defaultOpen={false}>
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-[10px] text-zinc-400 flex items-start gap-2">
              <Upload size={11} className="text-teal-500 mt-0.5 flex-shrink-0" />
              Upload to Cloudinary, Google Drive, or any public URL, then paste the link here. Floor plans, 2D/3D drawings, government approvals, BOQ — all help attract better bids.
            </div>
            <div className="space-y-4">
              {documents.map((doc, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Document {i + 1}</span>
                    <button type="button" onClick={() => removeDocument(i)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select value={doc.doc_type} onChange={e => editDocument(i, 'doc_type', e.target.value)} className={selectCls}>
                      {DOC_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                    </select>
                    <input value={doc.title} onChange={e => editDocument(i, 'title', e.target.value)}
                      placeholder="Document title *" className={inputCls} />
                    <input value={doc.file_url} onChange={e => editDocument(i, 'file_url', e.target.value)}
                      placeholder="File URL (PDF, image, CAD export) *" className={`${inputCls} md:col-span-2`} />
                    <input value={doc.thumbnail_url} onChange={e => editDocument(i, 'thumbnail_url', e.target.value)}
                      placeholder="Thumbnail / preview image URL (optional)" className={inputCls} />
                    <input value={doc.description} onChange={e => editDocument(i, 'description', e.target.value)}
                      placeholder="Brief description of this file" className={inputCls} />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase font-bold cursor-pointer">
                      <input type="checkbox" checked={doc.is_public} onChange={e => editDocument(i, 'is_public', e.target.checked)} className="accent-teal-500" />
                      Public (visible to all)
                    </label>
                    <label className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase font-bold cursor-pointer">
                      <input type="checkbox" checked={doc.requires_kyc} onChange={e => editDocument(i, 'requires_kyc', e.target.checked)} className="accent-teal-500" />
                      KYC required to download
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addDocument}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 font-bold text-[10px] uppercase rounded-xl hover:text-teal-500 hover:border-teal-500/40 transition-all">
              <Plus size={12} /> Add Document / Plan
            </button>
          </SectionCard>

          {/* Partners (optional) */}
          <SectionCard title="Finance & Supply Partners (Optional)" icon={Building2} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Assigned Bank / Financier" hint="bank or fund backing this project">
                <input value={form.assigned_bank} onChange={e => f('assigned_bank', e.target.value)} placeholder="e.g. Access Bank, IFC" className={inputCls} />
              </Field>
              <Field label="Primary Material Supplier" hint="preferred cement, steel or materials vendor">
                <input value={form.primary_supplier} onChange={e => f('primary_supplier', e.target.value)} placeholder="e.g. Dangote Cement PLC" className={inputCls} />
              </Field>
            </div>
          </SectionCard>

          {/* Submit */}
          <div className="p-6 rounded-2xl border border-teal-500/20 bg-teal-500/5 space-y-4">
            <div className="space-y-2 text-[10px] text-zinc-400">
              {[
                'Your project will receive a unique ID (e.g. NAP-2026-00042) visible on the marketplace',
                'Contractors worldwide can search by ID, category, country or trade and submit bids',
                'Investors can browse and fund your project — funds held in escrow until milestones are verified',
                'Diaspora contacts can search by project ID from anywhere in the world',
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2"><CheckCircle2 size={10} className="text-teal-500 mt-0.5 flex-shrink-0" />{t}</div>
              ))}
            </div>
            <button type="submit" disabled={busy}
              className="w-full py-5 bg-white text-black font-black uppercase text-sm tracking-[0.15em] rounded-xl hover:bg-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {busy
                ? <><Loader2 className="animate-spin" size={16} /> Submitting to Marketplace…</>
                : <><Upload size={16} /> Submit Project to Nested Ark Marketplace</>
              }
            </button>
          </div>

        </form>
      </main>
      <Footer />
    </div>
  );
}
