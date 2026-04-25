# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server
npm run build      # production build
npm run fetch      # pull latest Tonal workout data → src/data/sessions.json
npx tsx scripts/my-script.ts  # run a one-off TypeScript script
```

No test suite. No linter configured.

## Architecture

**Stack:** React 18 + Vite, Tailwind CSS, Recharts. No router — tab state lives in `window.location.hash`.

**Data flow:**
1. `npm run fetch` runs `scripts/fetch-sessions.ts`, which authenticates to the Tonal API via `@dlwiest/ts-tonal-client`, pulls `activityType === 'Internal'` workouts, merges them with `src/data/sessions.json` using a 3-level key strategy (activity ID → date+name → date only), and writes back. All manually-entered fields are preserved on merge.
2. `src/data/sessions.json` is the single source of truth — imported statically by `App.jsx` at build time. No runtime API calls in the UI.
3. `App.jsx` passes the full sessions array as a prop to every tab component. Components are pure consumers.

**`sessions.json` schema** — key fields per entry:
- `tonal_activity_id` — Tonal API ID; primary merge key. Multiple sessions on the same date are ordered chronologically and each has a unique ID.
- `total_volume`, `total_reps`, `time_under_tension`, `total_work_kj`, `duration` — populated by fetch script
- `pre_readiness` / `post_readiness` — muscle readiness maps (0–100); `pre_readiness` must be captured before the workout via `getMuscleReadiness()` — cannot be retrieved after. Post categories from app screenshot: Fresh ≈ 100, Recovering ≈ 50, Fatigued ≈ 15.
- `prs` — map of `movement_key → { weight, date }`; drives PRTracker and Notable PRs
- `calories`, `avg_hr`, `max_hr`, `energy_level`, `subjective_rating` — manual entry only (Tonal API does not expose these for machine workouts)
- `sweat` — text label: `dry` / `light` / `moderate` / `heavy`. Never a number.
- `shot_day` — boolean, true on GLP-1 injection days
- `functional_strength`, `movement_quality`, `movement_quality_delta` — from Tonal Goal Progress screen (manual entry)
- `strength_overall`, `strength_upper`, `strength_core`, `strength_lower` — from Tonal Strength Score screen (manual entry). Not stored in sessions.json — tracked in `StrengthScores.jsx` HISTORY array and Obsidian frontmatter.

**Tailwind design tokens** (defined in `tailwind.config.js`):
- `bg-surface-{0–3}` — dark background layers (0 = darkest)
- `text-accent` / `border-accent` — indigo-400 primary accent
- `card` and `label` are utility classes defined in `src/index.css`

**`Programs.jsx`** — static component; custom workout designs are hardcoded JSX, not derived from `sessions.json`. Edit directly to add/update workout templates.

**`Overview.jsx`** — contains hardcoded narrative text (`SESSION_NARRATIVES` keyed by `tonal_activity_id`, Recovery Arc events). Must be manually updated when new sessions are added. Lifetime Stats pulled live from `src/data/lifetime-stats.json`.

**`StrengthScores.jsx`** — `HISTORY` array is hardcoded with Tonal Strength Score snapshots (overall/upper/core/lower). Add a new entry after each session using values from the Strength Score screen in the Tonal app. Goals Progress chart (FS/MQ) is derived live from `sessions.json`.

## Tonal Workout Building

Before building any workout, read `TonalInstructions.md`. It contains movement UUIDs, the set object schema, block structure template, API quirks, and user training profile. Use the `/tonal-workout` Claude skill (`.claude/commands/tonal-workout.md`) for end-to-end workout creation.

All Tonal API work uses `@dlwiest/ts-tonal-client` via `npx tsx scripts/`. Credentials come from `.env`: `TONAL_EMAIL`, `TONAL_PASSWORD`, `OBSIDIAN_API_KEY`.
