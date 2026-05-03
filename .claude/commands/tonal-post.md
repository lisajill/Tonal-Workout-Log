Log post-workout data for the most recent Tonal session. Updates the Obsidian session note with all post-workout fields.

## Step 1 — Run fetch

```bash
cd /Users/moment/Sites/Workout-Tracker && npm run fetch
```

This pulls volume, reps, TUT, kJ, and `duration_sec` (for timed sets) from the Tonal API into sessions.json. Note the values for today's session.

**Check screenshots folder** at `/Users/moment/Sites/Workout-Tracker/screenshots/` for files dated today — the user often captures HR, calories, strength scores, and movement detail screens there. Read them before asking for data.

## Step 2 — Collect post-workout data from the user

If the user has already provided data in their message, use it and skip asking. Otherwise, ask for all of the following in one message:

```
energy_level:        # 1–5
subjective_rating:   # 0–5
sweat:               # dry | light | moderate | heavy
avg_hr:              # bpm — check zone2_log.json first; if session was exported via Zones app it's already there
max_hr:              # bpm — not in zone2_log, needs screenshot
calories:            # kcal

Post-readiness (per muscle — Fresh ≈ 100, Recovering ≈ 50, Fatigued ≈ 15):
  glutes / hamstrings / quads / calves / abs / obliques / back / chest / shoulders / biceps / triceps

Strength scores:
  overall / upper / core / lower

Goal progress:
  functional_strength:       # current score
  movement_quality:          # current score
  movement_quality_delta:    # change (+ or -)

PRs this session (leave blank if none):
High-volume muscles:
Low-volume muscles:
```

## Step 3 — Find and read today's session note

List Obsidian sessions folder:
```
GET https://127.0.0.1:27124/vault/Health%20%26%20Wellness/Tonal/Sessions/
Authorization: Bearer <OBSIDIAN_API_KEY from /Users/moment/Sites/Workout-Tracker/.env>
--insecure
```

Find today's session note (most recent, matching today's date) and **read its full current content**.

**CRITICAL — note already exists:** The `/tonal-workout` skill creates the note before the session and populates `pre_readiness`. If a note for today already exists, you MUST read it and preserve ALL existing frontmatter values — especially `pre_readiness`, `tonal_workout_id`, and any pre-workout fields. Never overwrite an existing note with a blank template.

**If no note exists:** Create one from the frontmatter template in TonalInstructions.md. Leave pre_readiness null.

## Step 4 — Update the note

Read the existing note content. Patch ONLY the post-workout fields with the new values. Leave `pre_readiness`, `tonal_workout_id`, `date`, `workout`, `phase`, and any other pre-workout field exactly as they were.

PUT the merged note back using the Obsidian REST API (https://127.0.0.1:27124, Bearer OBSIDIAN_API_KEY, --insecure).

## Step 5 — Handle Free Lift / secondary sessions

If today has more than one Tonal session (e.g. a short Free Lift that followed the main workout), ask the user: "Do you want to merge the [Free Lift] into [Main Session] as one combined session?"

If yes: add the Free Lift's movements to the main session's `movements` array, add its `calories` and `duration` to the main session's totals, update the note, and set `merged_into: <main_activity_id>` on the Free Lift entry in sessions.json.

**Timed Free Lift sets** (e.g. Farmer March): the Tonal API returns `reps: 0` and no duration. Ask the user how long each set was and add `duration_sec` manually to each set object.

## Step 6 — Confirm

Report: note updated (path), fields written, and any fields that were left null because data wasn't provided.
