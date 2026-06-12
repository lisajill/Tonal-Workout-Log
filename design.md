# Design System — workouts.lisajill.net

Inspired by structured print-style training trackers: clean grid layouts, clear typographic hierarchy, day-color coding, and at-a-glance data density. Adapted for dark-mode web with the current dark token set as the foundation.

---

## Design Direction

**Concept: "Structured Performance Log"**

The reference image works because it reads like a well-designed ledger — every data point has a home, visual structure conveys meaning before you read a word. Apply the same discipline here: replace ambient dark-UI softness with intentional grid structure, clear section headers, and color that encodes category rather than decoration.

**Principles:**
- Structure before color — grid lines and spacing communicate hierarchy first
- Color = category — each section/day/metric type gets its own hue, used consistently
- Dense but not cluttered — print-like information density, generous micro-spacing within cells
- No decorative chrome — borders and backgrounds carry semantic weight, not just aesthetics

---

## Color Palette

### Surface Tokens (keep existing)
```
surface-0  #0f0f11   page background
surface-1  #18181b   card/panel background
surface-2  #242428   table row alternates, inner cells
surface-3  #303036   borders, dividers
```

### Category Colors (new — for section/day coding)
Inspired by the pastel day-of-week coding in the reference, but shifted warm/muted for dark mode:

```
cat-strength   #a78bfa   violet-400    Tonal strength sessions
cat-cardio     #34d399   emerald-400   Zone 2 / cardio
cat-rowing     #38bdf8   sky-400       Rowing
cat-recovery   #fb923c   orange-400    Readiness / recovery state
cat-pr         #f472b6   pink-400      PRs / bests
cat-body       #a3e635   lime-400      Body maps / muscle state
```

### Accent (keep existing)
```
accent         #6366f1   indigo-500    primary interactive / CTA
accent-hover   #818cf8   indigo-400
```

### Typography Colors
```
text-primary    zinc-100   #f4f4f5   headings, key values
text-secondary  zinc-400   #a1a1aa   labels, metadata
text-muted      zinc-600   #52525b   de-emphasized, empty states
text-positive   emerald-400            PRs, up-trends
text-negative   red-400                fatigue, down-trends
text-neutral    zinc-300               body copy
```

---

## Typography

```
Display    : Instrument Serif or Playfair Display — session titles, weekly headers
            (matches the bold italic feel of "Monday" / "Tuesday" in the reference)

UI         : Inter — all body, labels, numbers, nav
            (already effective in current app)

Mono       : JetBrains Mono — weights (lbs), splits (pace), stats columns
            (numbers in tables should be tabular-nums, monospace for alignment)
```

**Scale:**
```
display-xl  : 2rem / 700     page section headers (e.g. "Tonal Sessions")
display-lg  : 1.5rem / 700   card primary headers
display-md  : 1.125rem / 600 sub-section titles
body        : 0.875rem / 400 standard body
label       : 0.6875rem / 500 uppercase tracked — COLUMN HEADERS, METADATA TAGS
mono-stat   : 0.875rem / 600 tabular numbers (weights, paces, HR)
```

---

## Layout

### Page Structure
```
┌─────────────────────────────────────────────────┐
│  NAV BAR  (sticky, 48px, surface-1 + border-b)  │
├─────────────────────────────────────────────────┤
│  TAB CONTENT  (max-w-7xl, centered, px-4 py-6)  │
└─────────────────────────────────────────────────┘
```

### Nav
- Height: 48px
- Logo / site name: left-aligned, `font-serif italic` — "LJ Fitness"
- Tab groups render as dropdown triggers, single tabs as direct links
- Active tab: `text-accent` + bottom border 2px accent
- Hover: `text-zinc-100`
- Dropdown: surface-2 panel, 8px radius, 1px surface-3 border, shadow-lg

### Grid — Card Layouts
Cards use CSS Grid, not Flexbox, for predictable column alignment:
```
Overview:    2-col left (stats) + right (narrative)   [desktop]
Session Log: full-width table with sticky header row
Session Detail: 2-col — left metadata panel + right movement grid
Charts:      2-col equal
Cardio:      3-col summary cards + full-width session log below
Rowing:      4-col summary cards + trend charts + session log
```

---

## Components

### Summary Cards (stat tiles)
Inspired by the reference's "DAILY HABIT PROGRESS" rings and stat cells:

```
┌──────────────────────┐
│  LABEL               │  ← .label class (uppercase, tracked, text-muted)
│  123                 │  ← display-lg, text-primary, mono-stat
│  subtitle / delta    │  ← body, text-secondary
└──────────────────────┘
```
- Background: surface-1
- Border: 1px surface-3
- Left accent bar: 3px solid category color
- Radius: 8px
- Padding: 16px

For progress rings (weekly Z2 progress, habit completion):
- Ring: SVG circle with stroke-dasharray, category color stroke
- Center: percentage in mono-stat

### Data Tables

Reference's exercise grid: exercises as rows, sets as columns, WT/REP sub-rows.

