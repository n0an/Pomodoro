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

## Requirements

- Node.js 18+
- Rust (install via rustup.rs)
- Platform-specific: Xcode CLI Tools (macOS), Visual Studio C++ Build Tools + WebView2 (Windows), webkit2gtk + libappindicator (Linux)

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

**Frontend (src/):** React 19 + TypeScript + Vite. All UI and timer logic lives in `App.tsx`. State is managed via React hooks (useState/useEffect/useRef).

**Backend (src-tauri/):** Rust code for native functionality. `tauri.conf.json` configures window size (400x520, non-resizable), app name, and bundling. Custom Rust commands go in `lib.rs`.

**Communication:** Frontend can call Rust functions via `invoke()` from `@tauri-apps/api/core`. Currently the app is frontend-only with no custom Rust commands.

## Key Implementation Details

**Timer accuracy:** The timer uses absolute timestamps (`Date.now()` + target end time) rather than decrementing a counter. This prevents drift when the window is in background or the system is under load. The interval checks remaining time against the absolute end time at 100ms frequency.

**Sound notification:** Uses Web Audio API to play ascending tones (A4, C#5, F5) with fallback to base64-encoded audio element.

## Build Output

Production builds go to `src-tauri/target/release/bundle/`:
- `macos/Pomodoro.app` - macOS application bundle
- `dmg/Pomodoro_*.dmg` - macOS disk image installer
- `msi/Pomodoro_*.msi` - Windows installer
- `deb/pomodoro_*.deb` - Linux package
