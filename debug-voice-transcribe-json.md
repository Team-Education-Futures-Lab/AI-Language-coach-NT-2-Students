# Debug Session: voice-transcribe-json
- **Status**: [OPEN]
- **Issue**: In de voice coach verschijnt `Failed to execute 'json' on 'Response': Unexpected end of JSON input` en het lijkt alsof de stemopname niet goed wordt opgepikt.
- **Scope**: `VoiceCoachSession`, `/api/voice/transcribe`, lokale voice runtime
- **Goal**: Bewijzen waar de response leeg raakt en waarom de handsfree opname nu geen bruikbaar transcript oplevert.

## Reproduction
1. Open `/chat`
2. Start microfoonopname
3. Spreek een korte zin in
4. Wacht op auto-stop
5. Observeer JSON parse error en ontbrekend transcript

## Hypotheses
| ID | Hypothesis | Likelihood | Evidence |
|---|---|---:|---|
| A | `/api/voice/transcribe` geeft soms een lege body terug, waardoor `response.json()` in de client crasht | High | Pending |
| B | `MediaRecorder` levert een lege of onbruikbare blob op, waardoor de route faalt of niets terugstuurt | High | Pending |
| C | De client stopt te snel door silence-detectie, waardoor er nauwelijks audio wordt opgenomen | Medium | Pending |
| D | De Next route gooit server-side een fout voordat `NextResponse.json(...)` wordt teruggegeven | Medium | Pending |
| E | De fout komt eigenlijk uit een andere fetch in dezelfde beurtflow, bijvoorbeeld `/api/coach/session` | Medium | Pending |

## Evidence Log
Pending

## Conclusion
Pending
