import React, { useState } from 'react';
import { Trip, SpeedViolation, BrakingEvent, JerkIncident, TelemetryPoint } from '../types/driving';
import {
  AlertTriangle,
  ShieldCheck,
  Zap,
  TrafficCone,
  Award,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface AnalysisViewProps {
  trip: Trip;
  onClose?: () => void;
  onSelectEventOnMap?: (event: BrakingEvent | SpeedViolation) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  trip,
  onClose,
  onSelectEventOnMap,
}) => {
  const [activeTab, setActiveTab] = useState<'part1' | 'part2' | 'telemetry'>('part1');

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Calculations for Part 1
  const violationCount = trip.speedViolations.length;
  const maxOver = trip.speedViolations.reduce(
    (max, v) => (v.pctOverLimit > max ? v.pctOverLimit : max),
    0
  );

  // Calculations for Part 2
  const signalBrakes = trip.brakingEvents.filter((b) => b.isSignalOrIntersection);
  const smoothStopsCount = signalBrakes.filter((b) => b.smoothnessScore >= 80).length;
  const hardStopsCount = signalBrakes.filter((b) => b.smoothnessScore < 60).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white space-y-6">
      {/* Trip Header & Overview Card */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Trip Telemetry Analysis
            </span>
            <span className="text-xs text-slate-400">
              {formatDate(trip.startTime)} at {formatTime(trip.startTime)}
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mt-1">
            {trip.driverName} — {trip.vehicle}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Start: {trip.startLocation.name || trip.startLocation.address || 'Start Location'}</span>
            </div>
            {trip.endLocation && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>End: {trip.endLocation.name || trip.endLocation.address || 'Destination'}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Duration: {formatDuration(trip.durationSeconds)} ({trip.distanceMiles.toFixed(1)} miles)</span>
            </div>
          </div>
        </div>

        {/* Composite Safety Score Badge */}
        <div className="flex items-center space-x-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Overall Safety Score</div>
            <div className="text-xs font-semibold text-slate-300">{trip.comfortRating}</div>
          </div>
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl font-mono shadow-inner ${
              trip.overallSafetyScore >= 88
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : trip.overallSafetyScore >= 75
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {trip.overallSafetyScore}
          </div>
        </div>
      </div>

      {/* Two-Part Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('part1')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'part1'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Part 1: Speed Limit vs Violations (&gt; +10%)</span>
          {violationCount > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white font-mono">
              {violationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('part2')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'part2'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Part 2: Driving Experience, Smoothness & Jerks</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-500/30 text-indigo-300 font-mono">
            {trip.overallSmoothnessScore}/100
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* PART 1: Speed Limit vs Violations over +10% */}
      {activeTab === 'part1' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="text-xs text-slate-400 uppercase font-bold">Speed Compliance</div>
              <div
                className={`text-3xl font-black font-mono mt-1 ${
                  trip.speedComplianceScore >= 90
                    ? 'text-emerald-400'
                    : trip.speedComplianceScore >= 75
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {trip.speedComplianceScore}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Trip distance within +10% safety margin
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="text-xs text-slate-400 uppercase font-bold">&gt; +10% Violations</div>
              <div
                className={`text-3xl font-black font-mono mt-1 ${
                  violationCount === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {violationCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Road segments exceeding threshold
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="text-xs text-slate-400 uppercase font-bold">Max Speed Recorded</div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {Math.round(trip.maxSpeedMph)} <span className="text-sm font-normal text-slate-400">MPH</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Trip average: {trip.avgSpeedMph.toFixed(1)} mph
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="text-xs text-slate-400 uppercase font-bold">Max % Over Limit</div>
              <div
                className={`text-3xl font-black font-mono mt-1 ${
                  maxOver > 20 ? 'text-rose-400' : maxOver > 10 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {maxOver > 0 ? `+${maxOver.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Time spent speeding: {trip.totalSpeedingDurationSec}s
              </div>
            </div>
          </div>

          {/* Location Violations Table */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Speed Limit Violations by Location (+10% Threshold)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Flags any driving where vehicle speed exceeded the posted Google Roads API limit by more than 10%
                </p>
              </div>
            </div>

            {trip.speedViolations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="font-bold text-white text-base">Perfect Speed Compliance!</div>
                <p className="text-xs max-w-md mx-auto text-slate-400">
                  Alex maintained speed within the posted legal limits and +10% tolerance across all road segments.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Place / Road Segment</th>
                      <th className="py-3 px-4">Speed vs Limit</th>
                      <th className="py-3 px-4">% Over Limit</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {trip.speedViolations.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-900/60 transition cursor-pointer"
                        onClick={() => onSelectEventOnMap && onSelectEventOnMap(v)}
                      >
                        <td className="py-3 px-4 font-sans font-medium text-white flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span>{v.placeName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-rose-400">{v.speedMph} mph</span>
                          <span className="text-slate-400 font-sans"> in </span>
                          <span className="text-slate-200 font-bold">{v.speedLimitMph} mph zone</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-400">
                          +{v.pctOverLimit.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans">
                          {v.durationSec}s
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              v.severity === 'excessive'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : v.severity === 'moderate'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            }`}
                          >
                            {v.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 font-sans">
                          {formatTime(v.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PART 2: Driving Experience: Smoothness, Jerks & Signal Braking */}
      {activeTab === 'part2' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="text-xs text-slate-400 uppercase font-bold">Signal Braking Smoothness</div>
              <div
                className={`text-3xl font-black font-mono mt-1 ${
                  trip.signalBrakingScore >= 85
                    ? 'text-emerald-400'
                    : trip.signalBrakingScore >= 70
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {trip.signalBrakingScore}/100
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {smoothStopsCount} smooth stops, {hardStopsCount} abrupt/harsh stops
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="text-xs text-slate-400 uppercase font-bold">Ride Smoothness Index</div>
              <div
                className={`text-3xl font-black font-mono mt-1 ${
                  trip.overallSmoothnessScore >= 85
                    ? 'text-emerald-400'
                    : trip.overallSmoothnessScore >= 70
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {trip.overallSmoothnessScore}/100
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Jerk dynamics: {trip.jerkIncidents.length} sudden jolts detected
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="text-xs text-slate-400 uppercase font-bold">Comfort Rating</div>
              <div className="text-2xl font-black text-indigo-300 mt-1 truncate">
                {trip.comfortRating}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Based on passenger g-forces & deceleration curves
              </div>
            </div>
          </div>

          {/* Signal & Intersection Braking Assessment */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center space-x-2">
                  <TrafficCone className="w-4 h-4 text-indigo-400" />
                  <span>Braking Smoothness Assessment at Signals & Intersections</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analyzes pedal deceleration ramp, peak negative G-force, and stop line jerk force
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              {trip.brakingEvents.map((brake) => {
                const isSilky = brake.smoothnessScore >= 85;
                const isControlled = brake.smoothnessScore >= 70 && brake.smoothnessScore < 85;
                const isHarsh = brake.smoothnessScore < 70;

                return (
                  <div
                    key={brake.id}
                    className="p-4 hover:bg-slate-900/60 transition cursor-pointer"
                    onClick={() => onSelectEventOnMap && onSelectEventOnMap(brake)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <TrafficCone
                            className={`w-4 h-4 ${
                              isSilky
                                ? 'text-emerald-400'
                                : isControlled
                                ? 'text-blue-400'
                                : 'text-amber-400'
                            }`}
                          />
                          <span className="font-bold text-sm text-white">
                            {brake.intersectionName || brake.locationName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isSilky
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isControlled
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {brake.rating} ({brake.smoothnessScore}/100)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 italic">
                          "{brake.notes}"
                        </p>
                      </div>

                      {/* Telemetry Numbers */}
                      <div className="flex items-center space-x-4 text-xs font-mono">
                        <div className="text-right">
                          <div className="text-slate-500 text-[10px]">Peak Decel G</div>
                          <div className="font-bold text-white">{brake.peakDecelG.toFixed(2)} g</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-500 text-[10px]">Peak Jerk</div>
                          <div className="font-bold text-white">{brake.peakJerk.toFixed(2)} m/s³</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-500 text-[10px]">Distance & Time</div>
                          <div className="text-slate-300">
                            {brake.stoppingDistanceFeet} ft / {brake.durationSeconds.toFixed(1)}s
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jerk & G-Force Incident Log */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Jerk Dynamics & G-Force Sudden Spikes</span>
            </h3>

            {trip.jerkIncidents.length === 0 ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>No abrupt jerk incidents or aggressive swerves detected during this trip.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {trip.jerkIncidents.map((j) => (
                  <div
                    key={j.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div>
                        <div className="font-bold text-slate-200">{j.description}</div>
                        <div className="text-[11px] text-slate-400">Location: {j.locationName}</div>
                      </div>
                    </div>
                    <div className="font-mono text-right">
                      <div className="text-amber-400 font-bold">{j.magnitude.toFixed(2)} m/s³</div>
                      <div className="text-[10px] text-slate-500">G-force: {j.gForce.toFixed(2)}g</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Teen Driver Coaching Recommendations */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 text-xs space-y-2">
              <div className="font-bold text-blue-300 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Teen Driving Coach Feedback & Recommendations</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {hardStopsCount > 0 && (
                  <li>
                    <strong>Signal Anticipation:</strong> Try looking 1-2 blocks ahead for stale green lights. Begin easing off the accelerator before hitting the brakes to eliminate the final stop jolt.
                  </li>
                )}
                {violationCount > 0 && (
                  <li>
                    <strong>Speed Limits:</strong> Watch for speed limit drops near school zones (20 mph) and arterial transitions. Speed crept up to +{maxOver.toFixed(0)}% over the limit.
                  </li>
                )}
                {smoothStopsCount > 0 && (
                  <li>
                    <strong>Great Brake Feathering:</strong> Excellent smooth stops executed at {smoothStopsCount} intersections with gradual pressure release!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
