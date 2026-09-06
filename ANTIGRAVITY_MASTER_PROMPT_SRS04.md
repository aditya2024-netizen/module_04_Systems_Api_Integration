# MASTER PROMPT FOR ANTIGRAVITY — SRS-04 (Systems / API / Integration Owner)
### HydroSurge AI | SIH PS 26071 | Component-ready deadline: **6 Sep 2026, 12:00 IST — TODAY**

Paste everything below into Antigravity as one instruction. It is written so the agent can execute it directly against the existing repo without further clarification.

---

## 0. CONTEXT — READ FIRST, DO NOT SKIP

You are working inside the existing project folder `/SIH_26071_MODULE_4/`. This folder already contains the correct skeleton (empty/stub files). **Do not restructure it, rename folders, or move files.** Your job is to fill in every file with working, tested, contract-correct code — not to redesign the layout.

Existing tree (verified to match SRS-04 Section 8 "Required Artifacts" almost exactly):

```
/SIH_26071_MODULE_4/
├── api/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── event.py
│   │   ├── health.py
│   │   ├── inundation.py
│   │   ├── rainfall.py
│   │   └── risk.py
│   ├── __init__.py
│   ├── dependencies.py
│   └── main.py
├── demo/
│   └── replay/
│       └── scenario.json
├── providers/
│   ├── __init__.py
│   ├── base.py
│   ├── inundation.py
│   ├── mock.py
│   └── rainfall.py
├── results/
│   └── latency.json
├── schemas/
│   ├── __init__.py
│   ├── decision.py
│   ├── inundation.py
│   ├── rainfall.py
│   └── risk.py
├── tests/
│   ├── __init__.py
│   ├── test_contracts.py
│   ├── test_event.py
│   ├── test_health.py
│   ├── test_inundation.py
│   ├── test_rainfall.py
│   └── test_risk.py
├── .env.example
├── .gitignore
├── API_README.md
└── requirements.txt
```

**Role you are being asked to fill:** R&D-4 — Systems/API/Integration Owner. Your job is to "turn independent ML/data outputs into one stable contract-driven service. The dashboard must consume the API — never notebooks, CSVs, or model files directly."

**Known constraint you must design around:** the real ML outputs from R&D-1 (Rainfall Forecast Engine) and R&D-2 (Inundation Spatial Intelligence Engine) may or may not be ready by the time of integration. **Do not wait for them and do not fabricate fake "real" results.** Build the mock/replay path as the fully working default, with the real providers wired as swappable, clearly-labeled stubs. This is not a fallback hack — it is the explicit architecture pattern this SRS mandates (Section 4).

**⏱ TIME CONSTRAINT — READ THIS BEFORE ANYTHING ELSE:** There are approximately **2 hours remaining** until the 12:00 IST deadline. Every decision below has already been made to optimize for shipping a working, demoable system in that window — do not deliberate, do not suggest alternatives, do not add anything not explicitly requested. Execute in the exact order given in Section 11 and stop when the clock runs out with whatever is green.

**Frontend stack decision (final, do not revisit):**
- **Next.js in plain JavaScript (`.jsx`), NOT TypeScript.** TypeScript would normally be the better choice for a contract-driven API like this one, but with ~2 hours left, type errors cost more debugging time than they save. Use plain `.jsx` files. Optionally use JSDoc type comments only if it costs zero extra setup time — skip entirely if unsure.
- **Styling: Tailwind CSS.** This is already your team's documented stack choice (not a new decision) — use it via `create-next-app`'s built-in Tailwind option. Do not add a component library (no shadcn/ui, no MUI) — plain Tailwind utility classes on divs only. Do not create separate `.css` files.
- **Scaffold command:** `npx create-next-app@latest` → select **No** for TypeScript, **Yes** for Tailwind CSS, **No** for `src/` directory unless the existing project already uses one.
- Map layer: Leaflet or Mapbox GL, whichever has fewer setup steps to get a marker rendering in the next 15 minutes — do not spend time comparing them.

---

## 1. NON-NEGOTIABLE RULES (violating any of these is a failed deliverable)

