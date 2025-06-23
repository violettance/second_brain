# Wire long-term memory vault to backend

## Why
Permanent notes must sync across devices with full-text search.

## Scope
- CRUD for `long_term_notes`
- Enable `pgroonga` or `pgvector` search

## Acceptance criteria
- [ ] Create, edit, delete work offline-aware
- [ ] Search returns in < 200 ms for 1 000+ notes

## Tags
`long-term` `backend` `search`