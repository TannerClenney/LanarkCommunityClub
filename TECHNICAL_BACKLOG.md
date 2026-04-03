# Technical Backlog

## High Priority
- Fix forum consistency so newly created topics appear immediately without requiring a hard refresh.
- Add clear local environment setup documentation for Supabase + Prisma + auth (required variables, expected .env file usage, seed flow).
- Verify role-based access end-to-end (MEMBER, OFFICER, ADMIN) across login, protected routes, and admin pages.

## Medium Priority
- Implement real sticky topic destinations (actual topic pages and/or seeded sticky threads) instead of placeholder behavior.
- Tighten member onboarding flow for production readiness (current seeded test-user auth works, but onboarding is still local/test-oriented).
- Add a short login smoke-test checklist for local development after seed.

## Lower Priority
- Refine member navigation information architecture (labels, grouping, and route discoverability).
- Improve forum UX polish (loading states, empty states, post-submit feedback, and list update responsiveness).
- Add lightweight telemetry/logging around auth and forum actions to simplify debugging.

## Notes / Context
- Current priority is stable local testing with seeded users and role-based route behavior.
- Avoid expanding scope into full production onboarding systems until core member flows are reliable.
- Keep backlog intentionally lean for solo maintenance; prefer small, verifiable tasks over broad refactors.
