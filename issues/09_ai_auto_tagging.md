# Integrate ai service to extract tags from notes

## Why
Automatic tags speed up search and strengthen graph links.

## Scope
- Call `/v1/generate-tags` (LLM function) on note save
- Store up to five tags in `tags` array

## Acceptance criteria
- [ ] Tag latency < 1 s
- [ ] Tags appear as chips and power filters

## Tags
`ai` `nlp` `tags` `enhancement`