Adapt for Session Log:
```
┌─────────────┬──────────┬──────────┬──────────┬──────────┐
│ DATE        │ WORKOUT  │ VOLUME   │ DURATION │ RATING   │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ Jun 11      │ Glutes   │ 14,200   │ 48 min   │ ★★★★☆    │
│             │          │   lbs    │          │          │
└─────────────┴──────────┴──────────┴──────────┴──────────┘
```

- Header row: surface-2, .label text, uppercase
- Body rows: surface-1, hover surface-2
- Alternating subtle: even rows get `bg-surface-0/40`
- Numbers right-aligned in monospace
- Active/selected row: `border-l-2 border-accent bg-accent/10`
- Sticky header on scroll

### Session Detail — Movement Grid

Closest adaptation of the reference's per-day exercise+set grid:

```
MOVEMENT NAME                      [PR badge if applicable]
─────────────────────────────────────────────────────────
       SET 1    SET 2    SET 3    SET 4    SET 5
WT     185      185      195      195      —
REPS   4        4        3        3        —
─────────────────────────────────────────────────────────
```

- Movement name: display-md, serif, cat-strength color
- Column headers (SET 1…): .label, centered
- WT row: mono-stat, text-primary
- REPS row: body, text-secondary
- PR sets: highlight cell with `bg-pink-500/20 text-pink-400 font-semibold`
- Warmup sets: subtle, text-muted, smaller font

### Day / Session Header (reference: "Monday — Feb 12")

For the top of a session detail view:
```
┌─────────────────────────────────────────────────────────┐
│  Wednesday                         GLUTES · HAMSTRINGS  │
│  Jun 11, 2026                               cat colored  │
├─────────────────────────────────────────────────────────┤
│  Volume     Duration    Avg HR     Rating    Energy      │
│  14,200 lbs  48 min     142 bpm    ★★★★☆     High        │
└─────────────────────────────────────────────────────────┘
```
- Day name: `font-serif italic text-3xl` in category color
- Date: text-secondary body
- Muscle groups: `.label` tag pills with `bg-cat-strength/20 text-cat-strength`

### Progress Rings

