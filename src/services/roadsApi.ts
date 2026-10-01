/**
 * Google Maps Platform Roads API & Geocoding Service
 * Uses Google Roads Speed Limits API & Snap to Roads API with solution_id=gmp_mcp_codeassist_v1_aistudio
 */

export interface RoadSpeedLimitResult {
  speedLimitMph: number;
  source: 'roads_api' | 'inferred' | 'osm';
  placeId?: string;
  roadName?: string;
}

// In-memory cache for speed limits and geocoding to avoid repetitive API queries
const speedLimitCache = new Map<string, RoadSpeedLimitResult>();
const geocodeCache = new Map<string, string>();

/**
 * Fetch speed limit for coordinates from Google Roads API
 */
export async function getSpeedLimitForCoordinate(
  lat: number,
  lng: number,
  roadTypeHint?: string
): Promise<RoadSpeedLimitResult> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (speedLimitCache.has(cacheKey)) {
    return speedLimitCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/api/roads/speed-limits?path=${lat},${lng}&units=MPH`);
    if (res.ok) {
      const data = await res.json();
      if (data.speedLimits && data.speedLimits.length > 0) {
        const item = data.speedLimits[0];
        // speedLimit is in km/h or mph depending on units param
        const speedLimit = Math.round(item.speedLimit || 35);
        const result: RoadSpeedLimitResult = {
          speedLimitMph: speedLimit,
          source: 'roads_api',
          placeId: item.placeId,
        };
        speedLimitCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Roads API speed limit query fallback:', err);
  }

  // Realistic regional inference based on location or road type hint
  // Standard US speed limits: School Zone = 20-25, Residential = 25, Major City Arterial = 35, Boulevard/Expressway = 45, Interstate = 65
  let inferredLimit = 35;
  if (roadTypeHint) {
    const lower = roadTypeHint.toLowerCase();
    if (lower.includes('school') || lower.includes('alley')) inferredLimit = 20;
    else if (lower.includes('st') || lower.includes('ave') || lower.includes('way') || lower.includes('court') || lower.includes('lane') || lower.includes('residential')) inferredLimit = 25;
    else if (lower.includes('blvd') || lower.includes('expwy') || lower.includes('pkwy')) inferredLimit = 45;
    else if (lower.includes('hwy') || lower.includes('freeway') || lower.includes('interstate') || lower.includes('fwy')) inferredLimit = 65;
  }

  const result: RoadSpeedLimitResult = {
    speedLimitMph: inferredLimit,
    source: 'inferred',
  };
  speedLimitCache.set(cacheKey, result);
  return result;
}

/**
 * Snap raw GPS coordinates to actual road network using Google Roads API
 */
export async function snapCoordinatesToRoad(
  points: Array<{lat: number; lng: number}>
): Promise<Array<{lat: number; lng: number}>> {
  if (points.length < 2) return points;

  const pathParam = points
    .slice(-20) // last 20 points
    .map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`)
    .join('|');

  try {
    const res = await fetch(`/api/roads/snap-to-roads?path=${encodeURIComponent(pathParam)}&interpolate=true`);
    if (res.ok) {
      const data = await res.json();
      if (data.snappedPoints && data.snappedPoints.length > 0) {
        return data.snappedPoints.map((sp: any) => ({
          lat: sp.location.latitude,
          lng: sp.location.longitude,
        }));
      }
    }
  } catch (err) {
    console.warn('SnapToRoads query fallback:', err);
  }

  return points;
}

/**
 * Reverse geocode lat/lng to a readable street or intersection name
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<string> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const top = data.results[0];
        // Clean formatted address
        const addr = top.formatted_address ? top.formatted_address.split(',').slice(0, 2).join(',') : 'Current Location';
        geocodeCache.set(cacheKey, addr);
        return addr;
      }
    }
  } catch (err) {
    console.warn('Geocoding fallback:', err);
  }

  const fallback = `Route Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  geocodeCache.set(cacheKey, fallback);
  return fallback;
}
