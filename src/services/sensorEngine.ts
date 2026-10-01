import { SensorReading, GPSReading } from '../types/driving';

export type SensorCallback = (reading: SensorReading) => void;
export type GPSCallback = (reading: GPSReading) => void;

class SensorEngine {
  private motionListener: ((e: DeviceMotionEvent) => void) | null = null;
  private orientationListener: ((e: DeviceOrientationEvent) => void) | null = null;
  private geoWatchId: number | null = null;

  private sensorCallbacks: Set<SensorCallback> = new Set();
  private gpsCallbacks: Set<GPSCallback> = new Set();

  private lastAccel = { x: 0, y: 0, z: 0 };
  private lastTimestamp = Date.now();
  private lastGPS: { lat: number; lng: number; time: number } | null = null;

  public isTracking = false;
  public hasMotionPermission = false;

  /**
   * Request sensor permissions (required on iOS Safari 13+)
   */
  public async requestPermissions(): Promise<boolean> {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceMotionEvent as any)?.requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        this.hasMotionPermission = response === 'granted';
        return this.hasMotionPermission;
      } catch (err) {
        console.warn('Sensor permission error:', err);
        return false;
      }
    }
    this.hasMotionPermission = true;
    return true;
  }

  /**
   * Start listening to device hardware sensors
   */
  public start(onSensor?: SensorCallback, onGPS?: GPSCallback) {
    if (onSensor) this.sensorCallbacks.add(onSensor);
    if (onGPS) this.gpsCallbacks.add(onGPS);

    if (this.isTracking) return;
    this.isTracking = true;

    // Accelerometer & Gyroscope
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      this.motionListener = (e: DeviceMotionEvent) => {
        const now = Date.now();
        const dt = Math.max((now - this.lastTimestamp) / 1000, 0.02);

        // Linear acceleration (excluding gravity if available)
        const accel = e.acceleration || { x: 0, y: 0, z: 0 };
        const accelGrav = e.accelerationIncludingGravity || { x: 0, y: 0, z: 9.8 };
        const rot = e.rotationRate || { alpha: 0, beta: 0, gamma: 0 };

        const ax = accel.x || 0;
        const ay = accel.y || 0;
        const az = accel.z || 0;

        // Jerk calculation: rate of change of acceleration vector (m/s^3)
        const dAx = (ax - this.lastAccel.x) / dt;
        const dAy = (ay - this.lastAccel.y) / dt;
        const dAz = (az - this.lastAccel.z) / dt;
        const jerk = Math.sqrt(dAx * dAx + dAy * dAy + dAz * dAz);

        // Longitudinal braking force (negative Y if phone portrait in mount)
        // Deceleration force in G-units (1g = 9.81 m/s^2)
        const brakingForceG = Math.abs(ay) / 9.81;
        const lateralG = Math.abs(ax) / 9.81;

        this.lastAccel = { x: ax, y: ay, z: az };
        this.lastTimestamp = now;

        const reading: SensorReading = {
          timestamp: now,
          accel: { x: ax, y: ay, z: az },
          accelIncludingGravity: {
            x: accelGrav.x || 0,
            y: accelGrav.y || 0,
            z: accelGrav.z || 9.8,
          },
          rotationRate: {
            alpha: rot.alpha || 0,
            beta: rot.beta || 0,
            gamma: rot.gamma || 0,
          },
          orientation: { alpha: 0, beta: 0, gamma: 0 },
          jerk,
          brakingForceG,
          lateralG,
        };

        this.sensorCallbacks.forEach((cb) => cb(reading));
      };

      window.addEventListener('devicemotion', this.motionListener);
    }

    // Orientation (yaw, pitch, roll)
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      this.orientationListener = (e: DeviceOrientationEvent) => {
        // Updated orientation if needed
      };
      window.addEventListener('deviceorientation', this.orientationListener);
    }

    // GPS Geolocation watchPosition
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      this.geoWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          const altitude = pos.coords.altitude;
          const heading = pos.coords.heading;

          // Speed in m/s converted to mph
          let speedMph = 0;
          if (pos.coords.speed !== null && pos.coords.speed !== undefined && pos.coords.speed >= 0) {
            speedMph = pos.coords.speed * 2.23694; // m/s to mph
          } else if (this.lastGPS) {
            // Calculate speed from displacement
            const distMiles = calculateDistanceMiles(
              this.lastGPS.lat,
              this.lastGPS.lng,
              lat,
              lng
            );
            const dtHours = (Date.now() - this.lastGPS.time) / (1000 * 3600);
            if (dtHours > 0.0001) {
              speedMph = distMiles / dtHours;
            }
          }

          this.lastGPS = { lat, lng, time: Date.now() };

          const reading: GPSReading = {
            timestamp: Date.now(),
            lat,
            lng,
            accuracy,
            altitude,
            heading,
            speedMph: Math.max(0, speedMph),
          };

          this.gpsCallbacks.forEach((cb) => cb(reading));
        },
        (err) => {
          console.warn('Geolocation watch error:', err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      );
    }
  }

  public stop() {
    this.isTracking = false;
    if (this.motionListener) {
      window.removeEventListener('devicemotion', this.motionListener);
      this.motionListener = null;
    }
    if (this.orientationListener) {
      window.removeEventListener('deviceorientation', this.orientationListener);
      this.orientationListener = null;
    }
    if (this.geoWatchId !== null) {
      navigator.geolocation.clearWatch(this.geoWatchId);
      this.geoWatchId = null;
    }
    this.sensorCallbacks.clear();
    this.gpsCallbacks.clear();
  }
}

