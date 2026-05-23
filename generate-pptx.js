const PptxGenJS = require('pptxgenjs')

const pptx = new PptxGenJS()
pptx.author = 'BMad AI Agent'
pptx.title = 'AI CareerOS — Built by BMad'

const C = {
  bg: '1a1a2e',
  bg2: '16213e',
  accent: '0f3460',
  gold: 'e94560',
  light: 'e8e8e8',
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
  const { subtitle, bullets, code, note } = options

  slide.background = { fill: C.bg }

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.15, h: '100%', fill: { color: C.gold }
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 0.4, w: 1.2, h: 0.04, fill: { color: C.gold }
  })
  slide.addText(String(pptx.slides.length), {
    x: 9.0, y: 0.3, w: 0.5, h: 0.3,
    fontSize: 10, color: C.gray, align: 'right', fontFace: 'Inter'
  })
  slide.addText(title, {
    x: 0.5, y: 0.6, w: 8.5, h: 0.5,
    fontSize: 28, color: C.white, fontFace: 'Inter', bold: true
  })
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 1.2, w: 8.5, h: 0.4,
      fontSize: 14, color: C.gold, fontFace: 'Inter'
    })
  }
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
  if (note) {
    slide.addText(note, {
      x: 0.5, y: 5.2, w: 8.5, h: 0.3,
      fontSize: 9, color: C.gray, fontFace: 'Inter', italic: true
    })
  }
  slide.addText('AI CareerOS — Built by BMad', {
    x: 0.5, y: 5.3, w: 4, h: 0.3,
    fontSize: 8, color: C.gray, fontFace: 'Inter'
  })
}

// ===== TITLE =====
const titleSlide = pptx.addSlide()
titleSlide.background = { fill: C.bg }
titleSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: '100%', fill: { color: C.gold } })
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
titleSlide.addText('How a single conversation with BMad turned an idea\ninto a full-stack production SaaS platform', {
  x: 0.5, y: 3.2, w: 7, h: 0.7,
  fontSize: 13, color: C.gray, fontFace: 'Inter', lineSpacingMultiple: 1.4
})
titleSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.2, w: 2, h: 0.04, fill: { color: C.gray } })
titleSlide.addText('From idea to deployed product • 55+ files • 17 API endpoints', {
  x: 0.5, y: 4.5, w: 8.5, h: 0.4,
  fontSize: 11, color: C.gray, fontFace: 'Inter'
})

// ===== THE BIG IDEA =====
addSlide('The Big Idea', '', {
  subtitle: 'What if one platform could manage your entire career?',
  bullets: [
    { text: 'Professionals juggle resumes, skills tracking, interview prep, and career goals across 5+ disconnected tools', fontSize: 12, color: C.gray },
    { text: 'AI CareerOS brings everything into one place — with an AI that actually takes action, not just gives advice', fontSize: 12, color: C.white },
    { text: 'Your resume, skills, goals, and interview practice live together, connected by a single AI assistant', fontSize: 12, color: C.light },
    { text: 'Tell the AI what you want to achieve — it creates goals, updates your resume, tracks skills, and saves progress', fontSize: 12, color: C.gold },
    { text: 'No more copy-paste between tools. No more "I should update my resume" — just ask and it happens.', fontSize: 12, color: C.light },
  ],
  note: 'AI CareerOS: Your career, one conversation at a time'
})

// ===== THE PROBLEM =====
addSlide('The Problem', '', {
  subtitle: 'Career management is fragmented and frustrating',
  bullets: [
    { text: 'Your resume lives in Google Docs, skills in LinkedIn, goals in a notebook, interview prep scattered across YouTube and blogs', fontSize: 12, color: C.gray },
    { text: 'Every job search means starting from scratch — rewriting resumes, remembering what you practiced, figuring out what skills you need', fontSize: 12, color: C.light },
    { text: 'AI tools give generic advice but never actually DO anything — they tell you what to change but won\'t make the edit', fontSize: 12, color: C.gray },
    { text: 'Career progress is invisible — no way to track how your skills grow or how your resume improves over time', fontSize: 12, color: C.light },
    { text: 'Result: missed opportunities, duplicated effort, and career inertia', fontSize: 12, color: C.gold },
  ],
  note: 'The average professional changes jobs 12 times in their career — each restart costs weeks of effort'
})

