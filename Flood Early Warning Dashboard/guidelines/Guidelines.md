# HydroSurge AI Redesign Guidelines

## Aesthetic Stance
The aesthetic is a **professional operational meteorological decision-support system**. It prioritizes clarity, data density without clutter, and immediate recognition of critical states. It must not look like a generic SaaS dashboard or a cyberpunk command center. It is light-mode only.

## Canvas & Ground
- **Background**: Very light cool-gray page background (e.g. #f4f6f8 or similar slate-gray tint).
- **Surfaces**: Pure white for primary cards/panels.
- **Borders**: Subtle neutral borders (e.g. very light slate or gray).
- **Shadows**: Restrained, crisp shadows. No excessive diffusion or glow.

## Typography
- **Display/Headings**: `Poppins` (resolved from Figma import) or `SF Pro Display` (system fallback).
- **Body**: `Inter` (system) or `SF Pro Display`.
- **Data/Numeric**: A suitable monospaced or tabular numbers approach for telemetry.
- **Colors**: Dark navy/slate for primary text, medium slate for secondary text. No pure black.

## Semantic Colors
- **Primary (Brand/Info)**: Blue/Cyan (for rainfall, forecast, general information).
- **Safe (Normal)**: Emerald Green.
- **Warning (Elevated)**: Amber/Orange.
- **Critical (Emergency)**: Red/Rose.

## Component Principles
- Avoid placing everything in cards. Use whitespace, sectioning, and clear hierarchy.
- Micro-interactions should be subtle (e.g. color transitions on hover, not bouncy scaling).
- Layout should emphasize rainfall first, then forecast timeline, then risk and impact.
