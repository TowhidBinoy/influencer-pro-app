# Influencer Pro & PostDesk — Creator Campaign & Content Management Suite

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-8B31FF?style=for-the-badge&logo=vercel&logoColor=white)](https://imp-frontend-nu.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_15-App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-Frontend-00D2FF?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Dark_Neon_UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A full-featured, responsive web application and administrative CMS engineered to streamline **Influencer & KOC (Key Opinion Consumer) marketing campaigns**, automated video reframing workflows, custom frame overlays, and real-time proof-of-work verification.

🔗 **Explore Live Demo:** **[https://imp-frontend-nu.vercel.app/](https://imp-frontend-nu.vercel.app/)**

---

## 🔑 Instant Demo Access (No Backend Required)

This repository includes an intelligent **Portfolio Demo Mode** (`lib/api.js`) that intercepts network requests and serves realistic mock data, allowing clients and hiring managers to explore all protected dashboards without setting up a local server.

1. Visit **[https://imp-frontend-nu.vercel.app/login](https://imp-frontend-nu.vercel.app/login)**
2. The demo credentials are **pre-filled** for convenience—simply click **LOG IN TO DEMO**:
   - **Username:** `admin`
   - **Password:** `admin123`

---

## 🎯 Project Overview: Why This Exists

### The Problem
Agencies managing dozens or hundreds of micro-influencers (KOCs) across TikTok, Instagram Reels, and Facebook face severe operational bottlenecks:
- **Fragmented Tracking:** Managing daily posting tasks, proof links, and payout approvals manually via spreadsheets leads to missed deadlines and human error.
- **Inconsistent Branding:** Creators struggle to apply standardized brand borders, overlays, and 9:16 vertical aspect ratios consistently across social platforms.
- **Lack of Real-Time Visibility:** Campaign managers lack a unified dashboard to monitor active video queues, pending reviews, and creator earnings in real time.

### The Solution
**Influencer Pro & PostDesk** unifies creator workflows and agency administration into a single platform:
- **For Creators / KOCs:** A mobile-first portal to view daily assigned tasks, apply brand frame overlays directly in the browser, submit published reel links, and track wallet earnings.
- **For Agencies / Admins:** A comprehensive command center (`PostDesk` & `Admin CMS`) to manage KOC accounts, assign custom frame templates, monitor video reframing queues, audit system activity, and approve payouts.

---

## ✨ Core Features & Modules

### 1. PostDesk Creator & Admin Suite (`/postdesk`)
- **KOC & Admin Dashboards:** Real-time KPI cards tracking active KOCs, processed videos, pending reviews, and monthly published reels.
- **Frame Management:** Create, preview, and assign custom PNG alpha overlays and background templates to specific user groups or individual creators.
- **Video Reframing & Submissions:** Monitor active render queues, apply 9:16 vertical framing, and review source vs. published reel URLs.
- **User & Role Management:** Granular role assignment (`KOL` vs. `KOC`) with module-level access toggles and account status controls.
- **Security Audit Logs:** Timestamped tracking of user actions, video approvals, and IP logs.

### 2. Mobile-First Influencer Portal (`/dashboard`)
- **Daily Mission Tracker:** Interactive job selector showing daily content requirements, platform targets, and submission deadlines.
- **In-Browser Frame Editor (`/more/frame-editor`):** HTML5 Canvas-powered tool allowing creators to composite video content with brand frames before downloading.
- **Proof Submission & History (`/submit-proof`, `/campaign`):** One-click proof link submission with status tracking (`Pending`, `Submitted`, `Approved`, `Rejected`, `Missed`).
- **Earnings, Wallet & Leaderboard (`/earnings`, `/leaderboard`):** Transparent payout tracking, bank detail management, and performance rankings.

---

## 🛠️ Tech Stack & Architecture

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | File-based routing, nested layouts, and fast client-side navigation |
| **UI Library** | **React 19** | Component-driven state management and interactive UI hooks |
| **Styling** | **Tailwind CSS** | Custom Dark-Neon design system (`#080512`, `#120D22`, `#8B31FF`) |
| **Graphics** | **HTML5 Canvas API** | Real-time client-side frame overlay preview and rendering |
| **API Layer** | **Custom Fetch Wrapper** | RESTful Bearer token integration with automatic demo-mode fallback |
| **Deployment** | **Vercel** | Continuous deployment and global edge hosting |

---

## 🗺️ Key Application Routes

| Route | Module | Description |
| :--- | :--- | :--- |
| `/login` | Authentication | Pre-filled demo login portal granting full Member & Admin access |
| `/dashboard` | Creator Portal | Daily tasks, job switcher, campaign highlights, and quick proof submission |
| `/postdesk` | PostDesk Suite | Unified workspace for KOC metrics, assigned frames, and video activity |
| `/admin` | Admin CMS | Platform-wide KPIs, influencer directory, submission approvals, and payouts |
| `/more/frame-editor` | Media Tool | Interactive frame overlay composition tool |
| `/earnings` | Finance | Creator wallet balance, payout history, and bank account settings |

---

## 📂 Project Structure

```text
├── app/
│   ├── admin/             # Admin CMS routes (influencers, submissions, payouts)
│   ├── components/        # Reusable UI widgets (BottomNav, BannerCarousel, Modals)
│   ├── dashboard/         # Member-facing daily task dashboard
│   ├── login/             # Pre-filled demo authentication page
│   ├── more/              # Job board, frame editor, profile, and bank settings
│   └── postdesk/          # PostDesk workspace layout and dashboard screens
├── lib/
│   ├── api.js             # Central fetch client with Portfolio Demo Mode interceptor
│   ├── choices.js         # Platform, content type, and status enum mappings
│   └── endpoints.js       # Structured REST API endpoint definitions
└── public/                # Static assets and brand icons