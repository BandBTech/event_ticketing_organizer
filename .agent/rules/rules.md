---
trigger: always_on
---

---
trigger: always_on
---

# Antigravity Project Rules: Event Ticketing Organizer

This document defines the coding standards, architectural patterns, and tech stack conventions for this project. Antigravity must strictly adhere to these rules for all code modifications and new feature implementation.

## 1. Project Mode & Constraints (Static Export Mode)

**CRITICAL CONSTRAINT:** The project is configured with `output: 'export'` in `next.config.js`. This enforces a **Client-First Architecture** (Static Site Generation / SPA).

| Feature | Status in this Project | Required Pattern |
|---------|----------------------|------------------|
| Server Actions | **FORBIDDEN** | Use TanStack Query `useMutation` to hit external APIs. |
| Middleware | **FORBIDDEN** | Authentication/Routing guards must be done client-side. |
| `fetch()` in Server Components | **FORBIDDEN** | All data fetching must happen in client components (`'use client'`) using TanStack Query hooks. |
| Dynamic Routes | **ALLOWED** | Must use `generateStaticParams()` to pre-render all possible paths at build time. |

## 2. Tech Stack

- **Framework:** Next.js 15 (App Router, Static Export Mode)
- **State Management:** Zustand (for global application state, non-API related)
- **API Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS 4, Shadcn UI components, Radix UI (Primitives)
- **Forms:** React Hook Form with Zod validation
- **Internationalization:** `next-intl` pattern (JSON messages in `messages/` directory)
- **Utilities:** `phosphor-icons` (icons), `date-fns` (date handling)

## 3. Directory Structure & Responsibilities

- `src/app`: Routes, layouts, and page-specific components. Must contain `generateStaticParams` for dynamic segments.
- `src/components/ui`: Atomic UI components (Shadcn/Radix based). Must be stateless.
- `src/components/layout`: Global layout components (e.g., Sidebars, Nav).
- `src/services`: Client-Side API Logic Classes. Houses all the business logic for making HTTP requests (uses TanStack Query hooks and Zod validation).
- `src/store`: Zustand stores for global UI state.
- `src/lib`: Centralized utilities (API client, token manager, shared helpers).
- `src/types`: TypeScript definitions, Zod schemas, often grouped by domain.

## 4. Antigravity Rules (Architectural Enforcement)

These rules are non-negotiable and designed to maintain a clean, testable separation between the client-side data layer and the UI.

### 4.1. The Client-First Data Flow Rule

- **Enforcement:** All asynchronous data fetching must be initiated from a component marked `'use client'`.
- **Action:** The only acceptable mechanism for fetching, caching, and updating server data is TanStack Query. Services (`src/services`) must expose query and mutation hooks, not raw `fetch` or `apiClient` calls.

### 4.2. The Zod Validation Gateway Rule

- **Enforcement:** No raw API data must ever reach a component or a Zustand store.
- **Action:** Every function within `src/services` that fetches data (i.e., every `queryFn` in a `useQuery` hook) must validate the response using a Zod schema defined in `src/types`.

### 4.3. State Ownership Rule (80/20)

- **Enforcement:** Server state (data that changes and requires caching) must be kept in TanStack Query (80%). UI state (temporary view flags, filters, modals) must be kept in Zustand or `useState` (20%).
- **Action:** Do not synchronize the results of a successful query (e.g., a list of events) into a Zustand store. Components should read API data directly from the TanStack Query hook result.

### 4.4. The Dumb Component Rule

- **Enforcement:** Components in `src/components/ui` and `src/components/layout` cannot be marked `'use client'` unless absolutely necessary (e.g., a theme provider), and they must not import any service or store.
- **Action:** State and data fetching hooks must be imported and used only in Page components (`src/app`) or Feature-specific components.
- Follow react component model with page and its components together

## 5. Coding Conventions

### Naming

- **Components:** PascalCase (e.g., `EventCard.tsx`).
- **Services & Stores:** camelCase (e.g., `authService.ts`, `authStore.ts`).
- **Query Keys:** Use a structured array format: `['domain', 'subdomain', id]` (e.g., `['events', eventId]`, `['users', 'current']`).

### Architecture Patterns

- **Services Layer:** Use classes or helper functions within `src/services` to group related `useQuery` and `useMutation` calls. This layer acts as the client-side API facade.
- **Forms:** Use Zod schemas for validation, integrated with React Hook Form. All form submissions must use a TanStack Query `useMutation` hook.
- **Authentication:** Must be handled entirely client-side (e.g., checking for a token in localStorage or cookies within the browser) and managed by the auth Zustand store and `authService`.

### Styling & UI (Rich Aesthetics)

- **Aesthetics:** Prioritize "WOW" factor. Utilize glassmorphism, depth (shadows), and smooth transitions (motion).
- **Consistency:** Always use existing UI components from `src/components/ui`.
- **Responsive Design:** All UI must be mobile-first and fully responsive, using Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`).

### Internationalization (I18n)

- Never hardcode strings. Always use the `t()` function provided by `next-intl`.
- Ensure new translation keys are added to the corresponding JSON files in the `messages/` directory.

## 6. Workflow Rules

- **Before Implementing:** Always check `src/services` to see if a relevant API hook already exists.
- **Error Handling:** Use the toast system defined in `src/lib/toast.ts`. Mutations should use the `onError` callback to display errors.
- **Verification:** Always run linting and type checks (`pnpm lint`, `pnpm check`) after changes.
- **Static Paths:** For any dynamic route like `app/events/[id]/page.tsx`, you must implement and export `generateStaticParams()` to pre-render the paths. If data for paths is unknown at build time, the route cannot be static and must be re-evaluated for architectural compatibility.
