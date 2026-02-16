# LLearn — Project Guide

Interactive web app for learning LLM implementation patterns through hands-on exercises. Built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, and shadcn/ui.

## Commands

- `npm run dev` — Start dev server (requires Node 22+, use `nvm use 22`)
- `npm run build` — Production build (also runs TypeScript checks)
- `npm run lint` — Run ESLint
- `npm start` — Serve production build locally

## Validation

After any code change, run these before considering work complete:

1. `npm run build` — Must pass with zero errors (includes TypeScript compilation)
2. `npm run lint` — Must pass with no warnings or errors
3. Dev server smoke test — `npm run dev` and verify:
   - Landing page loads at `/`
   - Module overview loads at `/learn`
   - At least one lesson page loads (e.g., `/learn/prompt-engineering/clear-instructions`)

## Architecture

### Content system

Lessons are defined as typed TypeScript objects in `content/<module-slug>/`. Each lesson file exports a `Lesson` object (see `lib/types.ts` for the schema). Module index files re-export all lessons as a `Module` object.

To add a new lesson: create a file in the module's content directory, add it to the module's `index.ts`, and the routes are generated automatically via `generateStaticParams`.

### Key directories

- `app/` — Next.js App Router pages
- `components/ui/` — shadcn/ui primitives (don't edit manually, use `npx shadcn add`)
- `components/layout/` — Site header, lesson sidebar
- `components/lesson/` — Lesson page components (editor, examples, validation)
- `components/landing/` — Landing page components
- `content/` — Lesson data organized by module
- `lib/` — Shared types, utilities (validation, progress, content loading)

### Client vs server components

- Lesson page (`app/learn/[module]/[lessonSlug]/page.tsx`) is a server component
- Interactive components (`exercise-editor`, `lesson-sidebar`, `copy-to-claude`, `progress-indicator`) are client components (`"use client"`)
- Content loading (`lib/content.ts`) works on both server and client

## Conventions

- Use `@/` import alias for all project imports
- Use shadcn/ui components from `components/ui/` for UI primitives
- Use Tailwind for styling — no CSS modules or styled-components
- Exercise validation is structural (regex, contains, min-length) — no LLM calls needed
- Progress tracking uses localStorage via `lib/progress.ts`
- No API keys or external services required for core functionality
