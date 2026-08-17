---
name: "Aster OS"
description: "A browser desktop shaped as a photographic light table: dense, local, and fully interactive."
colors:
  accent-cobalt: "#4f8cff"
  shell-graphite: "#090d12"
  shell-ice: "#f4f7fb"
  shell-panel-glass: "rgba(16, 21, 28, 0.82)"
  shell-panel-solid: "rgba(17, 22, 29, 0.94)"
  shell-border: "rgba(229, 239, 251, 0.16)"
  shell-light-ink: "#18202a"
  shell-light-panel: "rgba(239, 244, 249, 0.86)"
  window-surface-dark: "rgba(20, 24, 31, 0.94)"
  app-canvas-light: "#f5f6f8"
  app-surface-light: "#ffffff"
  app-ink-light: "#1e232b"
  app-muted-light: "#667080"
  app-canvas-dark: "#171a20"
  app-surface-dark: "#20242b"
  app-panel-dark: "#1b1f26"
  app-raised-dark: "#292e37"
  app-ink-dark: "#edf0f5"
  app-muted-dark: "#a3acba"
  signal-coral: "#ff7567"
  signal-lime: "#9edc55"
  status-danger: "#f07872"
  status-warning: "#dda14f"
  status-success: "#58bf97"
  browser-blue: "#3f7df0"
  notes-amber: "#d0a323"
  terminal-green: "#43b581"
  calculator-coral: "#d45f4a"
  writer-teal: "#39738f"
  files-steel: "#4d82bf"
  calendar-rose: "#bf4d5c"
  settings-violet: "#7557c7"
typography:
  display:
    fontFamily: "Segoe UI Variable, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(42px, 5.3vw, 68px)"
    fontWeight: 270
    lineHeight: 0.98
    letterSpacing: "0"
  headline:
    fontFamily: "Segoe UI Variable, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "22px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0"
  title:
    fontFamily: "Segoe UI Variable Text, SF Pro Text, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "17px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "Segoe UI Variable Text, SF Pro Text, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Segoe UI Variable Text, SF Pro Text, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0"
  mono:
    fontFamily: "Cascadia Code, SFMono-Regular, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "7px"
  xl: "8px"
  round: "50%"
spacing:
  xxs: "4px"
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  xxl: "22px"
  xxxl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent-cobalt}"
    textColor: "{colors.app-surface-light}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "7px 13px"
    height: "34px"
  button-text:
    backgroundColor: "{colors.app-surface-dark}"
    textColor: "{colors.app-ink-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "7px 13px"
    height: "34px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.app-muted-dark}"
    rounded: "{rounded.md}"
    padding: "0"
    size: "32px"
  search-field:
    backgroundColor: "{colors.app-surface-dark}"
    textColor: "{colors.app-ink-dark}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 9px"
    height: "34px"
  segmented-control:
    backgroundColor: "{colors.app-surface-dark}"
    textColor: "{colors.app-muted-dark}"
    rounded: "{rounded.lg}"
    padding: "2px"
    height: "32px"
  window-frame:
    backgroundColor: "{colors.window-surface-dark}"
    textColor: "{colors.shell-ice}"
    rounded: "{rounded.xl}"
    padding: "0"
  dock:
    backgroundColor: "{colors.shell-panel-glass}"
    textColor: "{colors.shell-ice}"
    rounded: "{rounded.xl}"
    padding: "6px"
    height: "58px"
  system-panel:
    backgroundColor: "{colors.shell-panel-glass}"
    textColor: "{colors.shell-ice}"
    rounded: "{rounded.xl}"
    padding: "16px"
  toggle-tile-on:
    backgroundColor: "{colors.accent-cobalt}"
    textColor: "{colors.app-surface-light}"
    rounded: "{rounded.lg}"
    padding: "8px"
    height: "58px"
  list-item-selected:
    backgroundColor: "{colors.app-surface-dark}"
    textColor: "{colors.app-ink-dark}"
    rounded: "{rounded.lg}"
    padding: "10px"
