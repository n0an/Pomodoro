# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs Vite dev server + Tauri window)
npm run tauri dev

# Build production app (creates .app and .dmg on macOS)
npm run tauri build

# Frontend only (no native window)
npm run dev

# Type check
npx tsc --noEmit
```

## Architecture

This is a Tauri desktop app with a React frontend. Tauri wraps web content in a native WebView and provides a Rust backend for system integration.

```
┌─────────────────────────────────────┐
│          Tauri Runtime              │
│  ┌─────────────┐  ┌──────────────┐  │
│  │   Rust      │  │   WebView    │  │
│  │   Backend   │◄►│   (React)    │  │
│  │  src-tauri/ │  │   src/       │  │
│  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

**Frontend (src/):** React 19 + TypeScript + Vite. All UI and timer logic lives in `App.tsx`.

**Backend (src-tauri/):** Rust code for native functionality. `tauri.conf.json` configures window size, app name, and bundling. Custom Rust commands go in `lib.rs`.

**Communication:** Frontend can call Rust functions via `invoke()` from `@tauri-apps/api/core`. Currently the app is frontend-only with no custom Rust commands.

## Build Output

Production builds go to `src-tauri/target/release/bundle/`:
- `macos/Pomodoro.app` - macOS application bundle
- `dmg/Pomodoro_*.dmg` - macOS disk image installer
