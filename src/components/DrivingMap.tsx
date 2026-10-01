import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { TelemetryPoint, SpeedViolation, BrakingEvent } from '../types/driving';
import { Navigation, AlertTriangle, TrafficCone, Compass, CheckCircle2, XCircle } from 'lucide-react';

interface DrivingMapProps {
  apiKey: string;
  currentLocation: { lat: number; lng: number };
  heading?: number;
  currentSpeedMph: number;
  currentSpeedLimitMph: number;
  telemetryHistory: TelemetryPoint[];
  violations: SpeedViolation[];
  brakingEvents: BrakingEvent[];
  selectedEvent?: BrakingEvent | SpeedViolation | null;
  onSelectEvent?: (event: any) => void;
}

// Polyline component rendering the driven path on the Google Map
function PolylinePath({ points }: { points: TelemetryPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length < 2 || typeof window === 'undefined' || !(window as any).google?.maps) return;

    const pathCoordinates = points.map((p) => ({ lat: p.lat, lng: p.lng }));

    // Safe path polyline (blue / green)
    const polyline = new (window as any).google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.85,
      strokeWeight: 5,
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, points]);

  return null;
}

// Auto-pan map component
function AutoCenter({ center, isTracking }: { center: { lat: number; lng: number }; isTracking: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (map && center && center.lat && center.lng) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng]);

  return null;
}

export const DrivingMap: React.FC<DrivingMapProps> = ({
  apiKey,
  currentLocation,
  heading = 0,
  currentSpeedMph,
  currentSpeedLimitMph,
  telemetryHistory,
  violations,
  brakingEvents,
  selectedEvent,
  onSelectEvent,
}) => {
  const [activeMarkerInfo, setActiveMarkerInfo] = useState<any | null>(null);

  const isViolating = currentSpeedMph > currentSpeedLimitMph * 1.1;

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          defaultCenter={currentLocation}
          defaultZoom={16}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
        >
          <AutoCenter center={currentLocation} isTracking={true} />
          <PolylinePath points={telemetryHistory} />

          {/* Current Vehicle Marker */}
          <AdvancedMarker position={currentLocation} title="Current Vehicle Location">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                  isViolating
                    ? 'bg-rose-600 text-white ring-4 ring-rose-400/60 animate-pulse'
                    : 'bg-blue-600 text-white ring-4 ring-blue-400/50'
                }`}
                style={{ transform: `rotate(${heading || 0}deg)` }}
              >
                <Navigation className="w-6 h-6 fill-current" />
              </div>
              <div className="absolute -top-7 bg-slate-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-700 shadow whitespace-nowrap">
                {Math.round(currentSpeedMph)} mph
              </div>
            </div>
          </AdvancedMarker>

          {/* Speed Violations Markers (> +10%) */}
          {violations.map((violation) => (
            <AdvancedMarker
              key={violation.id}
              position={{ lat: violation.lat, lng: violation.lng }}
              onClick={() => {
                setActiveMarkerInfo({ type: 'violation', data: violation });
                if (onSelectEvent) onSelectEvent(violation);
              }}
            >
              <div className="cursor-pointer group flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white transform group-hover:scale-110 transition">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="mt-1 bg-rose-950/90 text-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-500/40 shadow whitespace-nowrap">
                  +{violation.pctOverLimit.toFixed(0)}% Over
                </div>
              </div>
            </AdvancedMarker>
          ))}

          {/* Signal & Intersection Braking Assessment Markers */}
          {brakingEvents.map((brake) => {
            const isHarsh = brake.smoothnessScore < 60;
            const isSilky = brake.smoothnessScore >= 90;

            return (
              <AdvancedMarker
                key={brake.id}
                position={{ lat: brake.lat, lng: brake.lng }}
                onClick={() => {
                  setActiveMarkerInfo({ type: 'brake', data: brake });
                  if (onSelectEvent) onSelectEvent(brake);
                }}
              >
                <div className="cursor-pointer group flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white transform group-hover:scale-110 transition ${
                      isSilky
                        ? 'bg-emerald-600'
                        : isHarsh
                        ? 'bg-amber-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    <TrafficCone className="w-3.5 h-3.5" />
                  </div>
                  <div
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap ${
                      isSilky
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30'
                        : isHarsh
                        ? 'bg-amber-950/90 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-950/90 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    Brake {brake.smoothnessScore}pts
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>

      {/* Floating Marker Details Card if clicked */}
      {activeMarkerInfo && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 text-white shadow-2xl z-20">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {activeMarkerInfo.type === 'violation' ? (
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <TrafficCone className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {activeMarkerInfo.type === 'violation'
                    ? 'Speed Limit Violation (+10% Threshold Exceeded)'
                    : 'Signal / Intersection Braking Assessment'}
                </h4>
                <p className="text-xs text-slate-400">
                  {activeMarkerInfo.type === 'violation'
                    ? activeMarkerInfo.data.placeName
                    : activeMarkerInfo.data.intersectionName || activeMarkerInfo.data.locationName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMarkerInfo(null)}
              className="text-slate-400 hover:text-white text-sm px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-1.5">
            {activeMarkerInfo.type === 'violation' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recorded Speed:</span>
                  <span className="font-bold text-rose-400">{activeMarkerInfo.data.speedMph} mph</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Posted Speed Limit:</span>
                  <span className="font-medium text-white">{activeMarkerInfo.data.speedLimitMph} mph</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Over Limit:</span>
                  <span className="font-bold text-rose-400">
                    +{activeMarkerInfo.data.pctOverLimit.toFixed(1)}% ({activeMarkerInfo.data.speedMph - activeMarkerInfo.data.speedLimitMph} mph over)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Speeding Duration:</span>
                  <span className="text-white">{activeMarkerInfo.data.durationSec} seconds</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Smoothness Rating:</span>
                  <span
                    className={`font-bold ${
                      activeMarkerInfo.data.smoothnessScore >= 80
                        ? 'text-emerald-400'
                        : activeMarkerInfo.data.smoothnessScore >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {activeMarkerInfo.data.rating} ({activeMarkerInfo.data.smoothnessScore}/100)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peak Deceleration G:</span>
                  <span className="text-white font-mono">{activeMarkerInfo.data.peakDecelG.toFixed(2)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peak Jerk:</span>
                  <span className="text-white font-mono">{activeMarkerInfo.data.peakJerk.toFixed(2)} m/s³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stopping Distance:</span>
                  <span className="text-white">{activeMarkerInfo.data.stoppingDistanceFeet} ft</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-300 italic bg-slate-800/80 p-2 rounded">
                  "{activeMarkerInfo.data.notes}"
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 rounded-xl px-3 py-2 text-[11px] text-slate-300 shadow-lg space-y-1.5 hidden sm:block pointer-events-none">
        <div className="font-bold text-white text-xs mb-1">Live Map Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          <span>Driven Route Track</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>Speed Violation (&gt; +10% over limit)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Smooth Signal Brake</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Harsh / Abrupt Signal Brake</span>
        </div>
      </div>
    </div>
  );
};
