'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, ChevronRight, ArrowLeft, ExternalLink,
  Scale, Globe, Lock, AlertTriangle, DollarSign, Users,
  FileText, Zap, Ban, RefreshCw, Mail, Building2
} from 'lucide-react';

const EFFECTIVE_DATE = 'April 8, 2026';
const COMPANY       = 'Impressions & Impacts Ltd';
const PLATFORM      = 'Nested Ark OS';
const EMAIL         = 'nestedark@gmail.com';
const WEBSITE       = 'https://nested-ark-frontend.vercel.app';

/* ── Section data ──────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'acceptance',       label: 'Acceptance of Terms',         icon: Scale      },
  { id: 'platform',         label: 'Platform Description',        icon: Building2  },
  { id: 'eligibility',      label: 'Eligibility & Registration',  icon: Users      },
  { id: 'roles',            label: 'Operator Roles & Access',     icon: ShieldCheck},
  { id: 'financial',        label: 'Financial Services & Escrow', icon: DollarSign },
  { id: 'fees',             label: 'Fees & Revenue',              icon: Zap        },
  { id: 'kyc',              label: 'KYC / AML Compliance',        icon: FileText   },
  { id: 'ip',               label: 'Intellectual Property',       icon: Lock       },
  { id: 'prohibited',       label: 'Prohibited Conduct',          icon: Ban        },
  { id: 'disclaimers',      label: 'Disclaimers & Liability',     icon: AlertTriangle },
  { id: 'indemnification',  label: 'Indemnification',             icon: ShieldCheck},
  { id: 'governing',        label: 'Governing Law & Disputes',    icon: Globe      },
  { id: 'modifications',    label: 'Modifications to Terms',      icon: RefreshCw  },
  { id: 'contact',          label: 'Contact Information',         icon: Mail       },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('acceptance');

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
            <Link href="/privacy"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/40 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all">
              Privacy Policy <ExternalLink size={9} />
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
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 max-w-3xl space-y-1">

          {/* Hero */}
          <div className="pb-10 border-b border-zinc-800 mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={14} className="text-teal-500" />
              <span className="text-[9px] text-teal-500 uppercase font-black tracking-[0.3em]">Legal · Binding Agreement</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-4">
              Terms of Service
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 font-mono">
              <span>Effective: <strong className="text-white">{EFFECTIVE_DATE}</strong></span>
              <span>·</span>
              <span>Operator: <strong className="text-white">{COMPANY}</strong></span>
              <span>·</span>
              <span>Platform: <strong className="text-teal-500">{PLATFORM}</strong></span>
            </div>
            <div className="mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs leading-relaxed">
              <AlertTriangle size={12} className="inline mr-2 flex-shrink-0" />
              <strong>Important:</strong> By accessing or using {PLATFORM}, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. These terms constitute a legally binding agreement between you and {COMPANY}.
            </div>
          </div>

          {/* ── Section 1: Acceptance ──────────────────────────────────────── */}
          <Section id="acceptance" title="1. Acceptance of Terms" icon={Scale}>
            <p>These Terms of Service ("Terms") govern your access to and use of the {PLATFORM} platform ("Platform"), operated by {COMPANY} ("Company", "we", "us", or "our"), a technology company incorporated in Nigeria with operational presence in the United Kingdom and the United Arab Emirates.</p>
            <p>By creating an account, accessing the Platform, submitting a project, making an investment, or otherwise using any feature of the Platform, you ("User", "Operator", or "you") acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference.</p>
            <p>If you are using the Platform on behalf of an organisation, company, government agency, or financial institution, you represent and warrant that you have the authority to bind that entity to these Terms, and references to "you" shall include that entity.</p>
            <p>We reserve the right to update these Terms at any time. Continued use of the Platform after any modification constitutes acceptance of the revised Terms. Where changes are material, we will provide at least 30 days' notice via the Platform or registered email address.</p>
          </Section>

          {/* ── Section 2: Platform ───────────────────────────────────────── */}
          <Section id="platform" title="2. Platform Description" icon={Building2}>
            <p>{PLATFORM} is a real-time infrastructure investment and project management platform that connects project developers, investors, contractors, suppliers, verifiers, financial institutions, and government agencies across Africa and globally.</p>
            <p>The Platform provides the following core services:</p>
            <ul>
              <li><strong className="text-white">Project Marketplace:</strong> A publicly searchable registry of infrastructure projects identified by unique NAP (Nested Ark Project) IDs, enabling transparent discovery and due diligence.</li>
              <li><strong className="text-white">Escrow Engine:</strong> A Paystack-powered escrow mechanism that holds investor capital in trust and releases funds exclusively upon successful tri-layer milestone verification.</li>
              <li><strong className="text-white">Tri-Layer Verification:</strong> An AI-assisted, human-audited, and drone-captured verification system that must achieve unanimous confirmation before any escrow release.</li>
              <li><strong className="text-white">Immutable Ledger:</strong> A SHA-256 hash-chained audit trail recording all platform events in a tamper-evident, permanently auditable log.</li>
              <li><strong className="text-white">Multi-Role Command Centers:</strong> Role-specific dashboards for Developers, Investors, Contractors, Verifiers, Suppliers, Banks, Government agencies, and Administrators.</li>
              <li><strong className="text-white">Currency Oracle:</strong> Real-time foreign exchange rate integration supporting NGN, GBP, USD, EUR, GHS, KES, ZAR, CAD, and AUD.</li>
            </ul>
            <p>The Platform is a technology intermediary. We are not a licensed financial institution, investment adviser, bank, mortgage lender, or regulated escrow agent in all jurisdictions. We facilitate connections and provide infrastructure for verified transactions. Nothing on the Platform constitutes financial advice.</p>
          </Section>

          {/* ── Section 3: Eligibility ────────────────────────────────────── */}
          <Section id="eligibility" title="3. Eligibility & Registration" icon={Users}>
            <p>To use the Platform, you must:</p>
            <ul>
              <li>Be at least 18 years of age, or the legal age of majority in your jurisdiction, whichever is higher.</li>
              <li>Have the legal capacity to enter into binding contracts under the laws of your country of residence.</li>
              <li>Not be located in, or a national or resident of, any country subject to United Nations, United States OFAC, UK OFSI, EU, or Nigerian sanctions.</li>
              <li>Not be a Politically Exposed Person (PEP) or associated with one, without prior written disclosure to and approval from the Company.</li>
              <li>Not have been previously suspended or permanently banned from the Platform.</li>
              <li>For investment activities: comply with all applicable securities laws in your jurisdiction. You acknowledge that the Platform does not guarantee suitability of any investment for your particular circumstances.</li>
            </ul>
            <p>You agree to provide accurate, current, and complete registration information and to update such information to keep it accurate. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately at {EMAIL} if you suspect unauthorised account access.</p>
            <p>We reserve the right to refuse registration, suspend, or terminate any account at our sole discretion, including but not limited to accounts that fail KYC/AML screening, provide false information, or engage in prohibited conduct.</p>
          </Section>

          {/* ── Section 4: Roles ──────────────────────────────────────────── */}
          <Section id="roles" title="4. Operator Roles & Access" icon={ShieldCheck}>
            <p>The Platform operates an eight-role access model. Each role carries specific permissions, obligations, and responsibilities:</p>
            <ul>
              <li><strong className="text-white">Developer / Owner:</strong> Responsible for submitting accurate project information, uploading authentic supporting documentation (2D/3D plans, approvals, feasibility studies), and ensuring all project data is truthful. Developers bear primary liability for the accuracy of project representations.</li>
              <li><strong className="text-white">Investor:</strong> Accepts that all investments are subject to risk, that past platform performance does not guarantee future returns, and that the target yield is an indicative projection only. Investors must complete KYC before committing capital above platform-defined thresholds.</li>
              <li><strong className="text-white">Contractor:</strong> Must maintain an accurate profile, submit genuine bids, and perform contracted works to the standards described in their accepted proposals. Fabrication of evidence for milestone verification is grounds for immediate permanent ban and potential criminal referral.</li>
              <li><strong className="text-white">Verifier / Auditor:</strong> Acts as an independent third party. Verifiers must conduct genuine site inspections and submit truthful verification reports. Collusion with Contractors or Developers to fraudulently pass verification is a serious criminal matter.</li>
              <li><strong className="text-white">Supplier:</strong> Responsible for accurate dispatch records, genuine QR code issuance, and truthful delivery confirmations. Supply chain fraud triggers escrow holds and platform investigation.</li>
              <li><strong className="text-white">Bank / Institution:</strong> May access institutional-grade ledger data and capital analytics. Banks using the Platform must comply with all applicable banking regulations in their jurisdiction.</li>
              <li><strong className="text-white">Government / Agency:</strong> Government accounts bear heightened responsibility for the accuracy of public project sponsorships and verifications. Government milestone approvals constitute official representations.</li>
              <li><strong className="text-white">Administrator:</strong> System-assigned only. Administrators have access to all platform functions and are bound by elevated confidentiality and fiduciary obligations to the Company.</li>
            </ul>
            <p>Role elevation is subject to Company approval and may require additional verification, agreements, or onboarding. The Company may reassign, downgrade, or remove roles at its discretion.</p>
          </Section>

          {/* ── Section 5: Financial ──────────────────────────────────────── */}
          <Section id="financial" title="5. Financial Services & Escrow" icon={DollarSign}>
            <p><strong className="text-white">Escrow Mechanism.</strong> All investor capital committed through the Platform is held in escrow accounts managed via Paystack Financial Services Ltd, a licensed Nigerian financial institution. Funds are not held directly by {COMPANY}. Escrow release requires unanimous tri-layer verification (AI + Human + Drone).</p>
            <p><strong className="text-white">No Guarantee of Returns.</strong> The Platform does not guarantee any return on investment. Projected yields (e.g., 12% p.a.) are indicative targets based on project parameters and are not guaranteed. Infrastructure projects carry inherent risks including construction delays, cost overruns, regulatory changes, natural events, and contractor default.</p>
            <p><strong className="text-white">Capital at Risk.</strong> You acknowledge that all capital committed on the Platform is at risk and may not be recovered in full. You should not invest amounts you cannot afford to lose entirely.</p>
            <p><strong className="text-white">Milestone Payouts.</strong> Contractor payments are released only after the tri-layer verification gate is passed. A platform escrow fee (currently 2% of gross milestone value) is automatically deducted at the point of release as the System Maintenance & Insurance Levy. This fee is non-refundable and constitutes consideration for the verification and escrow services provided.</p>
            <p><strong className="text-white">Currency Risk.</strong> Multi-currency transactions are subject to foreign exchange rate fluctuations. The Company is not liable for losses arising from currency movements between investment and payout.</p>
            <p><strong className="text-white">Paystack Terms.</strong> Payment processing is subject to Paystack's own Terms of Service and Privacy Policy. By making payments through the Platform, you also agree to Paystack's terms. The Company's Paystack merchant name is "Impressions and Impacts Ltd."</p>
            <p><strong className="text-white">Withdrawals & Disbursements.</strong> Withdrawal requests are processed according to the Platform's disbursement schedule. The Company reserves the right to delay disbursements pending KYC verification, fraud investigations, or regulatory compliance checks.</p>
          </Section>

          {/* ── Section 6: Fees ───────────────────────────────────────────── */}
          <Section id="fees" title="6. Fees & Revenue Model" icon={Zap}>
            <p>The Platform operates a transparent multi-stream revenue model. By using the Platform, you agree to the following fee structure:</p>
            <ul>
              <li><strong className="text-white">Escrow Service Fee (2%):</strong> Charged on every verified milestone payout. Deducted automatically from the gross milestone allocation before contractor disbursement.</li>
              <li><strong className="text-white">Investment Placement Fee (0.5%):</strong> Charged to investors at the point of capital commitment. This fee covers KYC/AML processing and escrow administration costs.</li>
              <li><strong className="text-white">Supply Chain Commission (3%):</strong> Charged on supplier dispatch value processed through the Platform's logistics module.</li>
              <li><strong className="text-white">Project Listing Fee ($49 USD flat):</strong> A one-time fee charged to Developers to list a project and generate a NAP ID. This fee is non-refundable once a NAP ID is issued.</li>
              <li><strong className="text-white">Verification-as-a-Service (VaaS) Subscriptions:</strong> Enterprise and government subscriptions for private project ledger access, priced separately per agreement.</li>
              <li><strong className="text-white">Advertising & Sponsored Placements:</strong> Brands and financial institutions may sponsor placements in the Market Ticker. Rates are set by the Company and clearly labelled as "SPONSORED".</li>
            </ul>
            <p>All fees are inclusive of applicable taxes where required. The Company reserves the right to modify the fee structure with 30 days' written notice. Continued use after the effective date of any fee change constitutes acceptance.</p>
            <p>Paystack transaction fees (charged by Paystack independently) are in addition to the above and are the responsibility of the subaccount holder as configured in the Platform's payment split settings.</p>
          </Section>

          {/* ── Section 7: KYC/AML ───────────────────────────────────────── */}
          <Section id="kyc" title="7. KYC / AML Compliance" icon={FileText}>
            <p>The Platform is committed to full compliance with applicable anti-money laundering (AML), counter-terrorism financing (CTF), and Know Your Customer (KYC) regulations, including but not limited to:</p>
            <ul>
              <li>Nigeria's Money Laundering (Prevention and Prohibition) Act 2022</li>
              <li>Nigeria's Terrorism (Prevention and Prohibition) Act 2022</li>
              <li>Financial Action Task Force (FATF) Recommendations</li>
              <li>UK Proceeds of Crime Act 2002 and Money Laundering Regulations 2017</li>
              <li>EU Anti-Money Laundering Directives (AMLD4/5/6)</li>
              <li>US Bank Secrecy Act (BSA) and OFAC sanctions compliance</li>
            </ul>
            <p><strong className="text-white">KYC Verification.</strong> Investors committing capital above platform-defined thresholds, and all Developers listing projects, are required to complete identity verification by submitting a government-issued ID (NIN, BVN, Passport, Driver's Licence, or National ID) and associated personal information. KYC verification typically takes 1–3 business days.</p>
            <p><strong className="text-white">Data Retention.</strong> KYC records are retained for a minimum of 5 years from the date of the last transaction, in compliance with AML regulations.</p>
            <p><strong className="text-white">Suspicious Activity.</strong> The Company is required by law to report suspicious transactions to the Nigerian Financial Intelligence Unit (NFIU), UK National Crime Agency (NCA), and other relevant authorities. By using the Platform, you consent to such reporting where legally required. This is not a breach of our Privacy Policy.</p>
            <p><strong className="text-white">Sanctions Screening.</strong> All users and transactions are screened against international sanctions lists. Accounts matching sanctioned entities will be immediately suspended and reported to relevant authorities.</p>
          </Section>

          {/* ── Section 8: IP ─────────────────────────────────────────────── */}
          <Section id="ip" title="8. Intellectual Property" icon={Lock}>
            <p><strong className="text-white">Platform IP.</strong> The Platform, its software, design, logos, trademarks, trade names, NAP protocol, tri-layer verification methodology, hash chain architecture, and all associated intellectual property are owned exclusively by {COMPANY} and are protected under Nigerian, UK, UAE, and international intellectual property laws.</p>
            <p>You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform solely for the purposes described in these Terms. This licence does not include the right to copy, reproduce, modify, reverse-engineer, distribute, sublicense, or create derivative works from any part of the Platform.</p>
            <p><strong className="text-white">User Content.</strong> You retain ownership of project documentation, images, reports, and other content you upload to the Platform ("User Content"). By uploading User Content, you grant the Company a worldwide, royalty-free, non-exclusive licence to store, display, process, and use that content for the purpose of operating the Platform, including verification processes and ledger recording.</p>
            <p>You represent and warrant that: (a) you own or have the necessary rights to all User Content you upload; (b) User Content does not infringe any third party's intellectual property, privacy, or other rights; (c) User Content is accurate and not misleading.</p>
            <p><strong className="text-white">Feedback.</strong> Any suggestions, feedback, or ideas you provide regarding the Platform may be used by the Company without restriction or compensation.</p>
          </Section>

          {/* ── Section 9: Prohibited ─────────────────────────────────────── */}
          <Section id="prohibited" title="9. Prohibited Conduct" icon={Ban}>
            <p>You agree not to engage in any of the following, which are expressly prohibited and may result in immediate account termination, civil action, criminal referral, or all three:</p>
            <ul>
              <li>Submitting false, fraudulent, or misleading project information, financial data, or identity documents.</li>
              <li>Fabricating, manipulating, or staging verification evidence (photos, videos, drone footage, GPS data).</li>
              <li>Colluding with any other user to fraudulently pass the tri-layer verification gate.</li>
              <li>Using the Platform to launder money, finance terrorism, evade sanctions, or engage in any other unlawful financial activity.</li>
              <li>Creating multiple accounts to circumvent KYC, fees, bans, or platform limits.</li>
              <li>Attempting to access, reverse-engineer, scrape, or extract the Platform's source code, database, APIs, or proprietary algorithms without written authorisation.</li>
              <li>Introducing malware, ransomware, viruses, or any code designed to disrupt, disable, or gain unauthorised access to the Platform or its infrastructure.</li>
              <li>Using the Platform to harass, threaten, defame, or harm any other user or third party.</li>
              <li>Impersonating any person, entity, government agency, or financial institution.</li>
              <li>Circumventing or attempting to circumvent the Platform's escrow controls, release mechanisms, or payment routing.</li>
              <li>Using automated tools, bots, or scrapers to access Platform data without written authorisation from the Company.</li>
              <li>Violating any applicable law, regulation, or the rights of any third party.</li>
            </ul>
            <p>The Company cooperates fully with law enforcement, regulatory bodies, and financial intelligence units globally. Serious violations will be referred to the appropriate authorities.</p>
          </Section>

          {/* ── Section 10: Disclaimers ───────────────────────────────────── */}
          <Section id="disclaimers" title="10. Disclaimers & Limitation of Liability" icon={AlertTriangle}>
            <p><strong className="text-white">AS-IS Provision.</strong> The Platform is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or uninterrupted operation.</p>
            <p><strong className="text-white">No Investment Advice.</strong> Nothing on the Platform constitutes investment, financial, legal, tax, or regulatory advice. You should consult qualified professionals before making any investment decision. The Company does not recommend any specific project, investment amount, or strategy.</p>
            <p><strong className="text-white">Third-Party Services.</strong> The Platform integrates with third-party services including Paystack (payments), open.er-api.com (currency rates), and drone/verification data providers. The Company is not liable for any failures, errors, or interruptions in these third-party services.</p>
            <p><strong className="text-white">Force Majeure.</strong> The Company shall not be liable for delays or failures caused by circumstances beyond its reasonable control, including natural disasters, wars, pandemics, government actions, internet infrastructure failures, power outages, or acts of God.</p>
            <p><strong className="text-white">Limitation of Liability.</strong> To the maximum extent permitted by applicable law, the Company's total liability to you for any claims arising from these Terms or use of the Platform shall not exceed the greater of: (a) the total fees you paid to the Company in the 12 months preceding the claim; or (b) USD $100. The Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages, loss of profits, loss of data, or loss of goodwill.</p>
            <p><strong className="text-white">Downtime.</strong> The Platform may be unavailable due to scheduled maintenance, emergency updates, or infrastructure issues. The Company will endeavour to provide advance notice where reasonably practicable but does not guarantee continuous uptime.</p>
            <p>Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability. In such jurisdictions, our liability is limited to the minimum extent permitted by law.</p>
          </Section>

          {/* ── Section 11: Indemnification ───────────────────────────────── */}
          <Section id="indemnification" title="11. Indemnification" icon={ShieldCheck}>
            <p>You agree to indemnify, defend, and hold harmless {COMPANY}, its directors, officers, employees, agents, licensors, and successors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or relating to:</p>
            <ul>
              <li>Your use of the Platform or any activities conducted through your account.</li>
              <li>Your breach of these Terms or any applicable law or regulation.</li>
              <li>Your User Content or any project information you submit to the Platform.</li>
              <li>Any fraud, misrepresentation, or wilful misconduct by you.</li>
              <li>Any dispute between you and another Platform user.</li>
              <li>Any third-party claims arising from your actions on the Platform.</li>
            </ul>
            <p>The Company reserves the right, at its own expense, to assume the exclusive defence and control of any matter otherwise subject to indemnification by you, in which case you agree to cooperate with the Company's defence of such claim.</p>
          </Section>

          {/* ── Section 12: Governing Law ─────────────────────────────────── */}
          <Section id="governing" title="12. Governing Law & Dispute Resolution" icon={Globe}>
            <p><strong className="text-white">Governing Law.</strong> These Terms are governed by the laws of the Federal Republic of Nigeria. For users based in the United Kingdom, EU, or UAE, applicable consumer protection laws in those jurisdictions may also apply and are not displaced by this clause.</p>
            <p><strong className="text-white">Dispute Resolution.</strong> In the event of any dispute, controversy, or claim arising out of or relating to these Terms or the use of the Platform, the parties agree to first attempt resolution through good-faith negotiation. Written notice of a dispute must be sent to {EMAIL}, and the parties shall have 30 days to attempt resolution.</p>
            <p><strong className="text-white">Arbitration.</strong> If negotiation fails, disputes shall be submitted to binding arbitration under the Lagos Court of Arbitration Rules, unless the user is a consumer in a jurisdiction with mandatory court access rights. The seat of arbitration shall be Lagos, Nigeria. Proceedings shall be in English.</p>
            <p><strong className="text-white">Class Action Waiver.</strong> To the extent permitted by applicable law, you waive any right to bring claims as a plaintiff or class member in any class action, consolidated, or representative proceeding.</p>
            <p><strong className="text-white">Jurisdiction.</strong> For matters not subject to arbitration, you irrevocably submit to the exclusive jurisdiction of the courts of Lagos State, Nigeria, without prejudice to the right of consumers in other jurisdictions to bring claims before their local courts.</p>
            <p><strong className="text-white">Regulatory Complaints.</strong> Nothing in these Terms prevents you from filing a complaint with a relevant regulatory authority in your jurisdiction, including but not limited to the CBN (Nigeria), FCA (UK), or SEC (Nigeria).</p>
          </Section>

          {/* ── Section 13: Modifications ─────────────────────────────────── */}
          <Section id="modifications" title="13. Modifications & Termination" icon={RefreshCw}>
            <p><strong className="text-white">Modifications to Terms.</strong> The Company reserves the right to modify these Terms at any time. For material changes, we will provide at least 30 days' advance notice via email to your registered address or a prominent notice on the Platform. Non-material changes (such as corrections or clarifications) may be made without notice.</p>
            <p><strong className="text-white">Account Termination by You.</strong> You may close your account at any time by contacting {EMAIL}. Account closure does not affect your obligations for any transactions initiated prior to closure. Pending escrow balances will be processed according to the Platform's disbursement procedures.</p>
            <p><strong className="text-white">Account Suspension by Us.</strong> We may suspend or permanently terminate your account immediately, without notice, if: (a) you breach these Terms; (b) we are required to do so by law or regulation; (c) we detect fraud, suspicious activity, or KYC/AML concerns; (d) you engage in prohibited conduct.</p>
            <p><strong className="text-white">Effect of Termination.</strong> Upon termination: (a) your licence to use the Platform ceases immediately; (b) pending verified payouts will be processed; (c) unverified escrow balances may be held pending investigation; (d) your data will be retained as required by law. Sections 8 (IP), 9 (Prohibited Conduct), 10 (Disclaimers), 11 (Indemnification), and 12 (Governing Law) survive termination.</p>
            <p><strong className="text-white">Modifications to the Platform.</strong> The Company may modify, suspend, or discontinue any feature or the entire Platform at any time without liability. Where commercially reasonable, we will provide advance notice of material changes.</p>
          </Section>

          {/* ── Section 14: Contact ───────────────────────────────────────── */}
          <Section id="contact" title="14. Contact Information" icon={Mail}>
            <p>If you have any questions about these Terms, wish to make a complaint, or need to contact us for any legal purpose, please use the following:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {[
                { label: 'Email', value: EMAIL, mono: true },
                { label: 'Platform', value: WEBSITE, mono: true },
                { label: 'Company', value: COMPANY, mono: false },
                { label: 'Offices', value: 'Lagos · London · Dubai', mono: false },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
                  <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mb-1">{item.label}</p>
                  <p className={`text-sm text-teal-400 ${item.mono ? 'font-mono' : 'font-bold'}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <p>For KYC disputes and identity verification queries, please include your NAP user ID and account email in all correspondence. Response time is typically 1–3 business days.</p>
            <p>For urgent matters relating to suspected fraud, money laundering, or security incidents, contact {EMAIL} with the subject line "URGENT SECURITY" for priority handling.</p>
          </Section>

          {/* Footer stamp */}
          <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[9px] text-zinc-600 font-mono">
            <div className="space-y-1">
              <p>© 2026 {COMPANY} · {PLATFORM}</p>
              <p>Version 2.0 · Effective {EFFECTIVE_DATE}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-teal-500 transition-colors uppercase tracking-widest">Privacy Policy</Link>
              <span>·</span>
              <a href={`mailto:${EMAIL}`} className="hover:text-teal-500 transition-colors">{EMAIL}</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Reusable section wrapper ───────────────────────────────────────────────── */
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
