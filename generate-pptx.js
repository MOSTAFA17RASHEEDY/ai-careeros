const PptxGenJS = require('pptxgenjs')
const fs = require('fs')

const pptx = new PptxGenJS()
pptx.author = 'BMad AI Agent'
pptx.title = 'AI CareerOS — Built by BMad'

// Theme colors
const C = {
  bg: '1a1a2e',       // dark navy
  bg2: '16213e',      // slightly lighter navy
  accent: '0f3460',   // blue accent
  gold: 'e94560',     // red-gold accent
  light: 'e8e8e8',    // light text
  white: 'ffffff',
  gray: 'a0a0b0',
  green: '4ade80',
  blue: '60a5fa',
  purple: 'a78bfa',
  darkCard: '1e293b',
  border: '334155',
}

function addSlide(title, content, options = {}) {
  const slide = pptx.addSlide()
  const { subtitle, bullets, code, twoCol, leftCol, rightCol, image, note } = options

  // Background
  slide.background = { fill: C.bg }

  // Side accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.15, h: '100%', fill: { color: C.gold }
  })

  // Top decorative line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 0.4, w: 1.2, h: 0.04, fill: { color: C.gold }
  })

  // Slide number
  slide.addText(String(pptx.slides.length), {
    x: 9.0, y: 0.3, w: 0.5, h: 0.3,
    fontSize: 10, color: C.gray, align: 'right', fontFace: 'Inter'
  })

  // Title
  slide.addText(title, {
    x: 0.5, y: 0.6, w: 8.5, h: 0.5,
    fontSize: 28, color: C.white, fontFace: 'Inter', bold: true
  })

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 1.2, w: 8.5, h: 0.4,
      fontSize: 14, color: C.gold, fontFace: 'Inter'
    })
  }

  // Content text
  if (content) {
    const lines = Array.isArray(content) ? content : [content]
    const yStart = subtitle ? 1.7 : 1.3
    slide.addText(lines.map((l, i) => ({
      text: l,
      options: { fontSize: 14, color: C.light, fontFace: 'Inter', bullet: i > 0 || lines.length > 1 }
    })), {
      x: 0.5, y: yStart, w: 8.5, h: 4.5 - yStart,
      lineSpacingMultiple: 1.5, valign: 'top'
    })
  }

  // Bullets
  if (bullets) {
    const yStart = subtitle ? 1.7 : 1.3
    slide.addText(bullets.map(b => ({
      text: typeof b === 'string' ? b : b.text,
      options: {
        fontSize: b.fontSize || 13,
        color: b.color || C.light,
        fontFace: 'Inter',
        bullet: { code: '25CF', color: C.gold }
      }
    })), {
      x: 0.5, y: yStart, w: 8.5, h: 4.8 - yStart,
      lineSpacingMultiple: 1.6, valign: 'top',
      paraSpaceAfter: 4
    })
  }

  // Code block
  if (code) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 4.2, w: 8.5, h: 1.6,
      fill: { color: '1e293b' },
      line: { color: C.border, width: 1 },
      rectRadius: 4
    })
    slide.addText(code, {
      x: 0.7, y: 4.3, w: 8.1, h: 1.4,
      fontSize: 10, color: C.blue, fontFace: 'Courier New',
      lineSpacingMultiple: 1.3
    })
  }

  // Bottom note
  if (note) {
    slide.addText(note, {
      x: 0.5, y: 5.2, w: 8.5, h: 0.3,
      fontSize: 9, color: C.gray, fontFace: 'Inter', italic: true
    })
  }

  // Footer
  slide.addText('AI CareerOS — Built by BMad', {
    x: 0.5, y: 5.3, w: 4, h: 0.3,
    fontSize: 8, color: C.gray, fontFace: 'Inter'
  })
}

