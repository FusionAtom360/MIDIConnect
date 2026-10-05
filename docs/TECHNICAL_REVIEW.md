# MIDIConnect Technical Review

## Executive summary

MIDIConnect is currently a React/Vite visual prototype accompanied by a small, standalone
WebSocket relay. The project communicates the shape of a real-time MIDI collaboration product
well, but the implementation does not yet deliver the behavior described by the README or by the
dashboard copy. The main risk is not complexity; it is the gap between the product promise and
the executable system.

The frontend renders connection, device, latency, routing, activity, profile, and piano surfaces,
but almost all of these are static or mock data. There is no browser MIDI integration, no
frontend WebSocket client, no room/session model, no MIDI scheduling, no audio/MIDI output path,
and no connection lifecycle. The API server can relay a limited set of unvalidated JSON messages,
but it has no rooms, authentication, origin policy, rate limiting, protocol definition, health
endpoint, or deployment configuration. The two halves are therefore not an integrated
application.

The visual layer is a reasonable starting point: it has a clear feature-oriented component
layout, shared UI primitives, responsive Tailwind classes, and a coherent dark theme. However,
presentation currently overstates system state. Labels such as “Optimal”, “12ms”, “0.0%”, “4
Devices Found”, “WebRTC connection established”, and “Active Routes” are hard-coded and can
mislead a user into believing that live telemetry or connectivity exists.

## Scope and evidence

This review covers the repository snapshot as inspected, including the tracked application code
and the current working-tree changes. The working tree was already modified in
`web/src/App.tsx` and `web/src/components/layout/Header.tsx`, with
`web/src/components/features/PianoDock.tsx` untracked; those changes were treated as part of the
reviewed snapshot and were not reverted.

Validation commands:

```text
cd web
npm run build
npm run lint
```

Both commands currently fail. The specific failures are listed below.

## System inventory

### Frontend

- `web/src/main.tsx` mounts a single React application under `StrictMode`.
- `web/src/App.tsx` composes the dashboard and owns only piano visibility state.
- `web/src/components/layout/Header.tsx` owns profile-modal state and local username persistence.
- `web/src/components/features/` contains feature-shaped presentation components.
- `web/src/components/ui/` contains `Card`, `Button`, `Badge`, and `Input` primitives.
- Tailwind CSS 4 and Material Symbols provide the visual system.
- Vite supplies development and production bundling.

### Backend

- `api/src/server.ts` starts a `ws` `WebSocketServer` on port 8080.
- Connections are kept in process memory.
- Clients can identify themselves, subscribe as senders or receivers, send ping messages,
  broadcast MIDI payloads, and broadcast chat messages.
- The server is not referenced by the frontend source or by a root orchestration script.

### Repository and delivery

- There are separate `web` and `api` package manifests and lockfiles.
- The root `package-lock.json` is effectively an empty lockfile and there is no root
  `package.json`.
- The README describes a centralized Node.js architecture, but the footer claims WebRTC and
  the actual API uses WebSockets.
- No tests, CI workflow, API contract, environment configuration, or deployment instructions
  are present in the reviewed source tree.

## What is working well

### Structure and visual composition

The frontend has a comprehensible component boundary: layout, feature, and UI primitive folders
make the page easy to navigate. Repeated visual patterns are centralized in the shared
components rather than duplicated throughout every screen. `Button` and `Input` forward native
attributes, which leaves room for accessible behavior without redesigning the primitive API.

The page is responsive at a basic layout level through Tailwind grid breakpoints. The modal uses
a portal, and the piano toggle exposes `aria-pressed` and an accessible label. The presentation
has a consistent visual language and communicates the intended domain quickly.

### TypeScript baseline

The web `tsconfig.app.json` enables strict checking, unused-local checks, and no-fallthrough
checks. The API configuration also enables strict checking and declaration output. This is a
good foundation, but the repository does not currently pass the checks it has enabled.

### Backend starting point

The API does at least remove closed sockets from sender and receiver sets, checks socket
readiness before broadcasting, and isolates malformed JSON parsing in a per-message handler.
The use of explicit message types such as `ping`, `subscribe`, `midi`, and `chatMessage` is a
useful starting point for a formal protocol.

## Adversarial findings

Severity reflects impact on correctness, user trust, and ability to operate the product.

### Critical: the advertised product path is not implemented

The frontend contains no `WebSocket`, `navigator.requestMIDIAccess`, MIDI input listener, MIDI
output dispatch, or connection service. Buttons in `ConnectionPanel`, `SessionActivity`, and
`MidiDeviceList` have no actions. The piano dock only highlights a fixed array
(`61, 64, 67, 72`) and cannot be played. Consequently, the principal user journey—connect,
select a device, play a note, relay it, and hear it remotely—cannot occur.

