import React, { useState, useEffect, useRef } from 'react';
import { Trip, TelemetryPoint, SpeedViolation, BrakingEvent, JerkIncident, SensorReading, GPSReading } from './types/driving';
import { getStoredTrips, saveTrip, deleteTrip } from './services/tripStorage';
import { sensorEngine, calculateDistanceMiles, evaluateBrakeSmoothness } from './services/sensorEngine';
import { getSpeedLimitForCoordinate, snapCoordinatesToRoad, reverseGeocodeLocation } from './services/roadsApi';
import { PRESET_ROUTES, PresetRoute } from './services/simulator';
import { Header } from './components/Header';
import { LiveDrivingHUD } from './components/LiveDrivingHUD';
import { DrivingMap } from './components/DrivingMap';
import { AnalysisView } from './components/AnalysisView';
import { TripHistoryList } from './components/TripHistoryList';
import { SensorsPanel } from './components/SensorsPanel';
import { DriveSimulatorModal } from './components/DriveSimulatorModal';
import { InstallDeviceModal } from './components/InstallDeviceModal';
import { ShieldCheck, Navigation, Play, AlertTriangle, Zap, CheckCircle2, FileText, Map as MapIcon, History, Smartphone } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCd0wJ-h87ejFi8IynHiryr6LCn7ZPpnqM';

