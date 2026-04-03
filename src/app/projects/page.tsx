'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import CurrencySelector from '@/components/CurrencySelector';
import { useLiveProjects } from '@/hooks/useLiveSystem';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import { Briefcase, TrendingUp, ShieldCheck, Plus, Loader2, Globe, MapPin, Activity, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Roads','Bridges','Water','Energy','Technology','Housing','Healthcare','Education','Agriculture','Telecommunications'];

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
      alert('Bid submitted successfully!');
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Bid submission failed');
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Bid Amount (USD) *</label>
              <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Timeline (days) *</label>
              <input required type="number" value={form.timeline_days} onChange={e => setForm({ ...form, timeline_days: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
            </div>
          </div>
          <textarea required rows={4} value={form.proposal} onChange={e => setForm({ ...form, proposal: e.target.value })} placeholder="Technical proposal..." className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 resize-none" />
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="flex-1 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-teal-500 transition-all flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Deploy Bid'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-4 border border-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-xl hover:text-white">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
        <h3 className="text-xl font-bold uppercase">New Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Project Title *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
          <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
            <input required value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="Budget (USD) *" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
            <input type="number" value={form.timeline_months} onChange={e => setForm({ ...form, timeline_months: e.target.value })} placeholder="Months" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
          </div>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="flex-1 py-4 bg-teal-500 text-black font-bold uppercase text-xs rounded-xl hover:bg-teal-400 transition-all flex items-center justify-center">
              {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Create Project'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-4 border border-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-xl">Cancel</button>
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
  const [showNewProject, setShowNewProject] = useState(false);
  const [geoScope, setGeoScope] = useState<'LOCAL' | 'GLOBAL'>('GLOBAL');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={32} /></div>;

  const isGovt = user.role === 'GOVERNMENT' || user.role === 'ADMIN';
  const isContractor = user.role === 'CONTRACTOR';

  const filteredProjects = projects.filter((p: any) => {
    const matchesFilter = !filter || p.category === filter || p.country?.toLowerCase().includes(filter.toLowerCase());
    return matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {bidProject && <BidModal project={bidProject} milestones={[]} onClose={() => setBidProject(null)} onSuccess={() => { setBidProject(null); mutate(); }} />}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onSuccess={() => { setShowNewProject(false); mutate(); }} />}
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-8 border-l-2 border-teal-500 pl-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-[10px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-2">Infrastructure Feed</p>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Live Projects</h1>
          </div>
          <div className="flex gap-3">
            <CurrencySelector currency={currency} onSelect={setCurrency} compact />
            {isGovt && (
              <button onClick={() => setShowNewProject(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-black font-bold uppercase text-[10px] rounded-xl hover:bg-teal-400 transition-all">
                <Plus size={12} /> New Project
              </button>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={28} /></div>
        ) : (
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
                        <Link href={`/projects/${project.id}`} className="font-bold text-base uppercase tracking-tight hover:text-teal-500 transition-colors flex items-center gap-2">
                          {project.title} <ExternalLink size={14} className="opacity-50" />
                        </Link>
                        {project.gov_verified && <ShieldCheck size={12} className="text-teal-500" />}
                      </div>
                      <p className="text-zinc-500 text-xs">{project.location}, {project.country}</p>
                      <p className="text-zinc-600 text-[10px] mt-1 line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Budget</p>
                      <p className="font-mono text-lg font-bold text-white">{format(Number(project.budget))}</p>
                    </div>
                    {isContractor && (
                      <button onClick={() => setBidProject(project)} className="flex items-center gap-2 px-5 py-3 bg-white text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-teal-500 transition-all">
                        <Activity size={12} /> Submit Bid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}