This is an implementation gap, not merely missing polish. Either the README and dashboard should
be explicitly labeled as a prototype, or the application needs a real transport and MIDI
integration layer before these features are presented as available.

### High: false operational telemetry

`LatencyMonitor.tsx` displays fixed latency, jitter, packet-loss, bandwidth, and quality status.
`App.tsx` displays fixed session and route counts. `SessionActivity.tsx` displays fabricated
historical events, including a WebRTC connection even though the server is WebSocket-based.
`MidiDeviceList.tsx` has an empty mock device array while the dashboard claims four devices.

This creates a trust and support problem: a user cannot distinguish an offline system from a
healthy system with no traffic. State should have explicit phases such as `unsupported`,
`disconnected`, `connecting`, `connected`, and `error`, with telemetry derived from actual
events. Placeholder data should be visibly marked as demo data or removed from production builds.

### High: backend protocol is unauthenticated and unvalidated

`api/src/server.ts` trusts `userId`, `username`, subscription actions, and MIDI fields supplied
by every client. There is no schema validation, size limit, field-range validation, origin
restriction, authentication, authorization, rate limiting, or room membership check. Any client
can impersonate another user ID, subscribe as a sender, broadcast arbitrary JSON-shaped MIDI
payloads, or flood every connected client with chat and MIDI traffic.

The relay should define a versioned message schema, reject unknown or malformed messages with an
explicit error response, enforce MIDI ranges and payload limits, generate or authenticate
identities server-side, and scope broadcasts to an authenticated room. Production deployment
must use `wss` behind TLS and a controlled origin policy.

### High: lifecycle and identity handling are incorrect for multiple connections

The `users` record maps one user ID to one username, while `connections` maps each socket to that
ID. If the same user ID is connected twice, closing either socket deletes the shared user record,
even though the other socket remains open. `connectedUsers` counts sockets, but the UI concept is
participants, so reconnects and multiple tabs produce inconsistent counts.

The server also has no `error` handler, graceful shutdown, heartbeat/dead-connection cleanup, or
backpressure strategy. A client that disappears without a clean close can remain represented
until the operating system reports the socket failure.

### High: no session or room isolation exists

The README promises sessions and the UI asks for a room code, but the API has no room field and
all chat and MIDI messages are global to the entire server. A “Join Room” action cannot be
implemented against the current protocol. This is both a correctness defect and a privacy
boundary failure for any multi-room deployment.

### Medium: repository validation is already red

`npm run build` fails because `mockDevices` is inferred as `any[]` in
`MidiDeviceList.tsx`, and because `Badge` is imported but unused in `SessionActivity.tsx`.
`npm run lint` additionally fails because `Math.random()` is called during render in
`LatencyMonitor.tsx`, the same unused import is reported, and synchronous state hydration in
`Header.tsx` violates the configured React hooks rule.

These failures make regressions easy to ship and weaken confidence in every later change. The
minimum repair is to add a device type (or remove the mock), remove unused imports, make chart
data deterministic or stateful, and choose a deliberate local-storage hydration pattern. The
API should also have its own build and lint scripts so it is not invisible to validation.

### Medium: dependency and build boundaries are ambiguous

The API has no scripts, and the root has no package manifest or workspace configuration. A new
developer must infer which directory to install and run. The API compiles only if invoked
manually with `tsc`; it has no declared runtime entrypoint. There is no single command that
starts both the relay and the web app, and no documented environment variable for the API URL.

Choose either a workspace/monorepo setup with explicit root scripts, or document independent
web/API commands and add scripts to both packages. Keep one authoritative lockfile per chosen
package-manager strategy and avoid the empty root lockfile if the root is not a package.

### Medium: protocol and domain types are duplicated by convention

The server accesses arbitrary `data` properties after `JSON.parse`, while the frontend has no
corresponding domain types. There is no shared definition for MIDI messages, users, telemetry,
rooms, errors, or chat. This makes changes to the server protocol compile successfully while
silently breaking clients.

Introduce a small shared protocol package or generated schema. Keep transport envelopes separate
from domain payloads, include a protocol version and message ID, and model server errors and
acknowledgements explicitly.

### Medium: UI interaction and accessibility are incomplete

Several clickable controls are plain buttons without actions or disabled/loading states. The
profile trigger is a clickable `div` wrapping a nested button, which is invalid interaction
semantics and can produce duplicate click behavior. The modal has no Escape handling, focus trap,
return-focus behavior, dialog role, or labelled title. The device settings button has no label,
and piano keys are visual `div` elements rather than keyboard/pointer controls.

Use semantic buttons for all actions, provide visible focus states, add labels and live status
regions for connection state, and make the modal a proper accessible dialog. A virtual piano
should support pointer and keyboard input, note-on/note-off lifecycle, velocity, and release on
blur/unmount.

### Medium: render behavior is unstable and misleading

