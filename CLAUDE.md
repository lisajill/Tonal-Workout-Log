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
- `pre_readiness` / `post_readiness` — muscle readiness maps (0–100). `pre_readiness` must be captured before the workout. **`post_readiness`: run `npx tsx scripts/get-readiness.ts` immediately after the workout** — it hits the raw API endpoint `/users/{uid}/muscle-readiness/current` (note the `/current` suffix — without it, the endpoint 404s) via `(client as any).httpClient` and returns exact percentages for all 11 muscle groups. The `mcp__tonal-strength__get_readiness` MCP tool is an alternative if connected in the current environment, but the TypeScript script is self-contained and doesn't depend on an MCP server being available. Capture post_readiness right away; it reflects current state and will decay. App screenshot categories are only a last resort: Fresh ≈ 100, Recovering ≈ 50, Fatigued ≈ 15.
- `movements` — array of `{ name, warmup_sets, warmup_prs?, sets: [{ reps, weight_lbs, duration_sec?, prs? }] }`. Auto-populated by `npm run fetch` via the raw `/users/{uid}/workout-activities/{id}` endpoint (not exposed by ts-tonal-client; accessed via `(client as any).httpClient`). Only fetched for sessions missing `movements`. Per-set PR flags (`prs: ["strength","power"]`) are added manually after each session. `duration_sec` is populated by fetch from `prescribedDuration` for timed sets (Rest blocks, holds); displayed as `Xs` in SessionDetail instead of rep count. **API weight caveat:** for dual-cable movements (e.g. Barbell Hip Thrust, Barbell Lying Glute Bridge), the API's `baseWeight` is per-cable — half the weight displayed in the Tonal app. Always cross-check movement weights against app screenshots; store the app-displayed (total) weight in sessions.json, not the raw API value.
- `prs` — map of `movement_key → { weight, date }`; drives PRTracker and Session Log PR display
- `merged_into` — optional `tonal_activity_id` string. When set, this session is considered absorbed into the named session (e.g. a short Free Lift folded into the main workout). `App.jsx` filters these out before passing sessions to any component: `const sessions = rawSessions.filter(s => !s.merged_into)`. The next `npm run fetch` preserves custom fields so merged sessions won't reappear.
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
- `src/data/zone2_log.json` — all cardio sessions from Zones for Training exports. Walking auto-exports via Shortcut → GitHub Actions (`pending/workout.json` → import script → zone2_log.json push). Tonal, Hydrow, and other activity types are exported manually from the Zones app.
- `scripts/import-zone2.ts` — deduplicates by UUID, labels Tonal source as "Tonal", maps Hydrow source → "Rowing", writes zone2_log.json. Each entry includes `timestamp` (from `startDate`). **Always sort by `timestamp ?? date`.**
- `src/components/CardioTracker.jsx` — cardio dashboard (zone breakdown, HR trend, session log). Tracking began Apr 19, 2026. Session log sorted **descending** (most recent first) by `timestamp ?? date`. Distance column shows `{n}mi` for walking/running or `{n}m` for rowing.
- `src/components/RowingTracker.jsx` — standalone Rowing tab. Summary cards (sessions, total km, best split, best watts), trend charts (split /500m, avg peak power, distance — render once 2+ sessions exist), session log table (date, program, dist, split, watts, SPM, avg HR). Reads `zone2_log.json` directly, filters `activity === 'Rowing'`.
- Zone 2 = 108–125 bpm (Fat Burn zone). Weekly target: 150 min per Rhonda Patrick protocol.
- Weeks run **Sunday–Saturday**. `getWeekStart()` uses local date parts (not `new Date('YYYY-MM-DD')` which parses UTC and breaks in negative-offset timezones).
- **Summary cards** ("This Week Z2", "This Week Total") use the **current calendar week (Sun–Sat)**, same as the session log grouping. "This Week Total" is all-zone duration (not just Z2) — always show "all zones" in the subtitle to avoid confusion with the Z2-only "All-Time Z2" card.
- **Session Log** groups by **calendar week (Sun–Sat)**. Current week is always expanded; prior weeks collapse to a summary header and expand on click.
- Walking sessions excluded from readiness model (no soreness unless 25k+ steps).
- Vest walks are **always explicitly labelled** by the user (e.g. notes: "12 lb weighted vest"). Outdoor walks without a vest label are plain walks — never assume vest.
- Tonal sessions appear in zone2_log only when manually exported from Zones for Training. They won't appear automatically from `npm run fetch`.
- **Hydrow rowing sessions** — exported manually from Zones app as JSON (source: "Hydrow", activity type 35). Import script maps to activity "Rowing". Rowing entries carry extra fields: `rowing_program`, `rowing_distance_m`, `rowing_duration_min`, `rowing_avg_split`, `rowing_stroke_rate_spm`, `rowing_avg_watts`. Drag is fixed at 104 — not tracked. Use `/hydrow` skill to log. A short follow-on session (≤5 min, lower avg HR, starts within 15 min of main) is a cooldown — confirm before merging. Cooldown JSONs go in `Zone2Sessions/merged/` after merging. **Never confuse Tonal sessions (source: "Tonal", type 50) with Hydrow sessions (source: "Hydrow", type 35)** — always check source field before labelling.
- `src/components/Charts.jsx` — Tonal charts (volume, density, HR, calories, rating, reps, duration/TUT) followed by a Rowing section (split /500m, avg peak power, distance). Rowing section only renders when rowing data exists.

**Nav structure** — single-tab groups render as direct links, multi-tab groups render as dropdowns. Add new tabs to `TAB_GROUPS` in `App.jsx`. Current tabs:
- Summary: Overview, Strength Scores
- Sessions: Tonal Sessions, Detail, Body Maps
- Analysis: Charts, PRs, Muscle Matrix, Readiness, Current State
- Cardio (direct link)
- Rowing (direct link)

## Coach Skill — Obsidian Health Context

The `/coach` skill (`.claude/commands/coach.md`) reads live health data from Obsidian via REST API before every session. These notes are the authoritative source for medications, supplements, nutrition targets, and goals — not hardcoded values in the skill file itself.

**Obsidian API:** `https://127.0.0.1:27124` — Bearer token in `.env` as `OBSIDIAN_API_KEY`. Always use `--insecure` flag.

**Key health notes** (all under `Health & Wellness/`):
- `Supplements and Medications.md` — current stack, doses, coaching notes. Update this when supplements change.
- `Health and Fitness Goals.md` — training goals, sport-specific needs, milestones
- `Nutrition Targets.md` — calorie floor, macro targets, meal guidance
- `Weight History.md` — current weight trend, DEXA lean mass baseline (106.9 lbs, Aug 2022)
- `Zepbound Symptom Tracker.md` — current GLP-1 dose, titration history, triggers

**Keep Obsidian notes current.** When the user changes supplements, doses, or goals mid-conversation, update the relevant Obsidian note via PUT so future `/coach` sessions have accurate context.

## Tonal Workout Building

Before building any workout, read `TonalInstructions.md`. It contains movement UUIDs, the set object schema, block structure template, API quirks, and user training profile. Use the `/tonal-workout` Claude skill (`.claude/commands/tonal-workout.md`) for end-to-end workout creation.

All Tonal API work uses `@dlwiest/ts-tonal-client` via `npx tsx scripts/`. Credentials come from `.env`: `TONAL_EMAIL`, `TONAL_PASSWORD`, `OBSIDIAN_API_KEY`.
