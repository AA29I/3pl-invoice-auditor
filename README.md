# 3PL Invoice Auditor (SaaS Application)

A production-ready, full-stack SaaS application for e-commerce and direct-to-consumer (DTC) brands (e.g. sporting goods, fashion, electronics) to systematically audit warehouse fulfillment invoices against contracted rate cards.

Designed with **Mett Global's restrained editorial design system**, deterministic mathematical precision (exact integer cents, zero floating-point drift), and enterprise-grade multi-carrier tiered weight calculations.

![Mett Global Design System](https://img.shields.io/badge/Palette-Mett_Global_Editorial-B8892D)
![Next.js 14](https://img.shields.io/badge/Framework-Next.js_14_App_Router-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript_Strict-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL_•_SQLite_Local-navy)
![Billing](https://img.shields.io/badge/Billing-Lemon_Squeezy_Merchant_of_Record-yellow)

---

## 🌟 Key Capabilities

### 1. Deterministic Audit Rules Engine
- **Contract Rate Exceeded**: Compares billed unit rates and total charges against contracted rate cards for exact service dates.
- **Tiered Weight & Carrier Schedule Matcher**: Supports complex weight brackets in **ounces (oz), pounds (lbs), kilograms (kg), and grams (g)**, matching specific shippers (Royal Mail, DPD, FedEx, USPS, DHL, UPS) and calculating base tier rates plus incremental overage charges (e.g., +$0.85/kg over 30 kg).
- **Duplicate Charge Detection**: Detects repeated line items, order references, tracking numbers, or WMS duplicate batches.
- **Uncontracted Fee Category**: Identifies rogue warehouse surcharges, unscheduled peak fees, and unlisted accessorial charges absent from the agreement.
- **Month-over-Month Anomalous Surge**: Flags rate spikes (> 25%) compared against trailing historical invoice averages.

### 2. Developer / Sandbox Mode
- **Interactive Global Toggle**: Switch between Live Production and Developer Mode in the TopNav or Workspace Settings.
- **Zero Limit Restrictions**: Subscription row limits (Free tier 50-row ceiling) are bypassed during developer mode so logistics and accounting teams can stress-test high-volume datasets.
- **1-Click RDX Sports Enterprise Test Ingestion**: Ingests realistic multi-carrier parcel and freight CSVs with tiered weights and custom parameters with a single click.
- **Audit Trace Badging**: Invoices audited in dev mode are tagged with `[DEV]` and `[Dev Sandbox Audit]` badges for traceability.

### 3. Unlimited Custom Fields & Metadata
- **Rate Cards**: Add arbitrary custom SLA metadata (e.g., `Account_Number`, `DIM_Divisor`, `Facility_Code`, `Contract_Clause_ID`).
- **CSV Ingestion**: Dynamic Column Mapper allows adding unlimited custom column keys (`SKU`, `PO Number`, `Dimensions`, `Bin ID`) and previewing them before persistence.
- **Dispute Exports**: Custom fields and carrier weight parameters are cleanly formatted in dispute CSV downloads and audit triage modals.

### 4. Exact Minor Unit (Cents) Financial Accounting
- All currency operations and database storage use **integer minor units** (e.g., 285 cents = $2.85). Zero JavaScript floating-point errors (`0.1 + 0.2 !== 0.3`).

### 5. Multi-Channel Dispute Claims
- **Dispute CSV Generator**: Formatted export with line references, rules triggered, contracted rates, and calculation breakdowns.
- **Formatted PDF Dispute Claim Sheets**: Generates professional PDF claims (using `jspdf` and `jspdf-autotable`) ready to submit to 3PL warehouse finance teams.

### 6. Mett Global Editorial UI/UX
- Authentic observed color palette:
  - `#090908` Near Black
  - `#121210` Ink
  - `#FBFAF6` Warm Paper
  - `#F3F0E8` Cream
  - `#B8892D` Primary Gold
  - `#E0BC68` Light Gold
  - `#777268` Muted Text
  - `#DCD5C8` Hairline Borders
- Restrained editorial layout: Serif titles (`font-serif`), monospace metadata and numbers (`font-mono`), tabular figures (`tabular-nums`).
- No fake awards, customer logos, or inflated percentage-of-savings claims.

### 7. Commercial Lemon Squeezy Subscription Engine
- Architected behind an `IBillingProvider` abstraction.
- HMAC-SHA256 signature verification on incoming webhooks with idempotent database tracking (`WebhookEvent`).
- Free Tier (1 sample audit / 50 rows) vs Pro Tier ($49/month: unlimited audits, 50k rows, PDF export).
- Built-in authentic test-mode sandbox for testing payment flows locally.

---

## 📁 Codebase Directory Structure

```text
3pl-invoice-auditor/
├── prisma/
│   ├── schema.prisma              # SQLite default schema for zero-dependency local dev
│   ├── schema.postgresql.prisma   # PostgreSQL schema for production container deployment
│   └── seed.ts                    # Realistic demo seed (ShipBob, RDX Sports, sample invoices)
├── public/
│   ├── sample-3pl-invoice.csv     # Standard downloadable CSV
│   └── robots.txt                 # Search engine directives (blocks private dashboard)
├── src/
│   ├── app/
│   │   ├── (auth)/                # Login, Register, Reset Password
│   │   ├── (marketing)/           # Public SEO marketing, Pricing, FAQ, Calculator, Guides
│   │   ├── (dashboard)/           # Private workspace dashboard (DashboardShell, TopNav, Sidebar)
│   │   └── api/                   # Audits, Providers, Auth, Workspace, Billing, Webhooks, Exports
│   ├── components/
│   │   ├── audit/                 # ColumnMapper, FlagDetailModal, FlagBadge
│   │   ├── layout/                # DashboardShell, Sidebar, TopNav
│   │   ├── marketing/             # MarketingHeader, MarketingHeaderClient, Footer, Calculator
│   │   └── ui/                    # Button, Input, Select, Card, Badge
│   ├── lib/
│   │   ├── audit/                 # Deterministic engine, Normalizer, Rules
│   │   ├── auth/                  # JWT Sessions, Password Hashing
│   │   ├── billing/               # Lemon Squeezy provider & server limit assertion
│   │   ├── db/                    # Prisma Singleton
│   │   ├── export/                # CSV & PDF Dispute Claim generators
│   │   ├── money/                 # Integer cents formatting
│   │   └── seo/                   # JSON-LD Structured Data
│   └── types/                     # Audit, Billing, and Provider TypeScript definitions
├── docker-compose.yml             # Local PostgreSQL 16 container setup
└── Dockerfile                     # Production multi-stage Docker container
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 / 22 / 24)
- npm or pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Local Database & Seed Data
By default, the application runs on SQLite (`dev.db`), requiring **no external database server**:
```bash
npx prisma db push
npm run seed
```

This will automatically create:
- **Demo User**: `demo@apexapparel.com`
- **Password**: `Password123!`
- **Demo Workspace**: `Apex Apparel Co.` (Pro plan active)
- **Demo Providers**:
  - `ShipBob Fulfillment Center` (Standard fulfillment schedule)
  - `RDX Sports Global Logistics` (Multi-carrier tiered parcel and freight agreement)
- **Sample Audit**: `INV-2026-08-DEMO` ($785.40 billed, $179.35 potential discrepancies, 6 flagged lines)

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing the Application (Smoke Test Suite)

Run the automated end-to-end smoke test script to verify all public pages, authenticated routes, APIs, CSV export, and PDF generation:
```bash
npx tsx scripts/smoke-test.ts
```

---

## 🐳 Deployment (PostgreSQL & Docker)

### Option A: Deploying with Docker Compose
```bash
docker-compose up --build -d
```
Runs a production Next.js container linked with PostgreSQL 16 on port 3000.

### Option B: Deploying to Vercel / Railway / Render
1. Set the environment variable:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   JWT_SECRET="generate-a-random-32-character-secret"
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   ```
2. Build command:
   ```bash
   npx prisma generate --schema=prisma/schema.postgresql.prisma && next build
   ```

---

## 💳 Lemon Squeezy Configuration

1. Set your credentials in `.env`:
   ```env
   LEMON_SQUEEZY_API_KEY="your_api_key"
   LEMON_SQUEEZY_STORE_ID="your_store_id"
   LEMON_SQUEEZY_WEBHOOK_SECRET="your_webhook_signing_secret"
   LEMON_SQUEEZY_PRO_VARIANT_ID="your_pro_variant_id"
   ```
2. Set webhook URL in the Lemon Squeezy dashboard:
   `https://yourdomain.com/api/webhooks/lemon-squeezy`
   - Select events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`, `subscription_expired`.

---

## 🔒 Security & Privacy Notice

- **Workspace Data Isolation**: All database queries are filtered by `workspaceId`.
- **Permanent Self-Service Data Deletion**: Users can purge all invoices and rate cards in Workspace Settings.
- **Strict Auditing Boundary**: Unconfirmed discrepancies are labeled as **"Potential Discrepancies"**, never "recovered savings". Physical labor is not claimed to be audited without warehouse operational telemetry.