// ===== TITLE SLIDE =====
const titleSlide = pptx.addSlide()
titleSlide.background = { fill: C.bg }
titleSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: '100%', fill: { color: C.gold } })
// Decorative shapes
titleSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.2, w: 1.5, h: 0.04, fill: { color: C.gold } })
titleSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.3, w: 0.8, h: 0.04, fill: { color: C.gold } })
titleSlide.addText('AI CareerOS', {
  x: 0.5, y: 1.6, w: 8.5, h: 0.8,
  fontSize: 44, color: C.white, fontFace: 'Inter', bold: true
})
titleSlide.addText('Built End-to-End by an AI Agent', {
  x: 0.5, y: 2.5, w: 8.5, h: 0.5,
  fontSize: 22, color: C.gold, fontFace: 'Inter'
})
titleSlide.addText('How BMad Designed, Developed, Tested, and Deployed\na Full-Stack Production Application from Scratch', {
  x: 0.5, y: 3.2, w: 7, h: 0.7,
  fontSize: 13, color: C.gray, fontFace: 'Inter', lineSpacingMultiple: 1.4
})
titleSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.2, w: 2, h: 0.04, fill: { color: C.gray } })
titleSlide.addText('Duration: ~4 hours of agentic work • 55+ files • 16 API endpoints', {
  x: 0.5, y: 4.5, w: 8.5, h: 0.4,
  fontSize: 11, color: C.gray, fontFace: 'Inter'
})

// ===== SLIDE 2: The Mission =====
addSlide('The Mission', '', {
  subtitle: 'Build a complete AI-powered career platform from scratch',
  bullets: [
    { text: 'Marketing landing page with animations' },
    { text: 'Dashboard with live statistics' },
    { text: 'Resume Builder (full CRUD)' },
    { text: 'AI Career Coach (chat interface)' },
    { text: 'Skill Gap Analysis engine' },
    { text: 'Auth system (signup / login / JWT)' },
    { text: 'Backend REST API (16 endpoints)' },
    { text: 'Production deployment to Vercel' },
  ],
  note: 'Stack: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Express 5 + MongoDB'
})

// ===== SLIDE 3: Phase 1 — Planning =====
addSlide('Phase 1: Scaffolding & Planning', '', {
  subtitle: 'The agent didn\'t start coding immediately',
  bullets: [
    { text: 'Explored the workspace — checked existing files and environment' },
    { text: 'Created a task list — broke the work into 8 phases' },
    { text: 'Established conventions — read existing patterns to match style' },
    { text: 'Chose the stack based on compatibility and production readiness' },
  ]
})

// ===== SLIDE 4: Tech Stack Decisions =====
addSlide('Technology Decisions', '', {
  subtitle: 'Every choice had a rationale',
  twoCol: true,
  bullets: [
    { text: 'Vite over CRA — faster builds, native ESM', fontSize: 11 },
    { text: 'React 18 — mature ecosystem, concurrent features', fontSize: 11 },
    { text: 'TypeScript strict — type safety, catch bugs early', fontSize: 11 },
    { text: 'Tailwind — utility-first, rapid prototyping', fontSize: 11 },
    { text: 'Framer Motion — declarative scroll-reveal animations', fontSize: 11 },
    { text: 'React Router v7 — nested routes, layout patterns', fontSize: 11 },
    { text: 'Express 5 — modern, better async handling', fontSize: 11 },
    { text: 'Mongoose — schema validation, clean API', fontSize: 11 },
    { text: 'MongoDB Atlas — free tier, Vercel-compatible', fontSize: 11 },
    { text: 'JWT + bcryptjs — stateless auth, pure JS', fontSize: 11 },
    { text: 'Vercel — free tier, auto-scaling, GitHub CI', fontSize: 11 },
  ]
})

// ===== SLIDE 5: Phase 2 — Landing Page =====
addSlide('Phase 2: Building the Landing Page', '', {
  subtitle: '6 animated sections with Framer Motion',
  bullets: [
    { text: 'Hero — headline, subtitle, 2 CTA buttons' },
    { text: 'Features — 6 cards with icons (Resume Builder, Career Coach, Skill Analysis, Tailored Matches, Smart Insights, Interview Prep)' },
    { text: 'Pricing — 3 tiers: Free / Pro / Enterprise' },
    { text: 'Testimonials — 3 social-proof cards with avatars' },
    { text: 'CTA — call-to-action section' },
    { text: 'Footer — navigation links, copyright' },
    { text: 'Navbar — logo, nav links, Sign In button' },
  ],
  note: 'All animations use motion.div with opacity + y transforms and staggered delays'
})

