'use client';
import Link from 'next/link';
import { Globe, Twitter, Linkedin, Mail, Shield, Database, TrendingUp, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <div>
              <h2 className="text-white font-black text-xl tracking-tighter uppercase">Nested Ark <span className="text-teal-500">OS</span></h2>
              <p className="text-[10px] text-teal-500 uppercase font-bold tracking-widest mt-1">Global Infrastructure Exchange</p>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Revolutionizing infrastructure investment through transparent ledgers, AI-driven verification, and automated escrow.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://twitter.com/NestedArkOS" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-800 text-zinc-600 hover:text-teal-500 hover:border-teal-500/50 transition-all">
                <Twitter size={14} />
              </a>
              <a href="https://linkedin.com/company/nested-ark" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-800 text-zinc-600 hover:text-teal-500 hover:border-teal-500/50 transition-all">
                <Linkedin size={14} />
              </a>
              <a href="https://github.com/tayeloluejire/nested-ark-api" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-800 text-zinc-600 hover:text-teal-500 hover:border-teal-500/50 transition-all">
                <Github size={14} />
              </a>
              <a href="mailto:nestedark@gmail.com" className="p-2 rounded-lg border border-zinc-800 text-zinc-600 hover:text-teal-500 hover:border-teal-500/50 transition-all">
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={12} className="text-teal-500" /> Platform
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              {[
                { href: '/projects', label: 'Explore Projects' },
                { href: '/investments', label: 'Investment Nodes' },
                { href: '/milestones', label: 'Milestone Tracker' },
                { href: '/ledger', label: 'Global Ledger' },
                { href: '/map', label: 'Infrastructure Map' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className="hover:text-teal-500 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Governance */}
          <div>
            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} className="text-teal-500" /> Governance
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              {[
                { href: '/register', label: 'Register as Investor' },
                { href: '/register', label: 'Register as Contractor' },
                { href: '/register', label: 'Government Portal' },
                { href: '/admin', label: 'Admin Command Center' },
                { href: '/forgot-password', label: 'Access Recovery' },
              ].map((l, i) => (
                <li key={i}><Link href={l.href} className="hover:text-teal-500 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact + Legal */}
          <div>
            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest flex items-center gap-2">
              <Globe size={12} className="text-teal-500" /> Contact & Legal
            </h4>
            <div className="space-y-3 text-sm text-zinc-500 mb-5">
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-teal-500 flex-shrink-0" />
                <a href="mailto:nestedark@gmail.com" className="hover:text-teal-500 transition-colors">nestedark@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Twitter size={12} className="text-teal-500 flex-shrink-0" />
                <a href="https://twitter.com/NestedArkOS" target="_blank" rel="noopener noreferrer" className="hover:text-teal-500 transition-colors">@NestedArk_OS</a>
              </div>
              <p className="text-zinc-600 text-[10px] font-mono">Lagos · London · Dubai</p>
            </div>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li><Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/escrow-rules" className="hover:text-zinc-400 transition-colors">Escrow Protocol</Link></li>
              <li><Link href="/api-docs" className="hover:text-zinc-400 transition-colors">API Documentation</Link></li>
            </ul>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap items-center gap-4 py-6 border-t border-zinc-800 border-b border-zinc-800 mb-6">
          {[
            { icon: Shield, label: 'Tri-Layer Verification', desc: 'AI + Human + Drone' },
            { icon: Database, label: 'Bulletproof Ledger', desc: 'SHA-256 Hash Chain' },
            { icon: TrendingUp, label: 'Real-Time Escrow', desc: 'Atomic Multi-Sig Release' },
            { icon: Globe, label: 'Multi-Currency', desc: 'NGN · GHS · KES · EUR · GBP' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <Icon size={12} className="text-teal-500 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-white font-bold uppercase tracking-widest">{item.label}</p>
                  <p className="text-[8px] text-zinc-600">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom line */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[9px] text-zinc-700 uppercase tracking-[0.2em]">
          <span>© 2026 Nested Ark Infrastructure OS. All Rights Reserved.</span>
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            Secured by Bulletproof Hash Chain v2.4 · 57 Live Endpoints
          </span>
        </div>
      </div>
    </footer>
  );
}
