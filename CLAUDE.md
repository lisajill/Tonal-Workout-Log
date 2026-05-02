# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server
npm run build        # production build
npm run fetch        # pull latest Tonal workout data → src/data/sessions.json
npm run import-zone2 # import Zones for Training JSON exports → src/data/zone2_log.json
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
- `timestamp` — ISO 8601 from Tonal's `localTimestamp`. **Always sort by `timestamp ?? date`, never by array position or date string alone.** Same-day sessions have different timestamps (e.g. warmup at 09:43, main session at 09:45) and date-only sorting will get the order wrong.
- `total_volume`, `total_reps`, `time_under_tension`, `total_work_kj`, `duration` — populated by fetch script
- `pre_readiness` / `post_readiness` — muscle readiness maps (0–100). `pre_readiness` must be captured before the workout. **`post_readiness`: use the `mcp__tonal-strength__get_readiness` MCP tool immediately after the workout** — it returns exact percentages per muscle group. The TypeScript client's raw API endpoint (`/users/{uid}/muscle-readiness`) returns 404 and does not work. Capture post_readiness right away; it reflects current state and will decay. App screenshot categories are only a last resort: Fresh ≈ 100, Recovering ≈ 50, Fatigued ≈ 15.
- `movements` — array of `{ name, warmup_sets, warmup_prs?, sets: [{ reps, weight_lbs, prs? }] }`. Auto-populated by `npm run fetch` via the raw `/users/{uid}/workout-activities/{id}` endpoint (not exposed by ts-tonal-client; accessed via `(client as any).httpClient`). Only fetched for sessions missing `movements`. Per-set PR flags (`prs: ["strength","power"]`) are added manually after each session. **API weight caveat:** for dual-cable movements (e.g. Barbell Hip Thrust), the API's `baseWeight` is per-cable — half the weight displayed in the Tonal app. Always cross-check movement weights against app screenshots; store the app-displayed (total) weight in sessions.json, not the raw API value.
- `prs` — map of `movement_key → { weight, date }`; drives PRTracker and Session Log PR display
- `calories`, `avg_hr`, `max_hr`, `energy_level`, `subjective_rating` — manual entry only (Tonal API does not expose these for machine workouts). **Exception: `avg_hr` is available in `zone2_log.json` for any Tonal session exported via the Zones app** — check there first instead of asking for a screenshot. `max_hr` is not in zone2_log and still requires a screenshot. Note: Zones avg_hr may differ slightly from the Tonal app's reading (Zones may exclude rest periods).
- `sweat` — text label: `dry` / `light` / `moderate` / `heavy`. Never a number.
- `shot_day` — boolean, true on GLP-1 injection days
- `notes` — free text for session observations: form issues, pain/discomfort, fatigue, anything worth tracking. Always populate when there's something notable. Displayed in amber in the Session Log.
- `functional_strength`, `movement_quality`, `movement_quality_delta` — from Tonal Goal Progress screen (manual entry)
- `strength_overall`, `strength_upper`, `strength_core`, `strength_lower` — from Tonal Strength Score screen (manual entry). Stored in both sessions.json and Obsidian frontmatter. Also add a new entry to the `HISTORY` array in `StrengthScores.jsx` after each session.

**Tailwind design tokens** (defined in `tailwind.config.js`):
- `bg-surface-{0–3}` — dark background layers (0 = darkest)
- `text-accent` / `border-accent` — indigo-400 primary accent
- `card` and `label` are utility classes defined in `src/index.css`

**Session linking** — URL hash format is `#sessions:TONAL_ACTIVITY_ID`. `App.jsx` parses this on load via `parseHash()`. The session picker in `SessionDetail` updates the hash on change. Use this to share/bookmark a specific session.

**`Programs.jsx`** — still exists and exports `PROGRAMS`, but has no nav tab. Custom workout designs are hardcoded here; the Custom Workouts tab was removed. Movements are now stored per-session in `sessions.json` and displayed inline in `SessionDetail`.

**`Overview.jsx`** — contains hardcoded narrative text (`SESSION_NARRATIVES` keyed by `tonal_activity_id`, Recovery Arc events). Must be manually updated when new sessions are added. Lifetime Stats pulled live from `src/data/lifetime-stats.json`.

**`StrengthScores.jsx`** — `HISTORY` array is hardcoded with Tonal Strength Score snapshots (overall/upper/core/lower). Add a new entry after each session using values from the Strength Score screen in the Tonal app. Goals Progress chart (FS/MQ) is derived live from `sessions.json`.

**Cardio tracking:**
- `src/data/zone2_log.json` — all cardio sessions from Zones for Training exports. Walking auto-exports via Shortcut → GitHub Actions (`pending/workout.json` → import script → zone2_log.json push). Tonal and other activity types are exported manually from the Zones app.
- `scripts/import-zone2.ts` — deduplicates by UUID, labels Tonal source as "Tonal", writes zone2_log.json. Each entry includes `timestamp` (from `startDate`). **Always sort by `timestamp ?? date`.**
- `src/components/CardioTracker.jsx` — cardio dashboard (zone breakdown, HR trend, session log). Tracking began Apr 19, 2026.
- Zone 2 = 108–125 bpm (Fat Burn zone). Weekly target: 150 min per Rhonda Patrick protocol.
- Weeks run **Sunday–Saturday**. `getWeekStart()` uses local date parts (not `new Date('YYYY-MM-DD')` which parses UTC and breaks in negative-offset timezones).
- **Summary cards** ("This Week Z2", "This Week Total") use a **rolling 7-day window**. "This Week Total" is all-zone duration (not just Z2) — always show "all zones" in the subtitle to avoid confusion with the Z2-only "All-Time Z2" card.
- **Session Log** groups by **calendar week (Sun–Sat)**. Current week is always expanded; prior weeks collapse to a summary header and expand on click.
- Walking sessions excluded from readiness model (no soreness unless 25k+ steps).
- Vest walks are **always explicitly labelled** by the user (e.g. notes: "12 lb weighted vest"). Outdoor walks without a vest label are plain walks — never assume vest.
- Tonal sessions appear in zone2_log only when manually exported from Zones for Training. They won't appear automatically from `npm run fetch`.

**Nav structure** — single-tab groups render as direct links, multi-tab groups render as dropdowns. Add new tabs to `TAB_GROUPS` in `App.jsx`.

## Tonal Workout Building

Before building any workout, read `TonalInstructions.md`. It contains movement UUIDs, the set object schema, block structure template, API quirks, and user training profile. Use the `/tonal-workout` Claude skill (`.claude/commands/tonal-workout.md`) for end-to-end workout creation.

All Tonal API work uses `@dlwiest/ts-tonal-client` via `npx tsx scripts/`. Credentials come from `.env`: `TONAL_EMAIL`, `TONAL_PASSWORD`, `OBSIDIAN_API_KEY`.
