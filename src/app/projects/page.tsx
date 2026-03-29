'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Plus, X, MapPin, DollarSign, Send, Briefcase } from 'lucide-react';

export default function ProjectsPage() {
  const { user, isLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showBidForm, setShowBidForm] = useState<string | null>(null);
  const [bidData, setBidData] = useState({ amount: '', proposal: '', timeline_days: '30' });

  useEffect(() => { if (user) fetchProjects(); }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data.projects);
    } catch (error) { console.error(error); }
  };

  const handleBid = async (projectId: string) => {
    try {
      await api.post(`/api/projects/${projectId}/apply`, {
        amount: parseFloat(bidData.amount),
        proposal: bidData.proposal,
        timeline_days: parseInt(bidData.timeline_days)
      });
      alert("Bid Submitted to Project Node");
      setShowBidForm(null);
    } catch (error) { alert("Bid Failed: Ensure profile exists"); }
  };

  if (isLoading) return <div className="h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter">Infrastructure Feed</h2>
            <p className="text-zinc-500">Live deployment opportunities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p: any) => (
            <div key={p.id} className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-8 hover:border-teal-500/50 transition-all">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">{p.title}</h3>
                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-500 text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">
                  {p.status}
                </span>
              </div>
              <p className="text-zinc-400 mb-8 line-clamp-2">{p.description}</p>
              
              <div className="flex gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2 text-zinc-300"><MapPin size={16} className="text-teal-500" /> {p.location}</div>
                <div className="flex items-center gap-2 text-zinc-300"><DollarSign size={16} className="text-teal-500" /> ${(p.budget/1000).toFixed(0)}k</div>
              </div>

              {user?.role === 'CONTRACTOR' && (
                <button 
                  onClick={() => setShowBidForm(p.id)}
                  className="w-full py-4 rounded-xl bg-white text-black font-bold uppercase text-xs tracking-[0.2em] hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} /> Submit Quotation
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bidding Modal */}
        {showBidForm && (
          <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex justify-between mb-8">
                <h3 className="text-xl font-bold uppercase tracking-tighter">Project Quotation</h3>
                <button onClick={() => setShowBidForm(null)}><X /></button>
              </div>
              <div className="space-y-4">
                <input type="number" placeholder="Bid Amount (USD)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none" onChange={e => setBidData({...bidData, amount: e.target.value})} />
                <textarea placeholder="Technical Proposal" rows={4} className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none" onChange={e => setBidData({...bidData, proposal: e.target.value})} />
                <button onClick={() => handleBid(showBidForm)} className="w-full py-4 bg-teal-500 text-black font-bold rounded-xl uppercase tracking-widest">Deploy Bid</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}