// ===== SLIDE 6: Phase 3 — App Pages =====
addSlide('Phase 3: Building App Pages', '', {
  subtitle: '4 tool pages under /app/* with protected routes',
  bullets: [
    { text: 'Dashboard — live stats (Resume Score, Skill Match, Interviews Prepped, Career Progress), activity timeline, quick action buttons' },
    { text: 'Resume Builder — sidebar list, expand/collapse, create/edit/delete, versions tracking' },
    { text: 'Career Coach — conversation sidebar, real-time chat, simulated AI replies from 6 response pool' },
    { text: 'Skill Gap Analysis — current skills display, target role buttons, gap analysis with match/miss indicators' },
    { text: 'All pages handle: loading state, empty state, error state' },
  ],
  note: 'Protected by ProtectedRoute component, wrapped in AppLayout (sidebar + header + Outlet)'
})

// ===== SLIDE 7: Auth System =====
addSlide('Auth System: Signup / Login / JWT', '', {
  subtitle: 'Full authentication flow with persistent sessions',
  bullets: [
    { text: 'POST /api/auth/signup — bcrypt-hashed password, creates user' },
    { text: 'POST /api/auth/login — validates credentials, returns JWT (7-day expiry)' },
    { text: 'GET /api/auth/me — verifies token on page load' },
    { text: 'authMiddleware — intercepts all protected /api/* routes' },
    { text: 'AuthContext — React context with user, token, login, signup, logout' },
    { text: 'Token persisted in localStorage, auto-verified on app mount' },
    { text: 'ProtectedRoute — redirects to /login if unauthenticated' },
    { text: 'Login/Signup pages with form validation + error alerts' },
  ]
})

// ===== SLIDE 8: Phase 4 — Backend API =====
addSlide('Phase 4: Backend REST API', '', {
  subtitle: '16 endpoints • Express 5 • Mongoose • JWT auth',
  code: 'api/index.ts → backend/src/index.ts → Routes → Models → MongoDB Atlas',
  bullets: [
    { text: 'GET /api/health — health check', fontSize: 11 },
    { text: 'POST /api/seed — one-click database seeding', fontSize: 11 },
    { text: 'POST /api/auth/signup — create account', fontSize: 11 },
    { text: 'POST /api/auth/login — login → JWT token', fontSize: 11 },
    { text: 'GET /api/auth/me — verify token', fontSize: 11 },
    { text: 'GET /api/resumes — list / GET/:id / POST / PUT/:id / DELETE/:id', fontSize: 11 },
    { text: 'GET /api/dashboard/stats — stats + recent activity', fontSize: 11 },
    { text: 'GET /api/chat/conversations — list / GET/:id messages / POST messages', fontSize: 11 },
    { text: 'GET /api/skills — list / POST /analyze — gap analysis', fontSize: 11 },
  ]
})

// ===== SLIDE 9: Phase 5 — Connecting Frontend to API =====
addSlide('Phase 5: Connecting Frontend to API', '', {
  subtitle: 'Typed API client with auto JWT attachment',
  code: `const res = await fetch(\`\${API_BASE}\${path}\`, {
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
  },
})`,
  bullets: [
    { text: 'Single api.ts fetch wrapper — all endpoints through one function' },
    { text: 'Auto-attaches Bearer token from localStorage' },
    { text: 'Typed responses with TypeScript interfaces' },
    { text: 'Dashboard — live stats + activity from MongoDB' },
    { text: 'Resumes — full CRUD with real persistence' },
    { text: 'Career Coach — conversations + messages in DB' },
    { text: 'Skills — list from DB, analysis computed server-side' },
  ]
})

// ===== SLIDE 10: Phase 6 — Database Migration =====
addSlide('Phase 6: Database Migration (SQLite → MongoDB)', '', {
  subtitle: 'Why the first database choice had to change for production',
  bullets: [
    { text: 'Initial: sql.js (WASM-based SQLite) — simple, zero-config, worked great locally', fontSize: 12, color: C.gray },
    { text: 'Problem: Vercel serverless = ephemeral containers. SQLite file writes lost between invocations.', fontSize: 12, color: C.gold },
    { text: 'Migration: sql.js → mongoose (MongoDB ODM)', fontSize: 12, color: C.white },
    { text: '6 models rewritten: User, Resume, Conversation, Message, Skill, ActivityLog', fontSize: 12, color: C.light },
    { text: 'Vercel caching pattern: globalThis.mongooseCache singleton', fontSize: 12, color: C.light },
    { text: 'Why MongoDB: native Vercel support, free Atlas tier, Mongoose validation', fontSize: 12, color: C.green },
  ]
})

