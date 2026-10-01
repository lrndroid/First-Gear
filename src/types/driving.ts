export interface LocationPoint {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface TelemetryPoint {
  timestamp: number; // ms
  lat: number;
  lng: number;
  speedMph: number;
  speedLimitMph: number;
  speedLimitSource: 'roads_api' | 'inferred' | 'osm';
  accelX: number; // lateral (g)
  accelY: number; // longitudinal (braking/acceleration) (g)
  accelZ: number; // vertical shock (g)
  jerk: number; // m/s^3
  gyroAlpha: number; // yaw
  gyroBeta: number; // pitch
  gyroGamma: number; // roll
  isViolatingLimit: boolean; // > +10% over speed limit
  pctOverLimit: number; // % above posted limit (positive if over)
  nearIntersection?: boolean;
  intersectionName?: string;
}

export interface SpeedViolation {
  id: string;
  timestamp: number;
  lat: number;
  lng: number;
  placeName: string;
  speedMph: number;
  speedLimitMph: number;
  pctOverLimit: number; // e.g. 18.5 for 18.5%
  durationSec: number;
  severity: 'minor' | 'moderate' | 'excessive'; // minor 10-15%, moderate 15-25%, excessive > 25%
}

export interface BrakingEvent {
  id: string;
  timestamp: number;
  lat: number;
  lng: number;
  locationName: string;
  isSignalOrIntersection: boolean;
  intersectionName?: string;
  initialSpeedMph: number;
  finalSpeedMph: number;
  stoppingDistanceFeet: number;
  durationSeconds: number;
  peakDecelG: number; // negative g force magnitude
  avgDecelG: number;
  peakJerk: number; // m/s^3
  smoothnessScore: number; // 0 - 100
  rating: 'Silky Smooth' | 'Controlled' | 'Abrupt' | 'Harsh Jolt';
  notes: string;
}

export interface JerkIncident {
  id: string;
  timestamp: number;
  type: 'harsh_braking' | 'sudden_accel' | 'sharp_swerve' | 'pothole_shock';
  magnitude: number; // m/s^3
  gForce: number;
  locationName: string;
  description: string;
}

export interface Trip {
  id: string;
  driverName: string;
  vehicle: string;
  startTime: number;
  endTime?: number;
  isLive: boolean;
  startLocation: LocationPoint;
  endLocation?: LocationPoint;
  distanceMiles: number;
  durationSeconds: number;
  avgSpeedMph: number;
  maxSpeedMph: number;
  
  // Part 1: Speed Limit vs Violations (> +10%)
  speedViolations: SpeedViolation[];
  pctDistanceSpeeding: number;
  totalSpeedingDurationSec: number;
  speedComplianceScore: number; // 0 - 100
  
  // Part 2: Driving Experience, Braking & Jerks
  brakingEvents: BrakingEvent[];
  signalBrakingScore: number; // 0 - 100 average of signal/intersection stops
  jerkIncidents: JerkIncident[];
  overallSmoothnessScore: number; // 0 - 100
  comfortRating: 'Chauffeur Smooth' | 'Good Teen Driver' | 'Moderate Jerks' | 'Aggressive Driving';
  
  overallSafetyScore: number; // composite 0 - 100
  telemetryHistory: TelemetryPoint[];
}

export interface SensorReading {
  timestamp: number;
  accel: {
    x: number;
    y: number;
    z: number;
  };
  accelIncludingGravity: {
    x: number;
    y: number;
    z: number;
  };
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  orientation: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  jerk: number; // m/s^3
  brakingForceG: number; // -Y axis deceleration in g
  lateralG: number; // X axis in g
}

export interface GPSReading {
  timestamp: number;
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number | null;
  heading?: number | null;
  speedMph: number;
}
