<div align="center">

# 🎫 EventFlow
### Modern AI-Powered Serverless Event Ticketing & Operations Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12_(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3-F05A28?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com/)

<p align="center">
  A production-grade, AI-accelerated event ticketing and operations ecosystem featuring high-concurrency booking, real-time analytics, instant digital QR passes, and automated promotional copywriting.
</p>

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │  ⚡ Turbocharged with Next.js 16 • React 19 • Neon Postgres • Groq AI │
  └────────────────────────────────────────────────────────────────────────┘
```

[✨ Key Features](#-key-features) •
[⚡ 60-Second Quickstart](#-60-second-quickstart) •
[🏗 Architecture](#-system-architecture) •
[📱 User & Admin Walkthrough](#-user--admin-experience) •
[🔑 Environment Setup](#-environment-variables) •
[🛠 API & Scripts](#-available-scripts) •
[❓ Troubleshooting](#-troubleshooting--faq)

</div>

---

## 🌟 Key Features

| Category | Capability | Highlight |
| :--- | :--- | :--- |
| **🎨 Design & Feel** | Neo-Brutalist Aesthetic | Custom Tailwind v4 tokens (`#ffe17c` Warm Yellow / Charcoal / Sage), Anton display typography, Lenis inertial smooth scroll & Framer Motion spring physics. |
| **🔐 Authentication** | Multi-Provider Clerk Auth | Fully branded custom `/auth/user/login` & `/auth/user/register` with Google/GitHub/Apple OAuth, passwordless magic links & Edge Proxy protection. |
| **🤖 Generative AI** | Groq Llama 3.3 Copywriting | 1-click marketing copy generator for event organizers that turns bullet points into viral descriptions and agenda teasers in milliseconds. |
| **⚡ Database & Concurrency** | Neon Serverless Postgres | Transactional seat reservation powered by Prisma v7 & `@prisma/adapter-pg` connection pooling to eliminate overselling during traffic spikes. |
| **💳 Payments & Passes** | Razorpay + Dynamic QR Passes | Cryptographic HMAC-verified payment verification, instant digital ticket delivery & scannable QR passes for on-site admission. |
| **☁️ Cloud Storage** | AWS S3 Presigned URLs | Direct browser-to-bucket banner uploads bypassing Next.js server payload bottlenecks. |

<br/>

<details>
<summary><b>🔍 Click to expand in-depth feature breakdown</b></summary>

### 1. Editorial Neo-Brutalist Design System
- Custom theme built with **TailwindCSS v4**, featuring an ultra-crisp palette (Charcoal, Warm Yellow `#ffe17c`, and Sage).
- Expressive typography combining **Anton** display titles with clean **Satoshi** body type.
- Smooth inertial scrolling powered by **Lenis** and physics-based fluid spring micro-interactions with **Framer Motion**.
- Full Dark / Light mode support with ambient reactive glowing backgrounds.

