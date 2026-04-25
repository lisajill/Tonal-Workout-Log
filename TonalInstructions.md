# Tonal Instructions
*Reference this document before building any workout. Updated as new information is discovered.*

---

## Rules Before Building Any Workout

1. **Always show the full workout to the user before calling `createWorkout`.** Present it as a table with blocks, sets, reps, and notes. Wait for explicit approval.
2. **Always check muscle readiness before the session** (`getMuscleReadiness()`). Write pre_readiness to the Obsidian session note frontmatter immediately — it cannot be retrieved after the workout.
3. **Always use the TypeScript client (`tsx scripts/`)**, not the MCP. The MCP is a limited abstraction; the TS client has full API access.

---

## User Training Profile

- **Goal priority:** Strength first, hypertrophy as byproduct — never chase hypertrophy separately
- **Rep range:** 3–5 reps for working sets (strength), 5–8 for warmup/calibration sets
- **Load:** Very high relative load. Push hard for working sets.
- **Set count:** 3 working sets per exercise (bored at 4)
- **Programming rule from goals doc:** "Strength = 3–6 reps, high relative load, compound movements prioritized"
- **No drop sets** under any circumstances
- **Smart Flex:** ON for all working blocks (`flex: true` in API). OFF for warmup sets.
- **No squats, no lunges** — right knee injury (sharp pain on downward phase)
- **Monitor Standing Leg Extension** carefully — discomfort noted at 26–27 lbs
- **Current constraint:** Hands-free lower body only (both hands post-op). Right hand ~week 7+ post-op Apr 18. Left hand cleared of infection ~Apr 14.

---

## Workout Design Principles

- **Order:** Compounds first, then bilateral isolation, then unilateral isolation
- **Patterns to vary:** Hip extension, knee flexion, hip abduction — do not double up the same pattern in one session
- **Rests between exercises:** 2 minutes after compounds, 90 seconds between isolation movements
- **Rests between sets within a block:** Tonal handles automatically (built-in rest timer). No need to add explicit rest sets within a block.
- **Warmup set:** Include 1 warmup set (`warmUp: true`, `flex: false`) for the compound anchor only
- **Smart Flex note:** Set `flex: true` on all working sets. This enables Smart Flex via the API — no need to toggle manually on screen.

---

## Equestrian Return Priorities
*Returning to riding in ~4–6 weeks from Apr 2026. These movements are highest priority:*

- **Hip abduction** — lateral stability, independent seat, no knee compression
- **Unilateral hamstring curl** — addresses right hip instability (R weaker than L)
- **Glute bridge** — hip extension power for transitions and posting trot
- **Single-leg stance movements** — balance and proprioception for seat symmetry

**Known imbalances:** Right hip stability weaker than left. Left adductors weaker than right.

---

## Available Hands-Free Lower Body Movements

### Ankle Strap (on-machine)

| Movement | ID | Muscles | Pattern |
|---|---|---|---|
| Prone Bench Hamstring Curl | `bb513dfe-19c8-4490-bfc8-d8e71b81b52a` | Hamstrings | Knee flexion, bilateral |
| Prone Bench Single Leg Hamstring Curl | `752e2f27-11d5-4758-801d-f030ac5eac7c` | Hamstrings | Knee flexion, unilateral |
| Standing Diagonal Glute Kickback | `7b635e41-d9d1-475b-b4a6-e2779fce5fb1` | Glutes | Hip extension + lateral |
| Standing Donkey Kick | `029ea28e-328b-422e-a410-f1a8fc39c324` | Glutes, Hamstrings | Hip extension |
| Standing Hip Abduction | `9bb67ac6-735c-4830-b2af-d3c0945892b3` | Glutes | Abduction, lateral stability |
| Standing Leg Extension | `61ff8f2b-f821-4078-a36f-67e540c8b694` | Quads | Knee extension — monitor right knee |
| Standing Single Leg Hamstring Curl | `27b7f142-837d-4ecf-93dd-7c13269106df` | Hamstrings, Glutes | Knee flexion, unilateral |
| Standing Straight Leg Glute Kickback | `05b255f5-89a9-4e1c-819d-0bfa7bab2e27` | Glutes | Hip extension |

> **Note:** Quadruped Donkey Kick (`daa55e45`) requires hands and knees — NOT hands-free. Exclude.

> **Note:** Adductors are not a tracked muscle group in Tonal's catalog. No ankle strap adduction movement exists. Adductor work must happen off-Tonal.

### Compound (on-machine, hands-free)

| Movement | ID | Muscles | Accessories | Notes |
|---|---|---|---|---|
| Barbell Lying Glute Bridge | `b686f885-427c-4e64-9aa3-4b485c82678e` | Glutes, Hamstrings | Roller, Mat | Floor version — barbell rests on hips, hands-free ✓. **Smart Flex overshoots** — proposed 132 lbs on Apr 25 (unbudgeable). Working range was 100–120 lbs. Always start warmup manually at ~75 lbs and adjust before Smart Flex takes over. |
| Barbell Hip Thrust | `d44826e1-f6b3-4bed-9d6f-8456d9cde3ec` | Glutes, Hamstrings | Bench, Roller | **Bench slides** — fixed with yoga mat under bench + weight plates behind legs. Tested Apr 25: held through 65 lbs working set. Find the right bench distance from machine before loading. |
| Resisted Glute Bridge | `93457225-18db-41bc-974e-e874fb4d07d1` | Glutes, Abs, Hamstrings | Mat | Uses **handles** — NOT hands-free. Exclude. |

---

## Special Movement IDs