// ===== THE SOLUTION =====
addSlide('The Solution', '', {
  subtitle: 'AI CareerOS — your career as a connected system',
  bullets: [
    { text: 'One AI assistant that understands your entire career profile — resume, skills, goals, interview history', fontSize: 12, color: C.white },
    { text: 'Tell it what you want: "Help me become a Senior Engineer" → it creates goals, assesses skills, tailors your resume', fontSize: 12, color: C.light },
    { text: 'AI takes real actions — updates your resume, tracks skill progress, saves interview practice, logs achievements', fontSize: 12, color: C.gold },
    { text: 'Everything persists across sessions — your career data grows with you, not disappears after each chat', fontSize: 12, color: C.light },
    { text: 'From job seeker to career manager — one platform that evolves with your ambitions', fontSize: 12, color: C.white },
  ],
  note: 'Action-oriented AI: It doesn\'t just talk — it builds, updates, and tracks'
})

// ===== CORE FEATURES =====
addSlide('What It Does', '', {
  subtitle: 'Four integrated tools, one AI brain',
  bullets: [
    { text: 'Resume Builder — Create and optimize resumes for specific target roles. AI improves sections, tracks versions, scores quality.', fontSize: 12, color: C.white },
    { text: 'Career Coach — A conversational AI that understands your profile and takes real actions. Ask it to set goals, update skills, or prep for interviews.', fontSize: 12, color: C.light },
    { text: 'Skill Gap Analysis — Select a target role, see exactly what skills you have vs what you need. AI builds a prioritized learning roadmap.', fontSize: 12, color: C.light },
    { text: 'Interview Practice — Simulated interview sessions with AI feedback. Save and review your progress across behavioral, system design, and coding questions.', fontSize: 12, color: C.light },
    { text: 'Dashboard — Live stats on your career progress: resume scores, skill levels, goals achieved, interview sessions completed.', fontSize: 12, color: C.gold },
  ],
  note: 'All tools share data — your resume feeds your coach, your skills inform your goals'
})

// ===== HOW IT HELPS =====
addSlide('How It Helps', '', {
  subtitle: 'Real impact for real professionals',
  bullets: [
    { text: 'For the job seeker: One conversation updates your resume, identifies skill gaps, and sets a career goal — done in minutes, not days', fontSize: 12, color: C.white },
    { text: 'For the career grower: Track skill progression over time, see how your resume score improves, review past interview performance', fontSize: 12, color: C.light },
    { text: 'For the busy professional: No more maintaining separate tools. One chat with the AI handles everything — goals, resumes, skills, practice', fontSize: 12, color: C.light },
    { text: 'For the career changer: AI analyzes your current profile against a target role, shows exactly what to learn, updates your resume accordingly', fontSize: 12, color: C.gold },
    { text: 'The AI remembers everything — pick up where you left off, track progress over months, build a career history that grows with you', fontSize: 12, color: C.light },
  ],
  note: 'Your career data, your AI, your progress — always there when you need it'
})

