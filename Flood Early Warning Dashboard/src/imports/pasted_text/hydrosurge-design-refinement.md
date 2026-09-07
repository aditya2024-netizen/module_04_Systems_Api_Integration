REFINE THE CURRENT HYDROSURGE AI DESIGN — DO NOT REDESIGN FROM SCRATCH

The current design direction is good and should be preserved. Refine the existing Flood Early Warning Dashboard into a polished, production-grade operational early-warning system.

Use HYDROSURGE_FIGMA_CONTEXT.md as the primary source of truth for the actual product functionality, data, navigation, API relationships, terminology, and supported capabilities.

IMPORTANT:
Do NOT create a completely different design.
Do NOT change the product into a generic SaaS dashboard.
Do NOT invent new features, metrics, data, APIs, models, geographic information, or capabilities.
Preserve the existing information architecture and functionality while substantially improving visual hierarchy, usability, clarity, and operational credibility.

==================================================
1. CORE PRODUCT STORY
==================================================

The interface must communicate this flow immediately:

RAINFALL → FORECAST → RISK → INUNDATION → IMPACT → ACTION

The user should understand within a few seconds:

1. What is happening now?
2. What is expected to happen?
3. When is the peak / potential impact?
4. Where is the risk?
5. Who or what may be affected?
6. What should the operator do?

HydroSurge AI is an early-warning and decision-support system, not simply a rainfall analytics dashboard.

The design should feel appropriate for:
- disaster-management operations
- meteorological monitoring
- urban flood early warning
- emergency response decision support

It should NOT feel like:
- a generic AI SaaS product
- a cybersecurity dashboard
- a developer console
- a hackathon prototype
- an AI-generated template

==================================================
2. VISUAL DIRECTION
==================================================

KEEP THE CURRENT LIGHT / WHITE DESIGN DIRECTION.

Use:
- white primary surfaces
- very light cool-gray page background
- navy / dark slate typography
- restrained blue/cyan for rainfall and forecast information
- green for healthy/operational states
- amber for warnings/degraded states
- red for critical/emergency states
- subtle borders
- restrained shadows
- generous whitespace
- strong typography hierarchy

Avoid:
- dark backgrounds
- neon colors
- cyberpunk styling
- excessive gradients
- excessive glassmorphism
- glowing effects
- unnecessary decorative illustrations
- excessive rounded cards
- overly playful UI
- generic AI visual language

The visual language should be calm, precise, trustworthy and operational.

==================================================
3. COMMAND CENTER / EARLY WARNING CENTER
==================================================

Rename the primary page heading to:

EARLY WARNING CENTER

This should be the main operational view.

The page hierarchy should be:

EARLY WARNING CENTER

Monitoring Area
Adyar River Basin ▾

[ HEAVY RAINFALL WARNING ]

Then the main operational content:

RAINfall forecast                    SPATIAL FLOOD RISK
large forecast chart                 operational GIS map

Then:

EXPECTED IMPACT

Then:

RECOMMENDED RESPONSE

The screen should visually tell a story rather than looking like a collection of unrelated cards.

==================================================
4. WARNING BANNER
==================================================

Keep the existing prominent warning banner.

Use:

HEAVY RAINFALL WARNING

Forecast conditions indicate a significant increase in rainfall intensity over the selected catchment.

Show the most important operational information:

60 MIN
Lead time

87 mm/hr
Peak intensity

84%
Confidence

Make LEAD TIME / 60 MIN the strongest visual element because the primary value proposition is giving operators time to act before impact.

Do not make every metric equally visually dominant.

The warning should feel serious but not visually aggressive.

==================================================
5. RAINFALL FORECAST
==================================================

Keep rainfall forecasting as the visual hero of the dashboard.

Section title:

Rainfall Forecast

Supporting text:

Rainfall intensity is expected to increase over the selected catchment.

Show:

Current rainfall
25 mm/hr

Forecast peak
87 mm/hr

Peak expected in
60 min

Confidence
84%

Forecast horizon
0–120 min

The chart should remain large and easy to interpret.

The chart should clearly communicate:

NOW
+30 MIN
+60 MIN
+90 MIN
+120 MIN

