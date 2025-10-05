# Win – Minimalist Productivity Dashboard

Stay focused with a clean, black‑and‑white dashboard. Capture thoughts, set monthly goals, check off daily tasks and achievements, track streaks on a calendar, view simple analytics, and log your gym workouts.

## What you can do
- Thought Logs: Tap the floating book button to jot quick notes. Slide-out panel shows today’s entry and past entries.
- Daily Tasks: Exactly 9 checkable items. Complete all 9 to earn a streak day.
- Daily Achievements: A simple checklist of 3 wins for today.
- Monthly Goals: Set your primary focus, list concrete targets, add key resources, and watch the progress bar update.
- Streak Calendar: See which days you completed all tasks; today is detected in UTC+1.
- Analytics: Quick glance at streaks, completions, and monthly goal progress.
- Gym Workouts: Track 9 required workouts (for streaks) plus optional workouts (for extra effort). History summarizes completions by month.

## How to use it (daily flow)
1) Open the app and review your 9 tasks.
2) Check off tasks as you go; finishing all 9 marks a streak on the calendar.
3) Add 3 daily achievements to celebrate key wins.
4) Capture thoughts using the floating book button.
5) Keep monthly goals updated—check targets and add resources.
6) Log workouts in the Gym section (required vs optional).

## Tips
- Keep tasks short and unambiguous.
- Use achievements to reinforce momentum, not to add pressure.
- Optional workouts are for extra credit—they don’t affect streaks.
- The calendar highlights days you completed all 9 tasks; missing a day resets the streak.

## Quick start (for users)
- Go to the dashboard.
- Use the floating button to add a thought.
- Edit your daily tasks and achievements directly in place.
- Click Monthly Goals → Add Goal to create a new month template.
- Visit Gym to fill in your 9 workouts and add optional ones.

---

## Setup (for anyone installing locally)
- Requirements: Node.js 20+, Supabase project (URL + anon key)
- Install: `pnpm install`
- Env: create `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
- Run: `pnpm dev` → visit `http://localhost:3000`

## Scripts
- `pnpm dev` – start dev server
- `pnpm build` – production build
- `pnpm start` – run production server

## Notes & troubleshooting
- Use Node 20+ to avoid deprecation warnings from `@supabase/supabase-js`.
- If “Add Goal” doesn’t show a template, click the Add Goal button—an empty card appears to fill in.
- If data doesn’t save, ensure Supabase RLS policies allow authenticated read/write for your tables.

## License
MIT