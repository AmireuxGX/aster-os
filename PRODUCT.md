# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Aster OS serves people who need or evaluate familiar desktop productivity workflows inside a browser: launching tools, managing local notes and documents, browsing files, and switching between tasks without installing a native operating system.

## Product Purpose

Aster OS is a complete, interactive browser desktop rather than a static desktop mockup. It provides one continuous environment for booting, orienting, launching apps, multitasking, creating content, and returning to locally saved work. Success means the core desktop gestures and the built-in apps remain genuinely usable across desktop, touch, and narrow browser viewports.

## Positioning

The product combines a convincing multi-window desktop shell with practical local-first applications. Its differentiator is continuity: the launcher, dock, notifications, control center, window manager, settings, and app data behave as parts of one system instead of isolated demonstration cards.

## Operating Context

Aster OS occupies the full browser viewport and supports pointer, keyboard, and touch-oriented use. Desktop users can drag, resize, maximize, minimize, focus, and close windows; compact viewports shift to a single full-workspace window model. Settings and supported app content persist in browser storage. External web addresses are handed to a separate browser tab, and the terminal is a safe simulator that never executes host commands.

## Capabilities and Constraints

- System flows include boot, lock and unlock, desktop shortcuts, an app launcher with search, dock task switching, control center, notifications, toasts, and a desktop context menu.
- Built-in apps include Browser, Notes, Terminal, Calculator, Writer, Files, Calendar, and Settings.
- `Ctrl + Space` toggles the launcher, `Alt + Tab` changes the active window, `Alt + F4` closes it, and double-clicking a titlebar toggles maximize on desktop.
- Opening an already running app focuses its existing window instead of creating a duplicate instance.
- The implementation is local-only: it has no remote account system, cloud backend, host shell access, or evidence of cross-device synchronization.

## Brand Commitments

The product name is Aster OS. The primary interface language is Simplified Chinese (`zh-CN`). The asterisk-like Aster mark, the authored `public/aster-wallpaper.svg`, and the photographic light-table framing are established identity assets. The voice is concise, calm, and work-oriented rather than promotional.

## Evidence on Hand

- `README.md` documents the product scope, built-in apps, commands, and safety constraints.
- `index.html` contains the approved direction contract and product metadata.
- `src/App.tsx`, `src/shell/WindowFrame.tsx`, and the app components contain the implemented workflows.
- `src/styles.css`, `src/shell/window-frame.css`, and `src/apps/apps.css` are the visual and responsive sources of truth.
- `screenshots/` contains desktop, mobile, launcher, browser, and multi-window verification captures.
- No testimonials, customers, benchmarks, pricing, telemetry claims, or external product proof are present; future work must not fabricate them.

## Product Principles

- Preserve continuity across shell, windows, and apps; Aster OS is one environment, not a gallery of disconnected demos.
- Make the familiar desktop action work before adding decorative simulation.
- Keep user data and potentially risky actions local, legible, and reversible.
- Adapt desktop conventions to touch and narrow screens without hiding the user's current task.
- Persist meaningful preferences and work while keeping the system understandable without onboarding copy.

## Accessibility & Inclusion

The current implementation establishes visible keyboard focus, semantic button labels and state attributes, live status regions, a modal lock screen, reduced-motion handling, and 44px compact-mode targets. Future changes must preserve keyboard access, textual state labels, touch reachability, and Simplified Chinese legibility; no formal conformance claim is established.

