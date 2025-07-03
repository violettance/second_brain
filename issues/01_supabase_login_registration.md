# Implement supabase login and registration

## Why
Users must be able to create accounts and sign in securely before any data is stored.

## Scope
- Add `@supabase/auth-js`
- Email + password sign-up / sign-in UI
- Optional magic-link fallback
- Persist session with refresh tokens
- Protect private routes using `withPageAuth`

## Acceptance criteria
- [ ] Account creation, verification e-mail and login all succeed
- [ ] Session survives hard refresh and expires on log-out
- [ ] Auth errors surface via toast notifications

## Tags
`auth` `supabase` `backend` `frontend` `high-priority`