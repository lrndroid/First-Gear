---
name: Apex Telemetry & DrivePulse
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#b91a24'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff7a73'
  on-tertiary-container: '#79000e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: JetBrains Mono
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The brand ethos bridges high-precision endurance racing instrumentation with modern, non-punitive safety coaching. It targets novice drivers, tech-forward parents, and performance-oriented commuters who value telemetry data, clarity, and constructive habit reinforcement over arbitrary surveillance.

The aesthetic fuses **Tactical High-Tech Minimalism** with **Functional Glassmorphism**:
- High-clarity light substrates eliminate glare during bright daytime driving conditions while maintaining maximum contrast on modern mobile panels.
- Information architecture mirrors professional cockpit displays: zero visual fluff, high-contrast hierarchical hierarchy, and instantaneous scannability at arm's length or in a dashboard mount.
- Status feedback is immediate and communicative: calm neon emerald reflects steady-state control, precise amber signals threshold transitions, and urgent coral indicates critical telemetry spikes (excessive G-forces, rapid deceleration, severe overspeed).

## Colors

The palette operates in a default light mode environment configured for high daylight legibility and immediate peripheral comprehension.

### Core Roles
- **Primary (`#10B981` — Electric Emerald)**: Signifies optimal velocity, smooth steering angle, regenerative braking balance, and high safety scores. Emitted as accents, active rings, and achievement indicators.
- **Secondary (`#F59E0B` — Caution Amber)**: Used for threshold warnings, minor speed limit drift (+1 to +9%), dynamic curve advisory warnings, and passive coaching alerts.
- **Tertiary (`#EF4444` — Vivid Coral-Red)**: Strict warning indicator reserved strictly for rapid deceleration (hard braking), extreme lateral acceleration events, speed violations >10% over posted limits, and critical hardware/sensor disconnects.
- **Neutral Canvas (`#F8FAFC` — Crisp Light Base)**: Base application background, providing infinite contrast against lit elements.
- **Neutral Elevated Surfaces (`#FFFFFF` — Pure White)**: Structural card containers, module plates, and telemetry docks.
- **Surface Borders (`rgba(15, 23, 42, 0.12)`)**: Ultra-fine linear separators ensuring module delineation without adding structural clutter.
- **Text Primary (`#0F172A` — Deep Slate)**: High-luminance dark tone for telemetry metrics, live speeds, and critical alerts.
- **Text Secondary (`#64748B` — Mid Slate)**: Muted slate for units of measurement, timestamps, and contextual labels.

## Typography

The type system separates human narrative guidance from cold real-time telemetry.

- **Primary Headings (`Space Grotesk`)**: Technical, futuristic, and architectural. Used for trip summaries, score cards, and module group headers.
- **Body & Insights (`Geist`)**: Neutral, ultra-legible, engineered for readability of coaching notes, driving logs, and analytical reports.
- **Instrumentation & Metric Figures (`JetBrains Mono`)**: Strict monospace alignment prevents horizontal jitter or layout shift during high-frequency live velocity, RPM, G-force, and lap-delta changes. Always utilize OpenType tabular numerals (`tnum`) and slashed zeros where available.

## Layout & Spacing

The layout is built for hand-held inspection as well as landscape/portrait phone mounts in moving cockpits.

- **Grid Architecture**: 4-column layout on standard mobile devices, expanding to a 6-column modular grid on tablet/dashboard mounts.
- **Safe Zones**: Generous bottom padding (`space-xl` + system home indicator) ensures primary actions (Start Drive, Emergency SOS, End Trip) remain accessible in vehicle mounts.
- **Density**: Real-time cockpit layouts leverage compact vertical pacing (`space-sm` to `space-md`) to pack speed, safety score, and contextual radar into a glanceable viewport, avoiding any required scrolling while in motion. Post-drive review views expand to `space-lg` and `space-xl` for comfortable long-form data digestion.

## Elevation & Depth

