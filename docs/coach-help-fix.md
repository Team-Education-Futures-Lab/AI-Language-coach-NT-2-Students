# Exercise help and read-aloud fix

- Keep VoiceControls mounted outside the collapsible help tools. Folding the tools no longer stops playback or prevents new replies from being observed. The read-aloud toggle and speech errors stay visible. Active call/hangup controls remain visible when compact.
- Unlock the shared audio context during the user click/submit, before waiting for the AI response. Add a speech retry button for playback errors.
- An empty multiple-choice answer now stays empty rather than being converted by Number('') to the first option.
- Include the exercise focus in allowlisted coach context. Rotated grammar exercises use the focus rather than requiring a static ID for fallback hints.
- Prompt for concrete explanation of the current task, one different example where useful, and one specific next step. Remove the forced generic first hint. Keep answer keys out of context and preserve the answer-leak check.

Validation: 67 automated tests pass, including empty-choice handling, context allowlisting, rotated exercise hints and a structural regression test ensuring speech is not conditional on expanded tools. Production build and TypeScript checked. No live AI-response evaluation or physical audio listening was performed; provider quota, supported speech languages and browser autoplay restrictions still apply. No database/schema changes.
