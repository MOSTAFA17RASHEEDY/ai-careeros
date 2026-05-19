---
title: Landing/Marketing Site — AI CareerOS
type: 'feature'
created: '2026-05-19'
baseline_commit: 'NO_VCS'
status: 'done'
context: ['_bmad-output/planning-artifacts/briefs/brief-Demo 1-2026-05-19/brief.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AI CareerOS has a product brief and market validation but no public-facing web presence. Potential users (job seekers, employers, university decision-makers) have no way to discover the product, understand its value proposition, or engage with it.

**Approach:** Build a responsive single-page marketing site for AI CareerOS using React + TypeScript + Vite + Tailwind CSS. The site communicates the core value proposition (personalized AI career coaching, B2B-first model), targets three user groups (job seekers, employers, universities), and establishes credibility through clean design.

## Boundaries & Constraints

**Always:**
- React 18+ with TypeScript strict mode
- Vite as build tool
- Tailwind CSS for all styling (no CSS-in-JS or CSS modules)
- Mobile-responsive first, then desktop
- All text content should be easily editable (no hardcoded content deep in components)
- Use functional components with hooks, no class components

**Ask First:**
- Adding dependencies beyond React, Vite, Tailwind, and lucide-react (icons)
- Adding any backend/api integrations (this is a static marketing site)
- Changing the color scheme or typography system

**Never:**
- No backend or API calls (static site only)
- No server-side rendering (Vite SPA is fine for a marketing page)
- No authentication or user accounts
- No database connections
- No analytics or tracking scripts

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mobile viewport | Viewport < 768px | Layout stacks vertically, navigation collapses to hamburger menu | N/A |
| Tablet viewport | Viewport 768-1024px | Layout adjusts to tablet breakpoints, readable at all sizes | N/A |
| Desktop viewport | Viewport > 1024px | Full multi-column layout as designed | N/A |
| Loading images | Image assets not yet loaded | Skeleton/placeholder shown, no layout shift | Graceful fallback to colored placeholder |
| Long content | Section with lots of text | Text wraps properly, no overflow, responsive | N/A |

</frozen-after-approval>

## Code Map

- `src/App.tsx` — Root layout component, renders all sections
- `src/main.tsx` — Application entry point, mounts React app
- `src/components/Navbar.tsx` — Top navigation bar with responsive hamburger menu
- `src/components/Hero.tsx` — Hero section with headline, subtext, CTA buttons
- `src/components/Features.tsx` — Feature grid highlighting key differentiators
- `src/components/Pricing.tsx` — Pricing cards (Free, Pro, Enterprise)
- `src/components/Testimonials.tsx` — Social proof / testimonial section
- `src/components/CTA.tsx` — Call-to-action section (sign up / learn more)
- `src/components/Footer.tsx` — Site footer with links and branding
- `src/data/content.ts` — All text content in one place for easy editing
- `index.html` — Vite HTML entry point with proper meta tags
- `vite.config.ts` — Vite configuration
- `tailwind.config.js` — Tailwind configuration with custom theme
- `tsconfig.json` — TypeScript configuration

## Tasks & Acceptance

**Execution:**
- [x] Scaffold project: `npm create vite@latest . -- --template react-ts`, then install tailwindcss, postcss, autoprefixer, lucide-react
- [x] Configure Tailwind with custom theme (colors: primary blue, accent purple, neutral grays)
- [x] `src/data/content.ts` — Centralize all copy: headlines, feature descriptions, pricing, testimonials
- [x] `src/components/Navbar.tsx` — Responsive nav with logo, nav links, CTA button, mobile hamburger
- [x] `src/components/Hero.tsx` — Hero with headline, subtitle, two CTA buttons, optional illustration area
- [x] `src/components/Features.tsx` — 3x3 or 4x2 grid of feature cards with icon, title, description
- [x] `src/components/Pricing.tsx` — Three-tier pricing cards (Free $0, Pro $12/mo, Enterprise Custom)
- [x] `src/components/Testimonials.tsx` — 2-3 testimonial cards with avatar, quote, name, title
- [x] `src/components/CTA.tsx` — Bottom CTA section with headline and action button
- [x] `src/components/Footer.tsx` — Footer with logo, nav links, copyright
- [x] `src/App.tsx` — Compose all sections, smooth scroll navigation
- [x] `index.html` — SEO meta tags, Open Graph, favicon, font preloads

**Acceptance Criteria:**
- Given a user visits the site on mobile, when they view the page, then all content is readable and navigation is usable via hamburger menu
- Given a user visits the site on desktop, when they view the page, then the full multi-column layout is displayed
- Given a user clicks a nav link, when the page scrolls to the corresponding section, then the scroll is smooth and the section is visible
- Given a user views the pricing section, when they see three pricing tiers, then each tier clearly shows the name, price, and key features
- Given a developer opens `src/data/content.ts`, when they edit any text value, then the site reflects the change on reload

## Verification

**Commands:**
- `npm run dev` — expected: Vite dev server starts, landing page renders at localhost:5173
- `npm run build` — expected: Vite builds successfully, output in `dist/`
- `npm run preview` — expected: Built site serves and renders correctly
