# Breathing Techniques — React + Vite app

A small web application for exploring and practicing different breathing techniques. It is built with React and Vite, styled with Tailwind CSS, and includes a modular visualization system and utilities (e.g., a configurable logger).

This README consolidates setup and usage for the repository and the nested application under `./breathing-techniques/`. Existing in‑repo docs (linked below) provide deeper detail for specific subsystems.

## Overview
- Stack: React 19, Vite 7, Tailwind CSS 4, PostCSS, Framer Motion
- Language: JavaScript (ESM)
- Package manager: npm (package-lock.json present)
- App location: `./breathing-techniques/`
- Entry points:
  - HTML: `breathing-techniques/index.html`
  - Client: `breathing-techniques/src/main.jsx` → renders `<App />`
- Dev server and bundler: Vite

## Requirements
- Node.js 18+ (recommended LTS) or newer compatible with Vite 7
- npm 9+ (comes with Node)

## Quick start
```bash
# 1) Install dependencies for the app
cd breathing-techniques
npm install

# 2) Start the dev server (Vite)
npm run dev
# Vite will print a local URL to open in your browser

# 3) Build for production
npm run build

# 4) Preview the production build locally
npm run preview
```

Tip: This repository also contains a minimal `package.json` at the repo root with Tailwind/PostCSS as devDependencies only. The actual app and its scripts live in `./breathing-techniques/`.

## Scripts (in `./breathing-techniques/`)
- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Production build (`dist/`)
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint on the project

## Environment variables
Vite exposes only variables prefixed with `VITE_` to the client. The app uses:
- `VITE_LOG_LEVEL` — Controls logging level for the in‑app logger.
  - Allowed values: `none`, `error`, `warn`, `info`, `debug`
  - Defaults: `debug` in development, `error` in production
  - Example `.env` in `./breathing-techniques/`:
    ```bash
    VITE_LOG_LEVEL=info
    ```

Additional runtime controls (not env vars):
- `localStorage.LOG_LEVEL` — Overrides the logging level at runtime (same allowed values as above).
- `localStorage.LOG_CATEGORIES` — JSON array to filter logger categories (e.g., `["service","state"]`).

## Tests
There is a `src/__tests__/` directory with test files using Jest‑style APIs (e.g., `jest.fn`, `describe/test`). However, no test runner configuration or dependency is currently present in `package.json`.

- Current status: tests are not wired to run.
- TODO:
  1. Decide on a test runner: Jest or Vitest.
  2. Add dependencies and configuration.
     - For Jest: add `jest`, `babel-jest` (if needed), and a `jest.config.js`.
     - For Vitest: add `vitest`, set up `vite.config.js` test section, update imports if migrating from Jest-specific APIs.
  3. Add a script to `package.json` (e.g., `"test": "vitest"` or `"test": "jest"`).

Once configured, tests would typically be run with:
```bash
npm test
```

## Project structure
Top-level (this repository):
```
./
├─ README.md                     # This file
├─ package.json                  # Root (dev) dependencies only
├─ package-lock.json
├─ node_modules/                 # Root node_modules
└─ breathing-techniques/         # The actual web app (React + Vite)
```

Application folder (`./breathing-techniques/`):
```
breathing-techniques/
├─ index.html                    # Vite HTML entry
├─ package.json                  # App dependencies & scripts
├─ package-lock.json
├─ vite.config.js                # Vite configuration
├─ public/                       # Static assets
├─ dist/                         # Production build output (after build)
├─ src/                          # Application source
│  ├─ main.jsx                   # JS entry (mounts <App />)
│  ├─ App.jsx, AppProviders.jsx  # App root and providers
│  ├─ components/                # UI components
│  ├─ services/                  # App services (e.g., AudioService)
│  ├─ strategies/                # Visualization strategies
│  ├─ utils/                     # Utilities (e.g., Logger)
│  └─ __tests__/                 # Test files (needs runner wiring)
├─ README.md                     # Template README from Vite (kept for reference)
├─ FRAMEWORK_README.md           # Notes about framework choices
├─ LOGGER_README.md              # Detailed logger documentation
└─ src/visualizations/**/README.md  # Detailed visualization docs
```

Notable documentation (in `./breathing-techniques/`):
- `LOGGER_README.md` — How logging works, levels, and env/localStorage config.
- `FRAMEWORK_README.md` — Framework considerations.
- `src/visualizations/README.md` — Visualization architecture overview.
- `src/visualizations/primitives/README.md` and `src/visualizations/primitives/shapes/README.md` — Low‑level rendering details.
- `src/components/Common/README.md` — Common components documentation.

## Development notes
- Tailwind CSS 4 + PostCSS are configured in the app; styles are imported from `src/index.css` (see `src/main.jsx`).
- Vite dev server serves `index.html` and mounts the React app at `#root`.
- The logger reads `import.meta.env` variables (Vite) and `localStorage` to control verbosity and categories.

## Deployment
- Build with `npm run build` to generate `breathing-techniques/dist/`.
- Serve the `dist/` directory with any static server.
- If deploying under a subpath, ensure Vite `base` is configured accordingly in `vite.config.js`. 

## License
- TODO: No license file detected. Add a LICENSE file (e.g., MIT) at the repository root and reference it here.

---
If anything in this README becomes outdated, please update the relevant section and/or the linked subsystem docs.