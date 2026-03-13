# Polyglot

Polyglot is an AI-assisted visual web builder built with Next.js, React, Prisma, NextAuth, and Zustand.

## Features

- **AI Studio**: Generate and refine web components using natural language.
- **Visual Editor**: Drag-and-drop builder with real-time CSS editing.
- **Deep Persistence**: Fully synced project state between canvas and design stores.
- **Export & Share**: Generate clean Next.js/Tailwind code packages or share live previews.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL`: Prisma-compatible DB string.
   - `NEXTAUTH_SECRET`: Random secret for authentication.
   - `OPENAI_API_KEY`: For AI generation features.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Database checks:
   ```bash
   npx ts-node scripts/db-check.ts
   ```

## Key Paths

- **Dashboard**: `src/app/page.tsx`
- **Builder**: `src/app/builder/[id]/page.tsx`
- **Preview**: `src/app/builder/[id]/preview/page.tsx`
- **Public Share**: `src/app/share/[id]/page.tsx`

## Quality Gates

- `npm run lint`: ESLint check.
- `npx vitest`: Core state and logic tests.
- `npm run build`: Production build verification.
