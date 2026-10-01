import { TelemetryPoint, SpeedViolation, BrakingEvent, JerkIncident } from '../types/driving';
import { evaluateBrakeSmoothness } from './sensorEngine';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  speedLimitMph: number;
  roadName: string;
  isIntersection?: boolean;
  intersectionName?: string;
  hasTrafficSignal?: boolean;
  action?: 'cruise' | 'speed_up' | 'smooth_brake' | 'harsh_brake' | 'swerve' | 'stop';
  targetSpeedMph: number;
}

export interface PresetRoute {
  id: string;
  name: string;
  description: string;
  startPlace: string;
  endPlace: string;
  waypoints: RouteWaypoint[];
}

// Preset realistic routes in the Bay Area / Silicon Valley
export const PRESET_ROUTES: PresetRoute[] = [
  {
    id: 'school_commute',
    name: 'High School Morning Commute',
    description: 'Residential streets (25 mph), School Zone (20 mph), arterial with traffic signals (35 mph)',
    startPlace: '1428 Elm Street, Sunnyvale',
    endPlace: 'Homestead High School, Sunnyvale',
    waypoints: [
      {
        lat: 37.3688,
        lng: -122.0363,
        speedLimitMph: 25,
        roadName: 'Elm Street',
        targetSpeedMph: 23,
        action: 'cruise',
      },
      {
        lat: 37.3695,
        lng: -122.0375,
        speedLimitMph: 25,
        roadName: 'Elm St & 4th Ave',
        isIntersection: true,
        intersectionName: 'Elm St & 4th Ave (4-Way Stop)',
        targetSpeedMph: 0,
        action: 'smooth_brake',
      },
      {
        lat: 37.3712,
        lng: -122.0401,
        speedLimitMph: 35,
        roadName: 'Mary Avenue',
        targetSpeedMph: 33,
        action: 'cruise',
      },
      {
        lat: 37.3735,
        lng: -122.0425,
        speedLimitMph: 35,
        roadName: 'Mary Ave (Speed Creep)',
        targetSpeedMph: 41, // +17% over limit -> violation!
        action: 'speed_up',
      },
      {
        lat: 37.3768,
        lng: -122.0452,
        speedLimitMph: 35,
        roadName: 'Mary Ave & Fremont Ave',
        isIntersection: true,
        hasTrafficSignal: true,
        intersectionName: 'Mary Ave & Fremont Ave Traffic Signal',
        targetSpeedMph: 0,
        action: 'harsh_brake', // Late braking at yellow turning red
      },
      {
        lat: 37.3792,
        lng: -122.0485,
        speedLimitMph: 20,
        roadName: 'Homestead Rd (School Zone)',
        targetSpeedMph: 19,
        action: 'cruise',
      },
      {
        lat: 37.3815,
        lng: -122.0512,
        speedLimitMph: 20,
        roadName: 'Homestead High School Drop-off',
        isIntersection: true,
        intersectionName: 'School Entrance Signal',
        hasTrafficSignal: true,
        targetSpeedMph: 0,
        action: 'smooth_brake',
      },
    ],
  },
  {
    id: 'highway_interchange',
    name: 'Highway 101 & Express Interchange',
    description: 'High-speed freeway merge (65 mph), off-ramp deceleration, and suburban boulevard',
    startPlace: 'Shoreline Blvd On-Ramp, Mountain View',
    endPlace: 'Central Expressway & Castro St',
    waypoints: [
      {
        lat: 37.4182,
        lng: -122.0835,
        speedLimitMph: 45,
        roadName: 'Shoreline Blvd',
        targetSpeedMph: 44,
        action: 'cruise',
      },
      {
        lat: 37.4145,
        lng: -122.0768,
        speedLimitMph: 65,
        roadName: 'US-101 Southbound',
        targetSpeedMph: 68,
        action: 'cruise',
      },
      {
        lat: 37.4085,
        lng: -122.0672,
        speedLimitMph: 65,
        roadName: 'US-101 S near Ellis St',
        targetSpeedMph: 74, // +14% over 65 mph -> violation!
        action: 'speed_up',
      },
      {
        lat: 37.4012,
        lng: -122.0585,
        speedLimitMph: 65,
        roadName: 'US-101 S (Fast Lane)',
        targetSpeedMph: 76, // +17% violation
        action: 'speed_up',
      },
      {
        lat: 37.3955,
        lng: -122.0528,
        speedLimitMph: 45,
        roadName: 'Mathilda Ave Exit Ramp',
        isIntersection: true,
        hasTrafficSignal: true,
        intersectionName: 'US-101 Exit & Mathilda Ave Signal',
        targetSpeedMph: 0,
        action: 'harsh_brake',
      },
      {
        lat: 37.3888,
        lng: -122.0515,
        speedLimitMph: 45,
        roadName: 'Central Expressway West',
        targetSpeedMph: 43,
        action: 'cruise',
      },
      {
        lat: 37.3822,
        lng: -122.0655,
        speedLimitMph: 35,
        roadName: 'Castro St Intersection',
        isIntersection: true,
        hasTrafficSignal: true,
        intersectionName: 'Central Expwy & Castro St Signal',
        targetSpeedMph: 0,
        action: 'smooth_brake',
      },
    ],
  },
  {
    id: 'suburban_evening',
    name: 'Evening Practice & Signal Corridor',
    description: 'Multiple signalized intersections, speed limit changes (25 -> 40 mph), smooth stop tests',
    startPlace: 'West Valley Mall Plaza',
    endPlace: 'De Anza College Campus',
    waypoints: [
      {
        lat: 37.3245,
        lng: -122.0321,
        speedLimitMph: 25,
        roadName: 'Plaza Drive',
        targetSpeedMph: 22,
        action: 'cruise',
      },
      {
        lat: 37.3231,
        lng: -122.0355,
        speedLimitMph: 35,
        roadName: 'Stevens Creek Blvd',
        isIntersection: true,
        hasTrafficSignal: true,
        intersectionName: 'Stevens Creek & Wolfe Rd Signal',
        targetSpeedMph: 0,
        action: 'smooth_brake',
      },
      {
        lat: 37.3225,
        lng: -122.0452,
        speedLimitMph: 40,
        roadName: 'Stevens Creek Blvd Corridor',
        targetSpeedMph: 38,
        action: 'cruise',
      },
      {
        lat: 37.3218,
        lng: -122.0535,
        speedLimitMph: 40,
        roadName: 'Stevens Creek Blvd & Blaney Ave',
        isIntersection: true,
        hasTrafficSignal: true,
        intersectionName: 'Stevens Creek & Blaney Ave Signal',
        targetSpeedMph: 0,
        action: 'smooth_brake',
      },
      {
        lat: 37.3205,
        lng: -122.0622,
        speedLimitMph: 35,
        roadName: 'Stelling Road',
        targetSpeedMph: 42, // +20% over 35 mph -> violation!
        action: 'speed_up',
      },
      {
        lat: 37.3188,
        lng: -122.0688,
        speedLimitMph: 25,
        roadName: 'De Anza College Perimeter',
        isIntersection: true,
        intersectionName: 'Campus Access Signal',
        hasTrafficSignal: true,
        targetSpeedMph: 0,
        action: 'smooth_brake',
      },
    ],
  },
];
