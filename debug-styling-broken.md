[OPEN]

Session: styling-broken

Symptom:
- User reports: "mijn styling is kapot"

Hypotheses:
- A) `Bilingual` component changed inline layout into stacked/flex layout in places that cannot grow vertically.
- B) Recent navbar/dashboard/lessons patches introduced invalid wrapper elements for the design system.
- C) Hydration mismatch is causing DOM structure differences that visually break layout.
- D) A specific page/component has overflow/wrapping regressions from translated labels.
- E) Dev-server cache/hot reload left the browser on mixed old/new markup.

Plan:
- Collect runtime evidence in browser first.
- Identify the broken page/component.
- Apply minimal fix.
- Verify visually again.