1. **No unmeasured performance claims.** Never write "<3 sec" or any latency/throughput number unless it was actually benchmarked and logged with hardware, batch size, cold/warm state, and sample count in `results/latency.json`. If not yet measured, label it `PROTOTYPE 🟡` or `ARCHITECTURE 🔵` — never state it as fact.
2. **Every capability gets a status tag** in README and code comments: `VERIFIED 🟢` (measured/reproduced), `PROTOTYPE 🟡` (implemented, not validated), `ARCHITECTURE 🔵` (designed, not demonstrated), `CONCEPT ⚪` (idea only, not to be presented as current capability).
3. **Definition of Done:** a teammate must be able to clone the repo, follow `API_README.md`, run one command, and reproduce the component output. If this isn't true, the task isn't done.
4. **Provider abstraction is mandatory** — the dashboard/frontend must never import a notebook, CSV, or model file directly. Everything goes through the FastAPI layer.
5. **Schema is locked after it's agreed.** If you must change a schema field, document it explicitly in a comment and flag it in your final summary to the user — don't silently change contracts other team members depend on.
6. **Real APIs only if available; otherwise mock cleanly.** Do not attempt live calls to IMD/MOSDAC/NDMA endpoints inside this module unless the user explicitly provides working credentials — this component's job is the internal contract, not external data fetching (that's R&D-3's job).
7. **Do not confuse two different "schemas."** The Pydantic models in Section 3 below are the **API response contract** — what the FastAPI endpoints return to the frontend. Any PostgreSQL/PostGIS table schema R&D-3 uses internally is a **separate, unrelated concern** — it's how data is stored, not how the API responds. The mock provider for this 2-hour sprint reads from `demo/replay/scenario.json`, never from Postgres. If you encounter any Postgres/PostGIS schema files elsewhere in the project, do not attempt to connect to a database or mirror that table structure in `schemas/*.py` — the API contract stays exactly as defined in Section 3. Translating database rows into the API contract is future work for whoever wires in the real provider, not part of this task.

---

## 2. REQUIRED ARCHITECTURE (implement exactly this shape)

```
PRODUCERS
  ├─ MockForecastProvider        (providers/mock.py)   → fully working now
  ├─ RainfallModelProvider       (providers/rainfall.py) → stub, swap-ready
  └─ InundationModelProvider     (providers/inundation.py) → stub, swap-ready
          ↓
      COMMON CONTRACT (schemas/*.py — Pydantic models)
          ↓
        FastAPI (api/main.py + api/routes/*)
          ↓
    DecisionObject (schemas/decision.py)
          ↓
      Dashboard (Next.js — consumes API only, never touches files directly)
```

Implement `providers/base.py` as an abstract base class:

```python
from abc import ABC, abstractmethod

class ForecastProvider(ABC):
    @abstractmethod
    def get_forecast(self, event_id: str) -> dict:
        ...

class RiskProvider(ABC):
    @abstractmethod
    def get_risk(self, zone_id: str) -> dict:
        ...
```

Then:
- `providers/mock.py` → `MockForecastProvider(ForecastProvider)` — reads from `demo/replay/scenario.json`, returns deterministic data matching the exact schema below. This must work end-to-end today.
- `providers/rainfall.py` → `RainfallModelProvider(ForecastProvider)` — real provider stub. If no real model artifact exists yet, this class should raise a clear `NotImplementedError("RainfallModelProvider not yet wired — real model output pending from R&D-1")` and be marked `ARCHITECTURE 🔵` in code comments and README. Do NOT silently fall back to mock inside this class — the swap must be explicit at the dependency-injection layer (see `api/dependencies.py` below), not hidden inside the provider.
- `providers/inundation.py` → `InundationModelProvider(ForecastProvider)` — same pattern as above for R&D-2.
- A `LiveForecastProvider` class is optional/future — only stub it if you have time left after everything else is green; mark it `CONCEPT ⚪` if included as an empty shell.

In `api/dependencies.py`, implement provider selection via an environment variable so nobody has to edit code to swap providers later:

```python
# PROVIDER_MODE=mock (default) | rainfall_live | inundation_live
```

This is the single mechanism that lets R&D-1/R&D-2 plug in real outputs later without touching the API or the frontend — do not build any other swapping mechanism.

---

## 3. REQUIRED SCHEMAS (schemas/*.py — implement as Pydantic v2 models)

These must match SRS-03's core schemas (Observation, Raster, Prediction tile) and SRS-04's Decision Object exactly, so validation against R&D-3's contracts and R&D-1/2's outputs doesn't break later.

