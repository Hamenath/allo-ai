# ALLO — Product Debt Register

**Last Updated:** 2026-08-09  
**Owner:** Product Team  
**Review cadence:** Monthly

> This document tracks known UX, technical, AI quality, content, billing, and documentation debt for the ALLO platform. Items are classified by priority and should be resolved in order.

---

## CRITICAL

| Area | Issue | Notes |
|------|-------|-------|
| Content | Landing page `[Dashboard Preview]` placeholder replaced with live tool card grid | Fixed in Phase 26 |
| Content | Unsubstantiated social proof copy `"Join thousands of professionals..."` replaced | Fixed in Phase 26 |
| UI | Contact page used hardcoded dark `bg-slate-950` palette, ignoring global theme system | Fixed in Phase 26 |

---

## HIGH

| Area | Issue | Notes |
|------|-------|-------|
| AI Quality | No per-tool retry strategy — all retries use the same exponential backoff | Implement tool-specific error messages rather than generic "try again" |
| Billing | Razorpay Webhook retry needs idempotency guard surfaced in UI if webhook is replayed | Webhook handler logs replays; UI does not yet surface a recoverable state |
| UX | LinkedIn Post Generator (`/tools/linkedin`) route ID in tools registry is `linkedin-generator` but UI links to `/tools/linkedin` | ID mismatch may cause history lookups to return 0 results for this tool |
| Onboarding | No guided first-generation flow for new users — dashboard relies entirely on empty state copy | A one-time "generate your first result" nudge would improve activation |
| Mobile | `/billing` page upgrade card layout can be horizontally cramped on 375px due to long feature list items | Needs responsive grid adjustment for small viewports |

---

## MEDIUM

| Area | Issue | Notes |
|------|-------|-------|
| AI Quality | Gemini `temperature: 0.2` is globally fixed — some creative tools (LinkedIn post, Social Calendar) may benefit from higher temperature | Consider per-tool temperature configuration |
| UX | History search is client-side on already-loaded documents only, not server-side full-text search | For high-volume users, search quality degrades. Firestore doesn't support full-text; would need Algolia or similar |
| UX | Tool icons in the tool directory use different Lucide icons for the same purpose (Briefcase for Career, Cover Letter, and Job Description simultaneously) | Standardize one icon per tool, not one per category |
| AI Cost | Meeting Summarizer accepts 25,000 character transcripts — this generates expensive long-context requests | Add client-side character count warning and recommend truncation above 10,000 chars |
| Admin | Admin user list is capped at 100 users with no pagination | Add cursor-based pagination to `/api/admin/users` |
| Data | `DocumentWorkspace` history empty state does not contain a direct link to `/tools` | Add "Explore AI Tools" CTA link to empty state |
| UX | `study-planner` form has 14 input fields — users may feel overwhelmed before generating anything | Group fields into collapsible "Advanced Options" section |
| Content | Legal pages (`/privacy`, `/terms`, etc.) use a dark card style inconsistent with the rest of the app | These pages should match the global theme like `/contact` was fixed |

---

## LOW

| Area | Issue | Notes |
|------|-------|-------|
| Documentation | `docs/` directory has no index or table of contents | Add `docs/README.md` linking all doc files |
| Analytics | No product analytics events are currently tracked | Implement basic `signup`, `tool_open`, `generation_completed`, `upgrade_started` events |
| Performance | Tool list in `/dashboard` and `/tools` is duplicated in two separate arrays, not imported from the registry | Consolidate into a shared list derived from `toolsRegistry` |
| UX | No keyboard shortcut legend anywhere in the app beyond `⌘K` in the search box | Add Ctrl+K shortcut hint in global footer or settings |
| Billing | Pro plan feature "Priority AI processing speed" is not currently implemented in the AI service layer | Either remove this claim or implement request prioritization |

---

## Documentation Debt

| Doc | Status | Notes |
|-----|--------|-------|
| `docs/database.md` | ✅ Complete | Phase 20 |
| `docs/environment.md` | ✅ Complete | Phase 23 |
| `docs/deployment.md` | ✅ Complete | Phase 23 |
| `docs/production-runbook.md` | ✅ Complete | Phase 24 |
| `docs/disaster-recovery.md` | ✅ Complete | Phase 23 |
| `docs/product-review.md` | ✅ Complete | Phase 26 |
| `docs/product-debt.md` | ✅ Complete | Phase 26 |
| `docs/README.md` (index) | ❌ Missing | Create post-launch |
| API documentation | ❌ Missing | Internal API routes are undocumented |
| Admin user guide | ❌ Missing | Required before onboarding support staff |