`LatencyMonitor.tsx` generates a different chart on every render with `Math.random()`. Besides
failing the lint rule, this makes the UI jump for unrelated state changes and prevents
reproducible screenshots or tests. The component also reports “Optimal” while disconnected.
Telemetry visualizations should consume sampled data, use stable keys and values, and handle the
empty state explicitly.

### Low: code hygiene and presentation inconsistencies

Formatting varies between single and double quotes and between semicolon-terminated and
non-terminated files. `PianoDock.tsx` contains an empty label span, an inaccurate range caption
(`C4 to C8` while the key data begins at A0), and fixed dimensions that can become unusable on
small screens. `index.html` retains the default Vite favicon. The footer says “Built with React,
TypeScript, and WebRTC”, which contradicts the current relay implementation.

These issues are not blockers individually, but they make the project look less finished and
make the product story harder to trust.

## Architecture assessment

### Current architecture

The current design is effectively:

```text
Browser React dashboard  --(no implemented client transport)-->  WebSocket relay
       |                                                        |
       +-- static/mock UI                                      +-- process memory
```

The intended architecture appears to be:

```text
Browser MIDI input/output
        |
        v
Typed client session + clock/latency layer
        |
        v
Room-aware WebSocket transport (authenticated, validated)
        |
        v
Other clients' scheduled MIDI output
```

The missing middle layer is where most product correctness lives. It should own connection
retries, room membership, message ordering, clock offset, latency samples, MIDI device
enumeration, note lifecycle, cleanup, and user-visible errors. Components should subscribe to
that state rather than inventing values locally.

### Recommended boundaries

1. **`shared/protocol`**: schemas and TypeScript types for envelopes, room events, MIDI events,
   chat, errors, and acknowledgements.
2. **`web/src/services/midi`**: Web MIDI capability detection, input/output enumeration,
   listener registration, permission errors, and device cleanup.
3. **`web/src/services/session`**: WebSocket lifecycle, room join/leave, reconnect policy,
   heartbeat, message validation, and event dispatch.
4. **`web/src/state`**: a single source of truth for connection, devices, peers, activity, and
   telemetry.
5. **`api/src`**: validated handlers, room registry, identity/session lifecycle, rate limiting,
   and graceful shutdown.
6. **Feature components**: rendering and user intent only; no fabricated transport state.

## Implementation roadmap

### Phase 1: make the baseline honest and buildable

- Fix all TypeScript and ESLint failures.
- Remove or label mock values as demo data.
- Correct the WebRTC/WebSocket language and stale README claims.
- Add scripts for API build, dev, and start.
- Add a CI job that runs web build/lint and API type-check.

### Phase 2: implement a vertical slice

- Define a versioned message schema.
- Implement room creation/joining and explicit server acknowledgements.
- Add a frontend WebSocket service with reconnect and error states.
- Implement Web MIDI permission/device enumeration.
- Send MIDI note-on/note-off events from one local input to one remote client.
- Dispatch received events to a selected MIDI output.
- Add integration tests for join, leave, routing, malformed messages, and cleanup.

### Phase 3: make timing and operations credible

- Add server/client clock-offset estimation and measured round-trip telemetry.
- Define ordering and duplicate handling with sequence numbers.
- Add bounded queues and backpressure behavior.
- Add heartbeat timeouts, graceful shutdown, structured logs, and health checks.
- Add authentication and room authorization before public deployment.

### Phase 4: finish the product surface

- Make the virtual piano interactive and accessible.
- Replace mock activity with event-driven activity.
- Add device selection and route configuration.
- Add responsive behavior for the dock and small screens.
- Add browser compatibility messaging for Web MIDI and secure-context requirements.

## Acceptance criteria for a credible release

- `npm run build` and `npm run lint` pass for every package in CI.
- A user can see an explicit Web MIDI support/permission state.
- A room can be created and joined; users in different rooms never receive each other's data.
- A note-on and note-off sent from a physical or virtual input arrive at the intended output with
  measured timestamps and no stuck notes after disconnect.
- Every displayed connection, participant, device, route, and latency value comes from live state
  or is clearly marked as sample/demo data.
- Malformed, oversized, unauthorized, and rate-limited messages receive deterministic errors.
- Reconnect, tab close, server restart, and device unplug are covered by tests.
- The deployment instructions identify the web origin, secure WebSocket endpoint, required
  environment variables, and supported browsers.

## Overall assessment

The project has a clear visual direction and a useful component skeleton, but it should be
positioned as an early prototype until the transport, MIDI, room, and state layers exist. The
highest-value next step is not another dashboard redesign: it is a tested vertical slice that
connects one browser MIDI source to one authenticated room and one remote MIDI destination.
Once that path is real, the current UI can become a useful control surface rather than a
collection of persuasive placeholders.
