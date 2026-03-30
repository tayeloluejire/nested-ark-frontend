'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Activity, Briefcase, TrendingUp, CheckCircle2, Clock, DollarSign, Users, ShieldCheck } from 'lucide-react';

interface DashboardStats {
  totalProjects: number; activeProjects: number;
  totalMilestones: number; completedMilestones: number; totalInvestments: number;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ totalProjects: 0, activeProjects: 0, totalMilestones: 0, completedMilestones: 0, totalInvestments: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [projectsRes, milestonesRes] = await Promise.all([api.get('/api/projects'), api.get('/api/milestones')]);
      const projects = projectsRes.data.projects ?? [];
      const milestones = milestonesRes.data.milestones ?? [];
      setStats({ totalProjects: projects.length, activeProjects: projects.filter((p: any) => p.status === 'ACTIVE').length, totalMilestones: milestones.length, completedMilestones: milestones.filter((m: any) => m.status === 'PAID' || m.status === 'COMPLETED').length, totalInvestments: 0 });
    } catch (err) { console.error('Dashboard fetch error:', err); }
    finally { setDataLoading(false); }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/login'); return; }
    fetchStats();
  }, [user, authLoading, router, fetchStats]);

  if (authLoading || dataLoading) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Activity className="animate-spin text-teal-500" size={32} /></div>;
  if (!user) return null;

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: Briefcase, color: 'text-teal-500' },
    { label: 'Active Projects', value: stats.activeProjects, icon: Activity, color: 'text-emerald-500' },
    { label: 'Milestones', value: stats.totalMilestones, icon: Clock, color: 'text-amber-500' },
    { label: 'Completed', value: stats.completedMilestones, icon: CheckCircle2, color: 'text-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 border-l-2 border-teal-500 pl-6">
          <p className="text-[10px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-2">Operator Terminal // {user.role}</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Welcome, {user.full_name?.split(' ')[0] ?? 'Operator'}</h1>
          <p className="text-zinc-500 text-sm mt-1">Infrastructure Management OS — Live System Overview</p>
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {statCards.map((card) => { const Icon = card.icon; return (
            <div key={card.label} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{card.label}</p>
                <Icon size={16} className={card.color} />
              </div>
              <p className="text-3xl font-black font-mono">{card.value}</p>
            </div>
          ); })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(user.role === 'GOVERNMENT' || user.role === 'ADMIN') && (
            <button onClick={() => router.push('/projects')} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-teal-500/50 transition-all text-left">
              <ShieldCheck className="text-teal-500 mb-4" size={24} /><h3 className="font-bold uppercase tracking-tight mb-1">Manage Projects</h3><p className="text-zinc-500 text-xs">Create, verify and approve infrastructure proposals.</p>
            </button>
          )}
          {user.role === 'INVESTOR' && (
            <button onClick={() => router.push('/investments')} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-teal-500/50 transition-all text-left">
              <TrendingUp className="text-emerald-500 mb-4" size={24} /><h3 className="font-bold uppercase tracking-tight mb-1">Investment Nodes</h3><p className="text-zinc-500 text-xs">Browse open funding pools and commit capital.</p>
            </button>
          )}
          {user.role === 'CONTRACTOR' && (
            <button onClick={() => router.push('/projects')} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-teal-500/50 transition-all text-left">
              <Briefcase className="text-amber-500 mb-4" size={24} /><h3 className="font-bold uppercase tracking-tight mb-1">Submit Bids</h3><p className="text-zinc-500 text-xs">View open projects and submit your quotation.</p>
            </button>
          )}
          <button onClick={() => router.push('/milestones')} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-teal-500/50 transition-all text-left">
            <DollarSign className="text-teal-500 mb-4" size={24} /><h3 className="font-bold uppercase tracking-tight mb-1">Payout Schedule</h3><p className="text-zinc-500 text-xs">Track milestone payouts and escrow releases.</p>
          </button>
          <button onClick={() => router.push('/ledger')} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-teal-500/50 transition-all text-left">
            <Users className="text-teal-500 mb-4" size={24} /><h3 className="font-bold uppercase tracking-tight mb-1">Global Ledger</h3><p className="text-zinc-500 text-xs">Live transparency log of all system events.</p>
          </button>
        </div>
      </main>
    </div>
  );
}
