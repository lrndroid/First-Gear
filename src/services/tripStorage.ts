import { Trip, SpeedViolation, BrakingEvent, JerkIncident, TelemetryPoint } from '../types/driving';

const STORAGE_KEY = 'teendrive_trips_history';
const ACTIVE_TRIP_KEY = 'teendrive_active_trip';

export function getStoredTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = generateSeededTrips();
      saveTrips(seeded);
      return seeded;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse trips:', err);
    return generateSeededTrips();
  }
}

export function saveTrips(trips: Trip[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to save trips:', err);
  }
}

export function saveTrip(trip: Trip) {
  const trips = getStoredTrips();
  const existingIdx = trips.findIndex((t) => t.id === trip.id);
  if (existingIdx >= 0) {
    trips[existingIdx] = trip;
  } else {
    trips.unshift(trip);
  }
  saveTrips(trips);
}

export function deleteTrip(tripId: string) {
  const trips = getStoredTrips().filter((t) => t.id !== tripId);
  saveTrips(trips);
  return trips;
}

/**
 * Realistic seeded trips representing teen driving history over the past few days
 */
function generateSeededTrips(): Trip[] {
  const now = Date.now();
  const DAY_MS = 86400000;

  // Trip 1: Yesterday afternoon - Commute home with 1 speed violation and 1 harsh signal brake
  const trip1Violations: SpeedViolation[] = [
    {
      id: 'v1_1',
      timestamp: now - DAY_MS + 450000,
      lat: 37.3735,
      lng: -122.0425,
      placeName: 'Mary Ave (between Fremont & Maude)',
      speedMph: 41,
      speedLimitMph: 35,
      pctOverLimit: 17.1, // +17.1% over limit! (> +10%)
      durationSec: 42,
      severity: 'moderate',
    },
  ];

  const trip1Brakes: BrakingEvent[] = [
    {
      id: 'b1_1',
      timestamp: now - DAY_MS + 180000,
      lat: 37.3695,
      lng: -122.0375,
      locationName: 'Elm St & 4th Ave',
      isSignalOrIntersection: true,
      intersectionName: 'Elm St & 4th Ave 4-Way Stop',
      initialSpeedMph: 24,
      finalSpeedMph: 0,
      stoppingDistanceFeet: 34,
      durationSeconds: 3.8,
      peakDecelG: 0.22,
      avgDecelG: 0.16,
      peakJerk: 0.28,
      smoothnessScore: 94,
      rating: 'Silky Smooth',
      notes: 'Gentle deceleration ramp with seamless feather-release at stop line.',
    },
    {
      id: 'b1_2',
      timestamp: now - DAY_MS + 580000,
      lat: 37.3768,
      lng: -122.0452,
      locationName: 'Mary Ave & Fremont Ave Traffic Signal',
      isSignalOrIntersection: true,
      intersectionName: 'Mary Ave & Fremont Ave (Signal)',
      initialSpeedMph: 38,
      finalSpeedMph: 0,
      stoppingDistanceFeet: 72,
      durationSeconds: 2.1,
      peakDecelG: 0.52,
      avgDecelG: 0.38,
      peakJerk: 1.15,
      smoothnessScore: 48,
      rating: 'Harsh Jolt',
      notes: 'Late braking when light turned amber. Driver stomped on brake pedal with noticeable forward passenger heave.',
    },
    {
      id: 'b1_3',
      timestamp: now - DAY_MS + 920000,
      lat: 37.3815,
      lng: -122.0512,
      locationName: 'Homestead High School Drop-off Zone',
      isSignalOrIntersection: true,
      intersectionName: 'Homestead High Signal',
      initialSpeedMph: 19,
      finalSpeedMph: 0,
      stoppingDistanceFeet: 25,
      durationSeconds: 3.4,
      peakDecelG: 0.20,
      avgDecelG: 0.14,
      peakJerk: 0.24,
      smoothnessScore: 96,
      rating: 'Silky Smooth',
      notes: 'Perfect gradual stop at school crosswalk.',
    },
  ];

  const trip1Jerks: JerkIncident[] = [
    {
      id: 'j1_1',
      timestamp: now - DAY_MS + 580000,
      type: 'harsh_braking',
      magnitude: 1.15,
      gForce: 0.52,
      locationName: 'Mary Ave & Fremont Ave Signal',
      description: 'Harsh stop jolt on amber light (0.52g deceleration)',
    },
  ];

  // Trip 2: Two days ago - Weekend Soccer Practice (Clean driving, 0 violations, high smoothness)
  const trip2Brakes: BrakingEvent[] = [
    {
      id: 'b2_1',
      timestamp: now - DAY_MS * 2 + 120000,
      lat: 37.3231,
      lng: -122.0355,
      locationName: 'Stevens Creek & Wolfe Rd Signal',
      isSignalOrIntersection: true,
      intersectionName: 'Stevens Creek & Wolfe Rd',
      initialSpeedMph: 34,
      finalSpeedMph: 0,
      stoppingDistanceFeet: 68,
      durationSeconds: 4.2,
      peakDecelG: 0.24,
      avgDecelG: 0.18,
      peakJerk: 0.31,
      smoothnessScore: 92,
      rating: 'Silky Smooth',
      notes: 'Smooth, anticipatory braking from 80 feet away.',
    },
    {
      id: 'b2_2',
      timestamp: now - DAY_MS * 2 + 450000,
      lat: 37.3218,
      lng: -122.0535,
      locationName: 'Stevens Creek & Blaney Ave Signal',
      isSignalOrIntersection: true,
      intersectionName: 'Stevens Creek & Blaney Ave',
      initialSpeedMph: 36,
      finalSpeedMph: 0,
      stoppingDistanceFeet: 70,
      durationSeconds: 4.1,
      peakDecelG: 0.26,
      avgDecelG: 0.19,
      peakJerk: 0.33,
      smoothnessScore: 89,
      rating: 'Controlled',
      notes: 'Even pedal deceleration, comfortable ride.',
    },
    {
      id: 'b2_3',
      timestamp: now - DAY_MS * 2 + 780000,
      lat: 37.3188,
      lng: -122.0688,
      locationName: 'De Anza College Campus Entry',
      isSignalOrIntersection: true,
      intersectionName: 'Stelling Rd & Campus Way Signal',
      initialSpeedMph: 24,
      finalSpeedMph: 0,
      stoppingDistanceFeet: 36,
      durationSeconds: 3.9,
      peakDecelG: 0.19,
      avgDecelG: 0.13,
      peakJerk: 0.21,
      smoothnessScore: 97,
      rating: 'Silky Smooth',
      notes: 'Flawless stop at campus perimeter.',
    },
  ];

  // Trip 3: Three days ago - Freeway errand with 2 speed violations on US-101 and an abrupt off-ramp brake
  const trip3Violations: SpeedViolation[] = [
    {
      id: 'v3_1',
      timestamp: now - DAY_MS * 3 + 320000,
      lat: 37.4085,
      lng: -122.0672,
      placeName: 'US-101 S near Ellis St',
      speedMph: 74,
      speedLimitMph: 65,
      pctOverLimit: 13.8, // +13.8% over limit
      durationSec: 68,
      severity: 'minor',
    },
    {
      id: 'v3_2',
      timestamp: now - DAY_MS * 3 + 480000,
      lat: 37.4012,
      lng: -122.0585,
      placeName: 'US-101 S (Fast Lane)',
      speedMph: 77,
      speedLimitMph: 65,
      pctOverLimit: 18.5, // +18.5% over limit
      durationSec: 94,
      severity: 'moderate',
    },
  ];

  const trip3Brakes: BrakingEvent[] = [
    {
      id: 'b3_1',
      timestamp: now - DAY_MS * 3 + 650000,
      lat: 37.3955,
      lng: -122.0528,
      locationName: 'US-101 Exit & Mathilda Ave Signal',
      isSignalOrIntersection: true,
      intersectionName: 'Mathilda Ave Off-Ramp Signal',
      initialSpeedMph: 44,
      finalSpeedMph: 0,
      stoppingDistanceFeet: 82,
      durationSeconds: 2.6,
      peakDecelG: 0.49,
      avgDecelG: 0.35,
      peakJerk: 0.95,
      smoothnessScore: 56,
      rating: 'Abrupt',
      notes: 'Car was carrying high speed off freeway ramp into the signal. Braked firmly with high inertia.',
    },
    {
      id: 'b3_2',
      timestamp: now - DAY_MS * 3 + 890000,
      lat: 37.3822,
      lng: -122.0655,
      locationName: 'Central Expwy & Castro St Signal',
      isSignalOrIntersection: true,
      intersectionName: 'Castro St Intersection Signal',
      initialSpeedMph: 33,
      finalSpeedMph: 0,
      stoppingDistanceFeet: 58,
      durationSeconds: 3.7,
      peakDecelG: 0.28,
      avgDecelG: 0.20,
      peakJerk: 0.42,
      smoothnessScore: 84,
      rating: 'Controlled',
      notes: 'Controlled stop in right turn lane.',
    },
  ];

  const trip3Jerks: JerkIncident[] = [
    {
      id: 'j3_1',
      timestamp: now - DAY_MS * 3 + 650000,
      type: 'harsh_braking',
      magnitude: 0.95,
      gForce: 0.49,
      locationName: 'Mathilda Ave Off-Ramp Signal',
      description: 'Abrupt brake deceleration entering signal queue (0.49g)',
    },
    {
      id: 'j3_2',
      timestamp: now - DAY_MS * 3 + 710000,
      type: 'sharp_swerve',
      magnitude: 0.82,
      gForce: 0.38,
      locationName: 'Central Expwy Merge',
      description: 'Sudden steering snap during lane change',
    },
  ];

  return [
    {
      id: 'trip_yesterday_commute',
      driverName: 'Alex Parker (17 yrs)',
      vehicle: '2022 Honda Civic EX',
      startTime: now - DAY_MS,
      endTime: now - DAY_MS + 1020000, // 17 mins
      isLive: false,
      startLocation: {
        lat: 37.3688,
        lng: -122.0363,
        name: 'Elm Street Residence',
        address: '1428 Elm Street, Sunnyvale, CA',
      },
      endLocation: {
        lat: 37.3815,
        lng: -122.0512,
        name: 'Homestead High School',
        address: '21370 Homestead Rd, Cupertino, CA',
      },
      distanceMiles: 4.8,
      durationSeconds: 1020,
      avgSpeedMph: 24.2,
      maxSpeedMph: 41.0,
      speedViolations: trip1Violations,
      pctDistanceSpeeding: 6.2,
      totalSpeedingDurationSec: 42,
      speedComplianceScore: 88,
      brakingEvents: trip1Brakes,
      signalBrakingScore: 79,
      jerkIncidents: trip1Jerks,
      overallSmoothnessScore: 82,
      comfortRating: 'Good Teen Driver',
      overallSafetyScore: 85,
      telemetryHistory: [],
    },
    {
      id: 'trip_weekend_practice',
      driverName: 'Alex Parker (17 yrs)',
      vehicle: '2022 Honda Civic EX',
      startTime: now - DAY_MS * 2,
      endTime: now - DAY_MS * 2 + 960000, // 16 mins
      isLive: false,
      startLocation: {
        lat: 37.3245,
        lng: -122.0321,
        name: 'West Valley Mall Plaza',
        address: '10900 N Wolfe Rd, Cupertino, CA',
      },
      endLocation: {
        lat: 37.3188,
        lng: -122.0688,
        name: 'De Anza College Athletic Field',
        address: '21250 Stevens Creek Blvd, Cupertino, CA',
      },
      distanceMiles: 5.2,
      durationSeconds: 960,
      avgSpeedMph: 28.6,
      maxSpeedMph: 38.0,
      speedViolations: [],
      pctDistanceSpeeding: 0,
      totalSpeedingDurationSec: 0,
      speedComplianceScore: 100,
      brakingEvents: trip2Brakes,
      signalBrakingScore: 93,
      jerkIncidents: [],
      overallSmoothnessScore: 94,
      comfortRating: 'Chauffeur Smooth',
      overallSafetyScore: 97,
      telemetryHistory: [],
    },
    {
      id: 'trip_highway_errand',
      driverName: 'Alex Parker (17 yrs)',
      vehicle: '2022 Honda Civic EX',
      startTime: now - DAY_MS * 3,
      endTime: now - DAY_MS * 3 + 1280000, // ~21 mins
      isLive: false,
      startLocation: {
        lat: 37.4182,
        lng: -122.0835,
        name: 'Shoreline Blvd On-Ramp',
        address: 'Shoreline Blvd at US-101, Mountain View, CA',
      },
      endLocation: {
        lat: 37.3822,
        lng: -122.0655,
        name: 'Castro Street Downtown',
        address: 'Central Expwy & Castro St, Mountain View, CA',
      },
      distanceMiles: 9.4,
      durationSeconds: 1280,
      avgSpeedMph: 44.5,
      maxSpeedMph: 77.0,
      speedViolations: trip3Violations,
      pctDistanceSpeeding: 16.4,
      totalSpeedingDurationSec: 162,
      speedComplianceScore: 74,
      brakingEvents: trip3Brakes,
      signalBrakingScore: 70,
      jerkIncidents: trip3Jerks,
      overallSmoothnessScore: 72,
      comfortRating: 'Moderate Jerks',
      overallSafetyScore: 73,
      telemetryHistory: [],
    },
  ];
}
