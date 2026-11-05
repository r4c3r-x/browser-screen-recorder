# Stage 11 — webcam overlay

One stage, one job: composite an optional camera bubble over the screen
capture and record it into the same file. User request (verbatim):
"yes let's add that" — approving the webcam overlay proposal (PLAN.md
deferred item "Webcam overlay (canvas compositing)"). Shape per proposal:
picture-in-picture bubble, bottom-right, mirrored self-view, fixed position
for v1. Fail-soft: camera denied means a notice and a recording without the
bubble. Audio path is untouched.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/10-approval-gate/output/stage-report.md | Full | Current state |
| Layer 3 | docs/api/mediadevices-getusermedia.md | API | Camera capture |
| Layer 3 | workspace/_config/conventions.md | All | Naming/constants |

## Process

1. Branch `feature/v1-webcam`; add stage to PLAN/routing.
2. src/config.ts: WEBCAM_FRAME_RATE (30), WEBCAM_BUBBLE_WIDTH_RATIO (0.22),
   WEBCAM_BUBBLE_MARGIN_PX (24).
3. src/recorder/camera-source.ts: getUserMedia wrapper (640x480 ideal,
   facingMode user) with dispose().
4. src/recorder/canvas-compositor.ts: hidden video elements for screen +
   camera, canvas sized to the capture, background-timer draw loop (Worker
   ticker, because requestAnimationFrame freezes in hidden tabs and
   background timers throttle to ~1 fps), mirrored rounded camera bubble
   (pure layoutBubble for geometry, unit-tested), canvas.captureStream.
5. recording-session.ts: includeCamera option; camera requested inside the
   user-activation window (with mic); fail-soft notice; composite stream
   becomes the recorded video track and the preview stream; compositor
   stopped on every teardown path.
6. UI: "Include camera" checkbox beside the mic checkbox; onStart passes it.
7. Unit: layoutBubble geometry. e2e: recording with camera enabled
   (fake device) yields a non-empty download; without camera unchanged.
8. README feature line; PLAN deferred list updated. Suites green; report.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Modules | src/recorder/camera-source.ts, src/recorder/canvas-compositor.ts | ts |
| Tests | tests/unit/webcam-layout.test.ts, e2e updates | ts |

## Audit

- [ ] Recording stays live when the tab is hidden (Worker-driven draws, not rAF)
- [ ] Camera failure never fails the session; notice shown
- [ ] Compositor torn down on every path (user stop, share end, discard)
- [ ] Audio path unchanged; transcript mic-gating unchanged
- [ ] Unit + e2e green; tsc clean, no `any`; README/PLAN updated

## Checkpoint

Suites green; report; merge; deploy; approval ask for approved/v3.
