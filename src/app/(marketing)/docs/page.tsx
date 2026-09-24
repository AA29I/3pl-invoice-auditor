"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Calculator,
  Terminal,
  TrendingUp,
  Presentation,
  CheckCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Layers,
  Cpu,
  DollarSign
} from "lucide-react";

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "methodology" | "rate-cards" | "dev-mode" | "investor-pitch" | "operator-guide"
  >("overview");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const navItems = [
    { id: "overview", label: "Architecture & Security", icon: Shield },
    { id: "methodology", label: "Deterministic Audit Math", icon: Calculator },
    { id: "rate-cards", label: "Complex Rate Cards (oz/lb/kg)", icon: Layers },
    { id: "dev-mode", label: "Dev Mode & API Specs", icon: Terminal },
    { id: "investor-pitch", label: "Executive Funding Memo", icon: TrendingUp },
    { id: "operator-guide", label: "Live Presentation Run-Book", icon: Presentation },
  ] as const;

  return (
    <div className="bg-[#FBFAF6] min-h-screen text-[#121210]">
      {/* Hero Header */}
      <div className="border-b border-[#DCD5C8] bg-[#F3F0E8]/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#B8892D] uppercase tracking-wider">
            <span>Enterprise Documentation &amp; Whitepaper</span>
            <span>•</span>
            <span>Version 2.4.0 (Production)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#090908]">
            Mett Global 3PL Auditor Documentation
          </h1>
          <p className="text-sm text-[#777268] max-w-3xl leading-relaxed">
            Technical specifications, deterministic audit methodology, enterprise rate card schemas,
            and executive briefing materials for corporate stakeholders, logistics leaders, and investors.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#121210] hover:bg-[#090908] text-[#FBFAF6] text-xs font-semibold rounded transition"
            >
              Open Live Workspace <ChevronRight className="w-3.5 h-3.5 text-[#E0BC68]" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FBFAF6] hover:bg-[#F3F0E8] text-[#121210] border border-[#DCD5C8] text-xs font-semibold rounded transition"
            >
              Commercial Tiers &amp; Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Main Documentation Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-1">
            <div className="sticky top-20 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#777268] font-bold block px-2">
                Knowledge Modules
              </span>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded transition text-left ${
                        isActive
                          ? "bg-[#121210] text-[#FBFAF6] font-semibold shadow-xs"
                          : "text-[#777268] hover:text-[#121210] hover:bg-[#F3F0E8]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#E0BC68]" : "text-[#777268]"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-3.5 bg-[#F3F0E8] border border-[#DCD5C8] rounded text-xs space-y-2 mt-6">
                <div className="font-semibold text-[#121210] text-[11px] font-mono uppercase">
                  Executive Fast-Track
                </div>
                <p className="text-[11px] text-[#777268] leading-tight">
                  Presenting tomorrow? Switch directly to the{" "}
                  <button
                    onClick={() => setActiveTab("operator-guide")}
                    className="text-[#B8892D] font-bold hover:underline"
                  >
                    Live Presentation Run-Book
                  </button>{" "}
                  for a step-by-step 5-minute meeting script.
                </p>
              </div>
            </div>
          </aside>

          {/* Documentation Content Area */}
          <main className="lg:col-span-9 bg-white border border-[#DCD5C8] rounded-lg p-6 sm:p-10 shadow-xs space-y-10">
            {/* TAB 1: ARCHITECTURE & SECURITY */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="border-b border-[#DCD5C8] pb-4">
                  <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider font-semibold">
                    Core Technical Specifications
                  </span>
                  <h2 className="text-2xl font-serif font-black text-[#090908] tracking-tight mt-1">
                    System Architecture &amp; Data Security
                  </h2>
                  <p className="text-xs text-[#777268] mt-1">
                    How Mett Global guarantees bank-grade tenant isolation, data sovereignty, and deterministic integrity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#FBFAF6] border border-[#DCD5C8] rounded space-y-1.5">
                    <Database className="w-5 h-5 text-[#B8892D]" />
                    <div className="font-mono text-xs font-bold text-[#121210]">Neon Serverless Postgres</div>
                    <p className="text-[11px] text-[#777268]">
                      Encrypted connection pooling via AWS us-east-2 with point-in-time recovery and branch replication.
                    </p>
                  </div>
                  <div className="p-4 bg-[#FBFAF6] border border-[#DCD5C8] rounded space-y-1.5">
                    <Lock className="w-5 h-5 text-[#B8892D]" />
                    <div className="font-mono text-xs font-bold text-[#121210]">Tenant Isolation</div>
                    <p className="text-[11px] text-[#777268]">
                      Strict row-level workspace partition keys (<code className="text-[10px]">workspaceId</code>) on all invoice and rate card records.
                    </p>
                  </div>
                  <div className="p-4 bg-[#FBFAF6] border border-[#DCD5C8] rounded space-y-1.5">
                    <Cpu className="w-5 h-5 text-[#B8892D]" />
                    <div className="font-mono text-xs font-bold text-[#121210]">Edge Serverless Compute</div>
                    <p className="text-[11px] text-[#777268]">
                      Next.js 14 App Router deployed to Vercel global edge for sub-100ms response times worldwide.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    Data Flow Pipeline
                  </h3>
                  <div className="p-4 bg-[#121210] rounded text-[#FBFAF6] font-mono text-xs space-y-2 overflow-x-auto">
                    <div className="text-[#E0BC68]">// High-Level Ingestion &amp; Audit Lifecycle</div>
                    <div>1. Client Browser &rarr; Streams 3PL billing statement CSV to `/api/audits`</div>
                    <div>2. Normalizer &rarr; Auto-detects headers, validates data types, handles multi-carrier encoding</div>
                    <div>3. Rate Card Resolver &rarr; Fetches signed active rate card schedule for the billing period</div>
                    <div>4. Deterministic Engine &rarr; Executes line-by-line contract matching (flat, tiered weight, surcharges)</div>
                    <div>5. Flag Classifier &rarr; Isolates potential discrepancies into exact dollar differences with citations</div>
                    <div>6. Export Engine &rarr; Compiles executive dispute PDF summary &amp; warehouse reconciliation CSV pack</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    Authentication &amp; Session Management
                  </h3>
                  <ul className="text-xs text-[#777268] space-y-2 list-disc pl-5">
                    <li>
                      <strong className="text-[#121210]">HttpOnly Secure Cookies:</strong> Session tokens are signed using high-entropy HMAC-SHA256 JWTs with strict <code className="text-[11px]">SameSite=Lax</code> and <code className="text-[11px]">Secure</code> flags.
                    </li>
                    <li>
                      <strong className="text-[#121210]">Native Google OAuth 2.0:</strong> Direct OpenID Connect integration for corporate Gmail and Google Workspace accounts with fallback direct token verification.
                    </li>
                    <li>
                      <strong className="text-[#121210]">Stateless Scalability:</strong> Database session overhead is eliminated during token verification, ensuring uninterrupted throughput during high-volume month-end auditing bursts.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: AUDIT METHODOLOGY & MATH */}
            {activeTab === "methodology" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="border-b border-[#DCD5C8] pb-4">
                  <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider font-semibold">
                    Core Algorithmic Foundation
                  </span>
                  <h2 className="text-2xl font-serif font-black text-[#090908] tracking-tight mt-1">
                    Deterministic Audit Engine &amp; Mathematical Proof
                  </h2>
                  <p className="text-xs text-[#777268] mt-1">
                    Why deterministic contract-grounded verification wins disputes where probabilistic AI scrapers fail.
                  </p>
                </div>

                <div className="p-4 bg-[#F3F0E8] border border-[#B8892D]/40 rounded text-xs space-y-2">
                  <div className="font-bold text-[#121210] font-mono uppercase">
                    The Deterministic Standard:
                  </div>
                  <p className="text-[#777268] leading-relaxed">
                    When negotiating commercial fee disputes with warehouse operators (e.g. ShipBob, Red Stag, DCL), claims backed by probabilistic language (&ldquo;an AI estimated this was 15% too high&rdquo;) are summarily dismissed. Mett Global delivers <strong>immutable mathematical proof</strong> citing the signed contractual rate card, row number, weight bracket, and the exact penny discrepancy.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    The 4 Primary Discrepancy Detection Engines
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 border border-[#DCD5C8] rounded bg-[#FBFAF6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#121210]">
                          1. RATE_EXCEEDS_CONTRACT
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#fdf8f8] text-[#8f2020] border border-[#f1c2c2] rounded font-bold">
                          Primary Discrepancy
                        </span>
                      </div>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Cross-references every line charge against the contracted fee category for the matched service date.
                      </p>
                      <div className="bg-[#121210] p-3 rounded font-mono text-[11px] text-[#FBFAF6] overflow-x-auto">
                        <span className="text-[#E0BC68]">Discrepancy Formula:</span> Difference = BilledTotalCents - ExpectedTotalCents
                        <br />
                        <span className="text-[#777268]">// Example:</span> Billed Rate: $4.25 | Contracted Tier 0-1lb: $3.10 | Overbilling: +$1.15
                      </div>
                    </div>

                    <div className="p-4 border border-[#DCD5C8] rounded bg-[#FBFAF6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#121210]">
                          2. DUPLICATE_INVOICE_LINE
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#fdf8f8] text-[#8f2020] border border-[#f1c2c2] rounded font-bold">
                          Ghost Fulfillment
                        </span>
                      </div>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Flags identical order references or tracking numbers billed more than once across billing cycles or within the same invoice.
                      </p>
                    </div>

                    <div className="p-4 border border-[#DCD5C8] rounded bg-[#FBFAF6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#121210]">
                          3. UNCONTRACTED_FEE_CATEGORY
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#fdf8f8] text-[#8f2020] border border-[#f1c2c2] rounded font-bold">
                          Unauthorized Surcharges
                        </span>
                      </div>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Identifies invented line items (e.g. &ldquo;Emergency Holiday Handling&rdquo;, &ldquo;Peak Congestion Fee&rdquo;, &ldquo;Manual Address Scrub&rdquo;) that have no authorization in the signed agreement.
                      </p>
                    </div>

                    <div className="p-4 border border-[#DCD5C8] rounded bg-[#FBFAF6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#121210]">
                          4. MOM_ANOMALOUS_SURGE
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#fdf8f8] text-[#8f2020] border border-[#f1c2c2] rounded font-bold">
                          Statistical Outliers
                        </span>
                      </div>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Detects line items that exceed 3 standard deviations from historical baseline billing averages for that fee type.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RATE CARDS & TIERED WEIGHTS */}
            {activeTab === "rate-cards" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="border-b border-[#DCD5C8] pb-4">
                  <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider font-semibold">
                    Real-World Enterprise Ingestion
                  </span>
                  <h2 className="text-2xl font-serif font-black text-[#090908] tracking-tight mt-1">
                    Complex Rate Cards &amp; Tiered Weight Breaks
                  </h2>
                  <p className="text-xs text-[#777268] mt-1">
                    Built for high-volume enterprise brands like RDX Sports with weights in oz, lbs, kg, and multi-carrier splits.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    Supported Weight Dimensions &amp; Conversion Tables
                  </h3>
                  <div className="overflow-x-auto border border-[#DCD5C8] rounded">
                    <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                      <thead className="bg-[#F3F0E8] font-mono text-[#777268]">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold">Unit Code</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Standard Unit</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Common Applications</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Incremental Step Logic</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCD5C8] bg-white">
                        <tr>
                          <td className="px-4 py-2.5 font-mono font-bold text-[#121210]">OZ</td>
                          <td className="px-4 py-2.5">Ounces (16 oz = 1 lb)</td>
                          <td className="px-4 py-2.5 text-[#777268]">Apparel, boxing wraps, gloves, small accessories</td>
                          <td className="px-4 py-2.5 font-mono text-[#B8892D]">Per 1 oz step over base</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-mono font-bold text-[#121210]">LB</td>
                          <td className="px-4 py-2.5">Pounds (US Domestic)</td>
                          <td className="px-4 py-2.5 text-[#777268]">Punching bags, weight vests, multi-item cartons</td>
                          <td className="px-4 py-2.5 font-mono text-[#B8892D]">Per 1 lb step over tier</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-mono font-bold text-[#121210]">KG</td>
                          <td className="px-4 py-2.5">Kilograms (UK/EU/Global)</td>
                          <td className="px-4 py-2.5 text-[#777268]">Cross-border DPD, Royal Mail, DHL international</td>
                          <td className="px-4 py-2.5 font-mono text-[#B8892D]">Per 0.5 kg or 1 kg increment</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-mono font-bold text-[#121210]">G</td>
                          <td className="px-4 py-2.5">Grams (High precision)</td>
                          <td className="px-4 py-2.5 text-[#777268]">Supplements, mouthguards, micro-components</td>
                          <td className="px-4 py-2.5 font-mono text-[#B8892D]">Per 100g increment</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif font-bold text-[#090908]">
                      Tiered Weight Fee Schema Example (JSON)
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          "json-schema",
                          JSON.stringify(
                            {
                              category: "SHIPPING_CARRIER",
                              shipper: "Royal Mail",
                              serviceLevel: "Tracked 48",
                              weightUnit: "KG",
                              minWeight: 0.0,
                              maxWeight: 1.0,
                              rateCents: 380,
                              incrementalRateCents: 50,
                              incrementalWeightStep: 1.0,
                              customFields: { carrierZone: "UK Mainland", peakApplicable: false }
                            },
                            null,
                            2
                          )
                        )
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#B8892D] hover:underline"
                    >
                      {copiedSnippet === "json-schema" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === "json-schema" ? "Copied" : "Copy JSON"}</span>
                    </button>
                  </div>

                  <pre className="bg-[#121210] text-[#FBFAF6] p-4 rounded text-xs font-mono overflow-x-auto">
{`{
  "category": "SHIPPING_CARRIER",
  "shipper": "Royal Mail",
  "serviceLevel": "Tracked 48",
  "weightUnit": "KG",
  "minWeight": 0.0,
  "maxWeight": 1.0,
  "rateCents": 380,           // £3.80 base for 0-1 kg
  "incrementalRateCents": 50,  // +£0.50 per additional 1.0 kg
  "incrementalWeightStep": 1.0,
  "customFields": {
    "carrierZone": "UK Mainland",
    "contractClause": "Schedule B-2.4"
  }
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 4: DEV MODE & API */}
            {activeTab === "dev-mode" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="border-b border-[#DCD5C8] pb-4">
                  <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider font-semibold">
                    Developer Platform &amp; Integration
                  </span>
                  <h2 className="text-2xl font-serif font-black text-[#090908] tracking-tight mt-1">
                    Dev Sandbox, Custom Fields &amp; REST API
                  </h2>
                  <p className="text-xs text-[#777268] mt-1">
                    Full programmatic control for logistics engineering teams, enterprise ERP connectors, and webhooks.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    What Dev Sandbox Mode Enables
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-[#FBFAF6] border border-[#DCD5C8] rounded space-y-1">
                      <div className="font-mono font-bold text-[#121210]">1. Unlimited Row Limits</div>
                      <p className="text-[#777268]">
                        Instantly bypasses tier row limits to audit 50,000+ line warehouse statements during testing.
                      </p>
                    </div>
                    <div className="p-3.5 bg-[#FBFAF6] border border-[#DCD5C8] rounded space-y-1">
                      <div className="font-mono font-bold text-[#121210]">2. Rate Card Simulations</div>
                      <p className="text-[#777268]">
                        Simulates proposed rate cards against past invoices to calculate impact before signing new contracts.
                      </p>
                    </div>
                    <div className="p-3.5 bg-[#FBFAF6] border border-[#DCD5C8] rounded space-y-1">
                      <div className="font-mono font-bold text-[#121210]">3. Extended Custom Fields</div>
                      <p className="text-[#777268]">
                        Capture and map custom ERP columns (SKU, Pallet ID, Purchase Order, Dimensional Volumes).
                      </p>
                    </div>
                    <div className="p-3.5 bg-[#FBFAF6] border border-[#DCD5C8] rounded space-y-1">
                      <div className="font-mono font-bold text-[#121210]">4. Instant Sandbox Toggle</div>
                      <p className="text-[#777268]">
                        Switch between Live Mode and Dev Sandbox directly from the top navigation bar with 0 delay.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    Key REST API Endpoints
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 bg-[#FBFAF6] border border-[#DCD5C8] rounded flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-[#121210] text-[#FBFAF6] rounded font-bold text-[10px]">POST</span>
                        <span className="text-[#121210]">/api/audits</span>
                      </div>
                      <span className="text-[#777268] text-[11px] font-sans">Submit CSV billing data for audit</span>
                    </div>

                    <div className="p-3 bg-[#FBFAF6] border border-[#DCD5C8] rounded flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-[#B8892D] text-[#090908] rounded font-bold text-[10px]">GET</span>
                        <span className="text-[#121210]">/api/audits/:auditId/export-pdf</span>
                      </div>
                      <span className="text-[#777268] text-[11px] font-sans">Stream printable dispute summary PDF</span>
                    </div>

                    <div className="p-3 bg-[#FBFAF6] border border-[#DCD5C8] rounded flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-[#B8892D] text-[#090908] rounded font-bold text-[10px]">GET</span>
                        <span className="text-[#121210]">/api/audits/:auditId/export-csv</span>
                      </div>
                      <span className="text-[#777268] text-[11px] font-sans">Export line-item dispute claim sheet</span>
                    </div>

                    <div className="p-3 bg-[#FBFAF6] border border-[#DCD5C8] rounded flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-[#121210] text-[#FBFAF6] rounded font-bold text-[10px]">POST</span>
                        <span className="text-[#121210]">/api/workspace/dev-mode</span>
                      </div>
                      <span className="text-[#777268] text-[11px] font-sans">Toggle developer sandbox state</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: INVESTOR PITCH & UNIT ECONOMICS */}
            {activeTab === "investor-pitch" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="border-b border-[#DCD5C8] pb-4">
                  <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider font-semibold">
                    Executive Briefing &amp; Investment Memorandum
                  </span>
                  <h2 className="text-2xl font-serif font-black text-[#090908] tracking-tight mt-1">
                    Market Opportunity, Unit Economics &amp; Scale Thesis
                  </h2>
                  <p className="text-xs text-[#777268] mt-1">
                    Prepared for boardroom evaluation, venture funding discussions, and commercial enterprise scale.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-[#121210] text-[#FBFAF6] rounded space-y-1">
                    <div className="text-2xl font-serif font-bold text-[#E0BC68]">$120B+</div>
                    <div className="text-[11px] text-[#777268] font-mono uppercase">Global 3PL Market</div>
                  </div>
                  <div className="p-4 bg-[#121210] text-[#FBFAF6] rounded space-y-1">
                    <div className="text-2xl font-serif font-bold text-[#E0BC68]">3% – 8%</div>
                    <div className="text-[11px] text-[#777268] font-mono uppercase">Avg Overbilling Rate</div>
                  </div>
                  <div className="p-4 bg-[#121210] text-[#FBFAF6] rounded space-y-1">
                    <div className="text-2xl font-serif font-bold text-[#E0BC68]">9.4x</div>
                    <div className="text-[11px] text-[#777268] font-mono uppercase">Customer ROI Multiple</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    1. The Critical Enterprise Pain Point
                  </h3>
                  <p className="text-xs text-[#777268] leading-relaxed">
                    E-commerce brands spending between $500,000 and $10,000,000+ annually on 3PL warehouse logistics receive thousands of rows of weekly CSV statements. Manual Excel reconciliation takes 20+ hours per month, misses complex weight break creep (e.g. billing 17 oz at the 2 lb rate), and allows warehouse accounting discrepancies to slip through unnoticed.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    2. The Mett Global Value Proposition &amp; Moat
                  </h3>
                  <div className="space-y-2 text-xs text-[#777268]">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#B8892D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#121210]">Deterministic Grounding:</strong> We do not guess. We mathematically prove discrepancies against signed legal contracts.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#B8892D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#121210]">Dispute Claim Packages:</strong> Generate 1-click dispute CSV sheets and PDF audit reports ready to send directly to 3PL account managers for credit notes.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#B8892D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#121210]">Fast Payback:</strong> For a merchant spending $100,000/month, detecting a 4% discrepancy generates $4,000 in monthly credit against a $499 software cost — an immediate 8x return.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-serif font-bold text-[#090908]">
                    3. SaaS Commercial Tiers
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 border border-[#DCD5C8] rounded bg-[#FBFAF6] space-y-2">
                      <div className="font-serif font-bold text-sm text-[#090908]">Starter</div>
                      <div className="text-xl font-bold font-mono text-[#121210]">$199<span className="text-xs text-[#777268] font-normal">/mo</span></div>
                      <p className="text-[11px] text-[#777268]">Up to 5,000 orders/month. 1 warehouse provider.</p>
                    </div>
                    <div className="p-4 border border-[#B8892D] rounded bg-[#FBFAF6] space-y-2 relative shadow-xs">
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-[#B8892D] text-[#090908] px-1.5 py-0.5 rounded">
                        GROWTH
                      </span>
                      <div className="font-serif font-bold text-sm text-[#090908]">Professional</div>
                      <div className="text-xl font-bold font-mono text-[#121210]">$499<span className="text-xs text-[#777268] font-normal">/mo</span></div>
                      <p className="text-[11px] text-[#777268]">Up to 25,000 orders/month. Unlimited rate cards &amp; dispute packs.</p>
                    </div>
                    <div className="p-4 border border-[#DCD5C8] rounded bg-[#FBFAF6] space-y-2">
                      <div className="font-serif font-bold text-sm text-[#090908]">Enterprise</div>
                      <div className="text-xl font-bold font-mono text-[#121210]">$1,499+<span className="text-xs text-[#777268] font-normal">/mo</span></div>
                      <p className="text-[11px] text-[#777268]">Custom order volumes, multi-warehouse global splits, ERP connectors.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: OPERATOR RUN-BOOK (FOR TOMORROW'S PRESENTATION) */}
            {activeTab === "operator-guide" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="border-b border-[#DCD5C8] pb-4">
                  <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider font-semibold">
                    Presentation Run-Book
                  </span>
                  <h2 className="text-2xl font-serif font-black text-[#090908] tracking-tight mt-1">
                    Live Demo Script &amp; Step-by-Step Run-Book
                  </h2>
                  <p className="text-xs text-[#777268] mt-1">
                    Follow this exact sequence tomorrow to deliver a compelling 5-minute live SaaS demonstration.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#121210] text-[#E0BC68] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-sm font-serif font-bold text-[#090908]">
                        Open the Presentation &amp; Frame the Problem (Minute 1)
                      </h4>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Start on the homepage (<Link href="/" className="text-[#B8892D] underline">3pl-invoice-auditor.vercel.app</Link>). State clearly:
                      </p>
                      <blockquote className="p-3 bg-[#FBFAF6] border-l-2 border-[#B8892D] text-xs italic text-[#121210]">
                        &ldquo;Companies like RDX Sports spend millions on third-party logistics. Across the industry, 3% to 8% of all fulfillment bills contain contractual discrepancies—duplicate order charges, weight bracket creep, and uncontracted surcharges. Today, we audit these manually. Mett Global automates this with 100% mathematical precision.&rdquo;
                      </blockquote>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#121210] text-[#E0BC68] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-sm font-serif font-bold text-[#090908]">
                        Show Rate Cards &amp; Complex Tiering (Minute 2)
                      </h4>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Sign in as <code className="bg-[#F3F0E8] px-1 py-0.5 rounded font-mono text-[11px]">mettglobalinc@gmail.com</code> (or use 1-click Google Sign In).
                        Navigate to <strong>3PL Providers &amp; Rates</strong>. Click into <strong>Apex Global Logistics</strong> or <strong>RDX Sports Contract</strong>.
                        Point out:
                      </p>
                      <ul className="text-xs text-[#777268] list-disc pl-5 space-y-1">
                        <li>Tiered weight breaks (0-16 oz, 1-2 lbs, 2-5 kg).</li>
                        <li>Multi-carrier splits (Royal Mail, DPD, FedEx, UPS).</li>
                        <li>Custom field rules configured without code.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#121210] text-[#E0BC68] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-sm font-serif font-bold text-[#090908]">
                        Trigger the Live Audit Ingestion (Minute 3)
                      </h4>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Click <strong>Upload &amp; Audit CSV</strong> in the sidebar. Click the gold button:{" "}
                        <strong className="text-[#090908] bg-[#E0BC68]/40 px-1 py-0.5 rounded font-mono text-[11px]">
                          ⚡ Load Enterprise Tiered Dataset (RDX Sports)
                        </strong>.
                        Show the Column Mapping screen confirming automatic header recognition (Tracking #, Carrier, Weight, Billed Rate). Click <strong>Confirm &amp; Run Audit</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#121210] text-[#E0BC68] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-sm font-serif font-bold text-[#090908]">
                        Highlight Discrepancies &amp; Mathematical Proof (Minute 4)
                      </h4>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Show the Audit Results dashboard:
                      </p>
                      <ul className="text-xs text-[#777268] list-disc pl-5 space-y-1">
                        <li>Total Billed vs. Potential Discrepancies detected.</li>
                        <li>Click on any flag (e.g. Rate Exceeds Contract) to reveal the mathematical breakdown citing the exact contract rate vs billed rate.</li>
                        <li>Click <strong>Export PDF Report</strong> to show the executive summary.</li>
                        <li>Click <strong>Export CSV Claim Sheet</strong> to demonstrate how the brand sends the dispute back to the 3PL.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#121210] text-[#E0BC68] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      5
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-sm font-serif font-bold text-[#090908]">
                        Show Scaling Capabilities: Dev Mode &amp; Billing (Minute 5)
                      </h4>
                      <p className="text-xs text-[#777268] leading-relaxed">
                        Toggle the <strong>Dev Mode</strong> switch in the top bar to demonstrate the simulation sandbox.
                        Open <strong>Subscription &amp; Billing</strong> to show the Lemon Squeezy payment portal integration and commercial tier structure.
                        Conclude with:
                      </p>
                      <blockquote className="p-3 bg-[#121210] text-[#FBFAF6] rounded text-xs italic font-serif">
                        &ldquo;This is an official, scalable SaaS product ready for enterprise deployment today. It immediately pays for itself on the first audit, locks in recurring ARR, and gives brands total control over fulfillment expenditure.&rdquo;
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