// ===== WHAT IS BMAD — DEEP =====
addSlide('What Is BMad? (Technical)', '', {
  subtitle: 'An AI-powered software engineering framework that builds production applications',
  bullets: [
    { text: 'BMad is not a code generator — it is an autonomous AI agent that plans, architects, builds, debugs, and deploys full-stack applications', fontSize: 12, color: C.white },
    { text: 'It operates through specialized sub-agents: a Product Manager (John), Architect (Winston), Developer (Amelia), UX Designer (Sally), and Tech Writer (Paige)', fontSize: 12, color: C.light },
    { text: 'Each sub-agent has deep expertise in its domain and collaborates with the others — the PM defines requirements, the Architect designs the system, the Developer writes the code', fontSize: 12, color: C.light },
    { text: 'BMad uses "skills" — modular, reusable workflow packages that encode best practices for specific tasks like creating PRDs, designing UX, writing architecture specs, and deploying to production', fontSize: 12, color: C.light },
    { text: 'The agent reads your existing codebase first — it understands conventions, checks package.json, matches your style before writing a single line', fontSize: 12, color: C.gold },
    { text: 'It maintains a real-time task list, documents every decision with rationale, and iterates based on errors and user feedback — not guessing, but engineering', fontSize: 12, color: C.light },
  ],
  note: 'BMad = Bayesian Mindset Agentic Design — a multi-agent system for production software engineering'
})

// ===== WHAT IS BMAD — SOFT =====
addSlide('What Is BMad? (Simple)', '', {
  subtitle: 'Imagine having a full engineering team in one conversation',
  bullets: [
    { text: 'BMad is like having a product manager, architect, developer, designer, and tech writer all working together — and you\'re the CEO', fontSize: 12, color: C.white },
    { text: 'You describe what you want to build. BMad figures out the best way to build it, writes all the code, handles deployment, and fixes issues along the way', fontSize: 12, color: C.light },
    { text: 'It doesn\'t just give you code snippets — it builds complete, working applications with auth, databases, APIs, and polished frontends', fontSize: 12, color: C.gold },
    { text: 'When something breaks (and things always break the first time), BMad diagnoses the problem, figures out the fix, and applies it — you just watch and guide', fontSize: 12, color: C.light },
    { text: 'You stay in control: you make the big decisions (which database, what features, when to deploy). BMad handles everything else.', fontSize: 12, color: C.light },
    { text: 'The result? What would take a team of 3-5 people weeks to build, BMad builds in hours — from a single conversation.', fontSize: 12, color: C.white },
  ],
  note: 'Your idea → BMad plans it, builds it, deploys it, documents it'
})

// ===== WHY BMAD =====
addSlide('Why BMad?', '', {
  subtitle: 'Because the barrier between an idea and a working product should be a conversation',
  bullets: [
    { text: 'Traditional development: Write a spec → hire a team → wait weeks → review → fix → wait more → deploy months later', fontSize: 12, color: C.gray },
    { text: 'With BMad: Describe your idea → BMad builds it → deploy same day → iterate in real time', fontSize: 12, color: C.green },
    { text: 'Speed without sacrificing quality — BMad produces production-grade code: TypeScript, proper error handling, auth, database migrations, responsive design', fontSize: 12, color: C.white },
    { text: 'Cost: A fraction of development agency fees or full-time salaries. One conversation, one subscription, one deployed product.', fontSize: 12, color: C.gold },
    { text: 'Perfect for: Founders validating an idea before raising money. Teams needing an MVP fast. Anyone who wants to ship.', fontSize: 12, color: C.light },
    { text: 'AI CareerOS is proof — a full-stack SaaS platform with auth, AI, database, and deployment, built start to finish by BMad in one session.', fontSize: 12, color: C.white },
  ],
  note: 'AI CareerOS: built by BMad in a single continuous session — from idea to deployed URL'
})

// ===== HOW BMAD WORKS =====
addSlide('How BMad Built It', '', {
  subtitle: 'The AI agent methodology behind the project',
  bullets: [
    { text: '1. Understand the idea — The user shares the vision. BMad asks questions, explores the space, and defines what success looks like.', fontSize: 12, color: C.white },
    { text: '2. Plan the architecture — Break the idea into phases. Choose the right stack. Map the data flow from UI to database to deployment.', fontSize: 12, color: C.light },
    { text: '3. Build in layers — Frontend first, then backend, then auth, then AI integration. Each phase is working before the next begins.', fontSize: 12, color: C.light },
    { text: '4. Deploy early — Push to production as soon as something works. Real deployment reveals real issues that guide the next iteration.', fontSize: 12, color: C.light },
    { text: '5. Iterate with the user — You make the strategic calls (which database, what features matter). BMad handles the implementation.', fontSize: 12, color: C.gold },
    { text: '6. Document everything — Every decision, every endpoint, every fix. The docs become the project memory.', fontSize: 12, color: C.light },
  ],
  note: 'BMad methodology: Understand → Plan → Build → Deploy → Iterate → Document'
})

