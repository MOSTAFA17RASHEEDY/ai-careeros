---
title: 'Groq AI Integration with Multi-Agent System'
type: 'feature'
created: '2026-05-20'
status: 'in-review'
baseline_commit: f39e7eeb35d97f9bf5737599fe98096b85dab6c3
context:
  - 'backend/package.json'
  - 'backend/src/routes/chat.ts'
  - 'backend/src/routes/skills.ts'
  - 'backend/src/routes/resumes.ts'
  - 'backend/src/db/models.ts'
  - 'landing-page/src/lib/api.ts'
  - 'landing-page/src/pages/CareerCoach.tsx'
---

## Intent

**Problem:** Chat uses hardcoded mock replies, skill analysis is static, resume builder has no AI. The platform has zero real AI capabilities despite being an "AI CareerOS."

**Approach:** Integrate Groq API (free tier) with dual-model routing (Mixtral for speed, Llama-70b for depth), create specialized AI agents for each domain, and implement token-efficient context management to stay within free-tier quotas.

## Boundaries & Constraints

**Always:**
- Use `groq-sdk` npm package for API calls
- Dual-model: Mixtral-8x7b-32768 (fast, 30 req/min) for chat/simple tasks, Llama-3.3-70b (high quality) for deep analysis
- Limit conversation context to last 10 messages; summarize older ones if token budget exceeded (target: ≤4000 prompt tokens per request)
- All AI calls require auth middleware
- Handle rate limits gracefully (queue/backoff, user-friendly message on quota exhaustion)
- API key from `GROQ_API_KEY` env var

**Ask First:**
- Adding new frontend pages (InterviewPrep) — I'll keep it as a tab/section within existing pages unless you want a separate page

**Never:**
- No streaming responses in v1 (keep it simple for local testing)
- No storing AI responses in a separate DB collection (use existing Message model)
- No background cron jobs or webhook handlers

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | User sends message | AI responds via Groq within 3-5s | N/A |
| RATE_LIMITED | 30+ req/min on Mixtral | Queue and retry after 2s; if still limited, return "AI is warming up — try again shortly" | 429 caught, user-friendly message |
| QUOTA_EXCEEDED | Groq free tier exhausted | Fallback: "I've hit my daily AI usage limit. Your messages are saved and I'll respond once capacity is back." | Graceful degradation |
| EMPTY_CONTEXT | New conversation, no history | Agent responds with intro/greeting based on role | N/A |
| LONG_HISTORY | 50+ messages in conversation | Summarize oldest 40 into condensed context paragraph, keep last 10 verbatim | Token count check before API call |
| INVALID_KEY | `GROQ_API_KEY` missing/bad | Log warning, respond with "AI service is not configured" | 500→user-friendly |
| MODEL_DOWN | Groq API returns 5xx | Retry once with other model; both fail → friendly error | Failover to other model |

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Code Map

- `backend/src/services/ai.ts` -- NEW: Groq client, agent prompts, token management, model routing
- `backend/src/routes/chat.ts` -- MODIFY: Replace mock replies with real Groq via CareerCoach agent
- `backend/src/routes/ai.ts` -- NEW: Agent routes (resume-analysis, interview-prep, skill-gap)
- `backend/src/index.ts` -- MODIFY: Register new `/api/ai` routes
- `backend/src/db/models.ts` -- MODIFY: Add `agent` field to Message model
- `landing-page/src/lib/api.ts` -- MODIFY: Add AI agent API methods
- `landing-page/src/pages/CareerCoach.tsx` -- MODIFY: Agent selector UI, loading/error states
- `landing-page/src/pages/ResumeBuilder.tsx` -- MODIFY: Add AI analysis button
- `landing-page/src/pages/SkillGapAnalysis.tsx` -- MODIFY: Add AI recommendations
- `backend/.env` -- MODIFY: Add `GROQ_API_KEY=` entry

## Tasks & Acceptance

**Execution:**
- [x] `backend/src/services/ai.ts` -- Create Groq AI service with dual-model routing, token context management, and 4 agent system prompts (CareerCoach, ResumeCoach, InterviewPrep, SkillGapAnalyst)
- [x] `backend/src/routes/chat.ts` -- Replace mock reply array with Groq CareerCoach agent call; add agent type to request body
- [x] `backend/src/routes/ai.ts` -- Create dedicated endpoint `POST /api/ai/agent` for resume analysis, interview prep, skill gap
- [x] `backend/src/db/models.ts` -- Add optional `agent` string field to Message schema
- [x] `backend/src/index.ts` -- Register `aiRoutes` at `/api/ai`
- [x] `backend/.env` -- Add `GROQ_API_KEY=your_groq_api_key_here` comment line
- [x] `backend/package.json` -- Add `groq-sdk` dependency
- [x] `landing-page/src/lib/api.ts` -- Add `ai.agent()` and `ai.chat()` API methods
- [x] `landing-page/src/pages/CareerCoach.tsx` -- Add agent type selector dropdown, loading spinner, error display
- [x] `landing-page/src/pages/ResumeBuilder.tsx` -- Add "AI Analyze Resume" button calling resume coach agent
- [x] `landing-page/src/pages/SkillGapAnalysis.tsx` -- Add "AI Recommendations" button calling skill gap agent

**Acceptance Criteria:**
- Given a user sends a chat message, when the CareerCoach agent is selected, then the response comes from Groq Mixtral model with career advice within 5 seconds
- Given a user selects ResumeCoach agent, when they paste resume content and click analyze, then the response contains specific improvement suggestions
- Given Groq rate limit is hit, when any request is made, then a friendly "AI is warming up" message is shown (not a crash)
- Given a conversation has 50+ messages, when a new message is sent, then only the last 10 messages + a summary of older ones is sent to the API
- Given an invalid API key, when any AI request is made, then the user sees "AI service not configured" not a server error

## Design Notes

**Context Management Strategy:**
- Keep last 10 messages verbatim
- If total characters > 12000 (≈3000 tokens), summarize messages 1..N-10 into a single condensed paragraph prepended as "Previous conversation summary: ..."
- Summarization uses Mixtral (cheaper) with a "Condense the following chat history into 2-3 sentences preserving key facts:" system prompt

**Model Routing:**
- CareerCoach (chat): Mixtral (fast, 30 req/min) — users expect quick responses in chat
- ResumeCoach (analysis): Llama-3.3-70b (deep analysis)
- InterviewPrep: Mixtral (conversational)
- SkillGapAnalyst: Llama-3.3-70b (analytical)
- Context summarization: always Mixtral (cheap)

**Groq Free Tier Limits:**
- Mixtral-8x7b-32768: 30 req/min, 500K tokens/day (shared pool)
- Llama-3.3-70b: 30 req/min, 500K tokens/day (shared pool)
- We track via simple in-memory counter + reset timer per model

## Verification

**Commands:**
- `cd backend && npm run dev` -- expected: server starts, Groq client initialized (log message)
- `curl -X POST http://localhost:3001/api/chat/messages -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d "{\"conversationId\":\"...\",\"text\":\"Hello\"}"` -- expected: real AI response, not mock
- `curl -X POST http://localhost:3001/api/ai/agent -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d "{\"agent\":\"resume-coach\",\"content\":\"My resume...\"}"` -- expected: AI analysis response

**Manual checks:**
- Start backend, send a chat message, verify response is meaningful and not from the mock array
- Test with wrong API key → verify graceful error message
- Open CareerCoach page, select different agents, verify each responds in character