// ===== SLIDE 11: Vercel Deploy — Issue 1 =====
addSlide('Vercel Deploy: Issue 1 — Build Command', '', {
  subtitle: 'Error: sh: line 1: tsc: command not found',
  code: `"buildCommand": "echo 'built by @vercel/node'"`,
  bullets: [
    { text: 'Root package.json had a build script that tried to compile the frontend' },
    { text: 'TypeScript wasn\'t installed at the root level on Vercel' },
    { text: 'Fix: Override buildCommand to a no-op. Vercel\'s @vercel/node runtime auto-compiles serverless functions via esbuild.' },
  ]
})

// ===== SLIDE 12: Vercel Deploy — Issue 2 =====
addSlide('Vercel Deploy: Issue 2 — No Output Directory', '', {
  subtitle: 'Error: No Output Directory named "public" found',
  bullets: [
    { text: 'Vercel expects a static output directory for all projects' },
    { text: 'API-only projects have no frontend build output' },
    { text: 'Fix: Added a minimal public/index.html file' },
    { text: 'Vercel uses it as output, but all requests are rewritten to the API function' },
    { text: 'Lesson: Pure API projects on Vercel need at least a placeholder output' },
  ]
})

// ===== SLIDE 13: Vercel Deploy — Issue 3 =====
addSlide('Vercel Deploy: Issue 3 — TypeScript Compilation', '', {
  subtitle: 'Errors: Cannot find name "process" / "global" / "headers"',
  code: `// Fix 1: Add @types/node to root devDependencies
// Fix 2: Use globalThis instead of global
const globalAny = globalThis as any
let cached = globalAny.mongooseCache || { conn: null, promise: null }

// Fix 3: Cast request for headers access
const header = (req as any).headers?.authorization`,
  bullets: [
    { text: 'Vercel uses esbuild (not tsc) — different type resolution' },
    { text: '@types/node not in root deps → process undefined' },
    { text: 'global not available in strict ESM → use globalThis' },
    { text: 'Express 5 type incompatibility → cast for headers' },
  ]
})

// ===== SLIDE 14: Vercel Deploy — Issue 4 =====
addSlide('Vercel Deploy: Issue 4 — CORS Origin Mismatch', '', {
  subtitle: 'Failed to fetch: Browser rejected cross-origin request',
  bullets: [
    { text: 'CORS origin comparison is strict string match' },
    { text: 'https://vercel.app/ !== https://vercel.app (trailing slash mismatch)' },
    { text: 'Fix: Normalize origins — strip trailing slashes' },
    { text: 'Also added support for comma-separated multiple origins' },
    { text: 'Then: User had VITE_API_URL missing /api suffix' },
    { text: 'Fix: Set VITE_API_URL = https://api-url.vercel.app/api' },
  ]
})

// ===== SLIDE 15: Phase 8 — Final Integration =====
addSlide('Phase 8: Final Integration — All Verified', '', {
  subtitle: 'Every endpoint tested end-to-end',
  code: `$ curl https://api.vercel.app/api/health
{"status":"ok"}

$ curl -X POST https://api.vercel.app/api/seed
{"message":"Database seeded successfully"}

$ curl -X POST https://api.vercel.app/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alex@example.com","password":"password123"}'
{"token":"eyJ...", "user": {"id":"...", "name":"Alex Morgan"}}`,
  bullets: [
    { text: 'Health check → OK', fontSize: 12 },
    { text: 'Database seeding → Success (test user + mock data)', fontSize: 12 },
    { text: 'Auth (login/signup/me) → JWT + user response', fontSize: 12 },
    { text: 'Dashboard stats → Live data from MongoDB', fontSize: 12 },
    { text: 'Resume CRUD → Create/Read/Update/Delete all verified', fontSize: 12 },
    { text: 'Career Coach → Conversations + AI replies', fontSize: 12 },
    { text: 'Skill Analysis → Gap analysis computed server-side', fontSize: 12 },
  ]
})

