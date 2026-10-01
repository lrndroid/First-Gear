import React from 'react';
import { SensorReading, GPSReading } from '../types/driving';
import { Activity, Compass, Navigation, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

interface SensorsPanelProps {
  sensorReading: SensorReading | null;
  gpsReading: GPSReading | null;
  onRequestPermissions: () => void;
  onClose: () => void;
}

export const SensorsPanel: React.FC<SensorsPanelProps> = ({
  sensorReading,
  gpsReading,
  onRequestPermissions,
  onClose,
}) => {
  // Lateral & longitudinal Gs for bubble display
  const lateralG = sensorReading?.lateralG || 0;
  const brakingG = sensorReading?.brakingForceG || 0;

  // Max 0.8g display clamp
  const bubbleX = Math.max(-45, Math.min(45, (sensorReading?.accel.x || 0) * 10));
  const bubbleY = Math.max(-45, Math.min(45, (sensorReading?.accel.y || 0) * 10));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Live Hardware Sensor Diagnostics</h3>
              <p className="text-xs text-slate-400">
                GPS receiver, 3-axis accelerometer, gyroscope & jerk calculations
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

        {/* Permission Request for iOS / Mobile */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-300">
            <strong>Motion Sensors:</strong> Accelerometer & Gyroscope events
          </div>
          <button
            onClick={onRequestPermissions}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
          >
            Enable Device Motion
          </button>
        </div>

        {/* 2D G-Force Bubble Meter & Jerk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
            <div className="text-xs font-bold uppercase text-slate-400 mb-2">2D Accelerometer G-Bubble</div>
            <div className="relative w-36 h-36 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
              {/* Concentric rings */}
              <div className="absolute w-24 h-24 rounded-full border border-slate-800" />
              <div className="absolute w-12 h-12 rounded-full border border-slate-800" />
              <div className="absolute w-full h-[1px] bg-slate-800" />
              <div className="absolute h-full w-[1px] bg-slate-800" />

              {/* Dynamic Bubble */}
              <div
                className="w-5 h-5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 transition-all duration-75"
                style={{ transform: `translate(${bubbleX}px, ${bubbleY}px)` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-slate-500 font-mono text-center">
              Longitudinal: {brakingG.toFixed(2)}g • Lateral: {lateralG.toFixed(2)}g
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400">Rate of Change (Jerk)</div>
            <div className="text-3xl font-black font-mono text-cyan-400">
              {(sensorReading?.jerk || 0).toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">m/s³</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Jerk measures the immediate shock or pedal stab velocity: Δa / Δt. Smooth drivers keep jerk below 0.4 m/s³.
            </p>

            <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Accel X (Lateral):</span>
                <span>{(sensorReading?.accel.x || 0).toFixed(3)} m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Accel Y (Longitudinal):</span>
                <span>{(sensorReading?.accel.y || 0).toFixed(3)} m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Accel Z (Vertical):</span>
                <span>{(sensorReading?.accel.z || 0).toFixed(3)} m/s²</span>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Receiver Diagnostics */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase text-slate-400 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>GPS Receiver & Fused Location</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              Accuracy: ±{(gpsReading?.accuracy || 5).toFixed(1)}m
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px] font-sans">Latitude</div>
              <div className="text-white">{(gpsReading?.lat || 37.3688).toFixed(5)}°</div>
            </div>

            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px] font-sans">Longitude</div>
              <div className="text-white">{(gpsReading?.lng || -122.0363).toFixed(5)}°</div>
            </div>

            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px] font-sans">GPS Speed</div>
              <div className="text-white">{(gpsReading?.speedMph || 0).toFixed(1)} mph</div>
            </div>

            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px] font-sans">Heading</div>
              <div className="text-white">{(gpsReading?.heading || 0).toFixed(0)}°</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
