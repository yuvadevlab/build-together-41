# Build KnowledgAI

## Product experience
- Replace the placeholder home page with a modern, dark-first AI knowledge management workspace called KnowledgAI.
- Add a collapsible workspace sidebar, tenant/version controls, ingestion notifications, profile menu, and light/dark theme switch.
- Provide navigable areas for overview, knowledge sources and versions, prompt playground, widget customizer, live support inbox, analytics, and settings/integrations.

## Interactions
- Support version selection, crawler discovery with checked-by-default paths and exclusions, mock crawl progress, file selection, source actions, and production promotion confirmation.
- Build a configurable prompt playground with persona/model/tuning controls, simulated cited answers, and a retrieval inspector.
- Build a widget sandbox with configurable branding/placement, compact and expanded chat states, messaging, and copyable embed code.
- Build working inbox tabs and agent takeover, analytics filters/actions, and integration connection toggles.
- Use responsive layouts and realistic sample data; these are front-end demonstrations and do not perform real crawling, indexing, AI requests, or integrations.

## Technical approach
- Keep the experience within the existing TanStack Start home route, using local React state and installed Shadcn controls.
- Centralize the dark/light design tokens in `src/styles.css` and use semantic colors throughout the interface.
- Preserve the existing route setup and add route-specific metadata to `/`.

## Verification
- Run the existing routing test and validate the preview's key flows and small-screen layout.
- Check the latest preview build log and keep the project roadmap complete.