For weekly habit / Z2 progress (inspired by the reference's circular completion rings):
- SVG, 64px diameter
- Track: surface-3 stroke
- Fill: category color (emerald for cardio, violet for strength)
- Center text: percentage, mono-stat bold
- Below label: week target (e.g. "150 min / week")

### Section Headers

Matching the reference's block headers ("WEEKLY HABITS", "CARDIO"):
```
SECTION TITLE                                     [action link]
──────────────────────────────────────────────────────────────
```
- Text: `.label` (uppercase, tracked, text-secondary)
- Underline: 1px surface-3
- Optional right-aligned link: text-accent text-sm

### PR Badges

Small inline badges for records:
```
[⬆ PR]   bg-pink-500/20, text-pink-400, 10px font, rounded-full
[= TIED]  bg-orange-500/20, text-orange-400
```

### Readiness / Muscle State

Inspired by the reference's muscle group tags (HAMSTRINGS, CHEST etc):
- Muscle name: .label uppercase
- Status pill: Fresh (emerald), Recovering (amber), Fatigued (red)
- Progress bar under name showing 0–100 readiness %

---

## Spacing Scale

```
4px   micro — inner cell padding, badge gaps
8px   xs    — between label and value
12px  sm    — card inner sections
16px  md    — card padding, row height
24px  lg    — between cards in a grid
32px  xl    — section vertical gap
48px  2xl   — page section separation
```

---

## Iconography

Use Lucide React (already lightweight, tree-shakeable). Key icons:
```
Dumbbell      strength sessions
Heart         HR / cardio
Waves         rowing
TrendingUp    PRs, progress
CheckCircle2  completed sessions
Activity      charts
Target        goals / readiness
Calendar      date / week context
```

---

## Dark Mode Adaptations from Reference

The reference is light-mode print. Mapping to dark:

| Reference element          | Dark-mode equivalent                          |
|----------------------------|-----------------------------------------------|
| White card background      | surface-1 (#18181b)                           |
| Light gray table rows      | surface-2 alternating                        |
| Pastel day headers (blue)  | Category color at 15% opacity bg + full text  |
| Black bold section text    | zinc-100 display type                         |
| Checkbox ticks             | accent-colored SVG check or Lucide CheckCircle|
| Colored day name "Monday"  | serif italic in category color                |
| Faint grid lines           | surface-3 borders, 1px                        |
| Progress bar fill          | category color, rounded-full                  |

---

## Page-specific Design Notes

### Overview
- Left column: "this week" stat cards (3 across), below: Zone2 progress ring + strength sessions ring
- Right column: narrative text in serif, Recovery Arc timeline as horizontal stepped line
- Lifetime stats: horizontal banner of 4-5 mono-stat cards at top

### Session Log (Tonal Sessions)
- Dense table, 1 row per session
- Left accent bar color = muscle group category (glutes=violet, upper=pink, full-body=indigo)
- Inline sparklines for volume trend per row (tiny, 60px wide)
- Expandable row → shows movement list inline without navigating away

### Session Detail
- Day header as described above
- Movement blocks as grid (SET 1–N columns)
- Metadata sidebar: HR zones bar, effort/energy/sweat chips, notes in amber callout box
- Zone2 export data inlined if present (HR avg from zone2_log)

### Charts
- Chart backgrounds: surface-0
- Grid lines: surface-3 (subtle)
- Line/bar fills: category colors
- Axis labels: .label style

### Cardio Tracker
- Week grouping: each week = a "day column" from the reference — header with week date range
- Category color: emerald for all Zone2 elements
- Distance chip: `{n}mi` or `{n}m` in mono-stat

### Rowing Tracker
- Category color: sky-400 throughout
- Split time: mono-stat, large — it's the primary performance metric
- SPM and watts as secondary row (smaller, text-secondary)

---

## Year at a Glance — Activity Calendar

Inspired by a printable exercise tracker grid: rows = days of month (1–31), columns = months (Jan–Dec), each cell filled with a category color. Gives an immediate visual read of consistency, variety, and rest patterns across the full year — the fitness equivalent of a GitHub contributions graph.

### Layout

```
┌───┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│   │ JAN│ FEB│ MAR│ APR│ MAY│ JUN│ JUL│ AUG│ SEP│ OCT│ NOV│ DEC│
├───┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ 1 │ ██ │    │ ██ │    │ ██ │ ██ │    │    │    │    │    │    │
│ 2 │    │ ██ │    │ ██ │    │    │    │    │    │    │    │    │
│ … │    │    │    │    │    │    │    │    │    │    │    │    │
│31 │ ██ │ —  │ ██ │ —  │ ██ │    │    │    │    │    │    │    │
└───┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- Month columns: abbreviated 3-letter headers, `.label` style, centered
- Day rows: 1–31, right-aligned row number in `text-muted`
- Invalid days (e.g. Feb 30): subtle strikeout cell `bg-surface-0 opacity-30`
- Future days: empty cell, `bg-surface-0`
- Cell size: ~28×22px desktop, ~20×16px mobile (compress gracefully)

### Cell Color Encoding

Each cell reflects the **primary workout type** for that day. When multiple sessions occur (e.g. Tonal + Zone2 walk), use the highest-intensity type:

```
cat-strength  violet-400  #a78bfa   Tonal strength session
cat-cardio    emerald-400 #34d399   Zone 2 cardio (walk, bike, etc.)
cat-rowing    sky-400     #38bdf8   Hydrow / erg rowing
cat-mixed     indigo-400  #818cf8   Strength + cardio same day
cat-rest      surface-2   #242428   Explicit rest day (no session)
empty         surface-0   #0f0f11   No data / future
```

Multiple sessions same day → split the cell diagonally (top-left = first, bottom-right = second) using a CSS clip-path or border trick, OR use `cat-mixed` as the simpler fallback.

### Key / Legend

Sits to the right of the grid (desktop) or below it (mobile):

```
● Strength    (cat-strength swatch + label)
● Cardio      (cat-cardio)
● Rowing      (cat-rowing)
● Mixed       (cat-mixed)
□ Rest        (surface-2 outline cell)
  — No data
```

- Swatch: 12×12px rounded-sm square, matching cell color
- Label: `.label` text, `text-secondary`
- Spacing: 8px between items, 16px section gap

### Interaction

- **Hover cell** → tooltip showing: date, session name(s), volume/duration, rating
- **Click cell** → if a Tonal session exists, navigate to `#sessions:{tonal_activity_id}`
- **Hover month column header** → highlight entire column with brightness increase
- Tooltip: surface-2 bg, 1px surface-3 border, 8px radius, shadow-lg

### Placement

Add as a section within the **Overview tab**, below the weekly summary cards:

```
Overview
├── Lifetime Stats banner
├── This Week summary cards + Zone2 ring
├── Year at a Glance calendar          ← NEW
└── Recovery Arc timeline / narrative
```

Also consider a dedicated toggle to switch between current year and prior year.

### Implementation Notes

```jsx
// Data shape needed: one entry per day with session type
const calendarData = sessions.reduce((acc, s) => {
  const key = s.timestamp?.slice(0, 10) ?? s.date
  acc[key] = deriveActivityType(s)  // 'strength' | 'cardio' | 'rowing' | 'mixed'
  return acc
}, {})

// Also merge zone2_log entries for cardio/rowing days with no Tonal session
```

Cell rendering: a 12×31 CSS Grid (`grid-cols-[auto_repeat(12,1fr)]`), `aspect-ratio: auto`, with `gap-px` for hairline borders using a surface-3 background on the grid container — no individual cell borders needed.

---

## Implementation Notes

- Add Google Fonts import for Instrument Serif or Playfair Display (display only, not body)
- Extend `tailwind.config.js` with `cat-*` color tokens
- Add `font-display` utility class → `fontFamily: { display: ['Instrument Serif', 'serif'] }`
- Keep `.card` and `.label` utilities; extend with `.stat-card`, `.section-header`, `.pr-badge`
- Recharts: pass `surface-3` hex to `CartesianGrid` stroke, `zinc-500` to axis tick fill
- Tables: use `table-fixed` with explicit `w-*` column widths for alignment consistency
- All stat numbers: add `tabular-nums` via `font-variant-numeric: tabular-nums` utility class