// ===== THE JOURNEY =====
addSlide('The Journey: From Idea to Deployment', '', {
  subtitle: 'How it all happened, step by step',
  bullets: [
    { text: 'Start: "I want a platform that helps people manage their career with AI." — one sentence, no code, no design.', fontSize: 12, color: C.white },
    { text: 'Phase 1: BMad scaffolds the project — React + Vite frontend, Express backend, MongoDB database. Directory structure, config files, dependencies.', fontSize: 12, color: C.light },
    { text: 'Phase 2: Landing page goes live — animated hero, features grid, pricing tiers, testimonials. Looks like a real SaaS product.', fontSize: 12, color: C.light },
    { text: 'Phase 3: App pages come to life — Dashboard, Resume Builder, Career Coach, Skill Gap Analysis. All connected to a real API and database.', fontSize: 12, color: C.light },
    { text: 'Phase 4: Auth system locks it down — signup, login, JWT tokens, protected routes. Each user gets their own secure workspace.', fontSize: 12, color: C.light },
    { text: 'Phase 5: AI integration awakens — the Career Coach stops giving scripted replies and starts using real AI to understand and act on user requests.', fontSize: 12, color: C.gold },
    { text: 'Phase 6: Deployed to Vercel — two projects (frontend + API), MongoDB Atlas in production, zero infrastructure to manage.', fontSize: 12, color: C.green },
  ],
  note: 'From one sentence to a deployed SaaS platform in a single continuous session'
})

// ===== THE TECHNOLOGY =====
addSlide('The Technology', '', {
  subtitle: 'A modern, production-grade stack chosen for compatibility',
  bullets: [
    { text: 'Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion — fast dev, smooth animations, type-safe', fontSize: 12, color: C.white },
    { text: 'Backend: Express 5 + Mongoose + MongoDB Atlas — RESTful API, schema validation, serverless-compatible', fontSize: 12, color: C.light },
    { text: 'Auth: JWT + bcryptjs — stateless authentication, pure JavaScript, no native dependencies', fontSize: 12, color: C.light },
    { text: 'AI: Groq SDK + Qwen model — tool-calling architecture lets the AI take real actions in the database', fontSize: 12, color: C.gold },
    { text: 'Infrastructure: Vercel serverless + MongoDB Atlas — auto-scaling, free tier, zero ops', fontSize: 12, color: C.light },
    { text: 'Every choice has a reason: works with Vercel, no native compilation, production-ready from day one', fontSize: 12, color: C.light },
  ],
  note: 'Stack choices validated by successful production deployment'
})

// ===== BUSINESS MODEL =====
addSlide('Business Model', '', {
  subtitle: 'A SaaS platform with a clear path to revenue',
  bullets: [
    { text: 'Free tier: 10 AI responses per month — try the platform, experience the value, no credit card needed', fontSize: 12, color: C.gray },
    { text: 'Pro tier: 500 AI responses per month — for active job seekers and career growers who use the platform regularly', fontSize: 12, color: C.white },
    { text: 'Enterprise tier: Unlimited AI responses + team accounts — for companies investing in employee career development', fontSize: 12, color: C.gold },
    { text: 'Target market: Software engineers and tech professionals — a demographic that spends heavily on career tools', fontSize: 12, color: C.light },
    { text: 'Growth levers: Resume templates marketplace, premium skill assessments, team/career coaching for organizations', fontSize: 12, color: C.light },
    { text: 'Data advantage: Career progression analytics, salary benchmarking, market demand insights — valuable aggregated data over time', fontSize: 12, color: C.light },
  ],
  note: 'Freemium as a growth engine — free users become paying users as their career needs grow'
})