### 2. Enterprise Authentication & Role Security
- Multi-provider authentication managed through **Clerk**, customized with custom theme tokens.
- Optimized custom login (`/auth/user/login`) and registration (`/auth/user/register`) interfaces with instant social auth (Google, GitHub, Apple) and email magic links.
- Edge proxy routing ([src/proxy.ts](file:///d:/PROJECT/eventflow2/src/proxy.ts)) protecting administrative and dashboard paths with Role-Based Access Control (RBAC).

### 3. Groq-Powered AI Event Copywriter
- Integrated with **Groq Cloud API** running ultra-low latency **Llama 3.3** inference.
- Event organizers can generate high-converting, punchy promotional descriptions, agenda bullet points, and social teasers with a single click.

### 4. High-Performance Serverless Database Layer
- **Neon Serverless PostgreSQL** database backed by `@prisma/adapter-pg` connection pooling for non-blocking edge execution.
- Transactional seat capacity reservation preventing overselling or double-booking during peak traffic.
- Full administrative audit logging (`AdminLog`) capturing operational actions and timestamps.

### 5. Seamless Razorpay Payments & QR Verification
- Integrated with the **Razorpay Orders API** with HMAC-SHA256 signature verification.
- Instant digital ticket generation with cryptographic booking tokens.
- Dynamic SVG **QR Code passes** rendered for mobile check-in verification at event doors.

### 6. Zero-Bottleneck S3 Media Pipeline
- Direct browser-to-cloud uploads using **AWS S3 Presigned URLs**.
- Bypasses server memory limits and functions payload caps for lightning-fast high-res banner uploads.

</details>

---

## ⚡ 60-Second Quickstart

Get EventFlow running locally in 4 simple commands:

```bash
# 1. Clone the repository
git clone https://github.com/Harshal844600/EVENTFLOW.git
cd EVENTFLOW

# 2. Install dependencies
npm install

# 3. Copy environment configuration and configure your secrets
cp .env.example .env

# 4. Push database schema & start dev server
npx prisma db push
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to explore EventFlow live!

---

## 📱 User & Admin Experience

### 🎟️ Attendee Experience Flow
```
Browse Events (Bento Grid) ➔ Filter by Category ➔ View Details & Live Seats ➔
One-Click Login / Register ➔ Secure Razorpay Checkout ➔ Instant QR Ticket on Dashboard
```

1. **Browse & Discover**: Explore curated events displayed in an editorial Bento Grid with live badge tags (Upcoming, Filling Fast, Sold Out).
2. **Instant Sign-In**: Experience high-speed Clerk authentication with Google, GitHub, or Email.
3. **Smooth Checkout**: Reserve tickets securely with Razorpay test or live payment gateways.
4. **Digital QR Pass**: Access tickets anytime from the user dashboard ([/dashboard](file:///d:/PROJECT/eventflow2/src/app/dashboard/page.tsx)) ready for door check-in.

---

### 🛡️ Admin & Organizer Workflow
```
Access Admin Panel (/admin) ➔ Create Event ➔ AI Enhance Description ➔
Direct AWS S3 Image Upload ➔ Monitor Real-Time Revenue & Ticket Analytics
```

1. **Event Builder**: Specify venue, date, capacity, and ticket pricing.
2. **Llama 3.3 Copywriting**: Click **"Enhance with AI"** to generate viral marketing copy automatically.
3. **Direct Cloud Storage**: Drag-and-drop event banners directly to AWS S3 without server buffering.
4. **Analytics & Audit**: Track revenue charts, attendee check-in logs, and system operations in real time.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    Client([User Browser])
    
    subgraph Frontend["Next.js 16 (App Router + Turbopack)"]
        PublicPages["Bento Grid Landing & Events (/events)"]
        AuthPages["Clerk Auth UI (/auth/user/*)"]
        Dashboard["User Dashboard (/dashboard)"]
        AdminUI["Admin Control Panel (/admin)"]
        EdgeProxy["Edge Security Proxy (proxy.ts)"]
    end

    subgraph ExternalServices["External Cloud & AI Services"]
        ClerkAuth["Clerk Identity Provider"]
        Groq["Groq Cloud (Llama 3.3 Copywriting)"]
        AWSS3["AWS S3 (Presigned Asset Storage)"]
        Razorpay["Razorpay Payment Gateway"]
    end

    subgraph DataTier["Data & Persistence Tier"]
        PrismaORM["Prisma v7 ORM (@prisma/adapter-pg)"]
        NeonDB[("Neon Serverless PostgreSQL")]
    end

    Client -->|Browse & Search| PublicPages
    Client -->|Authenticate| AuthPages
    AuthPages <-->|Auth Tokens| ClerkAuth
    PublicPages -->|Book Event| Razorpay
    Razorpay -->|Webhook / Verify| PublicPages
    
    AdminUI -->|Generate Copy| Groq
    AdminUI -->|Upload Banner| AWSS3
    
    EdgeProxy -.->|Guards Protected Routes| AdminUI
    EdgeProxy -.->|Guards Protected Routes| Dashboard
    
    PublicPages & AdminUI & Dashboard --> PrismaORM
    PrismaORM <-->|Pooled Queries| NeonDB
```

---

## 📂 Project Structure

```
eventflow2/
├── prisma/
│   ├── schema.prisma            # Database schema models (User, Event, Booking, Ticket, AdminLog)
│   └── migrations/              # PostgreSQL migration history
├── public/                      # Static brand assets and SVGs
├── scripts/
│   ├── seed-admin.ts            # Admin seeding automation script
│   └── seed-dummy-data.ts       # Sample events and bookings seeder
├── src/
│   ├── app/
│   │   ├── (public)/            # Public routes: Bento Grid hero, /events, /events/[id], /about
│   │   ├── admin/               # Admin panel: Metrics, event manager, audit logs
│   │   ├── api/                 # Serverless endpoints (webhooks, S3 presigned URLs, AI copy)
│   │   ├── auth/                # Optimized Clerk login & registration routes
│   │   ├── dashboard/           # User ticket repository & QR pass viewer
│   │   ├── globals.css          # Design system, CSS variables, Anton & Satoshi webfonts
│   │   ├── layout.tsx           # Global RootLayout with ClerkProvider, ThemeProvider, Toaster
│   │   └── template.tsx         # Route transition animations
│   ├── components/              # UI Component Library (Navbar, BentoGrid, AmbientBackground, etc.)
│   ├── lib/                     # Singletons (prisma.ts, s3.ts, groq.ts, razorpay.ts)
│   └── proxy.ts                 # Next.js edge security proxy & route protection
├── .env.example                 # Comprehensive environment variable template
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependency manifest
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 🔑 Environment Variables

The project uses [.env.example](file:///d:/PROJECT/eventflow2/.env.example) to ensure easy, error-free onboarding:

| Variable | Description | Source |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Serverless PostgreSQL connection string | [Neon Console](https://console.neon.tech/) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable API Key | [Clerk Dashboard](https://dashboard.clerk.com/) |
| `CLERK_SECRET_KEY` | Clerk Secret API Key | [Clerk Dashboard](https://dashboard.clerk.com/) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Default Sign In Path (`/auth/user/login`) | Local Route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Default Sign Up Path (`/auth/user/register`) | Local Route |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (Test or Live) | [Razorpay Dashboard](https://dashboard.razorpay.com/) |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key | [Razorpay Dashboard](https://dashboard.razorpay.com/) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Signing Secret | [Razorpay Dashboard](https://dashboard.razorpay.com/) |
| `AWS_ACCESS_KEY_ID` | AWS IAM User Key ID with S3 PutObject permission | [AWS IAM Console](https://console.aws.amazon.com/) |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key | [AWS IAM Console](https://console.aws.amazon.com/) |
| `AWS_REGION` | AWS Region where S3 bucket resides (e.g., `us-east-1`) | AWS Console |
| `S3_BUCKET_NAME` | Name of your AWS S3 bucket for event banners | AWS S3 Console |
| `GROQ_API_KEY` | Groq Cloud API key for Llama 3.3 copywriting | [Groq Console](https://console.groq.com/) |

---

## 🛠 Available Scripts

```bash
# Start Turbopack dev server on http://localhost:3000
npm run dev

# Run TypeScript compilation check
npx tsc --noEmit

# Seed the admin user into Neon database
npm run seed

# Open interactive Prisma Database Studio
npx prisma studio

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>1. Clerk auth routes return 404</b></summary>
Ensure that your `.env` contains:
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/user/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/user/register"
```
and that your route files use `routing="path"` and `path="/auth/user/login"`.
</details>

<details>
<summary><b>2. Neon Postgres SSL connection warnings</b></summary>
Make sure your connection string specifies `sslmode=require` or `sslmode=verify-full` as required by Neon's pooled serverless endpoints.
</details>

<details>
<summary><b>3. Razorpay payments in local test mode</b></summary>
Use your Razorpay Test Key ID (`rzp_test_...`) and Secret. Razorpay test payments allow instant simulation without actual monetary charges.
</details>

<details>
<summary><b>4. S3 image upload errors (CORS)</b></summary>
Ensure your AWS S3 bucket has the following CORS configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```
</details>

---

## 🛡 Security & Best Practices

- 🔒 **Zero Secret Leakage:** All sensitive credentials, tokens, and webhook secrets are strictly server-side and excluded via [.gitignore](file:///.gitignore).
- ☁️ **Direct S3 Uploads:** Files are never routed through Next.js server memory, preventing memory starvation and Denial-of-Service.
- 💳 **Payment Verification:** Every payment requires cryptographic HMAC verification against the payment order ID before tickets are minted.
- 🧩 **End-to-End Type Safety:** Strict TypeScript interfaces from Prisma database models through to React 19 UI components.

---

## 👨‍💻 Author

**Harshal Vidhate**
- 🐙 GitHub: [@Harshal844600](https://github.com/Harshal844600)
- 📦 Repository: [EVENTFLOW](https://github.com/Harshal844600/EVENTFLOW)

---

<div align="center">

[⬆ Back to Top](#-eventflow)

Released under the [MIT License](LICENSE).

</div>
