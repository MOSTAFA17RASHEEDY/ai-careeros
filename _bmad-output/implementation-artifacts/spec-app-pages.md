---
title: App Pages — AI CareerOS Dashboard & Tools
type: 'feature'
created: '2026-05-19'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The marketing site explains what AI CareerOS is, but users have no actual application to use. The core value — personalized resume building, career coaching, skill gap analysis — requires an interactive app.

**Approach:** Build the authenticated application pages in the same Vite project, adding React Router to separate public marketing routes (`/`) from app routes (`/app/*`). Create four main pages: Dashboard (overview), Resume Builder (AI-powered editor), Career Coach (conversation interface), and Skill Gap Analysis (visual gap display). All pages are UI-only with mock data — the backend/API layer comes next.

## Boundaries & Constraints

**Always:**
- Same Vite project as the landing page — add `react-router-dom`, no new project
- All app routes under `/app/*` prefix (e.g., `/app/dashboard`, `/app/resumes`, `/app/coach`, `/app/skills`)
- Marketing site stays as-is at `/` with its existing components
- New `AppLayout` component with sidebar navigation for all app pages
- Use `framer-motion` for page transitions and route changes
- Mock/data-placeholder state for all data (no backend calls yet)
- Functional components with hooks, TypeScript strict mode

**Ask First:**
- Adding dependencies beyond react-router-dom, framer-motion (already installed), lucide-react, tailwind
- Changing the route structure or adding new pages beyond the four planned
- Adding any real backend or API integrations
- Changing the sidebar layout pattern

**Never:**
- No real backend calls — all data is mock/placeholder
- No auth guards yet (that comes in the auth system phase)
- No database or API connections
- No state management beyond React built-ins (useState, useReducer, Context)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Navigate to `/` | User visits root | Marketing landing page renders as before | N/A |
| Navigate to `/app/dashboard` | User visits dashboard route | App layout with sidebar renders, dashboard content shown | N/A |
| Navigate to `/app/resumes` | User visits resume builder | Resume builder page with mock resumes renders | N/A |
| Navigate to `/app/coach` | User visits career coach | Chat interface with mock messages renders | N/A |
| Navigate to `/app/skills` | User visits skill gap page | Skill comparison UI with mock data renders | N/A |
| Direct nav to `/app/*` without React Router | Browser refresh or URL entry | React Router handles client-side routing (Vite fallback may need config) | SPA fallback — Vite dev server handles this natively |
| Mobile viewport on app | Viewport < 768px | Sidebar collapses to bottom nav or hamburger | N/A |

</frozen-after-approval>

## Code Map

- `src/App.tsx` — Top-level router: `public routes` (`/` → marketing site) and `app routes` (`/app/*` → app pages)
- `src/components/AppLayout.tsx` — App shell: sidebar nav + main content area + header
- `src/components/Sidebar.tsx` — Sidebar navigation with icons, active state, mobile collapse
- `src/pages/Dashboard.tsx` — Overview page: resume strength card, skill gap summary, recent activity
- `src/pages/ResumeBuilder.tsx` — AI resume builder: list of resumes, create/edit modal/panel
- `src/pages/CareerCoach.tsx` — Chat interface: message list, input field, conversation history sidebar
- `src/pages/SkillGapAnalysis.tsx` — Skill comparison: target role input, current vs required skills visualization
- `src/data/mockData.ts` — All mock data in one place: resumes, chat messages, skill profiles, user stats

## Tasks & Acceptance

**Execution:**
- [x] `npm install react-router-dom` — Add routing dependency
- [x] `src/App.tsx` — Set up BrowserRouter with public route (`/` rendering marketing site) and app layout routes (`/app/*`)
- [x] `src/data/mockData.ts` — Create all mock data: user profile, resume list, chat history, skills, dashboard stats
- [x] `src/components/Sidebar.tsx` — Navigation sidebar with links to dashboard, resumes, coach, skills; active state; mobile responsive
- [x] `src/components/AppLayout.tsx` — App shell composing Sidebar + header + main content area with React Router Outlet
- [x] `src/pages/Dashboard.tsx` — Dashboard with 4 stat cards (resume score, skill match, interviews prepped, career progress) + recent activity feed
- [x] `src/pages/ResumeBuilder.tsx` — Resume list page with create button, mock resume cards, expand to see details/versions
- [x] `src/pages/CareerCoach.tsx` — Chat UI with message bubbles, typing indicator, input field, conversation sidebar
- [x] `src/pages/SkillGapAnalysis.tsx` — Target role selector, current skills list, required skills list with gap visualization (filled vs empty bars)
- [x] Configure `vite.config.ts` SPA fallback if needed (Vite dev server handles this by default for historyApiFallback)

**Acceptance Criteria:**
- Given a user visits `/`, when the page loads, then the marketing landing page is displayed exactly as before
- Given a user navigates to `/app/dashboard`, when the app layout renders, then a sidebar with nav links is visible and the dashboard page shows mock stats
- Given a user clicks a sidebar link (e.g., "Resumes"), when the route changes, then the page transitions smoothly and the sidebar active state updates
- Given a user visits `/app/coach`, when the page renders, then a chat interface with mock messages and an input field is displayed
- Given a user visits `/app/skills`, when the page renders, then a skill gap visualization with current vs required skills is shown
- Given a user is on mobile, when they view any app page, then the sidebar collapses responsively

## Verification

**Commands:**
- `npm run dev` — expected: Vite dev server starts, `/` shows marketing page, `/app/dashboard` shows app layout
- `npm run build` — expected: TypeScript compiles cleanly, Vite builds without errors
- Manual: navigate between all `/app/*` routes and verify each page renders