---

# Design System: Aster OS

## Overview

**Creative North Star: "The Photographic Light Table"**

Aster OS treats the browser viewport as a photographic light table: a graphite field illuminated by an authored blue, coral, and lime wallpaper, with compact chrome and translucent film-like surfaces layered above it. The shell should feel composed and atmospheric without becoming decorative software theater; the user's task remains the brightest, sharpest object on screen.

The shell and the apps intentionally use two material regimes. Top-level chrome, launchers, notifications, the dock, and floating windows use dark glass with crisp one-pixel rules. App interiors use quieter productivity surfaces - paper, canvas, sidebars, toolbars, and status bars - in coordinated light and dark themes. A single configurable accent connects focus, selection, active navigation, and primary actions across both regimes.

Interaction is part of the identity. Booting, opening, focusing, dragging, resizing, minimizing, restoring, searching, saving, locking, and returning to work form one continuous environment. Responsive behavior preserves that continuity by switching from overlapping windows to a full-workspace task model instead of shrinking a desktop composition beyond usability.

**Key Characteristics:**

- Graphite glass shell over an authored cobalt, coral, and lime photographic field.
- Dense productivity surfaces with crisp one-pixel rules and restrained 4-8px corners.
- One configurable accent for focus and action, plus bounded app identity colors.
- Direct manipulation, persistent local work, and explicit system state.
- Brief, decelerating motion that yields immediately to reduced-motion preferences.

## Colors

The palette balances cold graphite and ice neutrals with rare, high-clarity signals. Dark mode is the default presentation; light mode replaces the shell and app neutrals without changing the hierarchy.

### Primary

