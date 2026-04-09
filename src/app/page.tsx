'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ShieldCheck, TrendingUp, Building2, Globe,
  CheckCircle2, Lock, Eye, Cpu, Scale, FileText, MapPin,
  DollarSign, Zap, Home, Factory, Wrench, BarChart3,
  Database, Camera, ChevronRight, Star, Quote,
  Users, Landmark, TreePine, Play
} from 'lucide-react';
import Image from 'next/image';
import MarketTicker from '@/components/MarketTicker';
import ThemeToggle from '@/components/ThemeToggle';
import NapSearch from '@/components/NapSearch';
import api from '@/lib/api';

// ── Backend warm-up: fire a silent ping on page load so Render wakes up ───────
// Render free tier spins down after 15 min inactivity — this prevents the cold-start
// "timeout" error that users see when they try to register or log in.
function useBackendWarmup() {
  useEffect(() => {
    const ping = () => {
      fetch('https://nested-ark-api-22.onrender.com/api/health', {
        method: 'GET',
        cache: 'no-store',
      }).catch(() => {}); // silent — we don't need the response
    };
    ping(); // immediate ping on load
    const iv = setInterval(ping, 14 * 60 * 1000); // keep alive every 14 min
    return () => clearInterval(iv);
  }, []);
}

// ── Live market stats ─────────────────────────────────────────────────────────
function useMarketStats() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    api.get('/api/marketplace/stats').then(r => setStats(r.data.stats)).catch(() => {});
  }, []);
  return stats;
}

// ── Smooth animated counter ───────────────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '', duration = 2000 }: {
  to: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || to === 0) return;
    started.current = true;
    const start = Date.now();
    const iv = setInterval(() => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.floor(eased * to));
      if (t >= 1) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [to, duration]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

// ── Tag pill ──────────────────────────────────────────────────────────────────
function Tag({ children, color = 'teal' }: { children: React.ReactNode; color?: string }) {
  const c: Record<string, string> = {
    teal:    'border-teal-500/30 bg-teal-500/8 text-teal-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400',
    amber:   'border-amber-500/30 bg-amber-500/8 text-amber-400',
    blue:    'border-blue-500/30 bg-blue-500/8 text-blue-400',
    purple:  'border-purple-500/30 bg-purple-500/8 text-purple-400',
    red:     'border-red-500/30 bg-red-500/8 text-red-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${c[color] ?? c.teal}`}>
      {children}
    </span>
  );
}

// ── Project type data ─────────────────────────────────────────────────────────
const PROJECT_TYPES = [
  { icon: Zap,       label: 'Infrastructure',  desc: 'Roads, bridges, utilities, energy grids, water treatment',        color: 'teal',    type: 'INFRASTRUCTURE' },
  { icon: Home,      label: 'Residential',      desc: 'Private homes, estates, Diaspora builds, housing developments',   color: 'emerald', type: 'RESIDENTIAL' },
  { icon: Building2, label: 'Commercial',       desc: 'Offices, retail centres, mixed-use and hospitality developments', color: 'blue',    type: 'COMMERCIAL' },
  { icon: Factory,   label: 'Industrial',       desc: 'Manufacturing plants, warehouses, logistics and agro facilities', color: 'amber',   type: 'INDUSTRIAL' },
  { icon: Wrench,    label: 'Renovation',       desc: 'Refurbishment, retrofits, heritage restoration and upgrades',     color: 'purple',  type: 'RENOVATION' },
  { icon: TreePine,  label: 'Landscape',        desc: 'Parks, green spaces, eco-development and climate infrastructure', color: 'emerald', type: 'LANDSCAPE' },
];

