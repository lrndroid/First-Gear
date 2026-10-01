import React from 'react';
import { Trip } from '../types/driving';
import { MapPin, Clock, AlertTriangle, Zap, Calendar, Trash2, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TripHistoryListProps {
  trips: Trip[];
  activeTripId?: string;
  selectedTripId?: string;
  onSelectTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const TripHistoryList: React.FC<TripHistoryListProps> = ({
  trips,
  activeTripId,
  selectedTripId,
  onSelectTrip,
  onDeleteTrip,
}) => {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-base text-white">Trip History & Automatic Travel Logs</h3>
          <p className="text-xs text-slate-400">
            Recorded drives with Google Roads speed limits, signal braking, and jerk analysis
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'}
        </span>
      </div>

      {trips.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          No driving trips recorded yet. Start tracking or run the Test Drive Simulator!
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const isSelected = selectedTripId === trip.id;
            const isActive = activeTripId === trip.id;
            const violationsCount = trip.speedViolations.length;

            return (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isActive
                    ? 'bg-blue-950/40 border-blue-500/50 ring-2 ring-blue-500/20'
                    : isSelected
                    ? 'bg-slate-800/90 border-indigo-500/50 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                {/* Left: Date, Driver, Start/End Locations */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="flex items-center text-slate-400">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {formatDate(trip.startTime)} at {formatTime(trip.startTime)}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-semibold text-blue-300">{trip.driverName}</span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                        Active Trip
                      </span>
                    )}
                  </div>

                  {/* Start and End Locations */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-400 font-medium">From:</span>
                      <span className="font-medium truncate max-w-md">
                        {trip.startLocation.name || trip.startLocation.address || 'Start Point'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span className="text-slate-400 font-medium">To:</span>
                      <span className="font-medium truncate max-w-md">
                        {trip.endLocation?.name || trip.endLocation?.address || 'Current In-Progress Destination'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Miles & Duration */}
                <div className="flex items-center space-x-6 text-xs font-mono">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-sans">Distance</div>
                    <div className="text-base font-black text-white">{trip.distanceMiles.toFixed(1)} mi</div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-sans">Duration</div>
                    <div className="text-base font-black text-white">{formatDuration(trip.durationSeconds)}</div>
                  </div>
                </div>

                {/* Right: Part 1 & Part 2 Badges */}
                <div className="flex items-center space-x-3">
                  {/* Part 1 Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-center ${
                      violationsCount === 0
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold">Speed &gt; +10%</div>
                    <div className="text-xs font-mono font-bold">
                      {violationsCount === 0 ? '0 Violations' : `${violationsCount} Violations`}
                    </div>
                  </div>

                  {/* Part 2 Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-center ${
                      trip.overallSmoothnessScore >= 85
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : trip.overallSmoothnessScore >= 70
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold">Smoothness</div>
                    <div className="text-xs font-mono font-bold">
                      {trip.overallSmoothnessScore}/100
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTrip(trip.id);
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Delete trip from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
