import React from 'react';
import { PRESET_ROUTES, PresetRoute } from '../services/simulator';
import { Play, Pause, RotateCcw, FastForward, Car, Compass, Zap, TrafficCone } from 'lucide-react';

interface DriveSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoute: PresetRoute;
  onSelectRoute: (route: PresetRoute) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  onManualAction: (action: 'speed_up' | 'smooth_brake' | 'harsh_brake' | 'swerve') => void;
}

export const DriveSimulatorModal: React.FC<DriveSimulatorModalProps> = ({
  isOpen,
  onClose,
  selectedRoute,
  onSelectRoute,
  isRunning,
  onTogglePlay,
  simSpeed,
  onChangeSimSpeed,
  onManualAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Test Drive Route Simulator</h3>
              <p className="text-xs text-slate-400">
                Simulate teen driving routes, Google Roads speed limits & signal braking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Route Preset Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Test Drive Scenario
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {PRESET_ROUTES.map((route) => {
              const isSelected = selectedRoute.id === route.id;
              return (
                <button
                  key={route.id}
                  onClick={() => onSelectRoute(route)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{route.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {route.waypoints.length} Waypoints
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{route.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback Controls & Simulation Speed */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Simulation Controls</span>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400 mr-1">Speed:</span>
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSimSpeed(spd)}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                    simSpeed === spd
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onTogglePlay}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause Driving Simulation' : 'Run Driving Simulation'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Manual Pedals & Driver Actions */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Manual Driver Pedal & Steering Triggers
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onManualAction('speed_up')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold text-center transition"
            >
              🚀 Accelerate (+10% Creep)
            </button>

            <button
              onClick={() => onManualAction('smooth_brake')}
              className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center transition"
            >
              🟢 Smooth Feather Brake
            </button>

            <button
              onClick={() => onManualAction('harsh_brake')}
              className="p-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-bold text-center transition"
            >
              🛑 Harsh Stomp Brake
            </button>

            <button
              onClick={() => onManualAction('swerve')}
              className="p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-bold text-center transition"
            >
              ⚡ Sharp Swerve / Jerk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
