# Connect dashboard widgets to backend data

## Why
The dashboard must reflect real usage metrics instead of placeholders.

## Scope
- Pull counts (`totalNotes`, `connections`, `knowledgeScore`) via Supabase RPC
- Bind “Recent notes” list to `notes` table (`updated_at DESC`)
- Render mini graph with live link counts

## Acceptance criteria
- [ ] KPIs equal DB values after refresh
- [ ] Recent list paginates correctly
- [ ] Graph updates after a note is added or deleted

## Tags
`dashboard` `analytics` `supabase` `frontend` `backend`