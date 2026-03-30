'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { MapPin, DollarSign, Send, X, Plus, Activity, RefreshCw, Briefcase } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  budget: number;
  currency: string;
  category: string;
  status: string;
  progress_percentage: number;
}

const CATEGORIES = ['Infrastructure', 'Roads', 'Bridges', 'Energy', 'Water', 'Housing', 'Healthcare', 'Education', 'Agriculture', 'Technology'];

export default function ProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [bidData, setBidData] = useState({ amount: '', proposal: '', timeline_days: '30' });
  const [createData, setCreateData] = useState({
    title: '', description: '', location: '', country: 'Nigeria',
    budget: '', currency: 'USD', category: 'Infrastructure', timeline_months: '12',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data.projects ?? []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/login'); return; }
    fetchProjects();
  }, [user, authLoading, router, fetchProjects]);

  const handleBid = async (projectId: string) => {
    if (!bidData.amount || !bidData.proposal) {
      alert('Please fill in bid amount and proposal.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/projects/${projectId}/apply`, {
        amount: parseFloat(bidData.amount),
        proposal: bidData.proposal,
        timeline_days: parseInt(bidData.timeline_days),
      });
      alert('Bid submitted successfully.');
      setShowBidForm(null);
      setBidData({ amount: '', proposal: '', timeline_days: '30' });
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Bid failed. Create a contractor profile first.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.title || !createData.description || !createData.location || !createData.budget) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/projects', {
        title: createData.title,
        description: createData.description,
        location: createData.location,
        country: createData.country,
        budget: parseFloat(createData.budget),
        currency: createData.currency,
        category: createData.category,
        timeline_months: parseInt(createData.timeline_months),
      });
      alert('Project created successfully.');
      setShowCreateForm(false);
      setCreateData({ title: '', description: '', location: '', country: 'Nigeria', budget: '', currency: 'USD', category: 'Infrastructure', timeline_months: '12' });
      fetchProjects();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const canCreateProject = user?.role === 'GOVERNMENT' || user?.role === 'ADMIN';

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Activity className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">Infrastructure Feed</h2>
            <p className="text-zinc-500 text-sm mt-1">Live deployment opportunities · {projects.length} active</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchProjects} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/50 transition-all">
              <RefreshCw size={16} />
            </button>
            {canCreateProject && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-teal-400 transition-all"
              >
                <Plus size={14} /> New Project
              </button>
            )}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-zinc-800 rounded-3xl">
            <Briefcase className="mx-auto text-zinc-700 mb-4" size={32} />
            <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">No projects yet</p>
            {canCreateProject && (
              <button onClick={() => setShowCreateForm(true)} className="mt-4 text-teal-500 text-xs underline">
                Create the first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-8 hover:border-teal-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold tracking-tight uppercase flex-1 mr-3">{p.title}</h3>
                  <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-500 text-[9px] font-bold uppercase tracking-widest border border-teal-500/20 flex-shrink-0">
                    {p.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{p.description}</p>

                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin size={14} className="text-teal-500" />
                    {p.location}, {p.country}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <DollarSign size={14} className="text-teal-500" />
                    {p.currency} {Number(p.budget).toLocaleString()}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold mb-1">
                    <span>Progress</span>
                    <span>{p.progress_percentage ?? 0}%</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${p.progress_percentage ?? 0}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold">{p.category}</span>
                  {user?.role === 'CONTRACTOR' && (
                    <button
                      onClick={() => setShowBidForm(p.id)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-teal-500 transition-all"
                    >
                      <Send size={12} /> Submit Bid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bid Modal */}
        {showBidForm && (
          <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold uppercase tracking-tighter">Submit Bid</h3>
                <button onClick={() => setShowBidForm(null)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Bid Amount (USD)</label>
                  <input
                    type="number" placeholder="e.g. 50000"
                    className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors"
                    value={bidData.amount}
                    onChange={e => setBidData({ ...bidData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Timeline (days)</label>
                  <input
                    type="number" placeholder="30"
                    className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors"
                    value={bidData.timeline_days}
                    onChange={e => setBidData({ ...bidData, timeline_days: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Technical Proposal</label>
                  <textarea
                    placeholder="Describe your approach, team, and relevant experience..."
                    rows={4}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors resize-none"
                    value={bidData.proposal}
                    onChange={e => setBidData({ ...bidData, proposal: e.target.value })}
                  />
                </div>
                <button
                  disabled={submitting}
                  onClick={() => handleBid(showBidForm)}
                  className="w-full py-4 bg-teal-500 text-black font-bold rounded-xl uppercase tracking-widest hover:bg-teal-400 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? <Activity className="animate-spin" size={18} /> : 'Deploy Bid'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 my-6">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold uppercase tracking-tighter">Create Project</h3>
                <button onClick={() => setShowCreateForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Project Title *</label>
                    <input required placeholder="e.g. Lagos-Ibadan Highway Upgrade" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors" value={createData.title} onChange={e => setCreateData({ ...createData, title: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Description *</label>
                    <textarea required rows={3} placeholder="Describe the project scope, goals, and impact..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors resize-none" value={createData.description} onChange={e => setCreateData({ ...createData, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Location *</label>
                    <input required placeholder="e.g. Lagos" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors" value={createData.location} onChange={e => setCreateData({ ...createData, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Country *</label>
                    <input required placeholder="e.g. Nigeria" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors" value={createData.country} onChange={e => setCreateData({ ...createData, country: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Budget (USD) *</label>
                    <input required type="number" placeholder="e.g. 500000" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors" value={createData.budget} onChange={e => setCreateData({ ...createData, budget: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Category</label>
                    <select className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors" value={createData.category} onChange={e => setCreateData({ ...createData, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Timeline (months)</label>
                    <input type="number" placeholder="12" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-teal-500 transition-colors" value={createData.timeline_months} onChange={e => setCreateData({ ...createData, timeline_months: e.target.value })} />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-teal-500 text-black font-bold rounded-xl uppercase tracking-widest hover:bg-teal-400 transition-all disabled:opacity-50 flex items-center justify-center mt-2">
                  {submitting ? <Activity className="animate-spin" size={18} /> : 'Deploy Project'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