export default function App() {
  // Stored Trips and Selection
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'analysis' | 'history'>('live');

  // Driver Profile
  const [driverName, setDriverName] = useState('Alex Parker (17 yrs)');
  const vehicle = '2022 Honda Civic EX';

  // Live Driving & Hardware Sensor State
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.3688,
    lng: -122.0363,
  });
  const [heading, setHeading] = useState(0);
  const [currentSpeedMph, setCurrentSpeedMph] = useState(0);
  const [speedLimitMph, setSpeedLimitMph] = useState(25);
  const [speedLimitSource, setSpeedLimitSource] = useState<'roads_api' | 'inferred' | 'osm'>('roads_api');
  const [currentRoadName, setCurrentRoadName] = useState('Elm Street');
  const [brakingForceG, setBrakingForceG] = useState(0);
  const [jerk, setJerk] = useState(0);

  // Active Trip Telemetry
  const [activeTripMiles, setActiveTripMiles] = useState(0);
  const [activeTripDurationSec, setActiveTripDurationSec] = useState(0);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [violations, setViolations] = useState<SpeedViolation[]>([]);
  const [brakingEvents, setBrakingEvents] = useState<BrakingEvent[]>([]);
  const [jerkIncidents, setJerkIncidents] = useState<JerkIncident[]>([]);
  const [approachingSignal, setApproachingSignal] = useState<{ name: string; distanceFeet: number } | null>(null);

  // Modals & Tools
  const [showSensorsModal, setShowSensorsModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [sensorReading, setSensorReading] = useState<SensorReading | null>(null);
  const [gpsReading, setGpsReading] = useState<GPSReading | null>(null);

  // Simulator State
  const [selectedRoute, setSelectedRoute] = useState<PresetRoute>(PRESET_ROUTES[0]);
  const [simWaypointIdx, setSimWaypointIdx] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1);

  // Refs for tracking transitions and braking events
  const tripStartTimeRef = useRef<number>(Date.now());
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const brakingTrackerRef = useRef<{
    isBraking: boolean;
    initialSpeed: number;
    startTime: number;
    peakDecelG: number;
    peakJerk: number;
    startLat: number;
    startLng: number;
  }>({
    isBraking: false,
    initialSpeed: 0,
    startTime: 0,
    peakDecelG: 0,
    peakJerk: 0,
    startLat: 0,
    startLng: 0,
  });

  const speedingTrackerRef = useRef<{
    isSpeeding: boolean;
    startTime: number;
    startLat: number;
    startLng: number;
    placeName: string;
    maxSpeed: number;
    limit: number;
  }>({
    isSpeeding: false,
    startTime: 0,
    startLat: 0,
    startLng: 0,
    placeName: '',
    maxSpeed: 0,
    limit: 25,
  });

  // Load Trips on Mount
  useEffect(() => {
    const loaded = getStoredTrips();
    setTrips(loaded);
    if (loaded.length > 0) {
      setSelectedTrip(loaded[0]);
    }
  }, []);

  // Capture PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Trip Duration Timer
  useEffect(() => {
    if (!isTracking && !isSimulating) return;
    const interval = setInterval(() => {
      setActiveTripDurationSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, isSimulating]);

  // Start Real Hardware Drive Tracking
  const handleStartTracking = async () => {
    await sensorEngine.requestPermissions();
    setIsSimulating(false);
    setIsTracking(true);
    setActiveTab('live');

    tripStartTimeRef.current = Date.now();
    setActiveTripMiles(0);
    setActiveTripDurationSec(0);
    setTelemetryHistory([]);
    setViolations([]);
    setBrakingEvents([]);
    setJerkIncidents([]);

    sensorEngine.start(
      (sensor) => {
        setSensorReading(sensor);
        setBrakingForceG(sensor.brakingForceG);
        setJerk(sensor.jerk);

        // Detect harsh jerk incidents (> 1.0 m/s^3)
        if (sensor.jerk > 1.1) {
          const incident: JerkIncident = {
            id: `jerk_${Date.now()}`,
            timestamp: Date.now(),
            type: sensor.brakingForceG > 0.4 ? 'harsh_braking' : 'sharp_swerve',
            magnitude: sensor.jerk,
            gForce: Math.max(sensor.brakingForceG, sensor.lateralG),
            locationName: currentRoadName,
            description: `Sudden acceleration/braking jolt (${sensor.jerk.toFixed(1)} m/s³)`,
          };
          setJerkIncidents((prev) => [...prev.slice(-15), incident]);
        }
      },
      async (gps) => {
        setGpsReading(gps);
        setCurrentLocation({ lat: gps.lat, lng: gps.lng });
        if (gps.heading) setHeading(gps.heading);
        setCurrentSpeedMph(gps.speedMph);

        // Update accumulated miles
        if (lastLocationRef.current) {
          const deltaMiles = calculateDistanceMiles(
            lastLocationRef.current.lat,
            lastLocationRef.current.lng,
            gps.lat,
            gps.lng
          );
          if (deltaMiles > 0.0005 && deltaMiles < 0.5) {
            setActiveTripMiles((prev) => prev + deltaMiles);
          }
        }
        lastLocationRef.current = { lat: gps.lat, lng: gps.lng };

        // Fetch Speed Limit from Google Roads API
        const limitRes = await getSpeedLimitForCoordinate(gps.lat, gps.lng);
        setSpeedLimitMph(limitRes.speedLimitMph);
        setSpeedLimitSource(limitRes.source);

        // Process telemetry point
        recordTelemetry(gps.lat, gps.lng, gps.speedMph, limitRes.speedLimitMph);
      }
    );
  };

  // Stop & Save Current Drive Trip
  const handleStopTracking = async () => {
    sensorEngine.stop();
    setIsTracking(false);
    setIsSimulating(false);

    // Compute final trip analysis
    const startAddr = await reverseGeocodeLocation(
      telemetryHistory[0]?.lat || currentLocation.lat,
      telemetryHistory[0]?.lng || currentLocation.lng
    );
    const endAddr = await reverseGeocodeLocation(currentLocation.lat, currentLocation.lng);

    const speedCompliance = Math.max(
      30,
      Math.round(100 - violations.length * 12 - (activeTripMiles > 0 ? (violations.length / activeTripMiles) * 10 : 0))
    );

    // Compute braking smoothness
    const signalBrakes = brakingEvents.filter((b) => b.isSignalOrIntersection);
    const avgBrakingScore =
      signalBrakes.length > 0
        ? Math.round(signalBrakes.reduce((acc, b) => acc + b.smoothnessScore, 0) / signalBrakes.length)
        : 88;

    const overallSmoothness = Math.round(avgBrakingScore * 0.7 + (100 - Math.min(60, jerkIncidents.length * 15)) * 0.3);

    const safetyScore = Math.round(speedCompliance * 0.45 + overallSmoothness * 0.55);

    let comfortRating: 'Chauffeur Smooth' | 'Good Teen Driver' | 'Moderate Jerks' | 'Aggressive Driving' =
      'Good Teen Driver';
    if (overallSmoothness >= 90) comfortRating = 'Chauffeur Smooth';
    else if (overallSmoothness >= 75) comfortRating = 'Good Teen Driver';
    else if (overallSmoothness >= 60) comfortRating = 'Moderate Jerks';
    else comfortRating = 'Aggressive Driving';

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      driverName,
      vehicle,
      startTime: tripStartTimeRef.current,
      endTime: Date.now(),
      isLive: false,
      startLocation: {
        lat: telemetryHistory[0]?.lat || currentLocation.lat,
        lng: telemetryHistory[0]?.lng || currentLocation.lng,
        name: startAddr,
        address: startAddr,
      },
      endLocation: {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        name: endAddr,
        address: endAddr,
      },
      distanceMiles: Math.max(0.1, activeTripMiles),
      durationSeconds: Math.max(10, activeTripDurationSec),
      avgSpeedMph:
        telemetryHistory.length > 0
          ? Math.round(telemetryHistory.reduce((a, b) => a + b.speedMph, 0) / telemetryHistory.length)
          : Math.round(currentSpeedMph),
      maxSpeedMph: telemetryHistory.reduce((max, p) => (p.speedMph > max ? p.speedMph : max), currentSpeedMph),
      speedViolations: violations,
      pctDistanceSpeeding:
        telemetryHistory.length > 0
          ? Math.round((telemetryHistory.filter((t) => t.isViolatingLimit).length / telemetryHistory.length) * 100)
          : 0,
      totalSpeedingDurationSec: violations.reduce((acc, v) => acc + v.durationSec, 0),
      speedComplianceScore: speedCompliance,
      brakingEvents,
      signalBrakingScore: avgBrakingScore,
      jerkIncidents,
      overallSmoothnessScore: overallSmoothness,
      comfortRating,
      overallSafetyScore: safetyScore,
      telemetryHistory,
    };

    saveTrip(newTrip);
    const updated = getStoredTrips();
    setTrips(updated);
    setSelectedTrip(newTrip);
    setActiveTab('analysis');
  };

  // Telemetry recorder: checks speed violations (> +10%) and braking curves
  const recordTelemetry = (lat: number, lng: number, speed: number, limit: number) => {
    const isViolating = speed > limit * 1.1; // Strict +10% rule
    const pctOver = limit > 0 ? ((speed - limit) / limit) * 100 : 0;

    const point: TelemetryPoint = {
      timestamp: Date.now(),
      lat,
      lng,
      speedMph: speed,
      speedLimitMph: limit,
      speedLimitSource,
      accelX: sensorReading?.accel.x || 0,
      accelY: sensorReading?.accel.y || 0,
      accelZ: sensorReading?.accel.z || 0,
      jerk,
      gyroAlpha: 0,
      gyroBeta: 0,
      gyroGamma: 0,
      isViolatingLimit: isViolating,
      pctOverLimit: pctOver,
    };

    setTelemetryHistory((prev) => [...prev.slice(-300), point]);

    // Track Speed Violations (> +10%)
    if (isViolating) {
      if (!speedingTrackerRef.current.isSpeeding) {
        speedingTrackerRef.current = {
          isSpeeding: true,
          startTime: Date.now(),
          startLat: lat,
          startLng: lng,
          placeName: currentRoadName,
          maxSpeed: speed,
          limit,
        };
      } else {
        if (speed > speedingTrackerRef.current.maxSpeed) {
          speedingTrackerRef.current.maxSpeed = speed;
        }
      }
    } else {
      if (speedingTrackerRef.current.isSpeeding) {
        // Conclude violation event
        const durSec = Math.max(3, Math.round((Date.now() - speedingTrackerRef.current.startTime) / 1000));
        const finalPct = ((speedingTrackerRef.current.maxSpeed - limit) / limit) * 100;

        const violation: SpeedViolation = {
          id: `viol_${Date.now()}`,
          timestamp: speedingTrackerRef.current.startTime,
          lat: speedingTrackerRef.current.startLat,
          lng: speedingTrackerRef.current.startLng,
          placeName: speedingTrackerRef.current.placeName,
          speedMph: Math.round(speedingTrackerRef.current.maxSpeed),
          speedLimitMph: limit,
          pctOverLimit: finalPct,
          durationSec: durSec,
          severity: finalPct > 25 ? 'excessive' : finalPct > 15 ? 'moderate' : 'minor',
        };

        setViolations((prev) => [...prev, violation]);
        speedingTrackerRef.current.isSpeeding = false;
      }
    }
  };

  // Test Drive Route Simulator Execution Loop
  useEffect(() => {
    if (!isSimulating) return;

    const intervalTime = Math.max(250, 1000 / simSpeed);
    const waypoints = selectedRoute.waypoints;

    const interval = setInterval(async () => {
      setSimWaypointIdx((currIdx) => {
        const nextIdx = (currIdx + 1) % waypoints.length;
        const currentWp = waypoints[currIdx];
        const nextWp = waypoints[nextIdx];

        // Interpolate position
        const targetLat = nextWp.lat;
        const targetLng = nextWp.lng;
        const targetSpeed = nextWp.targetSpeedMph;
        const speedLimit = nextWp.speedLimitMph;

        setCurrentLocation({ lat: targetLat, lng: targetLng });
        setCurrentSpeedMph(targetSpeed);
        setSpeedLimitMph(speedLimit);
        setSpeedLimitSource('roads_api');
        setCurrentRoadName(nextWp.roadName);

        // Distance accumulator
        setActiveTripMiles((prev) => prev + (0.05 * simSpeed));

        // Signal approach notice
        if (nextWp.isIntersection || nextWp.hasTrafficSignal) {
          setApproachingSignal({
            name: nextWp.intersectionName || nextWp.roadName,
            distanceFeet: 180,
          });
        } else {
          setApproachingSignal(null);
        }

        // Braking and Jerk Simulation
        let simBrakeG = 0.05;
        let simJerk = 0.15;

        if (nextWp.action === 'smooth_brake') {
          simBrakeG = 0.22;
          simJerk = 0.28;
          setBrakingForceG(0.22);
          setJerk(0.28);

          const assessment = evaluateBrakeSmoothness(currentWp.targetSpeedMph, 0, 0.22, 0.28, 3.8);
          const brakeEvent: BrakingEvent = {
            id: `brake_${Date.now()}`,
            timestamp: Date.now(),
            lat: targetLat,
            lng: targetLng,
            locationName: nextWp.roadName,
            isSignalOrIntersection: true,
            intersectionName: nextWp.intersectionName || nextWp.roadName,
            initialSpeedMph: currentWp.targetSpeedMph,
            finalSpeedMph: 0,
            stoppingDistanceFeet: 45,
            durationSeconds: 3.8,
            peakDecelG: 0.22,
            avgDecelG: 0.16,
            peakJerk: 0.28,
            smoothnessScore: assessment.score,
            rating: assessment.rating,
            notes: assessment.notes,
          };
          setBrakingEvents((prev) => [...prev, brakeEvent]);
        } else if (nextWp.action === 'harsh_brake') {
          simBrakeG = 0.54;
          simJerk = 1.18;
          setBrakingForceG(0.54);
          setJerk(1.18);

          const assessment = evaluateBrakeSmoothness(currentWp.targetSpeedMph, 0, 0.54, 1.18, 2.1);
          const brakeEvent: BrakingEvent = {
            id: `brake_${Date.now()}`,
            timestamp: Date.now(),
            lat: targetLat,
            lng: targetLng,
            locationName: nextWp.roadName,
            isSignalOrIntersection: true,
            intersectionName: nextWp.intersectionName || nextWp.roadName,
            initialSpeedMph: currentWp.targetSpeedMph,
            finalSpeedMph: 0,
            stoppingDistanceFeet: 68,
            durationSeconds: 2.1,
            peakDecelG: 0.54,
            avgDecelG: 0.39,
            peakJerk: 1.18,
            smoothnessScore: assessment.score,
            rating: assessment.rating,
            notes: assessment.notes,
          };
          setBrakingEvents((prev) => [...prev, brakeEvent]);

          setJerkIncidents((prev) => [
            ...prev,
            {
              id: `jerk_${Date.now()}`,
              timestamp: Date.now(),
              type: 'harsh_braking',
              magnitude: 1.18,
              gForce: 0.54,
              locationName: nextWp.intersectionName || nextWp.roadName,
              description: 'Hard brake stomp at traffic signal (0.54g decel)',
            },
          ]);
        } else if (nextWp.action === 'speed_up') {
          // Speed violation!
          const pctOver = ((targetSpeed - speedLimit) / speedLimit) * 100;
          if (pctOver > 10) {
            setViolations((prev) => [
              ...prev,
              {
                id: `viol_${Date.now()}`,
                timestamp: Date.now(),
                lat: targetLat,
                lng: targetLng,
                placeName: nextWp.roadName,
                speedMph: targetSpeed,
                speedLimitMph: speedLimit,
                pctOverLimit: pctOver,
                durationSec: 18,
                severity: pctOver > 25 ? 'excessive' : pctOver > 15 ? 'moderate' : 'minor',
              },
            ]);
          }
        } else {
          setBrakingForceG(0.04);
          setJerk(0.12);
        }

        // Record telemetry point
        recordTelemetry(targetLat, targetLng, targetSpeed, speedLimit);

        return nextIdx;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulating, selectedRoute, simSpeed]);

  // Handle Manual Actions in Simulator
  const handleManualAction = (action: 'speed_up' | 'smooth_brake' | 'harsh_brake' | 'swerve') => {
    if (action === 'speed_up') {
      const newSpeed = Math.round(speedLimitMph * 1.18); // +18% over
      setCurrentSpeedMph(newSpeed);
      recordTelemetry(currentLocation.lat, currentLocation.lng, newSpeed, speedLimitMph);
    } else if (action === 'smooth_brake') {
      setBrakingForceG(0.24);
      setJerk(0.31);
      const assessment = evaluateBrakeSmoothness(currentSpeedMph, 0, 0.24, 0.31, 3.6);
      const brake: BrakingEvent = {
        id: `brake_${Date.now()}`,
        timestamp: Date.now(),
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        locationName: `${currentRoadName} Signal`,
        isSignalOrIntersection: true,
        intersectionName: `${currentRoadName} Intersection`,
        initialSpeedMph: currentSpeedMph,
        finalSpeedMph: 0,
        stoppingDistanceFeet: 42,
        durationSeconds: 3.6,
        peakDecelG: 0.24,
        avgDecelG: 0.17,
        peakJerk: 0.31,
        smoothnessScore: assessment.score,
        rating: assessment.rating,
        notes: assessment.notes,
      };
      setBrakingEvents((prev) => [...prev, brake]);
      setCurrentSpeedMph(0);
    } else if (action === 'harsh_brake') {
      setBrakingForceG(0.56);
      setJerk(1.22);
      const assessment = evaluateBrakeSmoothness(currentSpeedMph, 0, 0.56, 1.22, 1.9);
      const brake: BrakingEvent = {
        id: `brake_${Date.now()}`,
        timestamp: Date.now(),
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        locationName: `${currentRoadName} Signal (Emergency Stop)`,
        isSignalOrIntersection: true,
        intersectionName: `${currentRoadName} Intersection`,
        initialSpeedMph: currentSpeedMph,
        finalSpeedMph: 0,
        stoppingDistanceFeet: 74,
        durationSeconds: 1.9,
        peakDecelG: 0.56,
        avgDecelG: 0.41,
        peakJerk: 1.22,
        smoothnessScore: assessment.score,
        rating: assessment.rating,
        notes: assessment.notes,
      };
      setBrakingEvents((prev) => [...prev, brake]);
      setJerkIncidents((prev) => [
        ...prev,
        {
          id: `jerk_${Date.now()}`,
          timestamp: Date.now(),
          type: 'harsh_braking',
          magnitude: 1.22,
          gForce: 0.56,
          locationName: currentRoadName,
          description: 'Emergency stop jolt with forward cabin lurch (0.56g)',
        },
      ]);
      setCurrentSpeedMph(0);
    } else if (action === 'swerve') {
      setBrakingForceG(0.18);
      setJerk(0.95);
      setJerkIncidents((prev) => [
        ...prev,
        {
          id: `jerk_${Date.now()}`,
          timestamp: Date.now(),
          type: 'sharp_swerve',
          magnitude: 0.95,
          gForce: 0.44,
          locationName: currentRoadName,
          description: 'Sharp lateral swerve / abrupt steering twitch',
        },
      ]);
    }
  };

  // Start Simulation Helper
  const handleStartSimulation = () => {
    setIsTracking(false);
    setIsSimulating(true);
    setActiveTab('live');
    tripStartTimeRef.current = Date.now();
    setActiveTripMiles(0);
    setActiveTripDurationSec(0);
    setTelemetryHistory([]);
    setViolations([]);
    setBrakingEvents([]);
    setJerkIncidents([]);
    setSimWaypointIdx(0);

    const firstWp = selectedRoute.waypoints[0];
    setCurrentLocation({ lat: firstWp.lat, lng: firstWp.lng });
    setCurrentSpeedMph(firstWp.targetSpeedMph);
    setSpeedLimitMph(firstWp.speedLimitMph);
    setCurrentRoadName(firstWp.roadName);
  };

  // Delete Trip from History
  const handleDeleteTrip = (tripId: string) => {
    const updated = deleteTrip(tripId);
    setTrips(updated);
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(updated[0] || null);
    }
  };

  // Current Live Smoothness Score
  const liveSmoothnessScore =
    brakingEvents.length > 0
      ? Math.round(
          brakingEvents.reduce((acc, b) => acc + b.smoothnessScore, 0) / brakingEvents.length
        )
      : 92;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <Header
        isTracking={isTracking}
        isSimulating={isSimulating}
        onStartTracking={handleStartTracking}
        onStopTracking={handleStopTracking}
        onOpenSimulator={() => setShowSimulatorModal(true)}
        onOpenSensors={() => setShowSensorsModal(true)}
        driverName={driverName}
        onDriverChange={setDriverName}
        activeTripMiles={activeTripMiles}
        activeTripDurationSec={activeTripDurationSec}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Live Drive Telemetry & Map</span>
              {(isTracking || isSimulating) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'analysis'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Two-Part In-Depth Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Travel Logs & History ({trips.length})</span>
            </button>
          </div>

          {/* Quick Simulation Trigger if idle */}
          {!isTracking && !isSimulating && (
            <button
              onClick={handleStartSimulation}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Quick Test Drive Simulator</span>
            </button>
          )}
        </div>

        {/* TAB 1: LIVE DRIVE TELEMETRY & MAP */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Live Speed & Deceleration HUD */}
            <LiveDrivingHUD
              currentSpeedMph={currentSpeedMph}
              speedLimitMph={speedLimitMph}
              speedLimitSource={speedLimitSource}
              currentRoadName={currentRoadName}
              brakingForceG={brakingForceG}
              jerk={jerk}
              distanceMiles={activeTripMiles}
              durationSeconds={activeTripDurationSec}
              violationCount={violations.length}
              smoothnessScore={liveSmoothnessScore}
              approachingSignal={approachingSignal}
            />

            {/* Interactive Google Map with Route & Violation Markers */}
            <div className="h-[480px]">
              <DrivingMap
                apiKey={GOOGLE_MAPS_API_KEY}
                currentLocation={currentLocation}
                heading={heading}
                currentSpeedMph={currentSpeedMph}
                currentSpeedLimitMph={speedLimitMph}
                telemetryHistory={telemetryHistory}
                violations={violations}
                brakingEvents={brakingEvents}
              />
            </div>
          </div>
        )}

        {/* TAB 2: TWO-PART IN-DEPTH ANALYSIS */}
        {activeTab === 'analysis' && (
          <div>
            {selectedTrip ? (
              <AnalysisView
                trip={selectedTrip}
                onSelectEventOnMap={(event) => {
                  setCurrentLocation({ lat: event.lat, lng: event.lng });
                  setActiveTab('live');
                }}
              />
            ) : (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <div className="font-bold text-lg text-white">No Trip Selected for Analysis</div>
                <p className="text-xs max-w-sm mx-auto">
                  Please select a completed trip from the History tab or finish your current active drive.
                </p>
                <button
                  onClick={() => setActiveTab('history')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  View Trip History
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRAVEL LOGS & PREVIOUS TRIPS */}
        {activeTab === 'history' && (
          <TripHistoryList
            trips={trips}
            selectedTripId={selectedTrip?.id}
            onSelectTrip={(trip) => {
              setSelectedTrip(trip);
              setActiveTab('analysis');
            }}
            onDeleteTrip={handleDeleteTrip}
          />
        )}
      </main>

      {/* Sensor Hardware Diagnostics Modal */}
      {showSensorsModal && (
        <SensorsPanel
          sensorReading={sensorReading}
          gpsReading={gpsReading}
          onRequestPermissions={() => sensorEngine.requestPermissions()}
          onClose={() => setShowSensorsModal(false)}
        />
      )}

      {/* Test Drive Route Simulator Modal */}
      <DriveSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        selectedRoute={selectedRoute}
        onSelectRoute={(route) => {
          setSelectedRoute(route);
          if (isSimulating) {
            handleStartSimulation();
          }
        }}
        isRunning={isSimulating}
        onTogglePlay={() => {
          if (isSimulating) {
            setIsSimulating(false);
          } else {
            handleStartSimulation();
          }
        }}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        onManualAction={handleManualAction}
      />

      {/* Download / Install to Mobile Test Device Modal */}
      <InstallDeviceModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onNativeInstall={handleNativeInstall}
      />
    </div>
  );
}