// ── Role panels ───────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'investor', emoji: '💰', flag: '🇬🇧 🇺🇸 🇦🇪 🇳🇬',
    label: 'Investor', color: 'teal',
    headline: 'Your money builds home. Your ledger never lies.',
    body: 'Send capital from London, New York or Dubai into verified Nigerian infrastructure. Your money enters Paystack escrow — it cannot reach a contractor until three independent parties confirm the work is done. Track yield in GBP, USD or NGN in real-time. Earnings tick up every second.',
    bullets: ['12% p.a. target annual yield', 'Paystack-secured escrow', 'Live portfolio ticks per second', 'Multi-currency: GBP / USD / EUR / NGN', 'Downloadable SHA-256 investment certificate', 'KYC-gated withdrawals for compliance'],
    cta: 'Start Investing', href: '/register?role=INVESTOR',
  },
  {
    id: 'developer', emoji: '🏠', flag: '🌍',
    label: 'Developer / Owner', color: 'emerald',
    headline: 'Post once. Track forever. Build without flying home.',
    body: 'Any individual, family, corporate entity or government agency can post a project. Get a NAP Project ID (NAP-2026-NNNNN), upload 2D blueprints and 3D renders, and let investors fund it. You approve each milestone from anywhere on earth.',
    bullets: ['Individual, corporate & private builds', 'Unique NAP project identifier', '2D/3D document upload', 'Milestone-by-milestone control', 'Invite contractors to bid', 'Gov-verified projects rank higher'],
    cta: 'Post a Project', href: '/register?role=DEVELOPER',
  },
  {
    id: 'contractor', emoji: '🏗', flag: '🇳🇬',
    label: 'Contractor', color: 'amber',
    headline: 'Win work by trade. Get paid per milestone. No chase.',
    body: 'Browse project IDs by trade — Civil, Electrical, Plumbing, Architecture. Bid transparently. When the verifier confirms your work, escrow releases automatically. No invoice chasing. No political risk. Your work record is immutable.',
    bullets: ['Search by trade category', 'Transparent bid marketplace', 'Escrow-guaranteed payment', 'Immutable work record', 'Tri-layer release eliminates disputes', 'Rate developers after completion'],
    cta: 'Find Work', href: '/register?role=CONTRACTOR',
  },
  {
    id: 'government', emoji: '🏛', flag: '🇳🇬',
    label: 'Government / Agency', color: 'blue',
    headline: 'Mandate it. Fund it. Audit it. Publicly.',
    body: 'Sponsor public infrastructure tenders with full ledger transparency. Every naira spent is SHA-256 hashed in an immutable audit log visible to the public. Drone footage confirms physical progress before any release.',
    bullets: ['Public tender management', 'Immutable expenditure ledger', 'Drone verification integration', 'AML & compliance reporting', 'Authorize escrow releases', 'Full project audit trail'],
    cta: 'Open Gov Portal', href: '/register?role=GOVERNMENT',
  },
  {
    id: 'crowdfund', emoji: '🤝', flag: '🌍',
    label: 'Community / Crowdfund', color: 'purple',
    headline: 'Pool capital. Build together. Every kobo tracked.',
    body: 'Hometown associations, co-operatives, and family groups can pool smaller investments into a single infrastructure project. Each contributor gets their own ledger entry and signed certificate. Total accountability for every member.',
    bullets: ['Multiple investors per project', 'Individual SHA-256 certificates', 'Community project visibility', 'Hometown association support', 'International co-investment', 'Min. ₦5,000 per contribution'],
    cta: 'Start a Fund', href: '/register?role=INVESTOR',
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; btn: string }> = {
  teal:    { border: 'border-teal-500/40',    bg: 'bg-teal-500/5',    text: 'text-teal-400',    btn: 'bg-teal-500 text-black hover:bg-white' },
  emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/5', text: 'text-emerald-400', btn: 'bg-emerald-500 text-black hover:bg-white' },
  amber:   { border: 'border-amber-500/40',   bg: 'bg-amber-500/5',   text: 'text-amber-400',   btn: 'bg-amber-500 text-black hover:bg-white' },
  blue:    { border: 'border-blue-500/40',    bg: 'bg-blue-500/5',    text: 'text-blue-400',    btn: 'bg-blue-500 text-white hover:bg-white hover:text-black' },
  purple:  { border: 'border-purple-500/40',  bg: 'bg-purple-500/5',  text: 'text-purple-400',  btn: 'bg-purple-500 text-white hover:bg-white hover:text-black' },
};

