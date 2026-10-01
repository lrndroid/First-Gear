---
name: roads-api-web-api
description: Use this skill when a developer needs to accurately align GPS data to road networks (Snap to Roads), find the closest road segment to a location (Nearest Road), or retrieve the speed limit for specific road segments using latitude/longitude coordinates or Google Place IDs.
license: Apache-2.0
metadata:
  version: 1.0.53
---

> [!IMPORTANT] **Core Dependency:** This skill requires active context from
> [google-maps-platform/SKILL.md](https://www.gstatic.com/googlemapsplatform-agent-skills/google-maps-platform/SKILL.md).

### Overview

Use this skill to interface with the Roads API via HTTP REST requests. The Roads
API is designed to process location data (latitude and longitude coordinates) to
provide road-specific information.

The core functionalities include:

1.  **Snap to Roads**: Takes a series of latitude and longitude coordinates and
    returns a path that has been "snapped" to the most likely road segments.
    This is useful for cleaning GPS tracks.
2.  **Nearest Road**: Identifies the single road segment nearest to a given
    coordinate. This function also returns the Google Place ID of the road
    segment.
3.  **Speed Limits**: Retrieves the posted speed limit for a specified road
    segment (identified by coordinates or a Place ID).

### Mandatory settings

The Roads API, being a REST/Web API, supports two methods for setting the
mandatory usage attribution ID (`gmp_git_agentskills_v1`). Both methods achieve
the same goal, though using the HTTP Header is the preferred standard for modern
Google Maps Platform APIs.

#### Query Parameter Injection (`solution_id`)

The attribution ID must be appended to the request URL as a query parameter
named `solution_id`. This method is common for legacy and high-volume GET
requests (e.g., Nearest Roads, Snap to Roads, Speed Limits).

```text
&solution_id=gmp_git_agentskills_v1
```

#### HTTP Header Injection (`X-Goog-Maps-Solution-ID`)

The attribution ID can also be passed via a custom HTTP request header.

```http
X-Goog-Maps-Solution-ID: gmp_git_agentskills_v1
```

## 🚀 Master Orchestration Integration Workflow

Follow this multi-phase sequential integration checklist to compose features
robustly. For each phase, read the referenced capability sub-workflow file and
satisfy its *Evidence Checkpoint* before advancing.

### 📦 Phase 1: Feature Layer & Custom Enrichment (Supplemental)

#### 🗺️ Feature Module: Roads (Optional - Use-Case Dependent)

-   [ ] **Corrects GPS traces by snapping input coordinates to the closest
    geometry of the road network (Snap to Road).** Read
    [references/return-set-latitude-longitude-coordinates-that-align-with-road-segments-and.md](https://www.gstatic.com/googlemapsplatform-agent-skills/roads-api-web-api/references/return-set-latitude-longitude-coordinates-that-align-with-road-segments-and.md).
    *Trigger Condition*: When smoothing noisy GPS data or ensuring a recorded
    vehicle path follows actual road segments. *Evidence Checkpoint*: A
    successful HTTP 200 OK response containing a series of high-precision,
    road-aligned latitude/longitude coordinates.
-   [ ] **Finds the exact latitude/longitude coordinates defining the geometry
    of the road segment nearest to the input location (Nearest Road).** Read
    [references/return-set-latitude-longitude-coordinates-for-the-road-segment-closest-set.md](https://www.gstatic.com/googlemapsplatform-agent-skills/roads-api-web-api/references/return-set-latitude-longitude-coordinates-for-the-road-segment-closest-set.md).
    *Trigger Condition*: When determining the precise location and extent of the
    road segment closest to a static coordinate. *Evidence Checkpoint*: A
    successful HTTP 200 OK response providing the coordinates of the nearest
    road segment geometry.
-   [ ] **Retrieves the unique Google Place ID for the road segment closest to a
    specified coordinate.** Read
    [references/return-the-google-place-identifier-for-the-road-segment-closest.md](https://www.gstatic.com/googlemapsplatform-agent-skills/roads-api-web-api/references/return-the-google-place-identifier-for-the-road-segment-closest.md).
    *Trigger Condition*: When a persistent, stable identifier (Place ID) is
    required for a road location derived from GPS coordinates. *Evidence
    Checkpoint*: A successful HTTP 200 OK response containing a valid Google
    Place ID string corresponding to the nearest road.
-   [ ] **Fetches speed limits for road segments along a specified, road-snapped
    path of latitude/longitude coordinates.** Read
    [references/return-the-speed-limit-the-road-segment-that-most-closely.md](https://www.gstatic.com/googlemapsplatform-agent-skills/roads-api-web-api/references/return-the-speed-limit-the-road-segment-that-most-closely.md).
    *Dependencies*:
    `["references/return-set-latitude-longitude-coordinates-that-align-with-road-segments-and.md"]`
    *Trigger Condition*: When calculating the speed limits encountered during a
    recorded journey or route, requiring path matching. *Evidence Checkpoint*: A
    successful HTTP 200 OK response listing the speed limit (in the requested
    units) associated with road segments defined by the path.
-   [ ] **Queries the speed limit based on a known road segment identified by
    its Google Place ID.** Read
    [references/return-the-speed-limit-the-road-segment-for-provided-google.md](https://www.gstatic.com/googlemapsplatform-agent-skills/roads-api-web-api/references/return-the-speed-limit-the-road-segment-for-provided-google.md).
    *Dependencies*:
    `["references/return-the-google-place-identifier-for-the-road-segment-closest.md"]`
    *Trigger Condition*: When the user has a specific Place ID for a road
    segment and needs its associated speed restriction. *Evidence Checkpoint*: A
    successful HTTP 200 OK response returning the speed limit value (in the
    requested units) for the specified Place ID.