// ===== SLIDE 16: What Was Delivered =====
addSlide('What Was Delivered', '', {
  subtitle: '55+ files across frontend, backend, and config',
  bullets: [
    { text: 'Marketing site — 6 animated sections, Navbar + Footer', fontSize: 12 },
    { text: 'Auth system — Login, Signup, JWT, ProtectedRoute', fontSize: 12 },
    { text: 'Dashboard — Live stats, activity timeline, quick actions', fontSize: 12 },
    { text: 'Resume Builder — Full CRUD with versions', fontSize: 12 },
    { text: 'Career Coach — Chat interface with AI replies', fontSize: 12 },
    { text: 'Skill Gap Analysis — 2 target roles, computed gaps', fontSize: 12 },
    { text: 'Backend API — 16 RESTful endpoints, JWT auth', fontSize: 12 },
    { text: 'Database — MongoDB Atlas (free tier), 6 collections', fontSize: 12 },
    { text: 'Deployment — Frontend on Vercel, API on Vercel, GitHub repo', fontSize: 12 },
    { text: 'Documentation — Full project docs + this presentation', fontSize: 12 },
  ]
})

// ===== SLIDE 17: How the Agent Worked =====
addSlide('How BMad Worked', '', {
  subtitle: 'The methodology behind the build',
  bullets: [
    { text: '1. Understand first, code second — Read before writing. Ask when unclear.', fontSize: 12, color: C.white },
    { text: '2. Build in phases — Frontend → Backend → Auth → Integration → Deploy.', fontSize: 12, color: C.light },
    { text: '3. Error-driven development — Deploy early, fix issues as they appear.', fontSize: 12, color: C.light },
    { text: '4. Task tracking — Real-time todo list throughout the session.', fontSize: 12, color: C.light },
    { text: '5. Iterative refinement — Each deployment error → analysis → targeted fix.', fontSize: 12, color: C.light },
    { text: '6. Documentation as you go — Every decision logged with rationale.', fontSize: 12, color: C.light },
    { text: '7. User-in-the-loop — Key decisions (MongoDB choice, DB credentials) handled by user.', fontSize: 12, color: C.gold },
  ]
})

// ===== SLIDE 18: Key Takeaways =====
addSlide('Key Takeaways', '', {
  subtitle: 'What this project proves about AI-powered development',
  bullets: [
    { text: 'AI can build production software end-to-end — from planning to deployment, including fixing its own errors', fontSize: 12, color: C.white },
    { text: 'Error-driven iteration works — deploy early, let errors guide the fixes', fontSize: 12, color: C.light },
    { text: 'Stack compatibility is critical — choosing technologies that work together reduces integration issues', fontSize: 12, color: C.light },
    { text: 'Documentation creates an audit trail — every decision recorded with rationale', fontSize: 12, color: C.light },
    { text: 'AI + Human collaboration is the sweet spot — user makes strategic decisions, agent handles implementation', fontSize: 12, color: C.gold },
  ]
})

// ===== CLOSING SLIDE =====
const closeSlide = pptx.addSlide()
closeSlide.background = { fill: C.bg }
closeSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: '100%', fill: { color: C.gold } })
closeSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.0, w: 1.5, h: 0.04, fill: { color: C.gold } })
closeSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.1, w: 0.8, h: 0.04, fill: { color: C.gold } })
closeSlide.addText('AI CareerOS', {
  x: 0.5, y: 2.4, w: 8.5, h: 0.7,
  fontSize: 36, color: C.white, fontFace: 'Inter', bold: true
})
closeSlide.addText('https://github.com/MOSTAFA17RASHEEDY/ai-careeros', {
  x: 0.5, y: 3.2, w: 8.5, h: 0.4,
  fontSize: 14, color: C.blue, fontFace: 'Inter'
})
closeSlide.addText('alex@example.com / password123', {
  x: 0.5, y: 3.7, w: 8.5, h: 0.4,
  fontSize: 12, color: C.gray, fontFace: 'Inter'
})
closeSlide.addText('Built with BMad — AI-Powered Software Engineering', {
  x: 0.5, y: 4.5, w: 8.5, h: 0.4,
  fontSize: 11, color: C.gold, fontFace: 'Inter', italic: true
})
closeSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 5.0, w: 2, h: 0.02, fill: { color: C.gray } })

// Save
const outPath = 'docs/AI-CareerOS-Built-by-BMad.pptx'
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('Presentation saved:', outPath)
}).catch(err => {
  console.error('Error:', err)
})
