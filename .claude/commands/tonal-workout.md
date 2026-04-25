Build a new Tonal workout for the user.

## Step 1 — Read instructions and Obsidian context

Read these files before doing anything else:

**Project reference:**
- `TonalInstructions.md` in the project root — movement IDs, API quirks, set structure, user profile, design rules

**Obsidian vault (via REST API at https://127.0.0.1:27124, Bearer OBSIDIAN_API_KEY, --insecure):**
- `Health & Wellness/Health and Fitness Goals.md` — current training goals, priorities, constraints
- `Health & Wellness/Hand Recovery Gates.md` — current hand clearance status (hands-free restriction)
- Last 2–3 session notes from `Health & Wellness/Tonal/Sessions/` — check what was trained recently to avoid repeating patterns
- Today's Zepbound entry from `Health & Wellness/Zepbound Symptom Tracker.md` — flag if injection day (may affect energy/nausea)

To list the Sessions folder and find recent notes:
`GET /vault/Health%20%26%20Wellness/Tonal/Sessions/`

Read all of these before designing the workout. Follow TonalInstructions.md exactly.

## Step 2 — Check muscle readiness

Run a tsx script to call `getMuscleReadiness()` via the TypeScript client. Show the user their current readiness for glutes, hamstrings, quads, calves, and the rest. Flag any muscle below 70% as a caution.

## Step 3 — Ask for workout parameters

Ask the user:
- Any specific focus or movements they want?
- Any constraints today (energy level, time, equipment)?
- Anything to avoid?

If the user already provided this context in their message, skip asking and proceed.

## Step 4 — Design the workout

Using TonalInstructions.md and the Obsidian context as the guide:
- Compound first, then bilateral isolation, then unilateral isolation
- No duplicate movement patterns in the same session
- No patterns repeated from the last session
- 3 working sets per exercise (user gets bored at 4)
- 3–5 reps for strength focus
- Smart Flex ON (flex: true) for all working sets
- 1 warmup set for compound anchor only (warmUp: true, flex: false)
- Rest blocks: 2 min after compound, 90 sec between isolations
- No drop sets, no squats, no lunges
- Hands-free only unless Hand Recovery Gates.md confirms clearance
- If today is an injection day (check Zepbound tracker), note it as a flag — may affect energy

Cross-reference readiness data — if a muscle is below 70%, consider reducing volume or swapping movements that heavily load it.

## Step 5 — Present for approval

Show the full workout as a table:
- Block number, exercise, sets × reps, notes (Smart Flex, warmup, rest duration)
- Estimated duration
- Muscles targeted and movement patterns covered
- Any flags (readiness warnings, injection day, equestrian relevance, hand clearance, etc.)

Ask: "Send it?" Do NOT call createWorkout until the user explicitly approves.

## Step 6 — Write Obsidian pre-workout note

Before creating the workout on Tonal, write the session note to Obsidian at:
`Health & Wellness/Tonal/Sessions/YYYY-MM-DD Workout Name.md`

Use the frontmatter template from TonalInstructions.md. Populate pre_readiness with the live values from Step 2. Leave all post-workout fields as null.

Use the Obsidian REST API (https://127.0.0.1:27124, Bearer token from OBSIDIAN_API_KEY in .env, --insecure).

## Step 7 — Create the workout on Tonal

Run a tsx script using `@dlwiest/ts-tonal-client` to call `createWorkout()`. Auth via TONAL_EMAIL + TONAL_PASSWORD from .env.

Build the sets array following the structure in TonalInstructions.md. Include the tonal_workout_id in the Obsidian note frontmatter once created.

## Step 8 — Confirm

Report back:
- Workout created (title + ID)
- Obsidian note written (path)
- Remind user to fill in post-workout fields after the session and run `npm run fetch`
