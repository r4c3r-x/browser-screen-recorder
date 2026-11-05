# Stage 01 — foundation

One stage, one job: make everything later stages need in order to exist and
be true. Produces the tooling, the ICM workspace itself, and local API
references. No recorder logic.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 0 | AGENTS.md | All | Project context |
| Layer 3 | workspace/_config/conventions.md | All | Conventions to encode |
| Global | vibe-code-rules.md | All | Quality standards |

## Process

1. Verify toolchain (node >= 20, npm, git) and set repo-local git identity.
2. `git init` on main, bootstrap commit, create `feature/v1-core-recorder`.
3. Scaffold Vite + TypeScript (strict): package.json, tsconfig, vite.config,
   index.html, and a src/main.ts entry that fails loudly if the root is
   missing.
4. Write AGENTS.md (Layer 0), PLAN.md, and this workspace (Layers 1-3, all
   five stage contracts).
5. Download MDN references into docs/api/ (getDisplayMedia, MediaRecorder,
   AudioContext, getUserMedia, MediaStreamTrack) with a source index.
6. npm install; verify `npm run build` passes; verify the dev server serves.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Tooling | package.json, tsconfig.json, vite.config.ts, index.html, src/main.ts | mixed |
| Contracts | workspace/** | md |
| API refs | docs/api/** | md |

## Audit

- [ ] `npm run build` exits 0
- [ ] Dev server responds on port 5173
- [ ] All five stage CONTEXT.md files exist and are <= 80 lines
- [ ] docs/api contains 5 pages + index with source URLs and dates
- [ ] No recorder logic written (scope discipline)

## Checkpoint

Report what exists and was verified, then proceed to stage 02.