- **Aster Cobalt** (`accent-cobalt`, #4f8cff): Default focus, selection, launcher, progress, and primary-action color. Settings may replace this runtime value, so components consume the accent variable rather than hard-coding cobalt.

### Secondary

- **Signal Coral** (`signal-coral`, #ff7567): Notifications, agenda rails, and warm wallpaper energy; use as a signal, never as a second general-purpose accent.
- **Signal Lime** (`signal-lime`, #9edc55): Presence, success-adjacent shell signals, and the wallpaper's cool counterpoint.

### Tertiary

- **Browser Blue / Notes Amber / Terminal Green / Calculator Coral** (`browser-blue`, `notes-amber`, `terminal-green`, `calculator-coral`): Fixed identity accents for app icons and window identity, not interchangeable semantic colors.
- **Writer Teal / Files Steel / Calendar Rose / Settings Violet** (`writer-teal`, `files-steel`, `calendar-rose`, `settings-violet`): The remaining app identities, kept inside icon, titlebar, and app-specific contexts.
- **Status Success / Warning / Danger** (`status-success`, `status-warning`, `status-danger`): Save and error semantics inside apps. Always pair these colors with text or an icon-defined state.

### Neutral

- **Deep Graphite** (`shell-graphite`, #090d12): The shell foundation and fallback behind the wallpaper.
- **Shell Ice** (`shell-ice`, #f4f7fb): Primary shell text and high-contrast glyphs.
- **Graphite Glass / Solid Graphite Glass** (`shell-panel-glass`, `shell-panel-solid`): Translucent floating chrome and the more opaque context-menu/toast layer.
- **Frosted Shell** (`shell-light-panel`) and **Light Shell Ink** (`shell-light-ink`): Light-theme shell counterparts.
- **App Paper Set** (`app-canvas-light`, `app-surface-light`, `app-ink-light`, `app-muted-light`): Light app canvas, raised work surface, primary ink, and secondary copy.
- **App Darkroom Set** (`app-canvas-dark`, `app-surface-dark`, `app-panel-dark`, `app-raised-dark`, `app-ink-dark`, `app-muted-dark`): Default dark app hierarchy from canvas through hover-raised surfaces and readable text.

**The Accent Discipline Rule.** Accent color marks focus, selection, progress, and primary action; it does not flood whole toolbars or routine containers.

**The Identity Color Rule.** App identity colors identify an app at its icon and window boundary; shared controls continue to use the current system accent and semantic status colors.

## Typography

**Display Font:** Segoe UI Variable (with Segoe UI, PingFang SC, Microsoft YaHei, sans-serif fallbacks)  
**Body Font:** Segoe UI Variable Text (with SF Pro Text, PingFang SC, Microsoft YaHei, sans-serif fallbacks)  
**Label/Mono Font:** Cascadia Code (with SFMono-Regular and Consolas fallbacks) for terminal and technical previews only

**Character:** The system uses neutral, native-feeling variable sans typography with no added letter spacing. Hierarchy comes from weight, size, alignment, and density; mono is reserved for commands, paths, and raw content.

### Hierarchy

- **Display** (270, `clamp(42px, 5.3vw, 68px)`, 0.98): Desktop and lock-screen time; always tabular and visually quiet despite its scale.
- **Headline** (650, 22px, 1.25): App landing headings and major settings content headings.
- **Title** (650, 17px, 1.3): Sidebar, calendar, and section titles; writer document titles may rise to 24-27px.
- **Body** (400, 13px, 1.5): Standard app text and controls. Long-form reader and writer content expands to 1.8-1.85 line-height and stays within roughly 70-72ch.
- **Label** (600, 11px, 1.2): Window titles, toolbar labels, metadata, status text, and compact navigation. Sub-10px text is limited to auxiliary counts, frame codes, badges, and keyboard hints.
- **Mono** (400, 12px, 1.65): Terminal sessions; 10px mono is permitted for compact file previews.

**The Quiet Type Rule.** Do not use oversized marketing typography, negative tracking, or multiple display families; this is an operating environment, and type should clarify state rather than perform branding by itself.

## Layout

The shell is a full-viewport, overflow-hidden workspace with a fixed 36px topbar and a desktop area below it. On wide screens, 84x82px shortcuts form a left rail, a 280px glance region anchors the upper right, the contact sheet occupies the lower right, and the 58px dock floats 12px above the bottom edge. The launcher is centered above the dock at up to 620px wide; control and notification panels anchor 10px from the upper-right edge.

Windows are bounded by the desktop layer and cascade by 26px from an initial position near 104px by 72px. Each app defines a default and minimum size. Active windows rise through explicit z-index ordering; maximized windows remove radius, border, and shadow. Opening an already running app focuses that window, while clicking its active dock item minimizes it.

At 900px, secondary desktop atmosphere is reduced and the launcher grid drops a column. At 720px, or in a viewport no taller than 520px and no wider than 900px, the system enters compact workspace mode: windows fill the available work area, drag and resize stop, the maximize control disappears, topbar status is simplified, the dock spans the lower inset, and system panels use 8px side margins. At 430px, shortcut and launcher grids reduce again and control tiles become single-column. The root never targets below a 320px viewport.

App interiors use container queries instead of relying only on viewport width. At 700px, split views stack or become horizontal trays; at 590px, navigation and sidebars simplify; at 480px, notes become a horizontal list, file metadata columns collapse, and content padding tightens. Compact touch mode raises core buttons to a 44px target.

**The Workspace First Rule.** Reserve the topbar and dock before sizing windows; app content may scroll internally, but it must not disappear under shell chrome.

**The Container Owns Adaptation Rule.** Responsive app behavior follows the window's inline size, because a narrow floating window on desktop must receive the same layout care as a narrow device.

## Elevation & Depth

Aster OS uses a hybrid depth system. The shell relies on wallpaper contrast, translucent fills, backdrop blur, one-pixel borders, and large diffuse shadows. App interiors are flatter: tonal surface changes and dividers carry most hierarchy, with shadows reserved for selected rows, search emphasis, the writer page, and genuinely floating feedback.

### Shadow Vocabulary

- **Topbar Ambient** (`0 5px 18px rgba(4, 7, 11, 0.12)`): Separates persistent chrome from the wallpaper without appearing raised.
- **Dock Float** (`0 18px 52px rgba(2, 5, 9, 0.30), 0 3px 10px rgba(2, 5, 9, 0.16)`): Establishes the dock as a reachable floating control plane.
- **Panel Float** (`0 28px 80px rgba(3, 7, 12, 0.34), 0 5px 18px rgba(3, 7, 12, 0.18)`): Reserved for launchers, control surfaces, and notifications above the workspace.
- **Window Rest** (`0 24px 72px rgba(10, 14, 22, 0.24), 0 4px 14px rgba(10, 14, 22, 0.12)`): Default floating window separation.
- **Window Active** (`0 28px 90px rgba(8, 12, 20, 0.30), 0 7px 20px rgba(8, 12, 20, 0.15)`): Stronger shadow plus an accent-mixed border for the focused window.
- **Paper Lift** (`0 18px 42px rgba(20, 28, 38, 0.12)`): Writer page and other literal paper-like work surfaces only.

**The Glass Outside, Paper Inside Rule.** Backdrop blur belongs to shell chrome and window boundaries; app canvases remain crisp enough for repeated work and reading.

**The Active Plane Rule.** Only the current window receives the strongest shadow and accent border. Do not give every visible surface equal elevation.

## Shapes

The system is rectilinear and restrained. Two-pixel details define film frames and rails; 4px corners belong to document paper and contact-sheet material; 5-7px corners cover controls, fields, rows, and tiles; 8px is the standard maximum for docks, panels, app icons, and floating windows. Maximized and mobile windows become square to meet the workspace edges.

Circles are semantic exceptions: avatars, notification dots, presence indicators, calendar dates, swatches, toggle thumbs, and round playback controls. The contact sheet may rotate slightly because it represents a physical film object; operational surfaces remain aligned to the grid.

**The Eight Pixel Ceiling Rule.** Routine rectangles stay at or below 8px radius; larger soft cards would weaken the crisp desktop character.

**The Circle Reservation Rule.** Use circles for identity, status, a bounded value, or a physical control - never as ambient decoration.

## Components

### Buttons

- **Shape:** Text and primary buttons use a compact 6px radius and a 34px minimum height; compact touch mode raises them to 44px. Icon buttons are stable 32x32px squares on desktop and 44x44px on compact layouts.
- **Primary:** Current accent fill, white text, 7px by 13px padding, and a darker accent-mixed border. Hover darkens the accent; active presses down by 1px.
- **Text / Ghost:** Surface fill with a strong neutral border, or a transparent icon-only treatment. Hover introduces one tonal step and a visible border rather than a dramatic lift.
- **Focus:** Shell controls use a 2px accent outline; app controls use a 2px accent-mixed box ring. Never remove the focus indicator without an equivalent replacement.

### Inputs / Fields

- **Style:** Search and address fields are 34px high with 6-7px corners, one-pixel neutral borders, surface backgrounds, and leading Lucide icons.
- **Focus:** `:focus-within` shifts the border toward the current accent and adds a soft two-pixel ring.
- **Content:** Inputs remain borderless inside the field wrapper; placeholders use the faint text role. Long values truncate or flex rather than expanding toolbars.

### Navigation

- **Topbar:** A compact 36px three-column status strip; active app text truncates at 220px. At mobile width it becomes brand plus time/notification only.
- **Dock:** A translucent 58px strip with stable 44px buttons. Hover and active state rise 3px; running state uses a small dot, while active state expands it into a 16px accent bar.
- **Launcher:** A searchable grid plus recent work. Only one of launcher, control center, and notification center stays open at a time; Escape or a desktop press dismisses transient shell surfaces.
- **App navigation:** Sidebars, segmented controls, breadcrumbs, and tab-like links use tonal selection plus accent text or a narrow accent rail.

### Cards / Containers

- **System panels:** 8px corners, translucent shell fill, one-pixel shell border, 30px blur, and panel-level shadow. Padding is 16px for compact panels and 22px for the launcher.
- **App containers:** Prefer unframed sections, divider-led lists, and tonal sidebars. Cards are for repeated selectable items, notifications, file tiles, events, or tools that need a bounded hit target.
- **Selected rows:** Surface fill, one-pixel border, and either an accent rail or accent-mixed background. Selection must remain legible without relying on shadow alone.

### Window Frame

The window frame is the signature component: an 8px translucent surface with a 42px draggable titlebar, app identity glyph, truncating title, small frame code, and explicit minimize/maximize/close controls. Desktop windows are draggable and resizable within bounds; double-clicking the titlebar toggles maximize. Mobile windows fill the work area, disable drag/resize, hide the frame code and maximize action, and enlarge controls to 44px. Window-control tooltips appear on hover and keyboard focus.

### Toggles, Status, and Feedback

Control-center tiles use a 7px framed two-column pattern; the on state mixes the accent into the tile and fills its icon well. Settings toggles are 40x22px tracks with a 16px thumb. Toasts and notification cards combine icon, title, explanatory copy, and timestamp/state text so coral, lime, or cobalt is never the only carrier of meaning. Save states expose idle, saving, saved, and error text alongside their status dot.

### Interaction and Accessibility Contract

The boot screen is a live busy status and completes after roughly 2.7 seconds. Launcher and system controls expose expanded or pressed state; dynamic titles, toasts, and save state use live/status semantics; minimized windows are hidden from assistive reading; and the lock screen is modal while the shell is inert. The unlock action receives focus after locking. Keyboard shortcuts must ignore editable fields, and every icon-only command requires an accessible name plus a visible tooltip when its meaning is not universal.

**The State Must Read Rule.** Hover, focus, active, selected, running, saving, error, disabled, and locked states each require a distinct non-color cue or explicit text.

### Maintenance Map

- `src/styles.css` owns shell tokens, wallpaper, topbar, dock, system panels, lock state, global breakpoints, and reduced motion.
- `src/shell/window-frame.css` owns the window material, titlebar controls, active depth, boot screen, and compact window behavior.
- `src/apps/apps.css` owns app-theme tokens, shared primitives, app layouts, container queries, and compact touch sizes.
- `src/apps/AppSuite.tsx` owns app identity accents and default/minimum window sizes; add new identities there instead of scattering color constants.
- `.impeccable/design.json` must be regenerated whenever these normative tokens, shadows, motion timings, breakpoints, or representative components change.

## Do's and Don'ts

### Do:

- **Do** route shared focus, selection, and primary actions through the current accent variable so theme and accent settings remain live.
- **Do** preserve the shell/app material split: atmospheric glass for operating-system chrome, crisp tonal surfaces for sustained work.
- **Do** keep routine spacing on the established 4, 6, 8, 10, 12, 16, 22, and 28px rhythm and routine corners within 4-8px.
- **Do** test both themes, every accent option, keyboard shortcuts, lock focus, reduced motion, 320px minimum width, 430/720/900px viewport changes, 480/590/700px container changes, and short landscape at 900x520px.
- **Do** verify that the 36px topbar, mobile/fullscreen window area, and 58px dock never overlap essential controls or scrolling content.
- **Do** preserve Simplified Chinese text fit with ellipsis, wrapping, or flexible grid tracks; never let labels resize stable controls.

### Don't:

- **Don't** turn the desktop into a landing page, a grid of oversized app cards, or a collection of nested floating cards.
- **Don't** use blur and large shadows inside ordinary app content; reserve them for shell chrome, windows, and floating feedback.
- **Don't** introduce radii above 8px for routine rectangles, decorative gradient blobs, negative letter spacing, or a second competing global accent.
- **Don't** remove text labels, ARIA state, focus rings, reduced-motion fallbacks, or 44px compact targets to gain visual density.
- **Don't** hard-code the default cobalt inside shared components or repurpose app identity colors as success, warning, or danger semantics.
- **Don't** add an app without checking its minimum window size, narrow container layout, mobile full-workspace behavior, theme contrast, empty/error states, and dock/launcher identity.

