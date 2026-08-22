import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  List,
  CalendarDays,
  Printer,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Eye,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import { Trip, ViewType } from '../types';
import {
  calculateDateDifferenceDays,
  calculateTripFinancials,
  formatSingleDate,
  formatTripDates,
  getActivityCategoryBadge,
} from '../utils/tripHelpers';

interface ItineraryViewProps {
  trip: Trip | null;
  onNavigate: (view: ViewType) => void;
  onSelectTrip: (tripId: string) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ trip, onNavigate }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 text-white">
        <h2 className="text-xl font-serif font-bold text-white">No voyage selected to view</h2>
        <button
          onClick={() => onNavigate('my-trips')}
          className="gold-btn px-5 py-2.5 text-xs"
        >
          Select a Voyage
        </button>
      </div>
    );
  }

  const financials = calculateTripFinancials(trip);
  const totalDays = calculateDateDifferenceDays(trip.startDate, trip.endDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-white print:p-0 print:m-0">
      {/* Top Action Header */}
      <div className="palace-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:border-none print:shadow-none print:p-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              Complete Structured Voyage
            </span>
            <span className="text-xs text-[#b89f7a]">•</span>
            <span className="text-xs text-[#d6cbbe] font-medium">{totalDays} Days Planned</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            {trip.name}
          </h1>
          <p className="text-xs text-[#b89f7a] flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#dfbe88]" />
            <span>{formatTripDates(trip.startDate, trip.endDate)}</span>
            <span>•</span>
            <span className="font-serif font-bold text-[#dfbe88]">
              Est. Total Spend: ${financials.totalCost.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Action buttons & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 print:hidden shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#17130f] border border-[#c5a880]/25 p-1 rounded-xl">
            <button
              id="itinerary-view-mode-list"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'list' ? 'bg-[#dfbe88] text-[#14100b]' : 'text-[#b89f7a] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              id="itinerary-view-mode-calendar"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'calendar' ? 'bg-[#dfbe88] text-[#14100b]' : 'text-[#b89f7a] hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar View
            </button>
          </div>

          <button
            id="print-itinerary-btn"
            onClick={handlePrint}
            className="gold-outline-btn p-2.5 text-xs cursor-pointer"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            id="itinerary-to-builder-btn"
            onClick={() => onNavigate('itinerary-builder')}
            className="gold-btn px-4 py-2 text-xs shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit in Builder</span>
          </button>
        </div>
      </div>

      {/* Itinerary Contents */}
      {trip.stops.length === 0 ? (
        <div className="palace-card rounded-3xl p-12 text-center border border-dashed border-[#c5a880]/20 space-y-3">
          <p className="text-[#d6cbbe] text-sm font-light">This itinerary does not have any stops yet.</p>
          <button
            onClick={() => onNavigate('itinerary-builder')}
            className="gold-btn px-5 py-2.5 text-xs"
          >
            Open Itinerary Builder
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* DAY-BY-DAY / CITY GROUPED LIST VIEW */
        <div className="space-y-6">
          {trip.stops.map((stop, stopIdx) => {
            const stopNights = calculateDateDifferenceDays(stop.startDate, stop.endDate);
            const stopActivitiesCost = stop.activities.reduce((s, a) => s + (a.cost || 0), 0);

            return (
              <div
                key={stop.id}
                className="palace-card rounded-3xl overflow-hidden shadow-lg print:border-[#c5a880]/30 print:shadow-none"
              >
                {/* City Stop Header Banner */}
                <div className="p-5 bg-gradient-to-r from-[#17130f] via-[#1f1913] to-[#17130f] border-b border-[#c5a880]/20 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8c734b] to-[#dfbe88] text-[#0e0b08] font-serif font-bold text-base flex items-center justify-center shrink-0">
                      {stopIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-serif font-bold">{stop.cityName}</h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#090807] text-[#dfbe88] px-2.5 py-0.5 rounded-md border border-[#c5a880]/30">
                          {stop.country}
                        </span>
                      </div>
                      <p className="text-xs text-[#b89f7a] flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#dfbe88]" />
                        <span>
                          {formatTripDates(stop.startDate, stop.endDate)} ({stopNights} Nights)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#d6cbbe] bg-[#17130f] border border-[#c5a880]/25 px-3.5 py-1.5 rounded-xl backdrop-blur-xs">
                    <div>
                      <span className="text-[10px] text-[#b89f7a] block uppercase">Experiences</span>
                      <span className="font-serif font-bold text-[#dfbe88]">${stopActivitiesCost}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#b89f7a] block uppercase">Suite / Night</span>
                      <span className="font-serif font-bold text-[#dfbe88]">${stop.stayCostPerNight || 400}</span>
                    </div>
                  </div>
                </div>

                {stop.notes && (
                  <div className="px-6 py-2.5 bg-[#1f1912] border-b border-[#c5a880]/20 text-xs text-[#dfbe88]">
                    <strong className="font-serif">Curator Note:</strong> {stop.notes}
                  </div>
                )}

                {/* Stop Activities Timeline */}
                <div className="p-6 space-y-4">
                  {stop.activities.length === 0 ? (
                    <p className="text-xs text-[#b89f7a] italic py-2 font-light">
                      No specific experiences added for this stop yet.
                    </p>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#c5a880]/20">
                      {stop.activities.map((act) => {
                        const badge = getActivityCategoryBadge(act.type);

                        return (
                          <div
                            key={act.id}
                            className="relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#15110d] border border-[#c5a880]/20 hover:border-[#dfbe88]/40 transition gap-4"
                          >
                            {/* Dot on line */}
                            <div className="absolute -left-6 top-5 w-2.5 h-2.5 rounded-full bg-[#dfbe88] ring-4 ring-[#090807]"></div>

                            <div className="flex items-center gap-4">
                              <img
                                src={act.image}
                                alt={act.name}
                                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#c5a880]/30 shadow-md"
                              />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                                  >
                                    {act.type}
                                  </span>
                                  {act.timeOfDay && (
                                    <span className="text-[10px] font-semibold bg-[#17130f] text-[#dfbe88] px-2 py-0.5 rounded-md border border-[#c5a880]/20">
                                      {act.timeOfDay}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-serif font-bold text-white">{act.name}</h4>
                                <p className="text-xs text-[#d6cbbe] max-w-xl font-light">{act.description}</p>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#c5a880]/15">
                              <span className="text-base font-serif font-bold text-[#dfbe88]">
                                ${act.cost}
                              </span>
                              <span className="text-xs text-[#b89f7a] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#dfbe88]" />
                                {act.durationHours} hrs
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CALENDAR GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trip.stops.map((stop, sIdx) => {
            const stopNights = calculateDateDifferenceDays(stop.startDate, stop.endDate);

            return (
              <div
                key={stop.id}
                className="palace-card rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-serif font-bold text-[#dfbe88] uppercase">
                      Stop {sIdx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-[#b89f7a]">{stopNights} Nights</span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-white mt-1">{stop.cityName}</h3>
                  <p className="text-xs text-[#b89f7a]">{formatTripDates(stop.startDate, stop.endDate)}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#c5a880]/15 flex-1">
                  {stop.activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 bg-[#17130f] border border-[#c5a880]/20 rounded-xl text-xs flex items-center justify-between"
                    >
                      <span className="truncate pr-2 font-serif text-[#d6cbbe]">{act.name}</span>
                      <span className="font-serif font-bold text-[#dfbe88] shrink-0">${act.cost}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#c5a880]/15 text-right text-xs font-serif font-bold text-[#dfbe88]">
                  {stop.activities.length} planned experiences
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
