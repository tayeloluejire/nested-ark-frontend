'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, ArrowLeft, ExternalLink, Lock, Eye,
  Database, Globe, Users, RefreshCw, Mail, AlertTriangle,
  FileText, Cpu, Server, UserX, Download
} from 'lucide-react';

const EFFECTIVE_DATE = 'April 8, 2026';
const COMPANY       = 'Impressions & Impacts Ltd';
const PLATFORM      = 'Nested Ark OS';
const EMAIL         = 'nestedark@gmail.com';
const DPO_EMAIL     = 'nestedark@gmail.com';

const SECTIONS = [
  { id: 'overview',       label: 'Overview & Controller',      icon: ShieldCheck },
  { id: 'data-collected', label: 'Data We Collect',            icon: Database    },
  { id: 'how-collected',  label: 'How We Collect Data',        icon: Eye         },
  { id: 'legal-basis',    label: 'Legal Basis for Processing', icon: FileText    },
  { id: 'how-used',       label: 'How We Use Your Data',       icon: Cpu         },
  { id: 'sharing',        label: 'Data Sharing & Disclosure',  icon: Users       },
  { id: 'international',  label: 'International Transfers',    icon: Globe       },
  { id: 'retention',      label: 'Data Retention',             icon: Server      },
  { id: 'security',       label: 'Security Measures',          icon: Lock        },
  { id: 'rights',         label: 'Your Rights',                icon: UserX       },
  { id: 'cookies',        label: 'Cookies & Tracking',         icon: Eye         },
  { id: 'children',       label: "Children's Privacy",         icon: AlertTriangle },
  { id: 'changes',        label: 'Changes to This Policy',     icon: RefreshCw   },
  { id: 'contact',        label: 'Contact & DPO',              icon: Mail        },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-teal-500 transition-colors">
              <ArrowLeft size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Back</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 bg-teal-500 rounded-sm rotate-45 flex-shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                Nested Ark <span className="text-teal-500">OS</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-zinc-600 font-mono uppercase hidden md:block">Effective {EFFECTIVE_DATE}</span>
            <Link href="/terms"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/40 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all">
              Terms of Service <ExternalLink size={9} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">

        {/* ── Sticky sidebar nav ─────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-[0.3em] mb-4 pl-3">Contents</p>
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeSection === s.id
                      ? 'bg-teal-500/10 text-teal-500 border-l-2 border-teal-500'
                      : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/40 border-l-2 border-transparent'
                  }`}>
                  <Icon size={11} className="flex-shrink-0" />
                  <span className="line-clamp-1">{s.label}</span>
                </button>
              );
            })}

            {/* GDPR badge */}
            <div className="mt-6 p-3 rounded-xl border border-teal-500/20 bg-teal-500/5 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-teal-500" />
                <p className="text-[9px] text-teal-500 font-black uppercase tracking-widest">Compliance</p>
              </div>
              {['NDPR (Nigeria)', 'GDPR (EU/UK)', 'DPA 2018 (UK)', 'CCPA (California)', 'POPIA (S. Africa)'].map(r => (
                <p key={r} className="text-[8px] text-zinc-500 flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-teal-500 flex-shrink-0" /> {r}
                </p>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 max-w-3xl space-y-1">

          {/* Hero */}
          <div className="pb-10 border-b border-zinc-800 mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={14} className="text-teal-500" />
              <span className="text-[9px] text-teal-500 uppercase font-black tracking-[0.3em]">Your Privacy · Our Commitment</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-4">
              Privacy Policy
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 font-mono">
              <span>Effective: <strong className="text-white">{EFFECTIVE_DATE}</strong></span>
              <span>·</span>
              <span>Controller: <strong className="text-white">{COMPANY}</strong></span>
              <span>·</span>
              <span>DPO: <strong className="text-teal-500">{DPO_EMAIL}</strong></span>
            </div>
            <div className="mt-6 p-4 rounded-xl border border-teal-500/20 bg-teal-500/5 text-teal-400 text-xs leading-relaxed">
              <ShieldCheck size={12} className="inline mr-2" />
              {COMPANY} ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, process, store, share, and protect your data when you use the {PLATFORM} platform. We operate in compliance with the Nigerian Data Protection Regulation (NDPR), the UK/EU General Data Protection Regulation (GDPR), and other applicable global privacy frameworks.
            </div>
          </div>

          {/* ── Section 1: Overview ───────────────────────────────────────── */}
          <Section id="overview" title="1. Overview & Data Controller" icon={ShieldCheck}>
            <p><strong className="text-white">Data Controller.</strong> {COMPANY} is the data controller responsible for your personal data processed through {PLATFORM}. We are incorporated in Nigeria and operate internationally, with legal presence in Lagos, London, and Dubai.</p>
            <p>As a data controller, we determine the purposes and means by which personal data is processed. Where we engage third-party service providers to process data on our behalf, they act as data processors and are bound by data processing agreements obligating them to process data only according to our instructions and to maintain appropriate security measures.</p>
            <p><strong className="text-white">Scope.</strong> This policy applies to all personal data processed in connection with: (a) your registration and use of the Platform; (b) your participation in any transaction, project, investment, or verification activity on the Platform; (c) your communications with us; and (d) your use of our website and associated digital properties.</p>
            <p><strong className="text-white">Joint Controllership.</strong> For payment processing activities, {COMPANY} and Paystack Financial Services Ltd act as joint data controllers. Paystack's Privacy Policy applies in addition to this policy for all payment-related data.</p>
          </Section>

          {/* ── Section 2: Data Collected ─────────────────────────────────── */}
          <Section id="data-collected" title="2. Data We Collect" icon={Database}>
            <p>We collect personal data across the following categories:</p>

            <SubHeading>Identity & Account Data</SubHeading>
            <ul>
              <li>Full legal name, email address, phone number</li>
              <li>Operator role and account preferences</li>
              <li>Account credentials (passwords stored as bcrypt hashes — never in plaintext)</li>
              <li>Profile information, company name, specialisation (for Contractors)</li>
            </ul>

            <SubHeading>KYC / Identity Verification Data</SubHeading>
            <ul>
              <li>Government-issued ID number (NIN, BVN, Passport, Driver's Licence)</li>
              <li>Date of birth, nationality, residential address, city, country</li>
              <li>Identity document images (uploaded via secure URL, not stored directly by us)</li>
              <li>Selfie or biometric images (where provided for verification)</li>
              <li>KYC status, verification timestamps, and rejection reasons</li>
            </ul>

            <SubHeading>Financial & Transaction Data</SubHeading>
            <ul>
              <li>Investment amounts, project funding commitments, and transaction history</li>
              <li>Paystack payment references, access codes, and transaction statuses</li>
              <li>Escrow wallet balances and milestone payout records</li>
              <li>Revenue events and platform fee records associated with your account</li>
              <li>Bank account details (for disbursement — processed by Paystack)</li>
            </ul>

            <SubHeading>Project & Activity Data</SubHeading>
            <ul>
              <li>Project submissions, NAP IDs, descriptions, budgets, and documentation</li>
              <li>Milestone evidence (photos, drone footage URLs, geo-coordinates)</li>
              <li>Bids submitted, proposals, and contractor work records</li>
              <li>Supplier dispatch records, QR codes, and delivery data</li>
              <li>Verification decisions, audit notes, and ledger hash records</li>
            </ul>

            <SubHeading>Technical & Usage Data</SubHeading>
            <ul>
              <li>IP address, browser type and version, operating system, device identifiers</li>
              <li>Pages visited, features used, time spent, and interaction patterns</li>
              <li>API request logs, error logs, and performance data</li>
              <li>Authentication tokens (JWT), session data, and security logs</li>
            </ul>

            <SubHeading>Communications Data</SubHeading>
            <ul>
              <li>Emails sent to us and our responses</li>
              <li>Support tickets, complaint records, and dispute correspondence</li>
              <li>Notification preferences and email verification status</li>
            </ul>
          </Section>

          {/* ── Section 3: How Collected ──────────────────────────────────── */}
          <Section id="how-collected" title="3. How We Collect Data" icon={Eye}>
            <p>We collect your personal data through the following means:</p>
            <ul>
              <li><strong className="text-white">Direct submission:</strong> When you register, complete KYC, submit a project, make an investment, place a bid, or contact us — you provide data directly.</li>
              <li><strong className="text-white">Automated collection:</strong> When you use the Platform, we automatically collect technical and usage data through server logs, API request records, and browser interactions.</li>
              <li><strong className="text-white">Third-party sources:</strong> We may receive data from Paystack (payment confirmation, transaction status), KYC verification providers, and sanctions screening services to fulfil our AML/KYC obligations.</li>
              <li><strong className="text-white">Verification processes:</strong> Drone footage URLs, geo-coordinates, and evidence submissions collected during the tri-layer verification process.</li>
              <li><strong className="text-white">Ledger recording:</strong> Platform events are automatically recorded in the immutable system ledger, including timestamps of transactions you initiate or participate in.</li>
            </ul>
          </Section>

          {/* ── Section 4: Legal Basis ────────────────────────────────────── */}
          <Section id="legal-basis" title="4. Legal Basis for Processing" icon={FileText}>
            <p>Under the GDPR, UK GDPR, and NDPR, we process your personal data on the following legal bases:</p>
            <ul>
              <li><strong className="text-white">Contract performance (Art. 6(1)(b) GDPR):</strong> Processing necessary to provide the Platform services you have signed up for, including account management, escrow operations, project listings, and milestone payouts.</li>
              <li><strong className="text-white">Legal obligation (Art. 6(1)(c) GDPR):</strong> Processing required to comply with AML, KYC, CTF, tax reporting, and other regulatory obligations under Nigerian, UK, EU, and international law.</li>
              <li><strong className="text-white">Legitimate interests (Art. 6(1)(f) GDPR):</strong> Processing for fraud prevention, security monitoring, platform integrity, improving our services, and maintaining the immutable ledger — where these interests are not overridden by your fundamental rights.</li>
              <li><strong className="text-white">Consent (Art. 6(1)(a) GDPR):</strong> Where we rely on consent (e.g., for optional marketing communications), you may withdraw consent at any time without affecting the lawfulness of prior processing.</li>
              <li><strong className="text-white">Vital interests / Public task:</strong> In rare circumstances involving fraud prevention, public safety, or cooperation with law enforcement.</li>
            </ul>
            <p>For special category data (biometrics, where processed), we rely on Art. 9(2)(g) (substantial public interest — AML compliance) or your explicit consent.</p>
          </Section>

          {/* ── Section 5: How Used ───────────────────────────────────────── */}
          <Section id="how-used" title="5. How We Use Your Data" icon={Cpu}>
            <p>We use personal data for the following purposes:</p>

            <SubHeading>Platform Operations</SubHeading>
            <ul>
              <li>Registering and managing your operator account and role permissions</li>
              <li>Processing investments, escrow deposits, milestone verifications, and payouts</li>
              <li>Issuing NAP project IDs and maintaining the project registry</li>
              <li>Recording all transactions in the immutable SHA-256 ledger</li>
              <li>Sending transactional notifications (payment confirmations, verification updates, reset links)</li>
            </ul>

            <SubHeading>Compliance & Security</SubHeading>
            <ul>
              <li>Conducting KYC identity verification and AML screening</li>
              <li>Screening against international sanctions, PEP, and watchlists</li>
              <li>Detecting, investigating, and preventing fraud and financial crime</li>
              <li>Maintaining audit trails for regulatory compliance</li>
              <li>Reporting to financial intelligence units as required by law</li>
            </ul>

            <SubHeading>Platform Improvement</SubHeading>
            <ul>
              <li>Analysing usage patterns to improve features and user experience</li>
              <li>Diagnosing technical issues and monitoring platform performance</li>
              <li>Conducting analytics on aggregate (anonymised) data for business intelligence</li>
            </ul>

            <SubHeading>Communications</SubHeading>
            <ul>
              <li>Responding to your support requests and complaints</li>
              <li>Notifying you of updates to these policies or platform features (with opt-out)</li>
              <li>Sending marketing communications where you have consented (opt-in only)</li>
            </ul>
          </Section>

          {/* ── Section 6: Sharing ────────────────────────────────────────── */}
          <Section id="sharing" title="6. Data Sharing & Disclosure" icon={Users}>
            <p><strong className="text-white">We do not sell your personal data.</strong> We do not permit advertisers to target you individually based on personal data through our platform. The following describes when and with whom we share data:</p>

            <SubHeading>Service Providers (Data Processors)</SubHeading>
            <ul>
              <li><strong className="text-white">Paystack Financial Services Ltd:</strong> Payment processing, escrow management, and transaction verification. Bound by data processing agreement.</li>
              <li><strong className="text-white">Supabase / PostgreSQL (via Render):</strong> Database hosting for all platform data. Encrypted at rest and in transit.</li>
              <li><strong className="text-white">Render.com:</strong> Backend server hosting. Bound by GDPR-compliant data processing terms.</li>
              <li><strong className="text-white">Vercel:</strong> Frontend hosting. Subject to Vercel's GDPR-compliant data practices.</li>
              <li><strong className="text-white">Nodemailer / Gmail SMTP:</strong> Email delivery for transactional notifications. No marketing tracking pixels used.</li>
              <li><strong className="text-white">Exchange rate providers:</strong> Anonymous API calls — no personal data transmitted.</li>
            </ul>

            <SubHeading>Legal & Regulatory Disclosure</SubHeading>
            <ul>
              <li>Nigerian Financial Intelligence Unit (NFIU) — suspicious transaction reports</li>
              <li>Nigerian Economic and Financial Crimes Commission (EFCC)</li>
              <li>UK National Crime Agency (NCA) — Suspicious Activity Reports</li>
              <li>OFAC, EU sanctions authorities, and equivalent bodies globally</li>
              <li>Courts, tribunals, and law enforcement when required by valid legal process</li>
            </ul>

            <SubHeading>Other Platform Users (Limited)</SubHeading>
            <p>Certain information is visible to other users as part of the Platform's transparency model:</p>
            <ul>
              <li>Project sponsor name and project details — visible to all users browsing projects</li>
              <li>Contractor company name, specialisation, rating — visible when bidding</li>
              <li>Milestone verification status and ledger hashes — visible to relevant project stakeholders</li>
            </ul>
            <p>We never share your private financial data, KYC documents, or account credentials with other users.</p>

            <SubHeading>Business Transfers</SubHeading>
            <p>In the event of a merger, acquisition, or sale of the Company, personal data may be transferred to the successor entity, subject to equivalent privacy protections. We will notify you via email and Platform notice before any such transfer.</p>
          </Section>

          {/* ── Section 7: International Transfers ───────────────────────── */}
          <Section id="international" title="7. International Data Transfers" icon={Globe}>
            <p>The Platform operates globally and your data may be transferred to and processed in countries outside your country of residence, including Nigeria, the United Kingdom, the United States (Vercel, Render infrastructure), and the European Economic Area.</p>
            <p>Where we transfer data from the UK or EEA to countries without an adequacy decision, we implement appropriate safeguards including:</p>
            <ul>
              <li><strong className="text-white">Standard Contractual Clauses (SCCs):</strong> EU and UK SCCs incorporated into agreements with all data processors in third countries.</li>
              <li><strong className="text-white">Adequacy decisions:</strong> Where available, we rely on adequacy decisions by the European Commission or UK ICO.</li>
              <li><strong className="text-white">Binding Corporate Rules:</strong> For intra-group transfers where applicable.</li>
            </ul>
            <p>For Nigerian users, international transfers comply with the NDPR's requirements for cross-border data transfers, ensuring equivalent protection is maintained at the destination.</p>
            <p>You may request a copy of the specific safeguards in place for transfers affecting your data by contacting {DPO_EMAIL}.</p>
          </Section>

          {/* ── Section 8: Retention ──────────────────────────────────────── */}
          <Section id="retention" title="8. Data Retention" icon={Server}>
            <p>We retain personal data only for as long as necessary to fulfil the purposes for which it was collected or as required by law. Our retention schedule:</p>
            <ul>
              <li><strong className="text-white">Account data:</strong> Retained for the duration of your account plus 7 years after closure, to comply with financial record-keeping obligations.</li>
              <li><strong className="text-white">KYC records:</strong> Minimum 5 years from the last transaction, as required by AML regulations. May be extended if subject to ongoing investigation.</li>
              <li><strong className="text-white">Transaction records & ledger entries:</strong> Permanently retained in the immutable ledger as required by the platform's integrity architecture. Anonymisation is applied where personal data is no longer operationally necessary.</li>
              <li><strong className="text-white">Financial records:</strong> 7 years minimum, in line with Nigerian and UK tax and financial reporting requirements.</li>
              <li><strong className="text-white">Communications & support records:</strong> 3 years from date of last interaction.</li>
              <li><strong className="text-white">Legal dispute records:</strong> For the duration of any legal proceedings plus applicable limitation periods (up to 12 years).</li>
              <li><strong className="text-white">Technical logs:</strong> 90 days for routine operational logs; security-incident logs retained 3 years.</li>
              <li><strong className="text-white">Deleted account data:</strong> Within 30 days of account closure, data not subject to legal retention is purged from active systems. Backups are cleared within 90 days.</li>
            </ul>
            <p>The immutable nature of the SHA-256 hash chain means ledger records cannot be deleted post-recording; however, personal data in ledger payloads is pseudonymised after the applicable retention period.</p>
          </Section>

          {/* ── Section 9: Security ───────────────────────────────────────── */}
          <Section id="security" title="9. Security Measures" icon={Lock}>
            <p>We implement industry-standard technical and organisational measures to protect personal data against unauthorised access, loss, destruction, or alteration:</p>

            <SubHeading>Technical Controls</SubHeading>
            <ul>
              <li><strong className="text-white">Encryption at rest:</strong> All database content is encrypted at rest via Supabase's managed PostgreSQL with AES-256 encryption.</li>
              <li><strong className="text-white">Encryption in transit:</strong> All API communications use TLS 1.2+ (HTTPS). No plaintext data transmission.</li>
              <li><strong className="text-white">Password hashing:</strong> All passwords are stored as bcrypt hashes with cost factor 12. We never store plaintext passwords.</li>
              <li><strong className="text-white">JWT authentication:</strong> Session tokens use HS256 HMAC signing. Tokens expire after 24 hours.</li>
              <li><strong className="text-white">Immutable audit trail:</strong> All critical events are SHA-256 hash-chained in the system ledger, creating a tamper-evident record.</li>
              <li><strong className="text-white">Subaccount isolation:</strong> Payment processing uses Paystack subaccount architecture to isolate escrow funds.</li>
              <li><strong className="text-white">Role-based access control:</strong> Eight distinct operator roles with granular permissions. Admin access requires multi-factor authentication.</li>
            </ul>

            <SubHeading>Organisational Controls</SubHeading>
            <ul>
              <li>Principle of least privilege — staff access only data necessary for their function</li>
              <li>Regular security reviews and penetration testing</li>
              <li>Incident response plan with 72-hour breach notification protocol (GDPR Art. 33)</li>
              <li>Vendor security assessments before onboarding data processors</li>
            </ul>

            <p><strong className="text-white">Breach Notification.</strong> In the event of a personal data breach that poses a risk to your rights and freedoms, we will notify you without undue delay and, where required, notify the relevant supervisory authority within 72 hours of becoming aware of the breach.</p>
            <p>Despite these measures, no security system is impenetrable. You should use a strong, unique password, enable any available two-factor authentication, and report suspected unauthorised access to {EMAIL} immediately.</p>
          </Section>

          {/* ── Section 10: Rights ────────────────────────────────────────── */}
          <Section id="rights" title="10. Your Privacy Rights" icon={UserX}>
            <p>Depending on your jurisdiction, you have the following rights regarding your personal data. We will respond to all verified requests within 30 days (extendable by 60 days for complex requests):</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
              {[
                { right: 'Right of Access', desc: 'Request a copy of all personal data we hold about you (Subject Access Request / Data Subject Access Request).', tag: 'GDPR · NDPR · CCPA' },
                { right: 'Right to Rectification', desc: 'Request correction of inaccurate or incomplete personal data.', tag: 'GDPR · NDPR' },
                { right: 'Right to Erasure', desc: '"Right to be forgotten" — request deletion of data where there is no overriding legitimate purpose or legal obligation to retain.', tag: 'GDPR · NDPR' },
                { right: 'Right to Restriction', desc: 'Request that we restrict processing of your data in certain circumstances (e.g., while a dispute is resolved).', tag: 'GDPR' },
                { right: 'Right to Data Portability', desc: 'Receive your data in a structured, machine-readable format and transfer it to another controller.', tag: 'GDPR · UK GDPR' },
                { right: 'Right to Object', desc: 'Object to processing based on legitimate interests, including profiling and marketing.', tag: 'GDPR · NDPR' },
                { right: 'Right to Opt-Out of Sale', desc: 'We do not sell personal data. California residents may submit a "Do Not Sell" request for completeness.', tag: 'CCPA' },
                { right: 'Right to Non-Discrimination', desc: 'We will not discriminate against you for exercising any of your privacy rights.', tag: 'CCPA · POPIA' },
              ].map(item => (
                <div key={item.right} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                  <p className="text-[9px] text-zinc-600 font-mono mb-1">{item.tag}</p>
                  <p className="text-sm font-bold text-white mb-1">{item.right}</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <p><strong className="text-white">How to Exercise Rights.</strong> Submit your request to {DPO_EMAIL} with the subject line "Privacy Rights Request" and include: your registered email address, the right you wish to exercise, and any relevant details. We may need to verify your identity before processing the request.</p>
            <p><strong className="text-white">Exceptions.</strong> Some rights are subject to exceptions where we are required to retain data for legal or regulatory purposes (e.g., AML records, ledger entries). We will inform you of any applicable exceptions when responding to your request.</p>
            <p><strong className="text-white">Supervisory Authority.</strong> You have the right to lodge a complaint with your data protection supervisory authority: NITDA (Nigeria), ICO (UK), your national DPA (EU), or the applicable authority in your jurisdiction. We encourage you to contact us first so we can address your concerns directly.</p>
          </Section>

          {/* ── Section 11: Cookies ───────────────────────────────────────── */}
          <Section id="cookies" title="11. Cookies & Tracking Technologies" icon={Eye}>
            <p>The Platform uses minimal cookies and local browser storage technologies:</p>
            <ul>
              <li><strong className="text-white">Authentication token (localStorage):</strong> A JWT access token stored in your browser's localStorage to maintain your logged-in session. This is strictly necessary for platform functionality and is not a cookie. No third-party tracking involved.</li>
              <li><strong className="text-white">Currency preference (localStorage):</strong> Your selected display currency (e.g., NGN, GBP) stored locally for user experience continuity. No server-side tracking.</li>
              <li><strong className="text-white">Vercel Analytics:</strong> Where enabled, Vercel may collect aggregated, anonymised page view data. No individual user profiling is performed.</li>
            </ul>
            <p>We do not use third-party advertising cookies, cross-site tracking pixels, Facebook Pixel, Google Analytics with user identification, or any technology that tracks you across other websites.</p>
            <p>Because our authentication uses localStorage rather than cookies, traditional "cookie consent" banners are not applicable to the core authentication mechanism. If additional cookies are introduced in future, we will update this policy and obtain appropriate consent.</p>
          </Section>

          {/* ── Section 12: Children ──────────────────────────────────────── */}
          <Section id="children" title="12. Children's Privacy" icon={AlertTriangle}>
            <p>The Platform is strictly intended for users aged 18 and over (or the legal age of majority in their jurisdiction). We do not knowingly collect personal data from minors.</p>
            <p>If we become aware that a person under 18 has created an account or submitted personal data, we will immediately suspend the account and delete the data. If you believe a minor has used the Platform, please contact us immediately at {EMAIL} with subject "Minor Account Report."</p>
            <p>Parental or guardian consent does not supersede the minimum age requirement. Investors must additionally satisfy the Platform's KYC requirements, which verify age as part of identity confirmation.</p>
          </Section>

          {/* ── Section 13: Changes ───────────────────────────────────────── */}
          <Section id="changes" title="13. Changes to This Policy" icon={RefreshCw}>
            <p>We review and update this Privacy Policy regularly to reflect changes in our practices, technology, legal requirements, or business operations. The effective date at the top of this policy indicates when it was last revised.</p>
            <p><strong className="text-white">Material changes</strong> (such as changes to the categories of data we collect, new sharing arrangements, or changes to your rights) will be communicated by: (a) prominent notice on the Platform for at least 30 days; (b) email notification to your registered address; and (c) updating the version number and effective date.</p>
            <p><strong className="text-white">Non-material changes</strong> (such as clarifications, corrections, or contact detail updates) may be made without formal notice, though the effective date will be updated.</p>
            <p>We maintain an archive of previous versions of this policy. Prior versions are available on request by contacting {DPO_EMAIL}.</p>
          </Section>

          {/* ── Section 14: Contact ───────────────────────────────────────── */}
          <Section id="contact" title="14. Contact & Data Protection Officer" icon={Mail}>
            <p>For all privacy-related enquiries, data subject access requests, complaints, or to exercise your rights, contact our Data Protection function:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {[
                { label: 'Privacy & DPO Email',  value: DPO_EMAIL, mono: true  },
                { label: 'General Contact',       value: EMAIL,     mono: true  },
                { label: 'Legal Name',            value: COMPANY,   mono: false },
                { label: 'Registered Presence',   value: 'Lagos · London · Dubai', mono: false },
                { label: 'NDPR Registration',     value: 'Registered with NITDA Nigeria', mono: false },
                { label: 'Response Time',         value: '1–3 business days standard / 72h urgent', mono: false },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                  <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mb-1">{item.label}</p>
                  <p className={`text-sm text-teal-400 ${item.mono ? 'font-mono' : 'font-bold'}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <p>When submitting a request, please include: your full name, registered email, nature of the request, and any supporting information. For data subject access requests, we may need to verify your identity before releasing any data.</p>
            <p>If you are unsatisfied with our response, you have the right to escalate your complaint to the relevant supervisory authority in your jurisdiction:</p>
            <ul>
              <li><strong className="text-white">Nigeria:</strong> National Information Technology Development Agency (NITDA) — nitda.gov.ng</li>
              <li><strong className="text-white">UK:</strong> Information Commissioner's Office (ICO) — ico.org.uk</li>
              <li><strong className="text-white">EU:</strong> Your national Data Protection Authority (see edpb.europa.eu)</li>
              <li><strong className="text-white">South Africa:</strong> Information Regulator — inforegulator.org.za</li>
              <li><strong className="text-white">California (US):</strong> California Privacy Protection Agency — cppa.ca.gov</li>
            </ul>
          </Section>

          {/* Download prompt */}
          <div className="mt-10 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-white">Download a copy of this policy</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Print or save as PDF using your browser's print function</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-black font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all"
            >
              <Download size={12} /> Save as PDF
            </button>
          </div>

          {/* Footer stamp */}
          <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[9px] text-zinc-600 font-mono">
            <div className="space-y-1">
              <p>© 2026 {COMPANY} · {PLATFORM}</p>
              <p>Privacy Policy v2.0 · Effective {EFFECTIVE_DATE}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-teal-500 transition-colors uppercase tracking-widest">Terms of Service</Link>
              <span>·</span>
              <a href={`mailto:${EMAIL}`} className="hover:text-teal-500 transition-colors">{EMAIL}</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Reusable components ────────────────────────────────────────────────────── */
function Section({ id, title, icon: Icon, children }: {
  id: string; title: string; icon: any; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pb-10 mb-10 border-b border-zinc-900 last:border-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 flex-shrink-0">
          <Icon size={14} className="text-teal-500" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4 text-sm text-zinc-400 leading-relaxed [&_strong]:font-bold [&_p]:text-zinc-400 [&_ul]:space-y-2 [&_li]:flex [&_li]:gap-2 [&_li]:before:content-['→'] [&_li]:before:text-teal-500 [&_li]:before:flex-shrink-0 [&_li]:before:font-black [&_li]:before:text-xs [&_li]:before:mt-0.5">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="!text-white font-black text-xs uppercase tracking-widest pt-2 pb-1 border-b border-zinc-800/60">
      {children}
    </p>
  );
}
