# Wire short-term memory board to backend storage

## Why
Short-term notes need persistence and auto-archive after 30 days.

## Scope
- CRUD against `short_term_notes`
- Supabase scheduled task to archive after 30 days

## Acceptance criteria
- [ ] New card appears immediately
- [ ] Countdown badge shows correct days left
- [ ] Archived notes are hidden but kept in DB

## Tags
`short-term` `backend` `cron`