HYDROSURGE AI — COMPLETE UI/UX REDESIGN BRIEF

Use the attached HYDROSURGE_FIGMA_CONTEXT.md as the PRIMARY SOURCE OF TRUTH for the existing frontend implementation.

The screenshots provided represent the CURRENT implementation.

Your task is NOT to simply recolor the current dashboard.

Completely rethink and improve the UI/UX while preserving the actual product functionality, data relationships, navigation, and technical capabilities present in the source.

==================================================
1. PRODUCT IDENTITY
==================================================

HydroSurge AI is an:

AI-assisted heavy rainfall early-warning and urban inundation decision-support system.

The interface must immediately communicate:

RAINFALL
→ FORECAST
→ RISK
→ INUNDATION
→ IMPACT
→ ACTION

A user should understand the purpose of the product within 5 seconds.

The current design feels like a generic AI-generated admin dashboard.

DO NOT reproduce that aesthetic.

The final design should feel like a credible operational meteorological / disaster-management decision-support system.

Think:

weather intelligence + flood early warning + geospatial risk + emergency decision support

NOT:

AI SaaS dashboard
NOT:
developer console
NOT:
cybersecurity command center
NOT:
generic analytics dashboard
NOT:
hackathon prototype UI

==================================================
2. LIGHT MODE ONLY
==================================================

The entire application must use a professional LIGHT / WHITE visual system.

Primary:
- white surfaces
- very light cool-gray page background
- dark navy/slate typography
- subtle neutral borders
- restrained shadows
- strong whitespace

Operational semantic colors:

BLUE / CYAN
→ rainfall / forecast / information

GREEN
→ normal / healthy / safe

AMBER
→ warning / elevated risk

RED
→ critical / emergency / immediate action

Do NOT use:
- black backgrounds
- neon colors
- glowing borders
- cyberpunk styling
- excessive gradients
- excessive glassmorphism
- excessive rounded cards
- excessive colored badges

The interface should look like a serious professional operational system.

==================================================
3. MOST IMPORTANT CHANGE:
RAIN-FIRST INFORMATION HIERARCHY
==================================================

The current dashboard gives too much visual weight to implementation/status information.

Change the hierarchy.

The primary Command Center should immediately show:

CURRENT RAINFALL
↓
FORECAST TREND
↓
TIME TO PEAK / WARNING
↓
INUNDATION RISK
↓
MAP
↓
IMPACT
↓
RECOMMENDED ACTION

The rainfall forecast must feel like the core intelligence of the product.

The user should immediately see:

- current rainfall intensity
- forecast rainfall
- forecast horizon
- peak intensity
- warning threshold
- confidence
- expected inundation probability/depth
- affected location

==================================================
4. COMMAND CENTER
==================================================

Redesign the Command Center as the primary operational screen.

Recommended hierarchy:

HEADER
Location / catchment / current system state

PRIMARY WARNING PANEL
Current warning severity
Current rainfall
Expected peak rainfall
Forecast lead time
Risk status

FORECAST TIMELINE
0 min
30 min
60 min
90 min
120 min

Make this visually important.

Use a clear chart/timeline rather than a collection of generic cards.

Show:
- rainfall intensity
- trend
- threshold crossing
- forecast horizon
- confidence

Then:

FLOOD / INUNDATION RISK

Show:
- flood probability
- projected depth band
- affected zone
- risk severity

Then:

MAP

The GIS map should be a major operational element.

Then:

IMPACT SUMMARY

- exposed population
- critical facilities
- roads at risk

Then:

RECOMMENDED ACTION

Examples only where supported by actual application data:
- monitor
- alert
- close road
- deploy team
- evacuation-related action

Do not invent actions that are not supported by the source.

==================================================
5. RAINFALL FORECAST PAGE
==================================================

This page should clearly feel like a rainfall prediction product.

Make rainfall the visual hero.

Prioritize:

Current rainfall
Forecast rainfall
Forecast horizon
Peak rainfall
Rainfall trend
Confidence
Source/provenance

Use a professional rainfall chart.

The chart should make it immediately obvious:

WHEN rainfall increases
WHEN a warning threshold is crossed
WHEN the peak is expected
HOW MUCH rainfall is expected

Avoid excessive cards.

A single strong visualization is preferable to many small metric boxes.

==================================================
6. INUNDATION RISK PAGE
==================================================

Make this page about:

"Where will flooding occur and how severe will it be?"

Prioritize:

Flood probability
Projected depth
Depth band
Risk classification
Affected zone
Map

Use a clear depth/risk visualization.

Avoid technical implementation text dominating the page.

Technical model information can be placed in a secondary expandable/details area.

==================================================
7. GIS / MAP
==================================================

The map is NOT decorative.

Treat it as an operational decision-support component.

The map should clearly communicate:

- active risk zone
- catchment
- high-risk centroid
- affected area
- relevant flood/risk layer
- selected operational focus

Keep map controls minimal and useful.

Avoid clutter.

Make the map visually dominant enough to support geographic decision-making.

==================================================
8. IMPACT & WHAT-IF
==================================================

Make this page answer:

"Who and what is affected?"

Prioritize:

Population exposure
Critical infrastructure
Roads
Facilities
Vulnerable groups where actual data supports them

What-if controls should feel like genuine scenario analysis.

Do not make this look like a generic analytics dashboard.

==================================================
9. ACTION & ALERT CENTER
==================================================

Make this page answer:

