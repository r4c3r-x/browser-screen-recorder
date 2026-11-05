# Stage 01 report — foundation

Date: 2026-11-06. Branch: `feature/v1-core-recorder` (bootstrap commit
`fdc6e3f` on main).

## What exists

- Tooling: Vite 8.3.6 + TypeScript (strict, noUncheckedIndexedAccess,
  exactOptionalPropertyTypes), `npm run dev|build|preview`. Output of the
  empty shell: 0.77 kB raw / 0.44 kB gzip.
- ICM workspace: routing table (Layer 1), conventions (Layer 3), stage
  template, and all five stage contracts (Layer 2), each 44-50 lines.
- Docs: AGENTS.md (Layer 0, 72 lines), PLAN.md (canonical scope), README.md.
- `docs/api/`: 5 MDN pages downloaded from mdn/content (raw markdown) plus
  source index with dates.

## Evidence

- `npm run build` exits 0 (tsc --noEmit + vite build).
- Dev server responds HTTP 200 on http://localhost:5173.
- `wc -l` confirms all contracts <= 80 lines; AGENTS.md is 72.
- npm install: 0 vulnerabilities.

## Notes and deviations

- **IPv6 bind:** Vite binds `localhost`, which resolves to `::1` on this
  machine. `http://localhost:5173` works; the literal `http://127.0.0.1:5173`
  does not. Documented in README; no config change made.
- **Git identity:** global git identity is unset on this machine; a
  repo-local identity (`rpdc` / `rpdc@users.noreply.local`) was configured.
  Local-only repo, so no push implications.
- No deviations from the contract's Process list.

## Audit results

All five checklist items pass (build 0, server 200, contracts <= 80 lines,
5 docs + index, no recorder logic).