**`schemas/rainfall.py` — RainfallOutput**

⚠️ These exact fields come from the team's own War-Room Canvas "STANDARD CONTRACT" section — this is what R&D-1 has actually agreed to produce. Do not substitute your own field names.
```json
{
  "event_id": "E001",
  "zone_id": "Z42",
  "valid_time": "2026-09-06T09:00:00Z",
  "lead_minutes": 60,
  "rainfall_mm_hr": 87,
  "rainfall_accumulation_mm": 124,
  "confidence": 0.84,
  "prediction_uri": "...",
  "source": "mock | rainfall_model",
  "status": "VERIFIED | PROTOTYPE | ARCHITECTURE | CONCEPT"
}
```
(`zone_id`, `source`, and `status` are additions required by SRS-04 itself — Section 4 provider labeling and Section 6 dashboard grouping — and don't conflict with the team contract, they extend it. Every other field name must match exactly.)

**`schemas/inundation.py` — InundationOutput**

⚠️ Same rule — these fields match the team contract exactly.
```json
{
  "event_id": "E001",
  "zone_id": "Z42",
  "flood_probability": 0.87,
  "depth_band": "0.5-1.0m",
  "risk_uri": "...",
  "confidence": 0.81,
  "valid_time": "2026-09-06T09:00:00Z",
  "source": "mock | inundation_model",
  "status": "VERIFIED | PROTOTYPE | ARCHITECTURE | CONCEPT"
}
```

**`schemas/risk.py` — Spatial risk / tile output**
```json
{
  "tile_id": "tile_1024",
  "zone_id": "Z42",
  "timestamp": "2026-09-06T09:00:00Z",
  "rainfall_mm_hr": 82,
  "flood_probability": 0.87,
  "depth_band": "0.5-1.0m",
  "confidence": 0.81
}
```

**`schemas/decision.py` — DecisionObject (this is the joined object `/api/v1/event/{id}` returns)**
```json
{
  "event_id": "E001",
  "location": {"zone_id": "Z42"},
  "rainfall": { "...RainfallOutput..." },
  "inundation": { "...InundationOutput..." },
  "confidence": 0.81,
  "impact": {
    "population_exposed": 21400,
    "critical_assets": 3,
    "roads_affected": 2
  },
  "priority": "CRITICAL | HIGH | MEDIUM | LOW",
  "actions": ["ALERT", "CLOSE_ROAD", "DEPLOY_TEAM"],
  "data_source": "LIVE | PRECOMPUTED_REPLAY",
  "status": "VERIFIED | PROTOTYPE | ARCHITECTURE | CONCEPT"
}
```

Note the `data_source` and `status` fields — these are not decorative. They implement SRS-04 Section 6's mandatory failure-mode labeling and Section 2's status model. Every response object from every endpoint must carry these fields so the dashboard can render an honest "this is replay data" badge instead of silently pretending everything is live.

---

## 4. REQUIRED API ENDPOINTS (api/routes/*.py)

Implement exactly these five, no more, no fewer, at these exact paths:

| Endpoint | Returns | Notes |
|---|---|---|
| `GET /api/v1/rainfall` | `RainfallOutput` | Query params: `event_id` or `zone_id` |
| `GET /api/v1/inundation` | `InundationOutput` | Query params: `event_id` or `zone_id` |
| `GET /api/v1/risk` | List of risk tiles | Derived by combining rainfall + inundation for a bbox/zone set |
| `GET /api/v1/event/{id}` | `DecisionObject` | Joins rainfall + inundation + impact + priority + actions |
| `GET /api/v1/health` | System health | Must report which provider mode is active (mock/live) and last successful fetch per provider |

**Failure-mode behavior (mandatory, SRS-04 Section 6):** every route must try the configured live/real provider first (if `PROVIDER_MODE` says so), and on any exception, fall back to `MockForecastProvider`'s replay data, setting `"data_source": "PRECOMPUTED_REPLAY"` in the response — using the exact same response schema, so the dashboard code path never branches. Write this fallback logic once in `api/dependencies.py` as a reusable dependency, not duplicated per route.

---

## 5. MOCK / REPLAY ENGINE (demo/replay/scenario.json)

Build one deterministic historical scenario (pick any plausible Indian flood event — e.g. a Chennai/Mumbai monsoon day — you do not need real IMD data, just internally consistent fake data with real place names and realistic values). It must contain:
- At least 3–5 `event_id`s, each with a `zone_id`, timestamped rainfall values (matching the exact `RainfallOutput` field names above — `lead_minutes`, `rainfall_mm_hr`, `rainfall_accumulation_mm`, `prediction_uri`), and inundation values (`flood_probability`, `depth_band`, `risk_uri`) that are physically consistent with each other (higher rainfall → higher flood probability for the same zone).
- Enough time-series depth that the dashboard can show a timeline, not just a single snapshot.
- `prediction_uri` and `risk_uri` can point to placeholder strings (e.g. `"mock://rainfall/E001"`) — they don't need to resolve to real files for the mock path; they exist in the contract for when real raster/GeoTIFF outputs are wired in later.

This file is the single source of truth for `MockForecastProvider`. Do not hardcode mock values inside Python files — always read from this JSON so non-engineers on the team can edit scenario data without touching code.

---

## 6. BENCHMARKING (results/latency.json)

Populate this with **actually measured** numbers from running the mock path end-to-end (this is honest and allowed — you're not measuring a real model, you're measuring the service you built, which is real):

```json
{
  "load_time_ms": <measured>,
  "inference_time_ms": <measured, label as 'mock provider' explicitly>,
  "map_generation_time_ms": <measured, if applicable>,
  "api_latency_p50_ms": <measured>,
  "api_latency_p95_ms": <measured>,
  "memory_peak_mb": <measured, optional but preferred>,
  "hardware": "<describe the actual machine/container this ran on>",
  "batch_size": <int>,
  "cold_or_warm": "cold | warm",
  "sample_count": <int>,
  "measured_at": "<ISO timestamp>",
  "note": "These are mock-provider service benchmarks, not real ML model inference times. Real model timing pending R&D-1/R&D-2."
}
```

Run a simple load-testing script (a basic loop with `requests` + `time.perf_counter()`, or `httpx` + `asyncio`, is sufficient — do not over-engineer this) to produce these numbers for real, then write them here. Never leave placeholder zeros or invented numbers.

---

## 7. TESTS (tests/*.py — use pytest + FastAPI TestClient)

- `test_health.py` — asserts `/api/v1/health` returns 200 and reports current provider mode.
- `test_rainfall.py`, `test_inundation.py`, `test_risk.py`, `test_event.py` — each asserts the endpoint returns 200 with mock provider active, and that the response validates against its Pydantic schema.
- `test_contracts.py` — the most important file: load every schema, validate every sample payload in `demo/replay/scenario.json` against the corresponding Pydantic model, and fail loudly if any field is missing or mistyped. This is what SRS-04 Section 10 calls "schema test" — it must exist and pass before any git merge.

All tests must pass with a single command (`pytest`) with zero manual setup beyond `pip install -r requirements.txt`.

---

## 8. REQUIRED FILES TO FINALIZE

- `requirements.txt` — pin `fastapi`, `uvicorn`, `pydantic>=2`, `pytest`, `httpx`, `python-dotenv`. Add nothing speculative.
- `.env.example` — include `PROVIDER_MODE=mock`, `API_PORT=8000`, and placeholders (commented out) for future real-provider config so R&D-1/2 know what env vars to expect.
- `API_README.md` — must include: (1) one-command run instructions (`pip install -r requirements.txt && uvicorn api.main:app --reload`), (2) a table of all 5 endpoints with a sample `curl` request and sample JSON response for each, (3) an explicit "Current Status" section using the VERIFIED/PROTOTYPE/ARCHITECTURE/CONCEPT tags per component, (4) a short "How to swap in a real provider later" section referencing `PROVIDER_MODE`.

---

## 9. GIT WORKFLOW (execute exactly as specified)

- Work on branch `feature/api-integration`.
- Keep `main` demo-safe at all times.
- Once real R&D-1/R&D-2 outputs are ready and integration begins, that happens on `integration/sep6` — merge order is strictly: **schema → rainfall → inundation → API wiring → dashboard.**
- After every merge into `integration/sep6`: run schema test → hit `/health` → smoke-test every endpoint → run one full event flow (`/api/v1/event/{id}`) → take a screenshot of a working response.
- Only merge `integration/sep6` into `main` and tag a release after that full flow passes.
- Before 12:00 IST today, the only hard requirement is: **mock API + contracts + one working dashboard-consumable route, fully green.** Everything else is a bonus if time allows.

---

## 10. HANDOFF ARTIFACTS TO PRODUCE FOR TEAMMATES

At the end, explicitly produce (as part of your final summary to the user, not buried in code):
- **For R&D-1/R&D-2:** the exact request/response contract, a sample request, and the exact env var (`PROVIDER_MODE`) they'll need to know about to wire in their real model later.
- **For R&D-3:** a short note on any schema validation gaps or metadata fields you had to guess at because their contract files weren't available yet.
- **For Visual/Frontend:** the API base URL, sample event IDs from `scenario.json`, the exact shape of the map/tile layer data (`risk.py` schema), and the exact shape of timeline data (list of timestamped rainfall/inundation values per zone).
- **For Content/Presentation:** the measured latency numbers from `results/latency.json`, the current honest status of the system (mock-backed, real-model-ready architecture), and a plain-English description of the fallback behavior (live fails → replay, same interface, clearly labeled).

---

## 11. EXECUTION ORDER — TIME-BOXED FOR ~2 HOURS REMAINING

Ignore the original SRS's Sep 4–6 calendar entirely. This is a hard 2-hour sprint. Steps 1–7 (Backend Must-Haves) are **non-negotiable — do these first, in order, no skipping.** Steps 8–13 (Frontend + Polish) are best-effort — do as many as time allows, in order, and stop cleanly wherever the clock runs out.

### Backend Must-Haves (~70 minutes budget — do not exceed)
1. [ ] Implement all 4 schemas (`schemas/*.py`) with Pydantic v2, matching Section 3 exactly. *(~10 min)*
2. [ ] Build `demo/replay/scenario.json` with 3–5 realistic, internally-consistent events. *(~10 min)*
3. [ ] Implement `providers/base.py` abstract classes, `providers/mock.py` fully working against the scenario file. *(~10 min)*
4. [ ] Stub `providers/rainfall.py` and `providers/inundation.py` as explicit `NotImplementedError` swap points, clearly commented. *(~5 min)*
5. [ ] Implement `api/dependencies.py` provider-selection + fallback logic. *(~10 min)*
6. [ ] Implement all 5 routes in `api/routes/*.py`, wire into `api/main.py`. *(~15 min)*
7. [ ] Write and pass `test_contracts.py` at minimum (highest-value test — validates every schema against scenario data). Other test files only if time allows. *(~10 min)*

### Frontend + Polish (~50 minutes budget, best-effort, stop when time runs out)
8. [ ] Scaffold Next.js app in plain JavaScript + Tailwind CSS (per Section 0 decision) inside a `dashboard/` folder alongside the existing backend tree — do not nest it inside `api/`. *(~5 min)*
9. [ ] Build one page that calls `GET /api/v1/event/{id}` for a sample event from `scenario.json` and renders: rainfall value, flood probability, priority badge (color-coded by CRITICAL/HIGH/MEDIUM/LOW), and a `LIVE`/`PRECOMPUTED_REPLAY` status badge. This single working page is worth more than five broken ones — do not overbuild. *(~20 min)*
10. [ ] If time allows: add a basic Leaflet or Mapbox marker for the event's `zone_id`. Skip entirely if step 9 isn't rock-solid yet. *(~15 min, optional)*
11. [ ] Run a real (if minimal) benchmark and populate `results/latency.json` with genuine numbers — even 5 sample requests measured for real beats an invented number. *(~5 min)*
12. [ ] Write `API_README.md` with status tags and a working curl example per endpoint. Fill `.env.example` and `requirements.txt`. *(~5 min)*
13. [ ] Produce the handoff summary (Section 10) for the user to forward to teammates. *(~5 min)*

**Do not attempt the full clean-clone verification (previously step 11 in earlier drafts of this prompt) if time doesn't allow — a working `pytest` pass in the current environment plus a working `uvicorn` server you can demo is an acceptable deliverable at the 2-hour mark. Note in your final summary if this verification was skipped due to time.**

---

*End of master prompt. If Antigravity or the user needs to change any schema field after this point, that requires a note to the whole team per SRS-04's schema-lock rule — don't change it silently.*