export const sensorEngine = new SensorEngine();

/**
 * Haversine formula to compute distance in miles between coordinates
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Assess braking smoothness and jerk score
 * Returns score 0-100 and qualitative rating
 */
export function evaluateBrakeSmoothness(
  initialSpeedMph: number,
  finalSpeedMph: number,
  peakDecelG: number,
  peakJerk: number,
  durationSec: number
): { score: number; rating: 'Silky Smooth' | 'Controlled' | 'Abrupt' | 'Harsh Jolt'; notes: string } {
  // Ideal smooth braking: peakDecel around 0.15g - 0.25g, peak jerk < 0.35g/s
  // Harsh braking: decel > 0.45g, jerk > 0.8g/s
  let penalty = 0;

  // Deceleration penalty
  if (peakDecelG > 0.48) {
    penalty += (peakDecelG - 0.48) * 120 + 35;
  } else if (peakDecelG > 0.35) {
    penalty += (peakDecelG - 0.35) * 60 + 15;
  }

  // Jerk penalty (rapid onset or sudden brake release jolt)
  if (peakJerk > 1.2) {
    penalty += Math.min((peakJerk - 1.2) * 15, 30);
  } else if (peakJerk > 0.6) {
    penalty += (peakJerk - 0.6) * 10;
  }

  // Too abrupt time
  if (initialSpeedMph > 25 && durationSec < 2.0) {
    penalty += 15;
  }

  const score = Math.max(10, Math.min(100, Math.round(100 - penalty)));

  let rating: 'Silky Smooth' | 'Controlled' | 'Abrupt' | 'Harsh Jolt' = 'Silky Smooth';
  let notes = 'Gradual pedal application with soft release before stop.';

  if (score >= 90) {
    rating = 'Silky Smooth';
    notes = 'Excellent brake modulation! Gradual deceleration with no final jolt.';
  } else if (score >= 75) {
    rating = 'Controlled';
    notes = 'Good progressive braking with minor pedal pressure shift.';
  } else if (score >= 50) {
    rating = 'Abrupt';
    notes = 'Late brake application; felt sudden deceleration force.';
  } else {
    rating = 'Harsh Jolt';
    notes = 'Harsh panic braking event! Stomped on brakes near the intersection.';
  }

  return { score, rating, notes };
}
