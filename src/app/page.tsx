'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <Loader2 className="animate-spin text-teal-500" size={28} />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-base font-bold tracking-tighter uppercase">
            Nested Ark <span className="text-teal-500">OS</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-teal-500 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-teal-400 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-teal-500 text-[10px] uppercase font-bold tracking-[0.3em] mb-6">
          Global Infrastructure Investment System
        </p>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6 leading-none">
          Infrastructure<br /><span className="text-teal-500">Investment</span><br />OS
        </h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
          Connect governments, contractors, and investors to fund, build, and verify
          infrastructure projects — with full transparency and automated escrow.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register" className="bg-white text-black px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-teal-500 transition-colors">
            Join the Network
          </Link>
          <Link href="/login" className="border border-zinc-700 text-white px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:border-teal-500 transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, title: 'Live Investment Pools', desc: 'Commit capital to real infrastructure projects with real-time funding progress tracking.' },
            { icon: ShieldCheck, title: 'Government Verified', desc: 'Every project carries a SHA-256 immutable verification hash logged to the transparency ledger.' },
            { icon: Zap, title: 'Automated Escrow', desc: 'Milestone-based payments release automatically upon verification — no manual intervention.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30">
                <Icon className="text-teal-500 mb-4" size={24} />
                <h3 className="font-bold uppercase tracking-tight mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