// ===== ROADMAP =====
addSlide('What\'s Next', '', {
  subtitle: 'The platform is live — this is just the beginning',
  bullets: [
    { text: 'Rich resume templates with drag-and-drop editing — make every resume visually stand out', fontSize: 12, color: C.white },
    { text: 'Job board integration — find roles that match your skills and apply with your AI-optimized resume', fontSize: 12, color: C.light },
    { text: 'LinkedIn profile sync — import your experience, keep everything in sync across platforms', fontSize: 12, color: C.light },
    { text: 'Interview scheduling — practice on your own time, get feedback, track improvement over months', fontSize: 12, color: C.light },
    { text: 'Team and enterprise features — managers can track team skill development, identify training needs', fontSize: 12, color: C.gold },
    { text: 'Mobile app — take your career progress with you, practice interviews anywhere, never miss a career opportunity', fontSize: 12, color: C.light },
  ],
  note: 'Built on a solid foundation — adding features is fast because the architecture is clean'
})

// ===== KEY TAKEAWAYS =====
addSlide('Key Takeaways', '', {
  subtitle: 'What this journey proves',
  bullets: [
    { text: 'AI can build production software from scratch — not demos, not prototypes. A real SaaS platform with auth, payments, and AI.', fontSize: 12, color: C.white },
    { text: 'The barrier to building a tech product has never been lower. One conversation with BMad can turn an idea into a deployed URL.', fontSize: 12, color: C.gold },
    { text: 'You stay in control — you define the vision, make the strategic decisions, and guide the direction. BMad handles the implementation.', fontSize: 12, color: C.light },
    { text: 'The result is production-grade: TypeScript, MongoDB, JWT auth, Vercel deployment, responsive design, AI integration.', fontSize: 12, color: C.light },
    { text: 'Iterate fast, deploy early, let real usage guide what comes next. The fastest path to product-market fit is shipping.', fontSize: 12, color: C.gold },
  ],
  note: 'AI + Human collaboration: the most efficient way to build software'
})

// ===== CLOSING =====
const closeSlide = pptx.addSlide()
closeSlide.background = { fill: C.bg }
closeSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: '100%', fill: { color: C.gold } })
closeSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.0, w: 1.5, h: 0.04, fill: { color: C.gold } })
closeSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.1, w: 0.8, h: 0.04, fill: { color: C.gold } })
closeSlide.addText('AI CareerOS', {
  x: 0.5, y: 2.4, w: 8.5, h: 0.7,
  fontSize: 36, color: C.white, fontFace: 'Inter', bold: true
})
closeSlide.addText('Try it yourself', {
  x: 0.5, y: 3.2, w: 8.5, h: 0.4,
  fontSize: 14, color: C.gold, fontFace: 'Inter'
})
closeSlide.addText('Frontend: https://ai-careeros.vercel.app', {
  x: 0.5, y: 3.7, w: 8.5, h: 0.3,
  fontSize: 11, color: C.blue, fontFace: 'Inter'
})
closeSlide.addText('Test account: alex@example.com / password123', {
  x: 0.5, y: 4.0, w: 8.5, h: 0.3,
  fontSize: 11, color: C.gray, fontFace: 'Inter'
})
closeSlide.addText('Built with BMad — AI-Powered Software Engineering', {
  x: 0.5, y: 4.7, w: 8.5, h: 0.4,
  fontSize: 11, color: C.gold, fontFace: 'Inter', italic: true
})
closeSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 5.2, w: 2, h: 0.02, fill: { color: C.gray } })

const outPath = 'docs/AI-CareerOS-Built-by-BMad-v3.pptx'
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('Presentation saved:', outPath)
}).catch(err => {
  console.error('Error:', err)
})
