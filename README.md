# Polyglot

Polyglot is an AI-assisted visual web builder built with Next.js, React, Prisma, NextAuth, and Zustand.

## Local Development

1. Install dependencies with `npm install`.
2. Set up the required environment variables in `.env`.
3. Run the app with `npm run dev`.

The main product flows are:

- Dashboard: `src/app/page.tsx`
- New project flow: `src/app/builder/new/page.tsx`
- Builder studio: `src/app/builder/[id]/page.tsx`
- Share preview: `src/app/share/[id]/page.tsx`

## Quality Checks

- `npm run lint`
- `npm run build`

## Notes

- Projects are persisted through the Prisma-backed `/api/projects` endpoints.
- Shared previews use `/api/share/[id]`.
- Production export packages are generated from the same project renderer used by preview and share views.

I audited my-dev-builder and the product is not ready for “world class polish” yet because the core editor, persistence, preview/share/export parity, and API safety all need repair first. npm run lint currently reports 133 problems, and npm run build fails right now in [db-check.ts](E:/products/all in one/my-dev-builder/db-check.ts#L1). I have not changed code yet.

Major Issues

Repo hygiene is already broken: [README.md](E:/products/all in one/my-dev-builder/README.md#L1) still has unresolved git conflict markers, and the production build is blocked by dev-script/type issues in [db-check.ts](E:/products/all in one/my-dev-builder/db-check.ts#L1).
Existing project deep-links are broken. [builder/[id]/page.tsx](E:/products/all in one/my-dev-builder/src/app/builder/[id]/page.tsx#L23) calls setCurrentProject before loading server data and never retries, while [builder/[id]/preview/page.tsx](E:/products/all in one/my-dev-builder/src/app/builder/[id]/preview/page.tsx#L70) and [share/[id]/page.tsx](E:/products/all in one/my-dev-builder/src/app/share/[id]/page.tsx#L11) do not fetch from the server at all.
Style persistence is broken. CSS edits live only in [useDesignStore.ts](E:/products/all in one/my-dev-builder/src/state/useDesignStore.ts#L174), but server sync is triggered from [useCanvasStore.ts](E:/products/all in one/my-dev-builder/src/state/useCanvasStore.ts#L134) only on canvas-store mutations, so builder state, DB state, preview, and export drift apart.
Hydration restores defaults instead of real saved styles. [useSyncStores.ts](E:/products/all in one/my-dev-builder/src/hooks/useSyncStores.ts#L29) recreates missing elements from component defaults instead of project.designElements.
The builder canvas does not render the full component tree faithfully. [Canvas.tsx](E:/products/all in one/my-dev-builder/src/app/components/canvas/Canvas.tsx#L838) wraps only root nodes in CanvasElement, while nested nodes recurse through [ComponentWrapper.tsx](E:/products/all in one/my-dev-builder/src/app/components/canvas/ComponentWrapper.tsx#L114) and many layout types render null in [ComponentRenderer.tsx](E:/products/all in one/my-dev-builder/src/app/components/canvas/ComponentRenderer.tsx#L54).
Preview parity is incomplete. [builder/[id]/preview/page.tsx](E:/products/all in one/my-dev-builder/src/app/builder/[id]/preview/page.tsx#L26) only handles a subset of components, but the registry in [componentRegistry.ts](E:/products/all in one/my-dev-builder/src/config/componentRegistry.ts#L839) includes many more marketing/commerce blocks.
Manual insertion of premade sections loses their blueprint styling. [useCanvasStore.ts](E:/products/all in one/my-dev-builder/src/state/useCanvasStore.ts#L15) and [useCanvasStore.ts](E:/products/all in one/my-dev-builder/src/state/useCanvasStore.ts#L359) build blueprint trees but discard blueprint node props/css, even though those blueprints are defined in [componentRegistry.ts](E:/products/all in one/my-dev-builder/src/config/componentRegistry.ts#L193).
The project API has a security problem. [api/projects/route.ts](E:/products/all in one/my-dev-builder/src/app/api/projects/route.ts#L50) upserts by arbitrary id without verifying ownership on update.
Share/export is misleading today. The dashboard copies protected /builder/{id}/preview URLs in [page.tsx](E:/products/all in one/my-dev-builder/src/app/page.tsx#L91), but [middleware.ts](E:/products/all in one/my-dev-builder/src/middleware.ts#L1) protects /builder/\*, so “no-login sharing” is not real.
Export is not trustworthy yet. [api/export/route.ts](E:/products/all in one/my-dev-builder/src/app/api/export/route.ts#L15) ignores requested format and always builds one zip via [exporter.ts](E:/products/all in one/my-dev-builder/src/utils/exporter.ts#L174), which also contains fragile JSX generation like duplicate className output at [exporter.ts](E:/products/all in one/my-dev-builder/src/utils/exporter.ts#L156).
The “interactive / 3D / world-class” promise is not implemented yet. [InteractionsPanel.tsx](E:/products/all in one/my-dev-builder/src/app/components/panels/InteractionsPanel.tsx#L6) is still placeholder, and [builder/[id]/page.tsx](E:/products/all in one/my-dev-builder/src/app/builder/[id]/page.tsx#L69) still has placeholder Assets and History panels.
Builder UX still has product-level gaps. Closing the inspector in [RightPanel.tsx](E:/products/all in one/my-dev-builder/src/app/components/layout/RightPanel.tsx#L46) has no reopen path, and undo/redo in [useCanvasStore.ts](E:/products/all in one/my-dev-builder/src/state/useCanvasStore.ts#L643) does not cover style edits.
Implementation List

Stabilize the codebase: clear build/lint blockers, remove conflict markers, clean debug leftovers, and fix broken dev artifacts so the app can ship reliably.
Fix project loading and persistence: add proper single-project fetching, hydrate from server truth, and make style edits save immediately and per-project.
Unify builder, preview, and export rendering: one canonical render model for all component types so what users build is what they preview and export.
Repair the component system: make blueprint insertion preserve blueprint props/css, support all registered components, and make nested elements truly selectable/editable/resizable.
Secure the backend: enforce ownership in project writes, validate request payloads, and separate private builder routes from public shared preview routes.
Polish the full product UI: consistent premium design system across dashboard, auth, new project, builder, preview, share, empty states, errors, loading, and responsive behavior.
Ship advanced interactive creation: real interactions panel, motion presets, scroll/hover/click animations, 3D transform controls, and export-safe animation support.
Finish export/share productization: honor export format selection, generate valid modern code packages, and build true read-only public sharing.
Add quality gates: tests for create/edit/load/preview/share/export flows plus regression coverage for store sync and API auth.
I recommend we start with 1 -> 4 before touching 3D animation, because otherwise we’d be polishing a broken core. If you approve this implementation order, I’ll begin with Phase 1 and Phase 2 first.
