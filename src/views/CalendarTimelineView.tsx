import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Crown,
} from 'lucide-react';
import { Activity, Stop, Trip, ViewType } from '../types';
import { calculateDateDifferenceDays, formatSingleDate, formatTripDates, getActivityCategoryBadge } from '../utils/tripHelpers';

interface CalendarTimelineViewProps {
  trip: Trip | null;
  onNavigate: (view: ViewType) => void;
  onReorderActivity: (
    tripId: string,
    stopId: string,
    actIndex: number,
    direction: 'up' | 'down'
  ) => void;
  onRemoveActivity: (tripId: string, stopId: string, activityId: string) => void;
}

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  trip,
  onNavigate,
  onReorderActivity,
  onRemoveActivity,
}) => {
  const [expandedDays, setExpandedDays] = useState<{ [dayKey: string]: boolean }>({});

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 text-white">
        <h2 className="text-xl font-serif font-bold text-white">No voyage selected for timeline review</h2>
        <button
          onClick={() => onNavigate('my-trips')}
          className="gold-btn px-5 py-2.5 text-xs"
        >
          Select a Voyage
        </button>
      </div>
    );
  }

  const totalDays = calculateDateDifferenceDays(trip.startDate, trip.endDate);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="palace-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              Timeline & Day Planner
            </span>
            <span className="text-xs text-[#b89f7a]">•</span>
            <span className="text-xs text-[#d6cbbe] font-medium">{totalDays} Days Royal Voyage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {trip.name}
          </h1>
          <p className="text-xs text-[#b89f7a] font-light">{formatTripDates(trip.startDate, trip.endDate)}</p>
        </div>

        <button
          onClick={() => onNavigate('itinerary-builder')}
          className="gold-btn px-5 py-2.5 text-xs shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Open Builder</span>
        </button>
      </div>

      {/* Timeline Stops & Days */}
      <div className="space-y-8">
        {trip.stops.length === 0 ? (
          <div className="palace-card rounded-3xl p-12 text-center border border-dashed border-[#c5a880]/20">
            <p className="text-[#d6cbbe] text-sm font-light">No stops created yet.</p>
          </div>
        ) : (
          trip.stops.map((stop, sIdx) => {
            const stopNights = calculateDateDifferenceDays(stop.startDate, stop.endDate);

            return (
              <div key={stop.id} className="space-y-4">
                {/* Stop City Ribbon */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#17130f] via-[#1f1913] to-[#17130f] border border-[#c5a880]/25 text-white p-4 rounded-2xl shadow-md">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8c734b] to-[#dfbe88] text-[#0e0b08] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    {sIdx + 1}
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold leading-tight text-white">
                      {stop.cityName}, {stop.country}
                    </h2>
                    <p className="text-[11px] text-[#dfbe88] font-medium">
                      {formatTripDates(stop.startDate, stop.endDate)} ({stopNights} Nights)
                    </p>
                  </div>
                </div>

                {/* Day Cards for this stop */}
                <div className="space-y-3 pl-4 border-l-2 border-[#dfbe88]/40 ml-4">
                  {stop.activities.length === 0 ? (
                    <div className="p-4 palace-card rounded-2xl border border-dashed border-[#c5a880]/20 text-xs text-[#b89f7a]">
                      No experiences scheduled for {stop.cityName}.
                    </div>
                  ) : (
                    stop.activities.map((act, actIdx) => {
                      const badge = getActivityCategoryBadge(act.type);

                      return (
                        <div
                          key={act.id}
                          className="palace-card rounded-2xl p-4 shadow-md hover:border-[#dfbe88]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={act.image}
                              alt={act.name}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#c5a880]/30 shadow-md"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                                >
                                  {act.type}
                                </span>
                                {act.timeOfDay && (
                                  <span className="text-[10px] font-bold bg-[#17130f] text-[#dfbe88] border border-[#c5a880]/20 px-2 py-0.5 rounded-md">
                                    {act.timeOfDay}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs sm:text-sm font-serif font-bold text-white">
                                {act.name}
                              </h4>
                              <p className="text-xs text-[#d6cbbe] line-clamp-1 font-light">{act.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#c5a880]/15 shrink-0">
                            <div className="text-right">
                              <span className="text-sm font-serif font-bold text-[#dfbe88]">${act.cost}</span>
                              <span className="text-[11px] text-[#b89f7a] block">{act.durationHours} hrs</span>
                            </div>

                            {/* Reorder in Day */}
                            <div className="flex items-center bg-[#100d0a] border border-[#c5a880]/25 rounded-lg p-0.5">
                              <button
                                onClick={() => onReorderActivity(trip.id, stop.id, actIdx, 'up')}
                                disabled={actIdx === 0}
                                className="p-1 text-[#b89f7a] hover:text-[#dfbe88] disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onReorderActivity(trip.id, stop.id, actIdx, 'down')}
                                disabled={actIdx === stop.activities.length - 1}
                                className="p-1 text-[#b89f7a] hover:text-[#dfbe88] disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveActivity(trip.id, stop.id, act.id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
