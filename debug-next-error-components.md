[OPEN]

Session: next-error-components

Symptom:
- Browser shows: "Invariant: missing bootstrap script. This is a bug in Next.js"
- Browser shows: "missing required error components, refreshing..."

Evidence (runtime):
- `GET /_error` returns 302 (redirect), meaning middleware blocks Next’s internal error route.

Hypotheses:
- A) Middleware intercepts Next internal error routes (/_error, /_not-found), causing Next to fail rendering error fallback and show "missing required error components".
- B) Some _next chunk requests return non-200 (network/cache), causing missing bootstrap script.
- C) Hydration mismatch is treated as fatal due to missing fallback error route.
- D) Dev server restart / cache corruption causes inconsistent manifests.

Fix plan:
- Exclude Next internal error routes from middleware auth redirects.

