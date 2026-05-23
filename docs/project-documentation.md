# AI CareerOS — Complete Project Documentation

## Overview

AI CareerOS is a full-stack web application that helps professionals manage their career progression. It features an AI-powered resume builder, career coaching chatbot, and skill gap analysis tool.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Router v7 (frontend)  
**Stack:** Node.js + Express 5 + TypeScript + Mongoose + MongoDB Atlas (backend)  
**Deployment:** Vercel (frontend + API serverless functions)

---

## Project Structure

```
ai-careeros/
├── api/                          # Vercel serverless function entry point
│   └── index.ts                  # Imports Express app from backend/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts     # MongoDB connection (Vercel-cached singleton)
│   │   │   ├── models.ts         # Mongoose models (User, Resume, Conversation, Message, Skill, ActivityLog)
│   │   │   └── seed.ts           # Standalone seed script (run via `npm run seed`)
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT verification middleware + token generation
│   │   ├── routes/
│   │   │   ├── auth.ts           # POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me
│   │   │   ├── dashboard.ts      # GET /api/dashboard/stats
│   │   │   ├── resumes.ts        # CRUD /api/resumes
│   │   │   ├── chat.ts           # GET /api/chat/conversations, GET/POST messages
│   │   │   ├── skills.ts         # GET /api/skills, POST /api/skills/analyze
│   │   │   └── seed.ts           # POST /api/seed (one-click database seeding)
│   │   └── index.ts              # Express app setup, exports app for Vercel, listens for local dev
│   ├── .env                      # Local env vars (PORT, JWT_SECRET, MONGODB_URI)
│   ├── package.json
│   └── tsconfig.json
├── landing-page/
│   ├── src/
│   │   ├── components/           # Shared UI components (Navbar, Hero, Features, Pricing, etc.)
│   │   ├── pages/                # Route pages (Login, Signup, Dashboard, ResumeBuilder, etc.)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx    # Auth state management (login, signup, logout, token lifecycle)
│   │   ├── lib/
│   │   │   └── api.ts            # Typed API client with auto JWT token attachment
│   │   └── main.tsx              # App entry point
│   ├── vercel.json               # SPA rewrites for client-side routing
│   └── package.json
├── public/
│   └── index.html                # Vercel static output placeholder
├── vercel.json                   # API project config (serverless functions, rewrites)
├── package.json                  # Root package.json (production deps + dev scripts)
├── .gitignore
└── docs/
    └── project-documentation.md  # This file
```

---

## Phase 1: Initial Project Setup (Scaffolding)

### Decision: Why This Stack?

- **React 18 + TypeScript** — Type-safe, modern, widely supported
- **Vite** — Fast dev server, native ESM, HMR
- **Tailwind CSS** — Utility-first, rapid UI development, responsive
- **Framer Motion** — Declarative animations, scroll-reveal effects
- **React Router v7** — Latest version, nested routes, data loading patterns
- **Lucide React** — Lightweight, consistent icon set
- **Express 5** — Latest Express with improved async error handling
- **MongoDB + Mongoose** — Serverless-friendly, works with Vercel
- **JWT + bcryptjs** — Stateless auth, pure JS (no native deps)

### Files Created

- `landing-page/package.json` — Vite + React dependencies
- `landing-page/tsconfig.json` — TypeScript strict, path aliases
- `landing-page/vite.config.ts` — Vite config with Tailwind + React plugin
- `landing-page/tailwind.config.js` — Tailwind with custom content paths
- `landing-page/postcss.config.js` — PostCSS with Tailwind + autoprefixer
- `landing-page/index.html` — HTML entry with meta tags, fonts, favicon
- `landing-page/vercel.json` — Vite framework config + SPA rewrites
- `landing-page/.env` — VITE_API_URL default (/api)
- `landing-page/src/main.tsx` — App entry with BrowserRouter + AuthProvider
- `landing-page/src/App.tsx` — Route definitions (landing, auth, app)
- `landing-page/src/index.css` — Tailwind directives + Inter font imports
- `landing-page/src/vite-env.d.ts` — Vite client type declarations
- `backend/package.json` — Express + Mongoose dependencies
- `backend/tsconfig.json` — TypeScript strict, CommonJS output
- `backend/.env` — PORT, JWT_SECRET, MONGODB_URI placeholders
- `backend/src/index.ts` — Express app (CORS, routes, health check)
- `backend/src/middleware/auth.ts` — JWT middleware + token generation
- `backend/src/db/connection.ts` — MongoDB singleton with Vercel caching
- `backend/src/db/models.ts` — Mongoose models (User, Resume, Conversation, Message, Skill, ActivityLog)
- `backend/src/db/seed.ts` — Seed script with test data
- `backend/src/routes/auth.ts` — Signup, login, me endpoints
- `backend/src/routes/dashboard.ts` — Dashboard stats + activity
- `backend/src/routes/resumes.ts` — Resume CRUD
- `backend/src/routes/chat.ts` — Conversations + messages + AI replies
- `backend/src/routes/skills.ts` — Skills list + gap analysis
- `backend/src/routes/seed.ts` — One-click seed endpoint for production
- `api/index.ts` — Vercel serverless function wrapper
- `public/index.html` — Minimal static output for Vercel
- `package.json` (root) — Shared production deps + dev scripts
- `vercel.json` (root) — API project config
- `.gitignore` — Node, dist, .env exclusions
- `docs/project-documentation.md` — This document