Keep the warning threshold visible.

Label it:

Warning Threshold

Make the forecast curve visually clear.

The user should immediately understand that rainfall is increasing, crossing a warning threshold, reaching a peak, and then declining.

Do not add unsupported statistical indicators or invented model metrics.

==================================================
6. SPATIAL FLOOD RISK
==================================================

Increase the visual importance of the GIS map.

The map should occupy approximately 35–40% of the main content area when screen width permits.

Section:

Spatial Flood Risk

Supporting text:

Forecast risk across the selected catchment.

Keep the map operational rather than decorative.

Use only supported map/data functionality from the supplied context.

Where supported, provide clear layer controls such as:

Risk
Catchments
Inundation
Radar

The risk visualization should clearly communicate spatial severity.

Use a clean operational legend:

High Risk
Moderate Risk
Low Risk

Improve:
- map readability
- risk-zone visibility
- legend placement
- selected-area emphasis
- map controls
- visual relationship between forecast and spatial risk

Do not invent additional geographic zones or data.

==================================================
7. EXPECTED IMPACT
==================================================

Create a clearly separated Expected Impact section below the main forecast/map area.

Heading:

Expected Impact

Supporting text:

Estimated exposure within forecast high-risk areas.

Use the actual supported impact information:

Population exposed
21,400

Critical assets
3

Roads at risk
2

The numbers should be visually prominent, but the section should not become another oversized collection of cards.

Use a clean horizontal operational summary where appropriate.

Do not add unsupported categories such as hospitals, schools, vulnerable groups, economic loss, etc. unless they already exist in the supplied product context.

==================================================
8. RECOMMENDED RESPONSE
==================================================

Create a strong operational action section.

Heading:

Recommended Response

Use the supported actions:

ALERT
Issue an early warning for the affected area.

CLOSE ROAD
Assess closure of roads within the projected risk zone.

DEPLOY TEAM
Position response resources ahead of expected impact.

Make the relationship clear:

FORECAST → RISK → IMPACT → RESPONSE

Actions should look operational and actionable, not like generic AI recommendations.

Do not introduce fictional automation or emergency-response capabilities that are not supported by the existing implementation.

==================================================
9. MONITORING AREA / TOP BAR
==================================================

Improve the current:

ACTIVE FOCUS

to:

MONITORING AREA

Adyar River Basin ▾

Keep the existing update information:

Last Updated: 09:42
Valid Through: 11:42

The top bar should make it obvious that the operator is viewing a selected geographic monitoring area and forecast window.

Keep it compact.

==================================================
10. SIDEBAR
==================================================

Keep the current navigation structure.

Use:

Command Center
Rainfall Forecast
Inundation Risk
Impact & What-If
Action & Alerts
Historical Replay

Then visually separate technical/system functionality:

System Health

The sidebar should feel like an operational application navigation system, not a developer application.

Keep the HydroSurge AI identity at the top.

Use:

HydroSurge AI
Heavy Rainfall & Urban Flood Early Warning

==================================================
11. SYSTEM HEALTH
==================================================

Do not clutter the main Command Center with technical implementation details.

System Health should be a dedicated view.

It can contain technical observability information such as:

API / Gateway
Operational

Data Freshness
Current

Forecast service
Available

Spatial risk service
Available

Replay
Available

Where supported by the existing system, also show provider/fallback/latency information.

Technical information belongs here, not in the primary operational dashboard.

==================================================
12. DEVELOPER / INTERNAL LABELS
==================================================

Remove or demote internal implementation-oriented labels from the main user experience.

Do NOT prominently display things such as:

MOD_4 INTEGRATED
internal API paths
artifact URIs
developer contract labels
debug information
implementation identifiers
excessive telemetry
"scientific truthfulness"
internal module names

These may remain in appropriate technical/system-health areas if they represent legitimate functionality or observability requirements.

The primary dashboard must communicate the product, not its internal development structure.

==================================================
13. REDUCE CARD OVERLOAD
==================================================

This is important.

Do not put every piece of information into a separate floating card.

Use a combination of:

