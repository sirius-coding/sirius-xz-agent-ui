# sirius-xz-agent-ui Design

## Goal

Build a standalone frontend control console for `sirius-xz-agent`:

- show the agent summary and system status
- ask questions against the agent
- browse and edit knowledge documents
- inspect API health and request/response behavior

The UI should feel like a focused AI engineering console rather than a generic admin template.

## Non-Goals

- authentication and authorization
- multi-user collaboration
- chat history persistence
- file upload
- long-running workflow orchestration
- real-time streaming answers

## Information Architecture

The app is organized into four work areas:

1. Overview
   - agent summary
   - capability focus
   - backend status
   - active configuration hints
2. Chat
   - ask a question
   - view answer
   - inspect matched tokens
   - inspect source documents
3. Knowledge
   - list documents
   - inspect document details
   - create/update documents
4. API Lab
   - verify health
   - view endpoint status
   - debug request and response payloads

The shell keeps runtime mode and sync state visible while users move between pages.

## Visual Direction

- dark, high-contrast console style
- neon-leaning accent color on a restrained base
- dense but readable information hierarchy
- card-based layout with clear status chips
- responsive behavior for desktop and tablet first

## Technical Approach

- React + Vite + TypeScript
- local module-based state, no router for the first iteration
- relative API paths in development through Vite proxy
- fallback to mock data when the backend is unavailable
- native CSS variables for theme and spacing

The first iteration does not need a router. Hash-based page switching is enough to make the shell feel like a multi-page console while keeping the dependency surface small.

## Data Flow

1. The app loads agent summary and document list on startup.
2. Each API call tries the backend first.
3. If the backend is unavailable, the client falls back to in-memory mock data.
4. A chat submission returns the structured answer, sources, confidence, and matched tokens.
5. Saving a knowledge document refreshes the document list and selected detail view.

## UI States

The implementation must define explicit states for:

- loading
- empty
- success
- error
- fallback/mock mode

The overview page should expose:

- a top hero with runtime and sync metadata
- a status strip with backend mode and document counts
- a system snapshot block with runtime, last sync, and selected document

The chat page should expose:

- a prompt helper line that suggests the kinds of questions the backend can answer well
- a structured answer section with confidence, sources, and matched tokens

The knowledge page should expose:

- a list of documents on the left
- an editable document form on the right
- immediate refresh after save when the backend is reachable

## API Contract

The frontend consumes the existing backend contract:

- `GET /api/agent/summary?name=...`
- `GET /api/agent/ask?question=...`
- `GET /api/knowledge/documents`
- `POST /api/knowledge/documents`
- `GET /api/knowledge/documents/{id}`

The app also checks backend health through the actuator health endpoint when available.

## Component Boundaries

- `AppShell`
  - top-level layout, navigation, and status strip
- `MetricCard`
  - compact data display for summary and health indicators
- `StatusPill`
  - state visualization for connected, degraded, and fallback modes
- `SideNav`
  - page navigation with per-section counters
- `DocumentList`
  - knowledge document listing and selection
- `DocumentEditor`
  - upsert form for a knowledge document
- `ChatPanel`
  - question entry and answer rendering
- `ApiInspector`
  - endpoint and health visibility

## Testing Strategy

- unit-test API helpers and mock fallback behavior
- smoke-test page-level state transitions
- verify form submission and document refresh paths
- verify error rendering for unreachable backend scenarios

## Success Criteria

- the app starts locally as a standalone frontend project
- the overview, chat, knowledge, and API pages all render
- the app can run against the backend or in fallback mock mode
- the shell clearly communicates backend mode, last sync time, and document counts
- the UI exposes enough structure to support future Figma-to-code refinement