---

## Phase 2: Frontend Development

### Landing Page (`/`)

Built with Framer Motion scroll-reveal animations:

- **Navbar** — Logo + nav links + Sign In link
- **Hero** — Headline, subtitle, CTA buttons (Get Started, View Features)
- **Features** — 6 cards with icons (AI Resume Builder, Career Coach, Skill Analysis, Tailored Matches, Smart Insights, Interview Prep)
- **Pricing** — 3 tiers (Free, Pro, Enterprise) with feature lists
- **Testimonials** — 3 cards with avatar, quote, name, title
- **CTA** — Call-to-action section
- **Footer** — Links, copyright

### App Pages (under `/app/*`)

All wrapped in `ProtectedRoute` + `AppLayout` (sidebar + header):

- **Dashboard** (`/app/dashboard`) — Live stats cards + recent activity list + quick action buttons
- **Resume Builder** (`/app/resumes`) — Sidebar list + CRUD via API + expand/collapse detail
- **Career Coach** (`/app/coach`) — Conversation sidebar + real-time chat with simulated AI replies
- **Skill Gap Analysis** (`/app/skills`) — Target role buttons → API analyze → gap list

### Auth Pages

- **Login** (`/login`) — Email + password form
- **Signup** (`/signup`) — Name + email + password form

### Key Frontend Files

- `landing-page/src/contexts/AuthContext.tsx` — Auth state management with localStorage token persistence, auto `/auth/me` verification on load
- `landing-page/src/lib/api.ts` — Typed fetch wrapper with auto Bearer token attachment
- `landing-page/src/components/ProtectedRoute.tsx` — Route guard, redirects to `/login` if unauthenticated
- `landing-page/src/components/AppLayout.tsx` — Sidebar + header + Outlet layout
- `landing-page/src/components/Sidebar.tsx` — Nav links + user info + sign out

### Data Flow

```
UI Component → api.ts (fetch + token) → Vercel Serverless → Express Routes → Mongoose → MongoDB Atlas
```

---

## Phase 3: Backend Development

### Architecture

- Express 5 app exported as Vercel serverless function (`api/index.ts`)
- All routes prefixed with `/api`
- JWT auth middleware on protected routes (all except `/api/auth/*` and `/api/health` and `/api/seed`)
- MongoDB connection cached in `globalThis` for Vercel cold start optimization

### API Endpoints

| Method | Route                         | Auth | Purpose                              |
| ------ | ----------------------------- | ---- | ------------------------------------ |
| GET    | `/api/health`                 | No   | Health check                         |
| POST   | `/api/seed`                   | No   | One-click database seeding           |
| POST   | `/api/auth/signup`            | No   | Create account                       |
| POST   | `/api/auth/login`             | No   | Login, returns JWT                   |
| GET    | `/api/auth/me`                | Yes  | Verify token, get user               |
| GET    | `/api/dashboard/stats`        | Yes  | Stats + recent activity              |
| GET    | `/api/resumes`                | Yes  | List all resumes                     |
| GET    | `/api/resumes/:id`            | Yes  | Get single resume                    |
| POST   | `/api/resumes`                | Yes  | Create resume                        |
| PUT    | `/api/resumes/:id`            | Yes  | Update resume                        |
| DELETE | `/api/resumes/:id`            | Yes  | Delete resume                        |
| GET    | `/api/chat/conversations`     | Yes  | List conversations with last message |
| GET    | `/api/chat/conversations/:id` | Yes  | Get messages for conversation        |
| POST   | `/api/chat/messages`          | Yes  | Send message + get AI reply          |
| GET    | `/api/skills`                 | Yes  | List all skills                      |
| POST   | `/api/skills/analyze`         | Yes  | Analyze skills against target role   |

### Auth Flow

```
Login → POST /api/auth/login → { token, user }
Token stored in localStorage
Every API call → Authorization: Bearer <token>
JWT contains { userId, name }, expires 7 days
```

### MongoDB Models

- **User** — name, email (unique), passwordHash, createdAt
- **Resume** — title, target, score, versions, content, updatedAt, createdAt
- **Conversation** — title, updatedAt, createdAt
- **Message** — conversationId (ref), role (user|assistant), text, time
- **Skill** — name (unique), level
- **ActivityLog** — action, detail, time

---

## Phase 4: Database Migration (SQLite → MongoDB)

### Why the Migration?

- Initially used `sql.js` (WASM-based SQLite) for simplicity
- Vercel serverless functions have ephemeral filesystems — SQLite file writes are lost between invocations
- MongoDB Atlas (serverless-compatible) works natively with Vercel

### What Changed