// ── Testimonial / quote cards ─────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I sent £30,000 from London for my family home in Enugu. Every milestone was verified by drone before a single penny moved. My builder couldn't 'go quiet' — the system wouldn't let him.",
    name: 'Adaeze O.',
    role: 'Diaspora Developer',
    location: 'London → Enugu',
    color: 'teal',
  },
  {
    quote: "As a contractor, I finally get paid when I finish — not when someone feels like it. The escrow release was automatic the moment the auditor confirmed the roof. No calls. No chasing.",
    name: 'Emeka T.',
    role: 'Civil Contractor',
    location: 'Lagos, Nigeria',
    color: 'amber',
  },
  {
    quote: "Our co-operative pooled ₦12M from 40 members for a community borehole. Every member has a certificate. Every naira is on the ledger. We know exactly where our money is.",
    name: 'Fatima K.',
    role: 'Community Fund Coordinator',
    location: 'Kano, Nigeria',
    color: 'emerald',
  },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeRole, setActiveRole] = useState(0);
  const stats = useMarketStats();
  useBackendWarmup(); // silent backend ping — prevents cold-start timeout on first action

  const ngnTotal = Number(stats?.total_invested_ngn ?? 0);
  const usdTotal = ngnTotal / 1379;
  const r = ROLES[activeRole];
  const c = colorMap[r.color];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-teal-500/30 overflow-x-hidden">
      <MarketTicker />

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/nested_ark_icon.png"
                alt="Nested Ark OS"
                fill
                sizes="32px"
                priority
                className="object-contain drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
              />
            </div>
            <span className="text-sm font-black tracking-[0.15em] uppercase hidden sm:block">
              Nested Ark <span className="text-teal-500 text-[10px] align-top">OS</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest">
            <a href="#problem"  className="text-zinc-500 hover:text-white transition-colors">Why It Exists</a>
            <a href="#projects" className="text-zinc-500 hover:text-white transition-colors">Project Types</a>
            <a href="#roles"    className="text-zinc-500 hover:text-white transition-colors">Who It's For</a>
            <a href="#trust"    className="text-zinc-500 hover:text-white transition-colors">Trust Layer</a>
            <a href="#diaspora" className="text-zinc-500 hover:text-white transition-colors">Diaspora</a>
            <Link href="/about" className="text-zinc-500 hover:text-teal-500 transition-colors">About</Link>
            <Link href="/projects" className="text-zinc-500 hover:text-teal-500 transition-colors">Marketplace</Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Link href="/login" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors hidden sm:block px-3 py-2">Sign In</Link>
            <Link href="/register" className="bg-white text-black px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all flex-shrink-0">
              Get Access
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a606_1px,transparent_1px),linear-gradient(to_bottom,#14b8a606_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,#14b8a610_0%,transparent_100%)] pointer-events-none" />

        <div className="relative space-y-7">
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Tag color="teal"><ShieldCheck size={9} /> Tri-Layer Verified</Tag>
            <Tag color="emerald"><Lock size={9} /> Paystack Escrow</Tag>
            <Tag color="amber"><Cpu size={9} /> AI + Human + Drone</Tag>
            <Tag color="blue"><Globe size={9} /> Lagos · London · Dubai</Tag>
            <Tag color="purple"><Scale size={9} /> Platform Only — Not the Contractor</Tag>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.82] italic">
              Infrastructure<br />
              You Can <span className="text-teal-500">Trust.</span><br />
              Capital You Can <span className="text-teal-500">Track.</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              The <strong className="text-white">escrow, transparency and verification layer</strong> between
              Diaspora capital and African infrastructure. Residential, commercial, industrial, public.
              <br className="hidden md:block" />
              <span className="text-zinc-600"> We hold the money. The contractor earns it only when the work is verified.</span>
            </p>
          </div>

          {/* Legal disclaimer */}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
            <Scale size={10} className="text-amber-400 flex-shrink-0" />
            Nested Ark is the platform &amp; escrow provider. Projects are posted by independent owners. We are not the contractor.
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register?role=INVESTOR"
              className="flex items-center gap-2 px-8 py-4 bg-teal-500 text-black font-black uppercase text-xs tracking-[0.15em] rounded-xl hover:bg-white transition-all shadow-lg shadow-teal-500/20">
              💰 Start Investing <ArrowRight size={14} />
            </Link>
            <Link href="/register?role=DEVELOPER"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:border-emerald-500/60 hover:text-emerald-400 transition-all">
              🏠 Post a Project
            </Link>
            <Link href="/projects"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:border-zinc-600 hover:text-white transition-all">
              Browse Marketplace
            </Link>
          </div>

          {/* NAP Search */}
          <div className="max-w-xl mx-auto">
            <p className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest mb-3">Track any project globally by ID</p>
            <NapSearch mode="inline" placeholder="Enter NAP-2026-00042 to track any infrastructure project" />
          </div>

          {/* Live stats — only render when backend has responded */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4">
              {[
                { label: 'Active Builds',    value: <Counter to={stats.active_projects} />,     color: 'text-teal-400' },
                { label: 'Capital Deployed', value: <>${(usdTotal / 1_000_000).toFixed(2)}M</>, color: 'text-emerald-400' },
                { label: 'Nations Linked',   value: <Counter to={stats.countries_active} />,    color: 'text-white' },
                { label: 'Operators',        value: <Counter to={stats.total_operators} />,     color: 'text-teal-400' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/20 text-center">
                  <p className={`text-2xl font-black font-mono tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────────────────────── */}
      <section id="problem" className="border-y border-zinc-900 bg-black py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-14">
          <div className="text-center space-y-4">
            <Tag color="red">Why This Exists</Tag>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              $50,000 Sent. <span className="text-red-400">Foundation Poured.</span><br />
              Then… <span className="text-teal-500">Nothing.</span>
            </h2>
            <p className="text-zinc-500 text-base max-w-2xl mx-auto leading-relaxed">
              This is the Diaspora infrastructure horror story that plays out thousands of times a year.
              Nested Ark was built to end it — permanently and cryptographically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01', color: 'red', border: 'border-red-500/20', bg: 'bg-red-500/5',
                title: 'The Problem',
                points: [
                  'Diaspora sends £50k. Build stops at foundation.',
                  'No independent verification of any progress.',
                  'Contractor vanishes after the first release.',
                  'No legal recourse across jurisdictions.',
                  'Family friction. Trust destroyed. Capital lost.',
                ],
              },
              {
                n: '02', color: 'teal', border: 'border-teal-500/20', bg: 'bg-teal-500/5',
                title: 'Our Solution',
                points: [
                  'All funds held in Paystack escrow — not with the contractor.',
                  'AI + human auditor + drone = three independent confirmations.',
                  'Escrow only releases when all three pass.',
                  'SHA-256 hashed, immutable ledger for every event.',
                  'Certificate of Interest links your capital to the chain.',
                ],
              },
              {
                n: '03', color: 'amber', border: 'border-amber-500/20', bg: 'bg-amber-500/5',
                title: 'Our Role',
                points: [
                  'We are the escrow layer — not the builder.',
                  'Projects are posted by independent owners.',
                  'We verify, audit and hold the funds.',
                  'Not liable for construction quality.',
                  'We are the accountability mechanism.',
                ],
              },
            ].map(col => (
              <div key={col.title} className={`p-8 rounded-2xl border ${col.border} ${col.bg} space-y-4`}>
                <div className={`text-5xl font-black font-mono text-${col.color}-400/20`}>{col.n}</div>
                <h3 className={`text-base font-black uppercase tracking-tight text-${col.color}-400`}>{col.title}</h3>
                <ul className="space-y-3">
                  {col.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 leading-relaxed">
                      <ChevronRight size={10} className={`text-${col.color}-400 mt-0.5 flex-shrink-0`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Impact numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '12%',     label: 'Annual Yield Target',     sub: 'Paid to investors',        color: 'text-teal-400' },
              { value: '3',       label: 'Verification Layers',     sub: 'All required for release', color: 'text-emerald-400' },
              { value: '15min',   label: 'Reset Link Expiry',       sub: 'Secure & single-use',      color: 'text-amber-400' },
              { value: '100%',    label: 'SHA-256 Ledger Integrity',sub: 'Cannot be altered',         color: 'text-white' },
            ].map(s => (
              <div key={s.label} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 text-center">
                <p className={`text-4xl font-black font-mono tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">{s.label}</p>
                <p className="text-[9px] text-zinc-600 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECT TYPES ────────────────────────────────────────────────────── */}
      <section id="projects" className="max-w-7xl mx-auto px-6 py-24 space-y-14">
        <div className="text-center space-y-4">
          <Tag color="emerald">Project Types</Tag>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
            Public, Private &amp; <span className="text-teal-500">Individual.</span><br />
            Any Project. Any Owner.
          </h2>
          <p className="text-zinc-500 text-sm max-w-2xl mx-auto leading-relaxed">
            From a single Diaspora family home to a government water treatment plant to a corporate estate
            with crowdfunded investors — every project gets a unique NAP ID and the same bulletproof escrow protection.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PROJECT_TYPES.map(pt => {
            const Icon = pt.icon;
            const cc = colorMap[pt.color];
            return (
              <Link key={pt.type} href={`/projects?project_type=${pt.type}`}
                className={`p-6 rounded-2xl border ${cc.border} ${cc.bg} hover:scale-[1.02] transition-all group`}>
                <Icon size={24} className={`${cc.text} mb-4`} />
                <p className={`text-sm font-black uppercase tracking-tight ${cc.text}`}>{pt.label}</p>
                <p className="text-zinc-500 text-xs leading-relaxed mt-2">{pt.desc}</p>
                <p className={`text-[8px] uppercase font-bold tracking-widest mt-3 flex items-center gap-1 ${cc.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Browse {pt.label} <ArrowRight size={9} />
                </p>
              </Link>
            );
          })}
        </div>

        {/* Owner types grid */}
        <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20">
          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-6 text-center">Any owner type can submit projects:</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { icon: '👤', label: 'Individual',       desc: 'Personal home builds' },
              { icon: '🏢', label: 'Corporate',        desc: 'Companies & estates' },
              { icon: '💼', label: 'Private Business', desc: 'SMEs & developers' },
              { icon: '🏠', label: 'Developer',        desc: 'Property developers' },
              { icon: '🏛', label: 'Government',       desc: 'Public agencies' },
            ].map(o => (
              <div key={o.label} className="text-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <p className="text-2xl mb-2">{o.icon}</p>
                <p className="text-[10px] font-black uppercase tracking-widest">{o.label}</p>
                <p className="text-[9px] text-zinc-600 mt-1">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="border-y border-zinc-900 bg-zinc-900/10 py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-14">
          <div className="text-center space-y-4">
            <Tag color="amber">How It Works</Tag>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">
              Four Steps. <span className="text-teal-500">Zero Surprises.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { n: '01', title: 'NAP ID Generated',    desc: 'Every build gets NAP-YYYY-NNNNN. Globally searchable, trackable from Lagos to London.' },
              { n: '02', title: 'Funds Enter Escrow',  desc: 'Investor capital flows to Paystack. No one — not us, not the contractor — can access it without milestone release.' },
              { n: '03', title: 'Tri-Layer Verified',  desc: 'AI image analysis + independent human auditor + drone footage. All three must pass before any release.' },
              { n: '04', title: 'Ledger Hash Issued',  desc: 'Every payment and verification is SHA-256 hashed, chained and permanently public. Immutable.' },
            ].map(step => (
              <div key={step.n} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20">
                <p className="text-5xl font-black font-mono text-teal-500/20 mb-4">{step.n}</p>
                <h3 className="text-sm font-black uppercase tracking-tight mb-3">{step.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Certificate callout */}
          <div className="p-8 rounded-3xl border border-teal-500/20 bg-teal-500/5 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Tag color="teal"><FileText size={9} /> Digital Certificate of Interest</Tag>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-tight">
                Every investment generates a cryptographically-linked certificate.
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                After funding, you receive a downloadable certificate containing the Global Ledger Hash that
                permanently links your commitment to our immutable audit trail. Your legal claim is on-chain — not in a filing cabinet.
              </p>
              <Link href="/register?role=INVESTOR"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all">
                Get Your Certificate <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-800 bg-black/40 font-mono text-xs space-y-2.5">
              <p className="text-zinc-600 uppercase font-bold text-[9px]">Certificate Preview</p>
              <p className="text-zinc-600">──────────────────────────────</p>
              <p className="text-zinc-400">Project: <span className="text-teal-400">NAP-2026-00042</span></p>
              <p className="text-zinc-400">Investor: <span className="text-white">Adaeze Okonkwo</span></p>
              <p className="text-zinc-400">Amount: <span className="text-emerald-400">₦850,000.00</span></p>
              <p className="text-zinc-400">ROI Rate: <span className="text-teal-400">12.00% p.a.</span></p>
              <p className="text-zinc-400">Issued: <span className="text-white">08 April 2026</span></p>
              <p className="text-zinc-600">──────────────────────────────</p>
              <p className="text-[9px] text-zinc-500 break-all">Hash: <span className="text-teal-500/70">a3f9b2c4d1e8f6a2...</span></p>
              <p className="text-[8px] text-zinc-700 mt-1">SHA-256 · Single-use · Immutable · Nested Ark OS v4.0</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────────────────────── */}
      <section id="roles" className="max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="text-center space-y-4">
          <Tag color="blue">Who It's For</Tag>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
            One OS. <span className="text-teal-500">Five Command Centers.</span>
          </h2>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">
            Every operator type has a purpose-built portal — from Diaspora investors to government agencies to community crowdfunders.
          </p>
        </div>

        {/* Role tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {ROLES.map((role, i) => {
            const cc = colorMap[role.color];
            return (
              <button key={role.id} onClick={() => setActiveRole(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeRole === i ? `${cc.border} ${cc.bg} ${cc.text}` : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white'
                }`}>
                <span>{role.emoji}</span> {role.label}
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <div className={`p-8 md:p-12 rounded-3xl border ${c.border} ${c.bg} transition-all duration-300`}>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="text-4xl">{r.emoji}</div>
              <div>
                <p className={`text-[9px] uppercase font-black tracking-widest mb-2 ${c.text}`}>{r.label} · {r.flag}</p>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-tight">{r.headline}</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{r.body}</p>
              <Link href={r.href}
                className={`inline-flex items-center gap-2 px-7 py-3.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${c.btn}`}>
                {r.cta} <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">What you get:</p>
              {r.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-black/30">
                  <CheckCircle2 size={13} className={`${c.text} mt-0.5 flex-shrink-0`} />
                  <p className="text-sm text-white font-medium">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST / DRONE PROOF ──────────────────────────────────────────────── */}
      <section id="trust" className="border-y border-zinc-900 bg-black py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-14">
          <div className="text-center space-y-4">
            <Tag color="blue"><Eye size={9} /> Proof of Work</Tag>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              We Don't Ask You to Trust Us.<br />
              <span className="text-teal-500">The Drone Shows You.</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-2xl mx-auto leading-relaxed">
              When an investor clicks their position, they see timestamped drone verification reports and photo
              galleries of the actual site. In infrastructure, seeing is believing. Hashing is proving.
            </p>
          </div>

          {/* Drone visual + explanation */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
              <div className="absolute top-6 left-6 z-20 flex gap-2">
                <div className="px-3 py-1 rounded-full bg-red-500 text-white text-[8px] font-black uppercase tracking-widest animate-pulse">● Live Feed</div>
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest border border-white/10">Drone: Ark-09 · NAP-2026-00042</div>
              </div>
              <div className="absolute bottom-6 left-6 z-20 space-y-1">
                <p className="text-[8px] text-teal-400 font-mono uppercase tracking-widest">Geo: 6.5244°N, 3.3792°E</p>
                <p className="text-[8px] text-zinc-400 font-mono">Milestone 3 of 7 · AI: PASS · Human: PASS · Drone: PASS</p>
              </div>
              {/* Aerial construction image */}
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000" />
            </div>

            <div className="space-y-8">
              {[
                { icon: Cpu,      color: 'text-teal-400',  title: 'AI Layer',      desc: 'Computer vision analysis extracts material quantities, structural markers and GPS metadata from submitted photos. Hashed and logged.' },
                { icon: Users,    color: 'text-amber-400', title: 'Human Auditor', desc: 'An independent verifier — not employed by the contractor — physically inspects the site and submits a digitally-signed report.' },
                { icon: Camera,   color: 'text-blue-400',  title: 'Drone Layer',   desc: 'Aerial footage is captured, timestamped and geo-tagged. The drone hash is chained to the global ledger. Investors view footage inside their portfolio.' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-5">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50`}>
                        <Icon size={18} className={item.color} />
                      </div>
                    </div>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-tight mb-1.5 ${item.color}`}>{item.title}</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-0 rounded-xl border border-zinc-800 overflow-hidden">
                {['AI Hash', 'Human Audit', 'Drone Footage'].map((s, i) => (
                  <div key={s} className={`flex-1 px-4 py-3 text-center border-r border-zinc-800 last:border-r-0 ${i === 1 ? 'bg-teal-500/10' : ''}`}>
                    <p className="text-[8px] text-zinc-600 uppercase font-bold">{i + 1} of 3</p>
                    <p className={`text-[10px] font-black uppercase ${i === 1 ? 'text-teal-400' : 'text-zinc-400'}`}>{s}</p>
                  </div>
                ))}
              </div>
              <p className="text-zinc-700 text-[9px] uppercase font-bold tracking-widest">All three required before escrow releases</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIASPORA ─────────────────────────────────────────────────────────── */}
      <section id="diaspora" className="max-w-7xl mx-auto px-6 py-24 space-y-14">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <Tag color="emerald"><Globe size={9} /> Diaspora First</Tag>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-tight">
              Send GBP from London.<br />
              Track NGN in Lagos.<br />
              <span className="text-teal-500">Earn in both.</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our live currency oracle updates NGN, GHS, KES, EUR and GBP rates hourly.
              Your portfolio ticks up in your chosen currency in real-time. A Manchester-based investor
              sees GBP yield. A Dubaian investor sees AED. Your certificate is denominated in your currency.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { currency: '🇬🇧 GBP', rate: '~£0.00059', label: 'Per ₦1' },
                { currency: '🇺🇸 USD', rate: '~$0.00073', label: 'Per ₦1' },
                { currency: '🇦🇪 AED', rate: '~0.0027',   label: 'Per ₦1' },
                { currency: '🇳🇬 NGN', rate: '1.00',      label: 'Base currency' },
              ].map(r => (
                <div key={r.currency} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                  <p className="text-sm font-bold">{r.currency}</p>
                  <p className="font-mono text-teal-400 font-black text-lg mt-1">{r.rate}</p>
                  <p className="text-[8px] text-zinc-600 uppercase font-bold mt-1">{r.label}</p>
                </div>
              ))}
            </div>
            <p className="text-zinc-700 text-[8px] font-mono uppercase tracking-widest">Indicative rates only · Updated hourly</p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-teal-500/20 bg-teal-500/5 space-y-4">
              <p className="text-[9px] text-teal-500 uppercase font-bold tracking-widest">Example: Diaspora Investor Flow</p>
              {[
                ['Sends from London',        '£500 GBP'],
                ['Converted at oracle rate', '~₦850,000 NGN'],
                ['Held in Paystack escrow',  '✓ Secured'],
                ['12% annual yield',         '+₦102,000/yr est.'],
                ['Portfolio shown in',       'GBP + NGN'],
              ].map(([label, value], i) => (
                <div key={i} className={`flex justify-between ${i < 4 ? 'border-b border-zinc-800/50 pb-3' : ''}`}>
                  <span className="text-zinc-400 text-sm">{label}</span>
                  <span className={`font-mono font-bold text-sm ${i === 2 ? 'text-teal-400' : i === 3 ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Crowdfund callout */}
            <div className="p-5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2">
              <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">🤝 Community / Crowdfund Mode</p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Hometown associations, co-operatives, and family groups can pool from ₦5,000 each into a
                single project. Every contributor gets their own ledger entry and signed certificate.
              </p>
              <Link href="/register?role=INVESTOR"
                className="inline-flex items-center gap-1 text-[9px] text-purple-400 font-bold uppercase tracking-widest hover:text-white transition-colors">
                Start a community fund <ArrowRight size={9} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="border-y border-zinc-900 bg-zinc-900/10 py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <Tag color="teal"><Star size={9} /> Operator Testimonials</Tag>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">
              What <span className="text-teal-500">Operators Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => {
              const cc = colorMap[t.color];
              return (
                <div key={i} className={`p-8 rounded-2xl border ${cc.border} ${cc.bg} space-y-5 relative`}>
                  <Quote size={28} className={`${cc.text} opacity-30`} />
                  <p className="text-zinc-300 text-sm leading-relaxed italic">"{t.quote}"</p>
                  <div className="border-t border-zinc-800 pt-4">
                    <p className={`text-sm font-black ${cc.text}`}>{t.name}</p>
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{t.role}</p>
                    <p className="text-[9px] text-zinc-600 font-mono mt-1">{t.location}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PLATFORM CAPABILITIES ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="text-center space-y-4">
          <Tag color="teal">Platform Capabilities</Tag>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">
            What Nested Ark Does <span className="text-teal-500">Right Now</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, color: 'text-teal-500',   title: 'Multi-Role Auth',         desc: '8 operator roles — Developer, Investor, Contractor, Verifier, Supplier, Bank, Government, Admin. Purpose-built portal for each.' },
            { icon: Lock,        color: 'text-emerald-500',title: 'Paystack Escrow',          desc: 'Full payment gateway. Multi-split for platform fees, webhook verification, and automated milestone-gated release.' },
            { icon: BarChart3,   color: 'text-amber-500',  title: 'Live Portfolio + ROI',     desc: 'Portfolio value ticks per second with time-weighted yield. Withdrawal flow for KYC-verified users.' },
            { icon: Cpu,         color: 'text-blue-500',   title: 'Tri-Layer Verification',   desc: 'AI evidence analysis, human auditor approval, drone footage — all three required. Fully audit-able.' },
            { icon: Globe,       color: 'text-purple-500', title: 'Currency Oracle',          desc: 'Hourly NGN, GHS, KES, EUR, GBP updates. Portfolio switches instantly. Diaspora-first.' },
            { icon: FileText,    color: 'text-teal-500',   title: 'NAP Project IDs',          desc: 'Every project gets NAP-YYYY-NNNNN. Globally searchable. All project and owner types.' },
            { icon: Database,    color: 'text-emerald-500',title: 'Immutable Ledger',         desc: 'SHA-256 hash chain on every event. Cannot be altered or deleted. Public audit trail.' },
            { icon: TrendingUp,  color: 'text-amber-500',  title: 'Revenue Engine',           desc: 'Escrow fees (2%), listing fees ($49), investment placement (0.5%), supply commissions (3%).' },
            { icon: MapPin,      color: 'text-blue-500',   title: 'Geo + Map Layer',          desc: 'Projects geo-tagged with site coordinates. Infrastructure map for investors and government.' },
          ].map(cap => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 space-y-3 hover:border-zinc-700 transition-all">
                <Icon size={20} className={cap.color} />
                <h3 className="text-sm font-black uppercase tracking-tight">{cap.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── LIVE RATES STRIP ─────────────────────────────────────────────────── */}
      {stats?.key_rates && (
        <section className="border-t border-zinc-900 bg-zinc-900/10 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-6 overflow-x-auto pb-2">
              <span className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest flex-shrink-0">Live Rates / USD</span>
              {Object.entries(stats.key_rates).slice(0, 10).map(([code, rate]) => (
                <div key={code} className="flex-shrink-0 text-center">
                  <p className="text-[8px] text-zinc-600 uppercase font-bold">{code}</p>
                  <p className="font-mono text-sm font-bold text-white">{Number(rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              ))}
              <Link href="/projects" className="flex-shrink-0 ml-auto text-[9px] text-teal-500 font-bold uppercase tracking-widest hover:text-white transition-colors whitespace-nowrap">
                View All Rates →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="p-12 md:p-20 rounded-3xl border border-teal-500/10 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#14b8a612_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a604_1px,transparent_1px),linear-gradient(to_bottom,#14b8a604_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          <div className="relative space-y-6">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              <Tag color="teal"><ShieldCheck size={9} /> Escrow Active</Tag>
              <Tag color="emerald"><Database size={9} /> Ledger Live</Tag>
              <Tag color="amber"><Camera size={9} /> Drone Verified</Tag>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              Ready to Build Africa?<br />
              <span className="text-teal-500">The Ledger is Waiting.</span>
            </h2>
            <p className="text-zinc-400 text-base max-w-xl mx-auto leading-relaxed">
              Capital to invest, land to build on, a community project to fund, skills to offer or a mandate
              to govern — Nested Ark has a command center for you. Join the infrastructure revolution.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { href: '/register?role=INVESTOR',   label: '💰 Invest Capital',     primary: true  },
                { href: '/register?role=DEVELOPER',  label: '🏠 Post a Project',     primary: false },
                { href: '/register?role=CONTRACTOR', label: '🏗 Find Work',           primary: false },
                { href: '/register?role=GOVERNMENT', label: '🏛 Government Portal',  primary: false },
                { href: '/projects',                 label: '📋 Browse Marketplace', primary: false },
              ].map(b => (
                <Link key={b.href} href={b.href}
                  className={`flex items-center gap-2 px-7 py-4 font-black uppercase text-xs tracking-[0.15em] rounded-xl transition-all ${
                    b.primary ? 'bg-teal-500 text-black hover:bg-white shadow-lg shadow-teal-500/20' : 'border border-zinc-700 text-zinc-300 hover:border-teal-500/50 hover:text-white'
                  }`}>
                  {b.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 py-14 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 flex-shrink-0">
                <Image
                  src="/nested_ark_icon.png"
                  alt="Nested Ark OS"
                  fill
                  sizes="28px"
                  className="object-contain drop-shadow-[0_0_6px_rgba(20,184,166,0.4)]"
                />
              </div>
              <p className="text-sm font-black uppercase tracking-widest">Nested Ark OS</p>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed max-w-xs">
              The escrow and transparency platform for African infrastructure investment.
              We are the platform provider — not the contractor. All projects are submitted by independent owners.
            </p>
            <p className="text-[9px] text-zinc-700 font-mono">Impressions &amp; Impacts Ltd · nestedark@gmail.com</p>
            <p className="text-[9px] text-zinc-700 font-mono">Lagos · London · Dubai</p>
          </div>
          <div className="space-y-3">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Platform</p>
            {[['My Portfolio','/portfolio'],['Investment Nodes','/investments'],['Milestone Tracker','/milestones'],['Global Ledger','/ledger'],['Infrastructure Map','/map'],['About Us','/about']].map(([l,h]) => (
              <Link key={h} href={h} className="block text-xs text-zinc-600 hover:text-teal-500 transition-colors">{l}</Link>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Register</p>
            {[['Investor','/register?role=INVESTOR'],['Developer / Owner','/register?role=DEVELOPER'],['Contractor','/register?role=CONTRACTOR'],['Supplier','/register?role=SUPPLIER'],['Bank / Institution','/register?role=BANK'],['Government','/register?role=GOVERNMENT']].map(([l,h]) => (
              <Link key={h} href={h} className="block text-xs text-zinc-600 hover:text-teal-500 transition-colors">{l}</Link>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Legal &amp; Trust</p>
            <div className="space-y-2.5 text-[10px] text-zinc-700 font-mono">
              <div className="flex items-center gap-2"><ShieldCheck size={10} className="text-teal-500/50" /> Tri-Layer Verification</div>
              <div className="flex items-center gap-2"><Lock size={10} className="text-teal-500/50" /> Paystack Escrow</div>
              <div className="flex items-center gap-2"><Database size={10} className="text-teal-500/50" /> SHA-256 Hash Chain</div>
              <div className="flex items-center gap-2"><Scale size={10} className="text-amber-500/50" /> Platform — not contractor</div>
            </div>
            <div className="mt-4 space-y-2">
              {[['KYC Verification','/kyc'],['Terms of Service','/terms'],['Privacy Policy','/privacy']].map(([l,h]) => (
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