| Movement | ID | Notes |
|---|---|---|
| Rest | `00000000-0000-0000-0000-000000000005` | Use `prescribedDuration` (seconds), not `prescribedReps` |

---

## API Quirks

- **`totalWork` is in joules**, not kJ. Divide by 1000 for kJ.
- **`localTimestamp` is only populated for Internal (Tonal) activities.** External (Apple Watch) activities have `localTimestamp: "0001-01-01T00:00:00Z"`. Use `timestamp` for external activities.
- **`activityType === 'Internal'`** filters to Tonal machine workouts. External = Apple Watch, walking, etc.
- **`getActivitySummaries()` returns max 50 entries** across all activity types — mostly Apple Watch entries. Only ~4 Tonal workouts visible in recent history.
- **`calories` and heart rate** are NOT available in activity summaries for Tonal workouts. Manual entry only.
- **`name` field on activities** may differ from manually-entered workout names (e.g. API returns "Hands Free", manual was "Hands Free Lower Body"). Merge by `tonal_activity_id` first, then `date::workout`, then `date` only.

---

## Set Object Structure

```typescript
{
  blockStart: boolean,      // true for first set of each block
  movementId: string,       // movement UUID
  prescribedReps?: number,  // for rep-based exercises
  prescribedDuration?: number, // for time-based (Rest, holds) — in seconds
  dropSet: false,           // always false
  repetition: number,       // set number (1-based)
  repetitionTotal: number,  // total sets in this block
  blockNumber: number,      // block number (increments per block)
  burnout: false,
  spotter: false,
  eccentric: false,
  chains: false,
  flex: boolean,            // Smart Flex — true for working sets, false for warmup/rest
  warmUp: boolean,          // true for warmup sets only
  weightPercentage: 100,    // 100 for working sets, 0 for rest
  setGroup: 1,
  round: number,            // same as repetition
  description: '',
}
```

---

## Block Structure Template

```
Block 1: Warmup set (1×5, warmUp: true, flex: false)
Block 2: Working sets (3×5, warmUp: false, flex: true)
Block 3: Rest (2 min after compound)
Block 4: Isolation A — working sets (3×4, flex: true)
Block 5: Rest (90s)
Block 6: Isolation B — working sets (3×4, flex: true)
Block 7: Rest (90s)
Block 8: Isolation C — working sets (3×4, flex: true)
```

---

## Session Note Workflow

1. **Before workout:** Call `getMuscleReadiness()`. Write to Obsidian session note frontmatter at:
   `Health & Wellness/Tonal/Sessions/YYYY-MM-DD Workout Name.md`
2. **After workout:** Run `npm run fetch` to pull API data (volume, reps, TUT, kJ) into sessions.json. Manually fill in: `energy_level`, `subjective_rating`, `sweat`, `avg_hr`, `max_hr`, `calories`, `post_readiness`, `prs`, `muscles_high_volume`, `muscles_low_volume`, `functional_strength`, `movement_quality`, `movement_quality_delta`, `strength_overall/upper/core/lower`.
   - **post_readiness**: capture from the Tonal app's Muscle Readiness screen immediately after. If only categories are visible (not exact %), use: Fresh ≈ 100, Recovering ≈ 50, Fatigued ≈ 15.
   - **sweat scale**: use text labels — `dry`, `light`, `moderate`, `heavy`. Never use numbers.
   - **FS/MQ**: from Goal Progress screen (Focus Area + Interests tabs).
   - **Strength scores**: from the Strength Score screen (Overall + region breakdown).
   - **TUT and density**: these metrics are lower when proper rest is taken between sets. Do not compare density across sessions without noting whether structured rest was used. Structured rest (2 min post-compound, 90s between isolations) is correct protocol — lower density is not lower effort.
   - **Multiple sessions same day**: each gets its own sessions.json entry keyed by `tonal_activity_id`. Order chronologically (first session first). Free Lift sessions appear as separate API activities.

### Session Note Frontmatter Template

```yaml
---
date: YYYY-MM-DD
workout: "Workout Name"
tonal_workout_id: <uuid>
tonal_activity_id: <uuid>
shot_day: false
phase: active | recovery
energy_level: null
subjective_rating: null
sweat: null        # dry | light | moderate | heavy
duration: null
total_volume: null
total_reps: null
time_under_tension: null
total_work_kj: null
calories: null
avg_hr: null
max_hr: null
strength_overall: null
strength_upper: null
strength_core: null
strength_lower: null
pre_readiness:
  glutes: <value>
  hamstrings: <value>
  quads: <value>
  calves: <value>
  abs: <value>
  obliques: <value>
  back: <value>
  chest: <value>
  shoulders: <value>
  biceps: <value>
  triceps: <value>
post_readiness:
  glutes: null
  hamstrings: null
  quads: null
  calves: null
  abs: null
  obliques: null
  back: null
  chest: null
  shoulders: null
  biceps: null
  triceps: null
functional_strength: null
movement_quality: null
movement_quality_delta: null
prs: {}
muscles_high_volume: []
muscles_low_volume: []
---
```

---

## Obsidian API

- Base URL: `https://127.0.0.1:27124`
- Auth: `Authorization: Bearer <OBSIDIAN_API_KEY>` (from `.env`)
- SSL: `--insecure` (self-signed cert)
- Read file: `GET /vault/<path>`
- Write file: `PUT /vault/<path>` with `Content-Type: text/markdown`
- List folder: `GET /vault/<folder>/`

---

## Authentication

```typescript
import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL,  // note: TONAL_EMAIL not TONAL_USERNAME
  password: process.env.TONAL_PASSWORD,
})
```

Run scripts with: `npm run fetch` or `npx tsx scripts/my-script.ts`
