# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MathWise is a Spanish-language calculus tutoring web app for a "Cálculo Diferencial" course. Users sign in with Google (Firebase Auth) and land in one of two dashboards based on a role stored in Firestore:

- **Tutor**: creates "guides" (freeform lists of exercises) and assigns them to students.
- **Student**: works through assigned guides or a built-in bank of 34 derivative exercises, using a chat-style panel with canned "answer / step-by-step / teach me / hint / practice" responses.

The "AI tutor" chat is **not** an LLM integration — it's a scripted lookup into a hardcoded `SOLUTIONS` map keyed by exercise id, with simple Spanish keyword matching (`no entiendo`, `pista`, `práctica`, `respuesta`) to pick which canned response to surface. Keep this in mind when asked to "improve the tutor's responses" — it means editing/adding entries in `SOLUTIONS`, not wiring up a model.

This was bootstrapped from a CodeSandbox "React and TypeScript" starter (see `package.json` name/description and `.codesandbox/tasks.json`) and has since been built out into the actual app.

## Commands

Package manager is Yarn (see `.codesandbox/tasks.json`), but npm works identically since there's no lockfile-specific tooling.

- `yarn start` — run the CRA dev server on port 3000
- `yarn build` — production build (`react-scripts build`)
- `yarn test` — Jest/React Testing Library via `react-scripts test --env=jsdom` (no test files currently exist in the repo)
- `yarn eject` — CRA eject (avoid unless explicitly requested — irreversible)

There is no standalone lint script. `.eslintrc.json` only adds `@typescript-eslint/parser`; actual linting happens automatically as part of `react-scripts start`/`build` (CRA's built-in `eslint-config-react-app`).

## Architecture

This is a **single-file application**: essentially all logic lives in `src/App.tsx` (~2100 lines). `src/index.tsx` just mounts `<App />`, and `src/styles.css` is unused CRA boilerplate.

Top of `src/App.tsx`, in order:
1. **Firebase setup** — `initializeApp`/`getAuth`/`getFirestore`/`GoogleAuthProvider`, initialized at module scope with a hardcoded client config object.
2. **`C`** — the shared color palette object used throughout (all styling is inline `style={{...}}`, no CSS modules/Tailwind).
3. **KaTeX helpers** — `Tex` (renders a single LaTeX string via `katex.render` into a ref) and `MathText` (splits a string on `$...$` / `$$...$$` and `**bold**` markers and renders each part, used for all chat message content).
4. **`BUILTIN`** — the 34 fixed exercises ("Guía 12°"), grouped into parts I–IV by topic (definición, trig, tangente, potencia, producto, cociente, cadena, log/exp, orden superior, aplicada, implícita).
5. **`SOLUTIONS`** — keyed by exercise id, each entry has `answer` / `step` / `teach` / `exam` / `practice` markdown-ish strings (rendered through `MathText`). Adding a new built-in exercise means adding matching entries to both `BUILTIN` and `SOLUTIONS`.
6. **`MODES`** — the five response modes shown as tabs in the student chat UI, mapped to keys in `SOLUTIONS`.

Screen components (composed by the root `App` based on auth/role state):
- `LoginScreen` — Google popup sign-in; on first sign-in, checks `users/{uid}` in Firestore — if missing, routes to `RolePicker`.
- `RolePicker` — one-time choice between `tutor` and `student`, written to `users/{uid}.role`.
- `TutorDashboard` — tabbed UI (guides / create / assign / students) that reads/writes Firestore directly with no service layer.
- `StudentDashboard` — sidebar (assigned guides vs. built-in guide) + chat panel; tracks per-exercise "solved" state in `localStorage` under key `mw_s_{uid}` in addition to Firestore-backed assignment data.
- Root `App` — subscribes to `onAuthStateChanged`, loads the user's role from Firestore, and picks which screen to render (`Cargando…` while loading → `LoginScreen` → `RolePicker` → `TutorDashboard`/`StudentDashboard`).

There is no router, no global state management (Redux/Context) — everything is local `useState` per component, and no separate API/service module — Firestore/Auth calls are made inline inside the components that need them.

### Firestore data model

- `users/{uid}`: `{ uid, name, email, photo, role: "tutor" | "student", createdAt }`
- `guides/{id}`: `{ tutorId, tutorName, title, description, exercises: string (newline-delimited, one exercise per line), createdAt }`
- `assignments/{id}`: `{ tutorId, tutorName, studentId, studentName, guideId, guideTitle, assignedAt, status }`

There's no `firebase.json`/`firestore.rules` in this repo — security rules are managed outside the codebase (in the Firebase console/project), so don't assume any particular access-control invariant when reading this code.

## Conventions

- All user-facing text is **Spanish**; keep new UI copy consistent with that.
- Styling is always inline style objects using the `C` color constants — there's no external stylesheet or design system to extend, just follow the existing inline-style pattern.
- `tsconfig.json` has `strict: true` but most components use untyped/implicit-`any` props (e.g. `function Tex({ tex, block = false })`) — match the existing loose-typing style rather than introducing new type-checking friction unless asked to.
