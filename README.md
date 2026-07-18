# NOEXCUSE HPO V2 Dashboard

Production-grade dashboard foundation for a wearable health monitoring system.

**This is PR3.1 — Project Foundation.**
No dashboard widgets, charts, live Firebase data, or AI features are implemented yet.
This PR establishes the scalable architecture that later PRs will build on.

## Tech Stack

- React 19
- Vite 5
- TypeScript 5 (strict mode)
- Tailwind CSS 3
- React Router 6
- Firebase Modular SDK v11 (App, Auth, Firestore, Realtime Database)
- Lucide React (icons)
- Framer Motion (animation)
- React Hot Toast (notifications)
- React Hook Form (forms)
- ESLint 9 (flat config) + Prettier 3

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your Firebase project credentials in `.env.local`.

### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
npm run preview
```

## Available Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the Vite development server        |
| `npm run build`        | Type-check and build for production      |
| `npm run preview`      | Preview the production build locally     |
| `npm run lint`         | Run ESLint                               |
| `npm run lint:fix`     | Run ESLint and auto-fix issues           |
| `npm run format`       | Format the codebase with Prettier        |
| `npm run format:check` | Check formatting without writing changes |
| `npm run typecheck`    | Run the TypeScript compiler with no emit |

## Folder Structure

```
noexcuse-hpo-v2/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/                 # Static images and icons
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   │   ├── common/             # Cross-cutting shared components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── Layout/              # Application shell components
│   │       ├── AppLayout.tsx
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── constants/               # App-wide constants
│   │   ├── app.constants.ts
│   │   └── routes.constants.ts
│   ├── context/                 # React Context providers
│   │   ├── GlobalContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                    # Reusable hooks
│   │   ├── useAuth.ts
│   │   ├── useGlobalContext.ts
│   │   └── useTheme.ts
│   ├── pages/                    # Route-level page components
│   │   ├── Auth/LoginPage.tsx
│   │   ├── Dashboard/DashboardPage.tsx
│   │   └── NotFound/NotFoundPage.tsx
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── services/
│   │   └── firebase/
│   │       ├── authService.ts
│   │       └── firebaseConfig.ts
│   ├── types/                    # Shared TypeScript types
│   │   ├── global.types.ts
│   │   ├── theme.types.ts
│   │   └── user.types.ts
│   ├── utils/                    # Pure utility functions
│   │   ├── cn.ts
│   │   ├── logger.ts
│   │   └── storage.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .eslintrc / eslint.config.js
├── .prettierrc.json
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── vite.config.ts
```

## Architecture Notes

- **Path aliases** (`@components`, `@pages`, `@hooks`, `@services`, `@types`, `@constants`,
  `@utils`, `@assets`, `@context`, `@routes`) are configured in both `vite.config.ts` and
  `tsconfig.app.json` to keep imports flat as the codebase scales past 20,000 lines.
- **Theme system** is driven by `ThemeContext`, supporting `light`, `dark`, and `system` modes,
  persisted to `localStorage`, and toggled via a `dark` class on `<html>` consumed by Tailwind's
  `darkMode: 'class'` strategy.
- **Global state** (active user, active wearable device, sidebar/layout UI state) lives in
  `GlobalContext`, separate from theme state, so layout re-renders don't cascade into
  authentication or device logic.
- **Routing** is centralized in `AppRoutes.tsx`. Authenticated routes are wrapped by
  `ProtectedRoute`, which redirects unauthenticated users to `/login` while preserving the
  intended destination via router location state.
- **Firebase** is initialized once in `firebaseConfig.ts` (guarded against re-initialization in
  hot-reload scenarios) and exposes typed `firebaseAuth`, `firestoreDb`, and `realtimeDb`
  instances. `authService.ts` wraps Firebase Auth calls behind a small, testable API.
- **Error handling** uses a top-level `ErrorBoundary` class component so unexpected render errors
  produce a graceful fallback screen instead of a blank page.
- This PR intentionally ships only placeholder `Sidebar`, `Navbar`, `DashboardPage`, and
  `LoginPage` implementations — enough to prove the shell renders and routes correctly. Vital
  sign charts, live device telemetry, and AI-driven insights are out of scope until later PRs.

## Environment Variables

See `.env.example` for the full list of required Firebase configuration values. Copy it to
`.env.local` before running the app; Vite automatically loads `.env.local` and exposes any key
prefixed with `VITE_` to the client via `import.meta.env`.