- sections
- charts
- operational summaries
- timelines
- dividers
- whitespace
- compact metric groups
- tables where appropriate
- progressive disclosure

Cards should be used when they improve grouping or interaction, not simply because every element needs a container.

The result should feel like a professional operations interface.

==================================================
14. VISUAL HIERARCHY
==================================================

Establish a clear hierarchy:

HIGHEST PRIORITY
Current warning / severity
Lead time

SECOND PRIORITY
Rainfall forecast
Peak intensity
Forecast timing
Spatial flood risk

THIRD PRIORITY
Expected impact

FOURTH PRIORITY
Recommended response

TECHNICAL DETAIL
System health / data sources / replay / technical information

The operator's eye should naturally move:

WARNING
↓
WHEN
↓
HOW SEVERE
↓
WHERE
↓
WHO / WHAT IS AFFECTED
↓
WHAT TO DO

==================================================
15. HISTORICAL REPLAY
==================================================

Keep Historical Replay available.

However, it should not visually compete with the live/current early-warning experience.

Clearly distinguish states where applicable:

LIVE
REPLAY
PRECOMPUTED
SIMULATION

Only use these labels where they correspond to actual functionality in the supplied context.

==================================================
16. DATA SOURCES
==================================================

Keep Data Sources as a supporting system view.

Where supported, show the relationship between forecast inputs such as:

Radar
Satellite
NWP
Ground observations

Use actual source/status information from the supplied context.

Do not invent data providers or claim live integrations that do not exist.

==================================================
17. TYPOGRAPHY AND SPACING
==================================================

Improve typography hierarchy.

Use:
- strong but restrained page titles
- clear section headings
- compact labels
- highly legible numerical values
- readable supporting descriptions

Avoid excessive uppercase text.

Use uppercase mainly for:
- status labels
- small operational categories
- warning severity
- compact metadata

Use consistent spacing and alignment throughout the application.

==================================================
18. RESPONSIVE DESIGN
==================================================

Design for realistic desktop laptop screens first because this is an operational dashboard.

Also ensure the layout can gracefully adapt to smaller screens.

On narrower screens:
- stack forecast and map sections
- maintain warning visibility
- preserve critical metrics
- avoid horizontal overflow
- keep navigation usable
- maintain chart readability

==================================================
19. ACCESSIBILITY
==================================================

Ensure:
- sufficient text/background contrast
- status is not communicated only through color
- readable chart labels
- clear focus/interaction states
- understandable icons
- consistent semantic hierarchy
- accessible controls

==================================================
20. MICROINTERACTIONS
==================================================

Use subtle professional interactions only.

Examples:
- smooth navigation transitions
- subtle hover states
- map layer transitions
- warning state transitions
- chart tooltip interactions
- clear active navigation state

Avoid flashy animations.

This is an emergency/operations product. Clarity is more important than visual effects.

==================================================
21. CRITICAL DATA INTEGRITY RULE
==================================================

Do not invent values.

Do not create fake APIs.

Do not create fictional model capabilities.

Do not add unsupported datasets.

Do not add fake AI explanations.

Do not add arbitrary statistics.

Use the supplied HYDROSURGE_FIGMA_CONTEXT.md as the source of truth for what actually exists.

The design may improve presentation and UX, but it must remain faithful to the existing product.

==================================================
22. FINAL DESIGN GOAL
==================================================

The finished interface should make a judge or operator immediately understand:

"HydroSurge AI detects developing heavy rainfall, forecasts near-term rainfall intensity, translates that forecast into spatial inundation risk, estimates potential impact, and helps responders act before conditions become critical."

The final visual impression should be:

PROFESSIONAL
OPERATIONAL
TRUSTWORTHY
DATA-DRIVEN
CALM
PRECISE
EMERGENCY-READY

Not:

GENERIC AI
CYBERPUNK
DEVELOPER TOOL
HACKATHON TEMPLATE
DECORATIVE DASHBOARD

Keep the current design direction, but refine it to production quality.

The final visual narrative should be:

DETECT → FORECAST → ASSESS → PREDICT IMPACT → ACT

Tagline where appropriate:

"From rainfall forecast to flood risk — before the impact."