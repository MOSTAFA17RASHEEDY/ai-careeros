---
title: Backend API — Node.js + Express + SQLite
type: 'feature'
created: '2026-05-19'
status: 'done'
baseline_commit: 'NO_VCS'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app pages render mock data. There's no persistence, no API, and no actual data flow. Users can't save resumes, continue coaching conversations, or track skill progress across sessions.

**Approach:** Build a REST API backend using Node.js + Express + TypeScript + SQLite (better-sqlite3). Create endpoints for all four app areas: dashboard stats, resume CRUD, coaching conversations, and skill gap analysis. Seed the database with realistic mock data so the frontend can connect immediately.

## Boundaries & Constraints

**Always:**
- Backend lives in a `backend/` directory at project root (separate from `landing-page/`)
- TypeScript throughout, strict mode
- SQLite via `better-sqlite3` — synchronous API, no async DB overhead
- RESTful API design with JSON responses
- CORS enabled for `http://localhost:5173` (Vite dev server)
- All endpoints prefixed with `/api/`
- Database file stored at `backend/data/careeros.db`
- Seed script to populate initial mock data
- Standard HTTP status codes (200, 201, 400, 404, 500)

**Ask First:**
- Adding authentication/authorization middleware (comes in next phase)
- Adding additional databases or external services
- Changing the database from SQLite to something else
- Adding rate limiting or caching layers

**Never:**
- No user authentication yet (that's the next phase)
- No external AI API calls — coaching responses are simulated
- No file uploads
- No WebSocket connections
- No production deployment configuration

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Returns dashboard stats and recent activity |
| GET | `/api/resumes` | List all resumes |
| POST | `/api/resumes` | Create a new resume |
| GET | `/api/resumes/:id` | Get resume details |
| PUT | `/api/resumes/:id` | Update resume |
| DELETE | `/api/resumes/:id` | Delete resume |
| GET | `/api/chat/conversations` | List conversations |
| GET | `/api/chat/conversations/:id` | Get messages for a conversation |
| POST | `/api/chat/messages` | Send a message (returns simulated coaching reply) |
| GET | `/api/skills` | Get current skills |
| POST | `/api/skills/analyze` | Analyze skill gap for a target role |

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| GET resumes | N/A | Array of all resumes (id, title, target, score, versions, updated) | 500 on DB error |
| POST resume | `{ title, target }` | Created resume object with generated ID | 400 if missing fields |
| GET resume by ID | `:id` param | Single resume object with full data | 404 if not found |
| DELETE resume | `:id` param | 204 No Content | 404 if not found |
| POST chat message | `{ conversationId, text }` | Message object + simulated AI reply | 400 if missing fields |
| POST skill analyze | `{ targetRole }` | Array of skills with current vs required levels | 400 if missing targetRole |
| GET dashboard stats | N/A | Stats object + recent activity array | 500 on DB error |

</frozen-after-approval>

## Code Map

- `backend/package.json` — Dependencies: express, better-sqlite3, cors, tsx, typescript
- `backend/tsconfig.json` — TypeScript strict config
- `backend/src/index.ts` — Express app entry point, CORS, routes
- `backend/src/db/schema.ts` — Database initialization (create tables)
- `backend/src/db/seed.ts` — Seed mock data
- `backend/src/routes/dashboard.ts` — GET /api/dashboard/stats
- `backend/src/routes/resumes.ts` — CRUD /api/resumes
- `backend/src/routes/chat.ts` — GET/POST /api/chat/*
- `backend/src/routes/skills.ts` — GET/POST /api/skills/*

## Tasks & Acceptance

**Execution:**
- [x] `backend/package.json` — Initialize project with dependencies
- [x] `backend/tsconfig.json` — TypeScript config
- [x] `backend/src/db/schema.ts` — Create tables: resumes, conversations, messages, skills, activity_log
- [x] `backend/src/db/seed.ts` — Populate with realistic mock data matching frontend expectations
- [x] `backend/src/routes/dashboard.ts` — Stats + recent activity endpoints
- [x] `backend/src/routes/resumes.ts` — Full CRUD for resumes
- [x] `backend/src/routes/chat.ts` — Conversations list, messages list, send message with simulated AI reply
- [x] `backend/src/routes/skills.ts` — Get skills, analyze gap for target role
- [x] `backend/src/index.ts` — Wire everything together, CORS, error handling

**Acceptance Criteria:**
- Given the backend server is running (`npm run dev`), when I `curl http://localhost:3001/api/dashboard/stats`, then I get JSON with stats and recent activity
- Given the backend has seeded data, when I `curl http://localhost:3001/api/resumes`, then I get an array of resume objects
- Given I POST to `/api/chat/messages` with `{ conversationId, text }`, then I get back both my message and a simulated AI response
- Given I POST to `/api/skills/analyze` with `{ targetRole }`, then I get back a skills array with current vs required levels

## Verification

**Commands:**
- `cd backend && npm run dev` — starts dev server on port 3001
- `cd backend && npm run seed` — seeds the database
- `curl http://localhost:3001/api/dashboard/stats` — returns JSON

