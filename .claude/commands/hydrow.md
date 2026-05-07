Log a rowing erg session (Hydrow, Concept2, etc.) with performance metrics and HR zone data.

## Overview

Rowing sessions have two data sources:
1. **Zones for Training** — HR zones, avg HR (exported as JSON to Zone2Sessions/)
2. **Rowing machine app** — distance, splits, watts, stroke rate, drag

This skill combines both into zone2_log.json and creates an Obsidian note.

## Step 1 — Collect session data

If the user hasn't already provided it, ask in one message:

```
Date:
Program/workout name:
Duration (from rowing machine, MM:SS):
Distance (meters):
Avg split /500m (M:SS.s):
Strokes per minute:
Avg peak power (watts):
Calories (from rowing machine):
Notes (form, effort, anything notable):
```

Drag is fixed at 104 — no need to ask or record.

Also check Zone2Sessions/ for Zones export JSONs for this date. Hydrow JSONs have `"source": "Hydrow"` and `"activity": {"type": 35}` (HKWorkoutActivityType.rowing). The import script maps them to activity "Rowing". If present and not yet imported, run:
```bash
cd /Users/moment/Sites/Workout-Tracker && npm run import-zone2
```

Then find the matching entry in `src/data/zone2_log.json` (match by date + "Rowing" activity and source UUID).

**Do NOT mistake morning Tonal sessions (source: "Tonal", type 50) for Hydrow rowing sessions.** Check source field in the JSON before assuming any session is the row.

## Step 2 — Detect and confirm cooldown merge

After import, scan `zone2_log.json` for any same-day "Rowing" entries that follow the main session and look like a cooldown:
- Duration ≤ 5 min
- `avg_hr` lower than the main session's `avg_hr`, OR a short burst that's coming down (high Z1, low Z3/Z4)
- Start time within ~15 min of the main session's end time

If a cooldown candidate is found, ask:
> "Found a short follow-on session (X min, avg HR Y bpm). Merge it into the main rowing entry as a cooldown?"

Only proceed with the merge if the user confirms.

## Step 3 — Merge Zones + erg data

If two separate Zones entries exist for the session (main + cooldown), combine them:
- Total `duration_min`, `zone*_min` by summing raw seconds, then converting to minutes
- Weighted avg HR: `(hr1 * sec1 + hr2 * sec2) / (sec1 + sec2)`, rounded to nearest int
- Use the earlier entry's UUID and timestamp; delete or archive the second entry
- Move the cooldown JSON to `Zone2Sessions/merged/` to prevent re-import

Update the entry:
- `activity`: "Rowing"
- Add structured rowing fields (see schema below)
- Update `notes` with the program name and "first session in X weeks" context if applicable

### Rowing performance schema (add to zone2_log entry):
```json
"rowing_program": "...",
"rowing_distance_m": <number>,
"rowing_duration_min": <number>,
"rowing_avg_split": "M:SS.s",
"rowing_stroke_rate_spm": <number>,
"rowing_avg_watts": <number>
```

## Step 4 — Create Obsidian note

PUT to `https://127.0.0.1:27124/vault/Health%20%26%20Wellness/Cardio/Sessions/YYYY-MM-DD Rowing.md`
Authorization: Bearer <OBSIDIAN_API_KEY from .env> — always use `--insecure`

```markdown
---
date: YYYY-MM-DD
activity: Rowing
program: <program name>
duration_min: <zones total duration>
zone1_min: <n>
zone2_min: <n>
zone3_min: <n>
zone4_min: <n>
avg_hr: <n>
distance_m: <n>
avg_split: "<M:SS.s>"
stroke_rate_spm: <n>
avg_peak_power_w: <n>
calories: <n>
uuid: <UUID>
---

# Rowing — YYYY-MM-DD

<One sentence context: program progress, how it felt, first session back, etc.>

## Performance

| Metric | Value |
|--------|-------|
| Program | <program name> |
| Distance | <X> m |
| Duration | <X:XX> |
| Avg Split | <M:SS.s> /500m |
| Stroke Rate | <X> spm |
| Avg Peak Power | <X> W |
| Calories | <X> |

## Heart Rate & Zones

| Metric | Value |
|--------|-------|
| Avg HR | <X> bpm |
| Zone 1 (< 108 bpm) | <X> min |
| **Zone 2 (108–125 bpm)** | **<X> min** |
| Zone 3 (126–142 bpm) | <X> min |

<Notes if any>
```

Only include zone rows where zone > 0 min (always show Zone 2 in bold).

## Step 5 — Show prior session comparison

Search zone2_log.json for earlier "Rowing" entries. If any exist, show a comparison table:

| Session | Program | Distance | Split /500m | Watts | Z2 |
|---------|---------|----------|-------------|-------|----|
| Prior best split | ... | ... | ... | ... | ... |
| Today | ... | ... | ... | ... | ... |

Goal direction: lower split = faster, higher watts = more powerful.

## Step 6 — Commit and push

```bash
cd /Users/moment/Sites/Workout-Tracker
git add src/data/zone2_log.json
git commit -m "Log rowing session YYYY-MM-DD: <distance>m, <split>/500m, <watts>W"
git pull --rebase origin main && git push origin main
```

## Step 7 — Report

Confirm: note created, zone2_log updated, push succeeded. One line on today's performance vs prior sessions if history exists.
