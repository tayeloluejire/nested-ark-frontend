'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, ShieldCheck, TrendingUp, Building2, Users,
  Globe, CheckCircle2, Lock, Eye, Cpu, Layers, Play,
  ChevronDown, Star, Quote, MapPin, Zap, Scale, FileText
} from 'lucide-react';
import MarketTicker from '@/components/MarketTicker';

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '', decimals = 0 }: {
  to: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const step = to / 60;
    const iv = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(iv); }
      else setVal(start);
    }, 16);
    return () => clearInterval(iv);
  }, [to]);
  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()}{suffix}
    </span>
  );
}

// ── Floating tag ──────────────────────────────────────────────────────────────
function Tag({ children, color = 'teal' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    teal:    'border-teal-500/30 bg-teal-500/8 text-teal-400',
    amber:   'border-amber-500/30 bg-amber-500/8 text-amber-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400',
    blue:    'border-blue-500/30 bg-blue-500/8 text-blue-400',
    red:     'border-red-500/30 bg-red-500/8 text-red-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${colors[color] ?? colors.teal}`}>
      {children}
    </span>
  );
}

export default function LandingPage() {
  const [activeRole, setActiveRole] = useState(0);

  const roles = [
    {
      id: 'investor',
      label: 'Diaspora Investor',
      emoji: '💰',
      flag: '🇬🇧🇺🇸🇦🇪',
      headline: 'Your money builds home. Your ledger never lies.',
      body: 'Send capital from London, New York or Dubai into verified Nigerian infrastructure. Watch your yield accrue in real-time via cryptographic escrow — not a promise, a hash.',
      bullets: ['12% p.a. annual yield target', 'Principal held in Paystack escrow', 'Tri-layer milestone release', 'Real-time GBP / USD / NGN tracking'],
      cta: 'Start Investing',
      href: '/register?role=INVESTOR',
      color: 'teal',
    },
    {
      id: 'developer',
      label: 'Developer / Owner',
      emoji: '🏠',
      flag: '🇳🇬',
      headline: 'Post once. Track forever. Build without flying home.',
      body: 'Assign a Nested Ark Project ID (NAP) to your build site. Upload 2D blueprints and 3D renders. Contractors bid. Investors fund. You approve each milestone from anywhere on earth.',
      bullets: ['Unique NAP project number', '2D/3D document upload', 'Milestone-by-milestone control', 'No upfront platform fee to list'],
      cta: 'Submit a Project',
      href: '/register?role=DEVELOPER',
      color: 'emerald',
    },
    {
      id: 'contractor',
      label: 'Contractor',
      emoji: '🏗',
      flag: '🇳🇬',
      headline: 'Win work by trade. Get paid per milestone. No chase.',
      body: 'Browse project IDs by trade type — Civil, Electrical, Plumbing. Bid transparently. When the verifier confirms your work, escrow releases automatically. No invoice chasing.',
      bullets: ['Search by trade category', 'Transparent bid marketplace', 'Escrow-guaranteed payment', 'Immutable work record'],
      cta: 'Find Work',
      href: '/register?role=CONTRACTOR',
      color: 'amber',
    },
    {
      id: 'government',
      label: 'Government / Agency',
      emoji: '🏛',
      flag: '🇳🇬',
      headline: 'Mandate it. Fund it. Audit it. Publicly.',
      body: 'Sponsor public infrastructure tenders with full ledger transparency. Every NGN spent is hash-chained to an immutable audit log. Drone footage confirms physical progress before any release.',
      bullets: ['Public tender management', 'Drone verification integration', 'Immutable expenditure ledger', 'AML & compliance reporting'],
      cta: 'Open Gov Portal',
      href: '/register?role=GOVERNMENT',
      color: 'blue',
    },
  ];

  const activeRoleData = roles[activeRole];

  const colorMap: Record<string, { border: string; bg: string; text: string; btn: string }> = {
    teal:    { border: 'border-teal-500/40',    bg: 'bg-teal-500/5',    text: 'text-teal-400',    btn: 'bg-teal-500 hover:bg-white' },
    emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/5', text: 'text-emerald-400', btn: 'bg-emerald-500 hover:bg-white' },
    amber:   { border: 'border-amber-500/40',   bg: 'bg-amber-500/5',   text: 'text-amber-400',   btn: 'bg-amber-500 hover:bg-white'  },
    blue:    { border: 'border-blue-500/40',    bg: 'bg-blue-500/5',    text: 'text-blue-400',    btn: 'bg-blue-500 hover:bg-white'   },
  };
  const c = colorMap[activeRoleData.color];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-teal-500/30 overflow-x-hidden">

      {/* Market ticker */}
      <MarketTicker />

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-teal-500 rounded-sm rotate-45 flex-shrink-0" />
            <span className="text-sm font-black tracking-[0.15em] uppercase">
              Nested Ark <span className="text-teal-500 text-[10px] align-top">OS</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[9px] font-bold uppercase tracking-widest">
            <a href="#what"       className="text-zinc-500 hover:text-white transition-colors">What it is</a>
            <a href="#how"        className="text-zinc-500 hover:text-white transition-colors">How it works</a>
            <a href="#roles"      className="text-zinc-500 hover:text-white transition-colors">Who it's for</a>
            <a href="#trust"      className="text-zinc-500 hover:text-white transition-colors">Trust</a>
            <Link href="/projects" className="text-zinc-500 hover:text-white transition-colors">Marketplace</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"    className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Link href="/register" className="bg-white text-black px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all">
              Get Access
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a608_1px,transparent_1px),linear-gradient(to_bottom,#14b8a608_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative space-y-8">
          {/* Badge row */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Tag color="teal"><ShieldCheck size={9} /> Tri-Layer Verified</Tag>
            <Tag color="emerald"><Lock size={9} /> Paystack Escrow</Tag>
            <Tag color="amber"><Cpu size={9} /> AI + Human + Drone</Tag>
            <Tag color="blue"><Globe size={9} /> Lagos · London · Dubai</Tag>
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.82] italic">
              Infrastructure<br />
              You Can <span className="text-teal-500">Trust.</span><br />
              Capital You Can <span className="text-teal-500">Track.</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
              Nested Ark is the <strong className="text-white font-bold">escrow and transparency layer</strong> between
              Diaspora capital and African infrastructure projects. We are not the contractor — we are the platform that
              ensures your money only moves when the work is verified.
            </p>
          </div>

          {/* Disclaimer / positioning line */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/40 text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
            <Scale size={10} className="text-amber-400 flex-shrink-0" />
            Nested Ark is the platform &amp; escrow provider — not the contractor. Projects are posted by their owners.
          </div>

          {/* CTA pair */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register?role=INVESTOR"
              className="flex items-center gap-2 px-8 py-4 bg-teal-500 text-black font-black uppercase text-xs tracking-[0.15em] rounded-xl hover:bg-white transition-all">
              Start Investing <ArrowRight size={14} />
            </Link>
            <Link href="/projects"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:border-teal-500/60 transition-all">
              Browse Projects
            </Link>
            <Link href="/register?role=DEVELOPER"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:border-zinc-600 hover:text-white transition-all">
              Post a Project
            </Link>
          </div>

          {/* Live stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8">
            {[
              { label: 'Target Annual Yield', value: <><Counter to={12} />%</> },
              { label: 'Verification Layers',  value: <Counter to={3} /> },
              { label: 'Currencies Supported', value: <Counter to={5} /> },
              { label: 'Audit Trail Events',   value: <><Counter to={57} />+ endpoints</> },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/20 text-center">
                <p className="text-2xl font-black font-mono text-teal-500">{s.value}</p>
                <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is Nested Ark ────────────────────────────────────────────────── */}
      <section id="what" className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center space-y-4">
          <Tag color="teal">What is Nested Ark</Tag>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
            Infrastructure Needs<br />A <span className="text-teal-500">Trusted Referee</span>
          </h2>
          <p className="text-zinc-500 text-base max-w-2xl mx-auto leading-relaxed">
            Billions of pounds flow from the Diaspora to African home-countries every year. Most of it disappears
            into a fog of incomplete projects, diverted funds, and zero accountability. Nested Ark fixes that.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Building2,
              title: 'The Problem',
              color: 'text-red-400',
              border: 'border-red-500/20',
              bg: 'bg-red-500/5',
              points: [
                'Diaspora sends £50k. Construction stops at foundation.',
                'No independent verification of progress.',
                'Contractor disappears after first payment.',
                'No legal recourse across jurisdictions.',
              ],
            },
            {
              icon: ShieldCheck,
              title: 'Our Solution',
              color: 'text-teal-400',
              border: 'border-teal-500/20',
              bg: 'bg-teal-500/5',
              points: [
                'All funds held in Paystack escrow — not with the contractor.',
                'Three independent parties verify each milestone.',
                'Drone footage + human auditor + AI hash = release.',
                'Immutable SHA-256 ledger for every transaction.',
              ],
            },
            {
              icon: FileText,
              title: 'Our Role',
              color: 'text-amber-400',
              border: 'border-amber-500/20',
              bg: 'bg-amber-500/5',
              points: [
                'We are the escrow layer — not the builder.',
                'Projects are submitted by their owners.',
                'We verify, we audit, we hold funds.',
                'We are not liable for construction quality — we are the accountability mechanism.',
              ],
            },
          ].map(col => {
            const Icon = col.icon;
            return (
              <div key={col.title} className={`p-8 rounded-2xl border ${col.border} ${col.bg}`}>
                <Icon size={24} className={`${col.color} mb-5`} />
                <h3 className={`text-base font-black uppercase tracking-tight mb-4 ${col.color}`}>{col.title}</h3>
                <ul className="space-y-3">
                  {col.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 leading-relaxed">
                      <CheckCircle2 size={10} className={`${col.color} mt-0.5 flex-shrink-0`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Why Infrastructure Needs Transparency ────────────────────────────── */}
      <section className="border-y border-zinc-900 bg-zinc-900/10 py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <Tag color="amber">Why Transparency</Tag>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              Seeing Is <span className="text-teal-500">Believing.</span><br />
              Hashing Is <span className="text-teal-500">Proving.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { n: '01', title: 'Project ID Generated', desc: 'Every build gets a unique NAP-YYYY-NNNNN identifier. Traceable globally from Lagos to London.' },
              { n: '02', title: 'Funds Enter Escrow', desc: 'Investor capital flows into Paystack-held escrow. No one — not us, not the contractor — can touch it without milestone release.' },
              { n: '03', title: 'Tri-Layer Verification', desc: 'AI image analysis + independent human auditor + drone footage. All three must pass before escrow releases.' },
              { n: '04', title: 'Ledger Hash Issued', desc: 'Every payment and verification is SHA-256 hashed and permanently chained to the public ledger.' },
            ].map(step => (
              <div key={step.n} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20">
                <p className="text-5xl font-black font-mono text-teal-500/20 mb-4">{step.n}</p>
                <h3 className="text-sm font-black uppercase tracking-tight mb-3">{step.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Digital Certificate callout */}
          <div className="p-8 rounded-3xl border border-teal-500/20 bg-teal-500/5 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Tag color="teal"><FileText size={9} /> Digital Certificate of Interest</Tag>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                Every investment generates a cryptographically-linked certificate.
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                After funding a project, investors receive a downloadable PDF Certificate of Interest. It contains
                your investment amount, the Global Ledger Hash that permanently links your commitment to our
                immutable audit trail, and the NAP project ID. Your legal claim is on-chain, not in a filing cabinet.
              </p>
              <Link href="/register?role=INVESTOR"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all">
                Get Your Certificate <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-800 bg-black/40 font-mono text-xs space-y-3">
              <p className="text-zinc-600 uppercase font-bold">Certificate Preview</p>
              <div className="space-y-2 text-[10px]">
                <p className="text-zinc-400">NESTED ARK OS — CERTIFICATE OF INTEREST</p>
                <p className="text-zinc-600">──────────────────────────────────────</p>
                <p className="text-zinc-400">Project: <span className="text-teal-400">NAP-2026-00042</span></p>
                <p className="text-zinc-400">Investor: <span className="text-white">Taye Olaolu</span></p>
                <p className="text-zinc-400">Amount: <span className="text-emerald-400">₦5,000.00</span></p>
                <p className="text-zinc-400">ROI Rate: <span className="text-teal-400">12.00% p.a.</span></p>
                <p className="text-zinc-400">Issued: <span className="text-white">2026-04-03</span></p>
                <p className="text-zinc-600">──────────────────────────────────────</p>
                <p className="text-zinc-500 break-all">Ledger Hash: <span className="text-teal-500/70">a3f9b2c4d...</span></p>
                <p className="text-zinc-600 text-[8px] mt-2">SHA-256 · Immutable · Nested Ark OS v4.0</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Each Role Earns / Benefits ───────────────────────────────────── */}
      <section id="roles" className="max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="text-center space-y-4">
          <Tag color="emerald">Who It's For</Tag>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
            One OS. <span className="text-teal-500">Four Command Centers.</span>
          </h2>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">
            Whether you're funding, building, verifying or governing — there's a purpose-built portal for you.
          </p>
        </div>

        {/* Role tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {roles.map((r, i) => (
            <button key={r.id} onClick={() => setActiveRole(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                activeRole === i
                  ? `${colorMap[r.color].border} ${colorMap[r.color].bg} ${colorMap[r.color].text}`
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white'
              }`}>
              <span>{r.emoji}</span> {r.label}
            </button>
          ))}
        </div>

        {/* Active role panel */}
        <div className={`p-8 md:p-12 rounded-3xl border ${c.border} ${c.bg} transition-all`}>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="text-4xl">{activeRoleData.emoji}</div>
              <div>
                <p className={`text-[9px] uppercase font-black tracking-widest mb-2 ${c.text}`}>
                  {activeRoleData.label} {activeRoleData.flag}
                </p>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-tight">
                  {activeRoleData.headline}
                </h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{activeRoleData.body}</p>
              <Link href={activeRoleData.href}
                className={`inline-flex items-center gap-2 px-7 py-3.5 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all ${c.btn}`}>
                {activeRoleData.cta} <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">What you get:</p>
              {activeRoleData.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-black/30">
                  <CheckCircle2 size={14} className={`${c.text} mt-0.5 flex-shrink-0`} />
                  <p className="text-sm text-white font-medium">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Proof of Work / Drone Gallery callout ────────────────────────────── */}
      <section id="trust" className="border-y border-zinc-900 bg-zinc-900/10 py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <Tag color="blue"><Eye size={9} /> Proof of Work</Tag>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              We Don't Ask You to Trust Us.<br />
              <span className="text-teal-500">The Drone Shows You.</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-2xl mx-auto leading-relaxed">
              When an investor clicks their position, they see timestamped drone verification reports and photo
              galleries of the actual site — not a progress bar on a screen. In infrastructure, seeing is believing.
              Hashing is proving.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                color: 'text-teal-400',
                border: 'border-teal-500/20',
                title: 'AI Layer',
                desc: 'Every uploaded evidence photo is run through computer vision analysis. Material quantity, structural markers and GPS metadata are extracted and hashed.',
              },
              {
                icon: Users,
                color: 'text-amber-400',
                border: 'border-amber-500/20',
                title: 'Human Auditor Layer',
                desc: 'An independent verifier — not employed by the contractor or developer — physically inspects the site and submits a digitally-signed inspection report.',
              },
              {
                icon: Eye,
                color: 'text-blue-400',
                border: 'border-blue-500/20',
                title: 'Drone Layer',
                desc: 'Aerial footage is captured, timestamped and geo-tagged. The drone hash is chained to the global ledger. You can view the footage inside your investment position.',
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`p-8 rounded-2xl border ${item.border} bg-zinc-900/20 space-y-4`}>
                  <Icon size={28} className={item.color} />
                  <h3 className={`text-base font-black uppercase tracking-tight ${item.color}`}>{item.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color.replace('text-', 'bg-')} opacity-60`} style={{ width: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Triple-verification badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-0 rounded-2xl border border-zinc-800 overflow-hidden">
              {['AI Hash', 'Human Audit', 'Drone Footage'].map((s, i) => (
                <div key={s} className={`px-6 py-4 text-center border-r border-zinc-800 last:border-r-0 ${i === 1 ? 'bg-teal-500/10' : ''}`}>
                  <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{i + 1} of 3</p>
                  <p className={`text-sm font-black uppercase ${i === 1 ? 'text-teal-400' : 'text-zinc-400'}`}>{s}</p>
                </div>
              ))}
            </div>
            <p className="text-zinc-700 text-[9px] uppercase font-bold tracking-widest mt-3">
              All three required before escrow releases
            </p>
          </div>
        </div>
      </section>

      {/* ── Diaspora Currency Section ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Tag color="emerald"><Globe size={9} /> Diaspora First</Tag>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-tight">
              Send GBP from London.<br />
              Track NGN in Lagos.<br />
              <span className="text-teal-500">Earn in both.</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our live currency oracle updates NGN, GHS, KES, EUR and GBP rates every hour. Your portfolio value
              is displayed in your chosen currency in real-time — so a Diaspora investor in Manchester sees their
              portfolio ticking up in GBP, not just Naira.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { currency: '🇬🇧 GBP', rate: '0.00059', label: 'Per ₦1' },
                { currency: '🇺🇸 USD', rate: '0.00073', label: 'Per ₦1' },
                { currency: '🇦🇪 AED', rate: '0.0027',  label: 'Per ₦1' },
                { currency: '🇳🇬 NGN', rate: '1.00',    label: 'Base currency' },
              ].map(r => (
                <div key={r.currency} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                  <p className="text-sm font-bold">{r.currency}</p>
                  <p className="font-mono text-teal-400 font-black text-lg mt-1">{r.rate}</p>
                  <p className="text-[8px] text-zinc-600 uppercase font-bold mt-1">{r.label}</p>
                </div>
              ))}
            </div>
            <p className="text-zinc-700 text-[9px] font-mono uppercase tracking-widest">
              Live rates · Updated hourly · Exchange Rate Oracle
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-teal-500/20 bg-teal-500/5 space-y-4">
              <p className="text-[9px] text-teal-500 uppercase font-bold tracking-widest">Diaspora Investor Example</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">Sends from London</span>
                  <span className="font-mono font-bold text-white">£500 GBP</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">Converted at oracle rate</span>
                  <span className="font-mono font-bold text-white">₦850,000 NGN</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">Held in escrow</span>
                  <span className="font-mono font-bold text-teal-400">Paystack secured</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">12% annual yield</span>
                  <span className="font-mono font-bold text-emerald-400">+₦102,000/yr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Portfolio ticks in</span>
                  <span className="font-mono font-bold text-white">GBP + NGN</span>
                </div>
              </div>
            </div>
            <p className="text-zinc-600 text-[9px] text-center font-mono uppercase tracking-widest">
              Example only · Actual rates vary · Not financial advice
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="p-12 md:p-16 rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#14b8a612_0%,transparent_70%)] pointer-events-none" />
          <div className="relative space-y-6">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              Ready to Build Africa?<br />
              <span className="text-teal-500">The Ledger is Waiting.</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
              Join the infrastructure revolution. Whether you have capital to invest, land to build on,
              skills to offer, or a mandate to govern — Nested Ark has a command center for you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { href: '/register?role=INVESTOR',   label: '💰 Invest Capital',    primary: true  },
                { href: '/register?role=DEVELOPER',  label: '🏠 Post a Project',    primary: false },
                { href: '/register?role=CONTRACTOR', label: '🏗 Find Work',          primary: false },
                { href: '/register?role=GOVERNMENT', label: '🏛 Government Portal', primary: false },
              ].map(b => (
                <Link key={b.href} href={b.href}
                  className={`flex items-center gap-2 px-7 py-3.5 font-black uppercase text-xs tracking-[0.15em] rounded-xl transition-all ${
                    b.primary
                      ? 'bg-teal-500 text-black hover:bg-white'
                      : 'border border-zinc-700 text-zinc-300 hover:border-teal-500/50 hover:text-white'
                  }`}>
                  {b.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-500 rounded-sm rotate-45" />
              <p className="text-sm font-black uppercase tracking-widest">Nested Ark OS</p>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed">
              The escrow and transparency platform for African infrastructure investment. We are not the contractor.
            </p>
            <p className="text-[8px] text-zinc-700 font-mono">Impressions &amp; Impacts Ltd</p>
            <p className="text-[8px] text-zinc-700 font-mono">nestedark@gmail.com</p>
          </div>
          <div className="space-y-3">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Platform</p>
            {[
              ['My Portfolio', '/portfolio'],
              ['Investment Nodes', '/investments'],
              ['Milestone Tracker', '/milestones'],
              ['Global Ledger', '/ledger'],
              ['Infrastructure Map', '/map'],
            ].map(([l, h]) => (
              <Link key={h} href={h} className="block text-xs text-zinc-600 hover:text-teal-500 transition-colors">{l}</Link>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Access</p>
            {[
              ['Register as Investor',    '/register?role=INVESTOR'],
              ['Register as Developer',   '/register?role=DEVELOPER'],
              ['Register as Contractor',  '/register?role=CONTRACTOR'],
              ['Government Portal',       '/register?role=GOVERNMENT'],
              ['KYC Verification',        '/kyc'],
            ].map(([l, h]) => (
              <Link key={h} href={h} className="block text-xs text-zinc-600 hover:text-teal-500 transition-colors">{l}</Link>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Trust &amp; Legal</p>
            <div className="space-y-2 text-[10px] text-zinc-700 font-mono">
              <div className="flex items-center gap-2"><ShieldCheck size={10} className="text-teal-500/50" /> Tri-Layer Verification</div>
              <div className="flex items-center gap-2"><Lock size={10} className="text-teal-500/50" /> Paystack Escrow</div>
              <div className="flex items-center gap-2"><Layers size={10} className="text-teal-500/50" /> SHA-256 Hash Chain</div>
              <div className="flex items-center gap-2"><Scale size={10} className="text-amber-500/50" /> Platform — not contractor</div>
            </div>
            <div className="mt-4 space-y-2">
              {[['Terms of Service', '/terms'], ['Privacy Policy', '/privacy']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs text-zinc-600 hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[8px] text-zinc-700 font-mono">
          <p>© 2026 Impressions &amp; Impacts Ltd · Nested Ark OS. All Rights Reserved.</p>
          <p>Lagos · London · Dubai · Secured by Bulletproof Hash Chain v4.0</p>
        </div>
      </footer>

    </div>
  );
}
