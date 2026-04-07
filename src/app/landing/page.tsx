'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ShieldCheck, TrendingUp, Building2, Users, Globe,
  CheckCircle2, Lock, Eye, Cpu, Scale, FileText, MapPin,
  DollarSign, Zap, Home, Factory, TreePine, Wrench, BarChart3,
  BadgeCheck, ChevronDown, Star, Play, RefreshCw, Database, Camera,
  Briefcase, HardHat
} from 'lucide-react';
import MarketTicker from '@/components/MarketTicker';
import ThemeToggle from '@/components/ThemeToggle';
import api from '@/lib/api';

export default function LandingPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/api/marketplace/stats').then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-teal-500/30">
      <MarketTicker />
      
      {/* Hero Section */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-teal-500 rounded-sm rotate-45 shadow-[0_0_15px_rgba(20,184,166,0.4)]" />
          <span className="font-black tracking-[0.3em] uppercase text-sm">Nested Ark OS</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle compact />
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest hover:text-teal-400 transition-colors">Sign In</Link>
          <Link href="/register" className="px-5 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.15em] rounded-lg hover:bg-teal-500 transition-all">Get Started</Link>
        </div>
      </nav>

      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            Neutral Escrow & Transparency Platform
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
            The World's <span className="text-zinc-700">Infrastructure</span> <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-500">Exchange.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-400 text-sm md:text-lg font-medium leading-relaxed mb-10 uppercase tracking-wide">
            Bridging the trust gap between Global Capital and African Infrastructure. 
            Real-time verification for private property, corporate developments, and public grids.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/register?role=INVESTOR" className="w-full md:w-auto px-10 py-5 bg-teal-500 text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-xl shadow-teal-500/20">
              Start Investing
            </Link>
            <Link href="/register?role=DEVELOPER" className="w-full md:w-auto px-10 py-5 border border-zinc-800 bg-zinc-900/50 text-white font-bold uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all">
              List a Project
            </Link>
          </div>
        </div>
      </header>

      {/* Global Capacity Section */}
      <section className="py-24 border-y border-zinc-900 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <Home className="text-teal-500" size={32} />
              <h3 className="text-xl font-bold uppercase tracking-tight">Private & Residential</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Crowdfunded property developments for individuals and private estates with second-by-second yield accrual.</p>
            </div>
            <div className="space-y-4">
              <Factory className="text-teal-500" size={32} />
              <h3 className="text-xl font-bold uppercase tracking-tight">Corporate & Industrial</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Scaling industrial capacity for companies through transparent, milestone-gated funding models.</p>
            </div>
            <div className="space-y-4">
              <Globe className="text-teal-500" size={32} />
              <h3 className="text-xl font-bold uppercase tracking-tight">International & Diaspora</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">A trusted bridge for the Diaspora to invest in home-country growth with full currency hedging (GBP/USD/NGN).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proof of Work / Drone Section */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-teal-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Verification Engine</div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">
              Don't Trust. <br/><span className="text-zinc-500">Verify via Drone.</span>
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                  <Camera size={24} />
                </div>
                <div>
                  <h4 className="font-bold uppercase text-xs tracking-widest mb-1">Visual Proof</h4>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">4K Video and LiDAR captures uploaded for every construction milestone before funds are released.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                  <Database size={24} />
                </div>
                <div>
                  <h4 className="font-bold uppercase text-xs tracking-widest mb-1">Immutable Ledger</h4>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">Every verification event is hashed using SHA-256 and stored on the Global Infrastructure Ledger.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 group">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
             <div className="absolute bottom-8 left-8 z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500 text-black text-[9px] font-black uppercase tracking-widest mb-2">
                  <Play size={10} fill="black" /> Live Feed
                </div>
                <p className="text-white font-bold uppercase text-xs tracking-widest">Port Harcourt Smart Bridge</p>
                <p className="text-zinc-500 text-[9px] uppercase tracking-widest">Verification ID: PH-SB-2026-X81</p>
             </div>
             <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1591017403286-fd8493524e1e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 rounded-sm rotate-45" />
              <span className="font-black tracking-[0.3em] uppercase text-sm">Nested Ark OS</span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
              The infrastructure exchange platform specializing in neutral escrow, drone verification, and cryptographic ledgers. A product of Impressions & Impacts Ltd.
            </p>
            <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
              Lagos · London · Dubai
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Platform</p>
            <div className="flex flex-col gap-3 text-xs font-bold text-zinc-400">
              <Link href="/projects" className="hover:text-teal-400 transition-colors uppercase tracking-widest">Infrastructure Map</Link>
              <Link href="/ledger" className="hover:text-teal-400 transition-colors uppercase tracking-widest">Global Ledger</Link>
              <Link href="/governance" className="hover:text-teal-400 transition-colors uppercase tracking-widest">Escrow Rules</Link>
            </div>
          </div>
          <div className="space-y-4">
             <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Legal</p>
             <div className="flex flex-col gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
               <Link href="/terms">Terms</Link>
               <Link href="/privacy">Privacy</Link>
               <span className="text-amber-500/50">Neutral Platform Only</span>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
          <p>© 2026 Nested Ark OS. All Rights Reserved.</p>
          <p className="flex items-center gap-2"><Lock size={10} /> Secured by Bulletproof Hash Chain v2.4</p>
        </div>
      </footer>
    </div>
  );
}