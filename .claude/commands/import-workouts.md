Import new Zone2 workout sessions, create Obsidian notes, and push data to the repo.

## Step 1 — Run the import script

```bash
cd /Users/moment/Sites/Workout-Tracker && npm run import-zone2
```

Note how many new sessions were imported (check script output). If zero new sessions, stop and report "No new sessions found."

## Step 2 — Find sessions that need Obsidian notes

List existing notes in Obsidian:
```
GET https://127.0.0.1:27124/vault/Health%20%26%20Wellness/Cardio/Sessions/
Authorization: Bearer <OBSIDIAN_API_KEY from /Users/moment/Sites/Workout-Tracker/.env>
--insecure
```

Find the latest date in that list. Then read `src/data/activities.json` and find all non-Tonal sessions with a date after the latest Obsidian note date. These are the sessions that need notes.

Skip any session where `activity` is "Tonal" or contains "Strength Training" from Tonal — those get notes via `/tonal-workout`.

## Step 3 — Create Obsidian notes

For each new session, get `max_hr` and `calories` from the matching source JSON file in `/Users/moment/Documents/Claude/Zone2Sessions/` (match by UUID field).

**Filename:** `YYYY-MM-DD ActivityName.md`
- Same-day sessions of the same type: disambiguate with Afternoon/Evening/etc. based on the session start time
- Check existing filenames to avoid collisions

**PUT** to `https://127.0.0.1:27124/vault/Health%20%26%20Wellness/Cardio/Sessions/<filename>`

**Note format:**

```markdown
---
date: YYYY-MM-DD
activity: <activity name>
duration_min: <number>
zone1_min: <number>
zone2_min: <number>
zone3_min: <number>
zone4_min: <number>
avg_hr: <number>
max_hr: <number>
distance_mi: <number or 0>
calories: <number>
uuid: <UUID>
weekly_target: 150
---

# <Activity Name> — YYYY-MM-DD

<One sentence summary: e.g. "Short morning walk, entirely zone 1." or "Zone 2 cardio session with good HR control.">

| Metric | Value |
|--------|-------|
| Duration | <X> min |
| Distance | <X> mi |
| Avg HR | <X> bpm |
| Max HR | <X> bpm |
| Zone 1 (< 108 bpm) | <X> min (<X>%) |
| Zone 2 (108–125 bpm) | **<X> min** |
| Zone 3 (126–142 bpm) | <X> min |
| Zone 4 (> 142 bpm) | <X> min |
| Calories | <X> kcal |
```

Only include zone rows where the zone has > 0 minutes, except always show Zone 2 (bold it).

## Step 4 — Commit and push

```bash
cd /Users/moment/Sites/Workout-Tracker
git add src/data/zone2_log.json src/data/activities.json
git commit -m "Import Zone2 sessions through <latest date>"
git pull --rebase origin main && git push origin main
```

## Step 5 — Report back

List each new session note created (date + activity name) and confirm the push succeeded.