Visual hierarchy relies on clean surface layering, subtle drop shadows, and precise edge illumination suitable for a light-themed dashboard:

- **Layer 0 (Canvas Base)**: Clean light background `#F8FAFC`, non-reflective and high-contrast.
- **Layer 1 (Card & Module Deck)**: `#FFFFFF` with `backdrop-filter: blur(12px)`. Enclosed by a 1px border of `rgba(15, 23, 42, 0.08)` and subtle shadows.
- **Layer 2 (Floating Action Docks & HUD Widgets)**: `#FFFFFF` at 95% opacity with `border: 1px solid rgba(15, 23, 42, 0.12)` and soft ambient elevation.
- **Glow & Phosphor Overlays**:
  - Stable telemetry displays a soft ambient radial glow behind critical metrics: `0 0 24px rgba(16, 185, 129, 0.15)`.
  - Danger/Breach states flash an ambient boundary glow: `0 0 32px rgba(239, 68, 68, 0.25)`.

## Shapes

The interface balances aerodynamic curves with machined precision:

- **Cards and Containers**: Utilize standard roundedness (`0.5rem` to `1rem`) to maintain clear screen boundaries without wasting critical corner pixels on mobile screens.
- **Gauges and Telemetry Rings**: Full circular paths (`9999px` / SVG arc primitives) with open terminals, referencing mechanical tachometer clusters.
- **Telemetry Indicators & Badges**: Beveled or lightly rounded (`0.25rem` / `space-xs`) geometric badges designed to look like stamped carbon or military instrumentation tags.

## Components

### Telemetry Radial Rings & Speedometers
- **Structure**: Concentric SVG arcs with a base track rendered in `rgba(15, 23, 42, 0.1)` and an active gauge track in neon primary, secondary, or tertiary colors.
- **Center Well**: Large tabular metric (`display-hero-mobile`), stacked over a secondary unit label (`label-caps`, e.g., `MPH`, `G-LAT`, `SCORE`).
- **State Transition**: Color transitions between `#10B981` (Safe), `#F59E0B` (Caution), and `#EF4444` (Breach) must occur across a smooth 200ms cubic bezier curve.

### Metric Cards
- **Structure**: Surface `#FFFFFF` container with a 1px outer stroke (`rgba(15, 23, 42, 0.08)`).
- **Header**: Top row with a micro icon, title (`label-caps`), and real-time status pip (a 6px glowing dot).
- **Body**: Main value in `JetBrains Mono` (`headline-lg`) flanked by trend arrows and delta percentages.

### Safety Badges & Event Tags
- **Structure**: Compact, high-contrast pills. Background is set to a 10% opacity tint of the respective status color, framed by a 1px border of that same color at 30% opacity.
- **Typography**: `JetBrains Mono` in `label-telemetry-sm`, uppercase.
- **Variants**:
  - `Smooth Turn`: Emerald green accent with lateral G reading (`0.22G`).
  - `Limit Advisory`: Amber accent with speed difference (`+4 MPH`).
  - `Harsh Decel`: Coral-red accent with braking force (`-0.68G`).

### Buttons & Interactive Controls
- **Drive Action Primary**: Large hit target (min 56px height) with full roundedness or `rounded-lg`. Gradient base of `#10B981` transitioning subtly to `#059669`. Bold, high-contrast light text (`#FFFFFF`) for immediate daylight legibility.
- **Hazard / Abort Actions**: Ghost button with a 1px stroke of `#EF4444`, red text, and red glow on tap.
- **HUD Mode Toggles**: Segmented pill selectors with light container backgrounds and clean contrasting thumbs.

### Inputs & Sliders
- **Sensory Calibration Sliders**: Custom slider controls featuring an active glowing bar (electric emerald) with a high-contrast circular thumb surrounded by a thin glowing ring.
- **Text Inputs**: Clean light background inset (`#F1F5F9`), thin slate border, dark monospace typography, and primary focus ring.