"What should the operator do now?"

Prioritize:

Current incident
Severity
Time-to-impact
Affected route
Recommended response
Alert generation

CAP/SACHET functionality should remain available where implemented.

However:

Do NOT allow CAP/SACHET technical terminology to dominate the entire dashboard.

It should appear as an operational action, not as a developer feature.

==================================================
10. HISTORICAL REPLAY
==================================================

Historical replay is useful but should NOT dominate the main operational experience.

Clearly distinguish:

LIVE
REPLAY
PRECOMPUTED
SIMULATION

However, don't repeatedly display:

"PROTOTYPE"
"REPLAY SIMULATION"
"PRECOMPUTED REPLAY"
"MOD_4 INTEGRATED"

in every section.

Show the operational state once in a clean system-status area.

==================================================
11. SYSTEM HEALTH
==================================================

System Health may contain technical information.

This is where technical details belong.

Examples:

API health
provider health
latency
data freshness
service availability
model availability
fallback status

Keep technical implementation details primarily here.

Do NOT expose internal implementation terminology throughout the operational dashboard.

==================================================
12. REMOVE UNNECESSARY UI LANGUAGE
==================================================

Audit every visible label.

Remove, consolidate, or move to technical/system-health areas where appropriate:

- MOD_4 INTEGRATED
- unnecessary PROTOTYPE labels
- repeated PRECOMPUTED REPLAY labels
- unnecessary CONTRACT VERIFIED labels
- internal API paths
- internal artifact URIs
- developer-facing implementation terminology
- unnecessary "scientific truthfulness" wording
- excessive telemetry/debug labels
- repetitive status badges

IMPORTANT:

Do not remove functionality.

Remove unnecessary PRESENTATION of implementation details.

The operator should see operational intelligence, not the internal architecture.

==================================================
13. STOP MAKING EVERYTHING A CARD
==================================================

The current design overuses cards.

Do not put every piece of information into a bordered rectangle.

Use:

- sections
- charts
- timelines
- hierarchy
- whitespace
- dividers
- meaningful grouping
- progressive disclosure

Cards should be used only when they improve comprehension.

==================================================
14. TYPOGRAPHY
==================================================

Use a professional modern UI typeface.

Avoid making the entire interface look like a terminal.

Use monospaced/typewriter styling only where genuinely useful:

- timestamps
- numeric telemetry
- technical identifiers
- API/system details

Normal headings, descriptions and navigation should use a highly readable professional UI font.

Create clear hierarchy:

H1
H2
section heading
metric
supporting information
metadata

==================================================
15. NAVIGATION
==================================================

Preserve the existing major product areas.

But improve the navigation hierarchy.

Primary navigation:

Command Center
Rainfall Forecast
Inundation Risk
Impact & What-If
Action & Alert Center
Historical Replay
Data Sources
System Health

Make the Command Center clearly primary.

Avoid making every navigation item visually equal.

==================================================
16. DATA AUTHENTICITY
==================================================

CRITICAL:

Use the actual data structures, terminology, values, and relationships present in HYDROSURGE_FIGMA_CONTEXT.md.

DO NOT invent:

- metrics
- APIs
- sensors
- model results
- confidence values
- locations
- rainfall values
- flood probabilities
- datasets
- government integrations
- capabilities

If a value is prototype/replay data, label it appropriately.

Never make simulated data look like verified live operational data.

==================================================
17. RESPONSIVE UX
==================================================

Design for:

Desktop first
Laptop
Tablet
Mobile

The operational hierarchy must remain understandable at smaller widths.

Do not simply shrink desktop cards.

Reflow information intelligently.

==================================================
18. MICRO-INTERACTIONS
==================================================

Use subtle professional interactions:

- hover states
- active navigation
- forecast selection
- map focus
- warning state transitions
- expandable technical details
- smooth but restrained transitions

Avoid flashy animations.

This is an emergency decision-support system.

Clarity > decoration.

==================================================
19. OVERALL VISUAL GOAL
==================================================

The final product should look like:

A REAL EARLY RAINFALL WARNING AND URBAN FLOOD INTELLIGENCE PLATFORM.

When someone sees the Command Center, they should immediately think:

"Rainfall is increasing."
"Here is when the peak is expected."
"This area is at risk."
"Here is the projected flood severity."
"These people/assets may be affected."
"These are the actions I should consider."

NOT:

"This is an AI-generated dashboard."

==================================================
20. IMPORTANT IMPLEMENTATION CONSTRAINT
==================================================

Do not redesign the application by inventing a new product.

Use the attached source code to understand:

- existing pages
- components
- data
- API relationships
- interactions
- maps
- replay
- forecast timeline
- risk data

Preserve the underlying functionality.

Improve the UI/UX dramatically.

Do not change backend/API contracts.

Do not remove real functionality.

Do not invent functionality.

==================================================
FINAL DELIVERABLE
==================================================

Create a complete high-fidelity Figma redesign of the HydroSurge application.

The redesign must include:

1. Command Center
2. Rainfall Forecast
3. Inundation Risk
4. Impact & What-If
5. Action & Alert Center
6. Historical Replay
7. Data Sources
8. System Health

The screens must share one coherent design system.

The final result should feel:

professional
credible
operational
calm
information-dense but understandable
weather/flood focused
light-mode
human-designed
decision-oriented

NOT:

AI-generated
generic SaaS
cyberpunk
developer dashboard
card-heavy
prototype-looking