- `backend/src/db/schema.ts` → deleted (was sql.js init + schema creation)
- `backend/src/db/connection.ts` → new (MongoDB singleton with Vercel caching pattern)
- `backend/src/db/models.ts` → new (Mongoose schemas for all collections)
- All routes: `getDb()` / `saveDb()` → `connectDb()` + Mongoose queries
- `backend/package.json`: removed `sql.js` + `@types/sql.js`, added `mongoose`
- `backend/.env`: added `MONGODB_URI`

---

## Phase 5: Vercel Deployment

### Two Vercel Projects

1. **Frontend** (`ai-careeros`) — deployed from `landing-page/` directory
   - URL: `https://ai-careeros.vercel.app`
   - Env: `VITE_API_URL` = API project URL + `/api`
2. **API** (`ai-careeros-api`) — deployed from repository root
   - URL: `https://ai-careeros-api-lake.vercel.app`
   - Env: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`

### Deployment Issues & Fixes

1. **Build command failed** — Root `package.json` build script tried to build frontend (TypeScript not available). Fixed by setting `"buildCommand": "echo 'built by @vercel/node'"` in root `vercel.json` (Vercel's `@vercel/node` runtime auto-compiles TypeScript serverless functions via esbuild).

2. **"No Output Directory named public"** — Vercel requires an output directory. Fixed by adding a `public/index.html` file (serves as static output placeholder; all requests are rewritten to the API function anyway).

3. **TypeScript errors** — `process` not found, `global` not found, Express `headers` type issues. Fixed by adding `@types/node` to root `devDependencies`, using `globalThis` instead of `global`, and casting `req` for headers access.

4. **"Failed to fetch" on login** — CORS origin mismatch (trailing slash in `CORS_ORIGIN` env var). Fixed by normalizing CORS origins (strip trailing slashes).

5. **404 on API calls** — `VITE_API_URL` missing `/api` suffix on frontend project. Fixed by correcting the env var value.

### Key Configuration Files

- `landing-page/vercel.json` — Framework: Vite, SPA rewrites
- `vercel.json` (root) — Serverless function config, rewrites to API, no-op build

---

## Phase 6: Git & GitHub

### Repository

- **URL:** `https://github.com/MOSTAFA17RASHEEDY/ai-careeros`
- **Branch:** `main`
- **First commit:** Initial scaffolding
- **Final commit:** Fix TypeScript errors + CORS normalization

### Key Commits

```
c54dfe0 — fix: add public/ dir so Vercel has output to deploy
4b00bf0 — fix: move API deps to root package.json for Vercel
42f78d1 — fix: override root build command in vercel.json
28b0eba — add /api/seed endpoint for one-click DB seeding
a08f452 — migrate from sql.js to MongoDB/Mongoose + Vercel restructure
```

---

## How to Run Locally

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# Clone
git clone https://github.com/MOSTAFA17RASHEEDY/ai-careeros.git
cd ai-careeros

# Install deps
npm install
cd backend && npm install && cd ..
cd landing-page && npm install && cd ..

# Set up env
# Edit backend/.env — update MONGODB_URI if needed

# Seed database
npm run seed

# Run in dev mode
npm run dev
# Frontend: http://localhost:5173
# API: http://localhost:3001
```

---

## How to Deploy

### Frontend (Vercel)

1. New project → Import `ai-careeros` repo
2. Root directory: `landing-page/`
3. Framework: Vite (auto-detected)
4. Add env: `VITE_API_URL` = API project URL + `/api`
5. Deploy

### API (Vercel)

1. New project → Import `ai-careeros` repo
2. Root directory: `.` (default)
3. Framework: Other
4. Env vars:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — Random secret
   - `CORS_ORIGIN` — Frontend URL
5. Deploy
6. Run: `curl -X POST https://your-api-url.vercel.app/api/seed`

---

## Current Status

- [x] Landing page with animations
- [x] App pages (Dashboard, Resumes, Career Coach, Skill Gap)
- [x] Auth system (signup, login, JWT, protected routes)
- [x] MongoDB Atlas database
- [ ] Vercel CI/CD (auto-deploys via GitHub pushes)
- [ ] Custom domain
- [ ] Real AI integration

---

## Technical Decisions Log

| Decision                              | Rationale                                                             |
| ------------------------------------- | --------------------------------------------------------------------- |
| Vite over CRA                         | Faster builds, native ESM, smaller output                             |
| Express 5                             | Latest Express, better async error handling                           |
| Mongoose over raw MongoDB             | Schema validation, type safety, cleaner API                           |
| bcryptjs over bcrypt                  | Pure JS, no native compilation needed                                 |
| JWT over sessions                     | Stateless, works with serverless                                      |
| Framer Motion over CSS animations     | Declarative, scroll-reveal, staggered children                        |
| Tailwind over styled-components       | Faster to iterate, smaller bundle, utility-first                      |
| Two Vercel projects (frontend + API)  | Independent scaling, simpler config than monorepo                     |
| Vercel serverless over Express on VPS | Free tier, auto-scaling, no server management                         |
| Path of least resistance for DB       | Started with sql.js (simple), migrated to MongoDB (Vercel-compatible) |
