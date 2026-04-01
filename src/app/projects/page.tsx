'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import CurrencySelector from '@/components/CurrencySelector';
import { useLiveProjects } from '@/hooks/useLiveSystem';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import { Briefcase, TrendingUp, ShieldCheck, Plus, Loader2, Globe, MapPin, Activity, X } from 'lucide-react';

// Categories for new project creation
const CATEGORIES = ['Roads','Bridges','Water','Energy','Technology','Housing','Healthcare','Education','Agriculture','Telecommunications'];

// Bid modal
function BidModal({ project, milestones, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ milestone_id: milestones[0]?.id || '', amount: '', timeline_days: '90', proposal: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/api/projects/${project.id}/apply`, {
        amount: parseFloat(form.amount),
        timeline_days: parseInt(form.timeline_days),
        proposal: form.proposal,
        milestone_id: form.milestone_id || undefined,
      });
      alert('Bid submitted successfully! It has been logged to the ledger.');
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Bid submission failed';
      if (msg.includes('profile')) {
        alert('You need to create a contractor profile first. Go to My Profile.');
      } else {
        alert(msg);
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Submit Bid</h3>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest line-clamp-1">{project.title}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {milestones.length > 0 && (
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Milestone</label>
              <select value={form.milestone_id} onChange={e => setForm({ ...form, milestone_id: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors">
                {milestones.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.title} — ${Number(m.budget_allocation).toLocaleString()}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Bid Amount (USD) *</label>
              <input required type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 500000" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Timeline (days) *</label>
              <input required type="number" min="1" value={form.timeline_days} onChange={e => setForm({ ...form, timeline_days: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Technical Proposal *</label>
            <textarea required rows={4} value={form.proposal} onChange={e => setForm({ ...form, proposal: e.target.value })} placeholder="Describe your approach, methodology, team qualifications, and how you will meet project requirements..." className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="flex-1 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="animate-spin" size={14} /> : <><TrendingUp size={12} /> Deploy Bid</>}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-4 border border-zinc-700 text-zinc-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:text-white transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// New project modal (GOVERNMENT only)
function NewProjectModal({ onClose, onSuccess }: any) {
  const [form, setForm] = useState({ title: '', description: '', location: '', country: 'Nigeria', budget: '', category: 'Roads', timeline_months: '24' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/projects', { ...form, budget: parseFloat(form.budget), timeline_months: parseInt(form.timeline_months) });
      alert('Project created successfully!');
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Failed to create project');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight">New Project</h3>
            <p className="text-zinc-500 text-xs mt-1">Create an infrastructure project for funding</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Project Title *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
          <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Project Description *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location (City) *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
            <input required value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Budget (USD) *</label>
              <input required type="number" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 2500000" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Timeline (months)</label>
              <input type="number" min="1" value={form.timeline_months} onChange={e => setForm({ ...form, timeline_months: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="flex-1 py-4 bg-teal-500 text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-teal-400 transition-all disabled:opacity-50 flex items-center justify-center">
              {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Create Project'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-4 border border-zinc-700 text-zinc-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:text-white transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { projects, isLoading, mutate } = useLiveProjects();
  const { currency, setCurrency, format } = useCurrency();
  const [bidProject, setBidProject] = useState<any>(null);
  const [bidMilestones, setBidMilestones] = useState<any[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [geoScope, setGeoScope] = useState<'LOCAL' | 'GLOBAL'>('GLOBAL');
  const [userCountry, setUserCountry] = useState('Nigeria');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  // Detect user's approximate country from browser
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz?.includes('Lagos') || tz?.includes('Abuja')) setUserCountry('Nigeria');
      else if (tz?.includes('Accra')) setUserCountry('Ghana');
      else if (tz?.includes('Nairobi')) setUserCountry('Kenya');
    } catch {}
  }, []);

  const openBidModal = useCallback(async (project: any) => {
    try {
      const res = await api.get(`/api/milestones?project_id=${project.id}`);
      setBidMilestones(res.data.milestones ?? []);
      setBidProject(project);
    } catch { setBidMilestones([]); setBidProject(project); }
  }, []);

  if (authLoading || !user) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={32} /></div>;

  const isGovt = user.role === 'GOVERNMENT' || user.role === 'ADMIN';
  const isContractor = user.role === 'CONTRACTOR';

  const filteredProjects = projects.filter((p: any) => {
    const matchesGeo = geoScope === 'GLOBAL' ? true : p.country?.toLowerCase().includes(userCountry.toLowerCase());
    const matchesFilter = !filter || p.category === filter || p.country?.toLowerCase().includes(filter.toLowerCase());
    return matchesGeo && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {bidProject && (
        <BidModal
          project={bidProject}
          milestones={bidMilestones}
          onClose={() => setBidProject(null)}
          onSuccess={() => { setBidProject(null); mutate(); }}
        />
      )}
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onSuccess={() => { setShowNewProject(false); mutate(); }}
        />
      )}

      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-8 border-l-2 border-teal-500 pl-6">
          <p className="text-[10px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-2">Infrastructure Feed</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Live Projects</h1>
              <p className="text-zinc-500 text-sm mt-1">
                {filteredProjects.length} active deployment opportunit{filteredProjects.length !== 1 ? 'ies' : 'y'}
                {geoScope === 'LOCAL' && ` · ${userCountry}`}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Geo scope toggle */}
              <div className="flex rounded-xl border border-zinc-800 overflow-hidden">
                <button onClick={() => setGeoScope('LOCAL')} className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${geoScope === 'LOCAL' ? 'bg-teal-500 text-black' : 'text-zinc-500 hover:text-white'}`}>
                  <MapPin size={10} /> Local
                </button>
                <button onClick={() => setGeoScope('GLOBAL')} className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${geoScope === 'GLOBAL' ? 'bg-teal-500 text-black' : 'text-zinc-500 hover:text-white'}`}>
                  <Globe size={10} /> Global
                </button>
              </div>
              {/* Category filter */}
              <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-[10px] font-bold uppercase outline-none focus:border-teal-500 transition-colors">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {/* Currency */}
              <CurrencySelector currency={currency} onSelect={setCurrency} compact />
              {isGovt && (
                <button onClick={() => setShowNewProject(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-teal-400 transition-all">
                  <Plus size={12} /> New Project
                </button>
              )}
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="py-20 text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={28} /></div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
            <Briefcase className="mx-auto text-zinc-700 mb-4" size={32} />
            <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">No projects {geoScope === 'LOCAL' ? `in ${userCountry}` : 'found'}</p>
            {geoScope === 'LOCAL' && (
              <button onClick={() => setGeoScope('GLOBAL')} className="mt-4 text-teal-500 text-xs underline">Switch to Global View</button>
            )}
          </div>
        )}

        <div className="grid gap-4">
          {filteredProjects.map((project: any) => (
            <div key={project.id} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 flex-shrink-0">
                    <Briefcase className="text-teal-500" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-base uppercase tracking-tight">{project.title}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${project.status === 'ACTIVE' ? 'border-teal-500/30 text-teal-500' : 'border-zinc-700 text-zinc-500'}`}>
                        {project.status}
                      </span>
                      {project.gov_verified && <ShieldCheck size={12} className="text-teal-500" title="Government Verified" />}
                    </div>
                    <p className="text-zinc-500 text-xs">{project.location}, {project.country}</p>
                    <p className="text-zinc-600 text-[10px] mt-1 line-clamp-2">{project.description}</p>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-zinc-600">
                        <span>Progress</span>
                        <span>{Number(project.progress_percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 transition-all" style={{ width: `${project.progress_percentage || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Budget</p>
                    <p className="font-mono text-lg font-bold text-white">{format(Number(project.budget))}</p>
                    {currency !== 'USD' && (
                      <p className="text-[9px] text-zinc-600 font-mono">${Number(project.budget).toLocaleString()} USD</p>
                    )}
                    <span className="text-[9px] text-zinc-600 uppercase">{project.category}</span>
                  </div>
                  {isContractor && (
                    <button onClick={() => openBidModal(project)} className="flex items-center gap-2 px-5 py-3 bg-white text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-teal-500 transition-all active:scale-95">
                      <Activity size={12} /> Submit Bid
                    </button>
                  )}
                  {isGovt && (
                    <div className="flex gap-2">
                      <button onClick={async () => {
                        const hash = await api.post('/api/gov/verify-project', { project_id: project.id, official_id: user.id, official_name: user.full_name }).then(r => r.data.hash).catch(() => null);
                        if (hash) { alert(`Project verified. Hash: ${hash.slice(0,16)}...`); mutate(); }
                      }} className="px-3 py-2 bg-teal-500/20 border border-teal-500/30 text-teal-400 font-bold rounded-lg text-[9px] uppercase tracking-tighter hover:bg-teal-500/30 transition-all">
                        <ShieldCheck size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
