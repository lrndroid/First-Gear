import React from 'react';
import { ShieldCheck, Car, Play, Square, Activity, Compass } from 'lucide-react';

interface HeaderProps {
  isTracking: boolean;
  isSimulating: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onOpenSimulator: () => void;
  onOpenSensors: () => void;
  driverName: string;
  onDriverChange: (name: string) => void;
  activeTripMiles: number;
  activeTripDurationSec: number;
}

export const Header: React.FC<HeaderProps> = ({
  isTracking,
  isSimulating,
  onStartTracking,
  onStopTracking,
  onOpenSimulator,
  onOpenSensors,
  driverName,
  onDriverChange,
  activeTripMiles,
  activeTripDurationSec,
}) => {
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">TeenDrive Guard</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Google Roads API
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Speed Limit Compliance & Braking Smoothness Telemetry
            </p>
          </div>
        </div>

        {/* Driver Selection & Live Status Controls */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Car className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-slate-400 mr-2">Driver:</span>
            <select
              value={driverName}
              onChange={(e) => onDriverChange(e.target.value)}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="Alex Parker (17 yrs)" className="bg-slate-800 text-white">Alex Parker (17 yrs)</option>
              <option value="Emma Davis (16 yrs)" className="bg-slate-800 text-white">Emma Davis (16 yrs)</option>
              <option value="Jordan Lee (18 yrs)" className="bg-slate-800 text-white">Jordan Lee (18 yrs)</option>
            </select>
          </div>

          {/* Active Trip Live Stats Banner if running */}
          {(isTracking || isSimulating) && (
            <div className="flex items-center space-x-3 bg-blue-950/60 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-slate-400">Tracking: </span>
                <span className="font-bold text-blue-300">{activeTripMiles.toFixed(1)} mi</span>
                <span className="text-slate-500 mx-1.5">•</span>
                <span className="font-medium text-white">{formatDuration(activeTripDurationSec)}</span>
              </div>
            </div>
          )}

          {/* Sensor Diagnostics Button */}
          <button
            onClick={onOpenSensors}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition font-medium"
            title="View accelerometer, gyroscope & GPS status"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sensors</span>
          </button>

          {/* Test Drive Simulator Toggle */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs transition font-medium"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSimulating ? 'Simulator Active' : 'Test Drive Simulator'}</span>
          </button>

          {/* Start / Stop Tracking Drive */}
          {isTracking || isSimulating ? (
            <button
              onClick={onStopTracking}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>End & Analyze Trip</span>
            </button>
          ) : (
            <button
              onClick={onStartTracking}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Drive Tracking</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
