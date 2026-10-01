import React from 'react';
import { AlertTriangle, ShieldCheck, Gauge, Zap, Flame, CheckCircle2, TrafficCone, Compass } from 'lucide-react';
import { TelemetryPoint } from '../types/driving';

interface LiveDrivingHUDProps {
  currentSpeedMph: number;
  speedLimitMph: number;
  speedLimitSource: 'roads_api' | 'inferred' | 'osm';
  currentRoadName: string;
  brakingForceG: number;
  jerk: number;
  distanceMiles: number;
  durationSeconds: number;
  violationCount: number;
  smoothnessScore: number;
  approachingSignal?: { name: string; distanceFeet: number } | null;
}

export const LiveDrivingHUD: React.FC<LiveDrivingHUDProps> = ({
  currentSpeedMph,
  speedLimitMph,
  speedLimitSource,
  currentRoadName,
  brakingForceG,
  jerk,
  distanceMiles,
  durationSeconds,
  violationCount,
  smoothnessScore,
  approachingSignal,
}) => {
  const speed = Math.round(currentSpeedMph);
  const limit = Math.round(speedLimitMph);
  const delta = speed - limit;
  const violationThreshold = limit * 1.1; // +10% rule
  const isViolating = speed > violationThreshold;
  const isCaution = speed > limit && speed <= violationThreshold;
  const pctOver = limit > 0 ? ((speed - limit) / limit) * 100 : 0;

  // Format trip duration
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  // Deceleration meter percentage (0 to 0.7g max scale)
  const decelPercent = Math.min(100, Math.round((brakingForceG / 0.6) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-5">
      {/* Approaching Signal Warning Banner if active */}
      {approachingSignal && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-amber-200 animate-pulse">
          <div className="flex items-center space-x-2.5">
            <TrafficCone className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-amber-300">
                Approaching Intersection / Traffic Signal
              </div>
              <div className="text-xs text-white font-medium">{approachingSignal.name}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-amber-300">~{approachingSignal.distanceFeet} ft</span>
            <div className="text-[10px] text-amber-400/80">Begin gentle brake release</div>
          </div>
        </div>
      )}

      {/* Speedometer & Speed Limit Comparison Block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Real-time Vehicle Speed */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center relative overflow-hidden">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>Vehicle Speed</span>
          </div>

          <div className="flex items-baseline space-x-1">
            <span
              className={`text-6xl font-black tracking-tight font-mono transition-colors duration-200 ${
                isViolating
                  ? 'text-rose-500 animate-pulse'
                  : isCaution
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {speed}
            </span>
            <span className="text-sm font-semibold text-slate-400">MPH</span>
          </div>

          {/* Current Road Name */}
          <div className="mt-2 text-xs text-slate-300 truncate max-w-full px-2 font-medium">
            📍 {currentRoadName || 'Active GPS Route'}
          </div>

          {/* Speed Status Badge */}
          <div className="mt-3">
            {isViolating ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Violation: +{pctOver.toFixed(0)}% Over Limit</span>
              </span>
            ) : isCaution ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span>Near Limit (+{delta} mph)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Within Speed Limit ({delta <= 0 ? `${Math.abs(delta)} mph below` : 'optimal'})</span>
              </span>
            )}
          </div>
        </div>

        {/* MUTCD-style Posted Speed Limit Sign */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-3">
          <div className="w-28 bg-white text-slate-900 border-4 border-slate-900 rounded-lg p-2 text-center shadow-xl transform hover:scale-105 transition">
            <div className="text-[10px] font-black uppercase tracking-widest leading-tight border-b-2 border-slate-900 pb-1">
              SPEED<br />LIMIT
            </div>
            <div className="text-4xl font-black font-mono my-0.5 leading-none">
              {limit}
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-1 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>{speedLimitSource === 'roads_api' ? 'Google Roads API' : 'Road Classification'}</span>
          </div>
        </div>

        {/* Braking Smoothness & Jerk Real-time Gauge */}
        <div className="md:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Braking Force & G-Meter</span>
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300">
              {brakingForceG.toFixed(2)} g
            </span>
          </div>

          {/* G-Force Deceleration Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                brakingForceG > 0.45
                  ? 'bg-rose-500'
                  : brakingForceG > 0.28
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${decelPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.0g (Coast)</span>
            <span>0.25g (Smooth)</span>
            <span>0.50g+ (Harsh)</span>
          </div>

          {/* Instantaneous Jerk */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Instant Jerk (da/dt):</span>
            <span
              className={`font-mono font-bold ${
                jerk > 0.9 ? 'text-rose-400' : jerk > 0.4 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {jerk.toFixed(2)} m/s³ {jerk > 0.8 && '⚠️ Jerky'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Trip Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
          <div className="text-[11px] text-slate-400">Distance Traveled</div>
          <div className="text-lg font-bold text-white font-mono">{distanceMiles.toFixed(2)} mi</div>
        </div>

        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
          <div className="text-[11px] text-slate-400">Trip Duration</div>
          <div className="text-lg font-bold text-white font-mono">{formattedDuration}</div>
        </div>

        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
          <div className="text-[11px] text-slate-400">&gt;+10% Speed Violations</div>
          <div
            className={`text-lg font-bold font-mono ${
              violationCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {violationCount}
          </div>
        </div>

        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
          <div className="text-[11px] text-slate-400">Smoothness Index</div>
          <div
            className={`text-lg font-bold font-mono ${
              smoothnessScore >= 85
                ? 'text-emerald-400'
                : smoothnessScore >= 70
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {smoothnessScore}/100
          </div>
        </div>
      </div>
    </div>
  );
};
