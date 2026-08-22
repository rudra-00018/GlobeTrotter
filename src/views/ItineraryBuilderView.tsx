import React, { useState } from 'react';
import {
  PlusCircle,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  Eye,
  PieChart,
  Plus,
  X,
  Search,
  Check,
  Building,
  Crown,
} from 'lucide-react';
import { Activity, City, Stop, Trip, ViewType } from '../types';
import { calculateDateDifferenceDays, calculateTripFinancials, formatTripDates, getActivityCategoryBadge } from '../utils/tripHelpers';

interface ItineraryBuilderViewProps {
  trip: Trip | null;
  cities: City[];
  allActivities: Activity[];
  onNavigate: (view: ViewType) => void;
  onAddStop: (tripId: string, stopData: Omit<Stop, 'id' | 'order' | 'activities'>) => void;
  onRemoveStop: (tripId: string, stopId: string) => void;
  onReorderStop: (tripId: string, stopIndex: number, direction: 'up' | 'down') => void;
  onAddActivityToStop: (tripId: string, stopId: string, activity: Activity) => void;
  onRemoveActivityFromStop: (tripId: string, stopId: string, activityId: string) => void;
  onReorderActivity: (
    tripId: string,
    stopId: string,
    actIndex: number,
    direction: 'up' | 'down'
  ) => void;
  onOpenCreateTrip: () => void;
}

export const ItineraryBuilderView: React.FC<ItineraryBuilderViewProps> = ({
  trip,
  cities,
  allActivities,
  onNavigate,
  onAddStop,
  onRemoveStop,
  onReorderStop,
  onAddActivityToStop,
  onRemoveActivityFromStop,
  onReorderActivity,
  onOpenCreateTrip,
}) => {
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [selectedStopForActivity, setSelectedStopForActivity] = useState<string | null>(null);
  const [expandedStops, setExpandedStops] = useState<{ [stopId: string]: boolean }>({});

  // Add Stop Modal State
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id || '');
  const [stopStartDate, setStopStartDate] = useState(trip?.startDate || '2026-10-01');
  const [stopEndDate, setStopEndDate] = useState(trip?.endDate || '2026-10-05');
  const [stopStayCost, setStopStayCost] = useState(380);
  const [stopNotes, setStopNotes] = useState('');

  // Activity Picker Drawer State
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('All');
  const [customActName, setCustomActName] = useState('');
  const [customActCost, setCustomActCost] = useState(120);
  const [customActDuration, setCustomActDuration] = useState(2);
  const [customActTimeOfDay, setCustomActTimeOfDay] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Evening');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 text-white">
        <div className="w-16 h-16 rounded-3xl bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center mx-auto shadow-md">
          <Crown className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">No active voyage selected</h2>
        <p className="text-sm text-[#d6cbbe] max-w-md mx-auto">
          Select an existing voyage from My Voyages or start building a new royal itinerary.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('my-trips')}
            className="gold-outline-btn px-4 py-2.5 text-xs"
          >
            Go to My Voyages
          </button>
          <button
            onClick={onOpenCreateTrip}
            className="gold-btn px-5 py-2.5 text-xs"
          >
            + Plan New Voyage
          </button>
        </div>
      </div>
    );
  }

  const financials = calculateTripFinancials(trip);
  const totalDays = calculateDateDifferenceDays(trip.startDate, trip.endDate);

  const toggleExpand = (stopId: string) => {
    setExpandedStops((prev) => ({
      ...prev,
      [stopId]: prev[stopId] === undefined ? false : !prev[stopId],
    }));
  };

  const handleAddStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const city = cities.find((c) => c.id === selectedCityId) || cities[0];

    onAddStop(trip.id, {
      cityId: city.id,
      cityName: city.name,
      country: city.country,
      startDate: stopStartDate,
      endDate: stopEndDate,
      stayCostPerNight: Number(stopStayCost),
      notes: stopNotes.trim(),
    });

    setShowAddStopModal(false);
    setStopNotes('');
  };

  const handleAddActivityFromCatalog = (act: Activity) => {
    if (!selectedStopForActivity) return;
    onAddActivityToStop(trip.id, selectedStopForActivity, {
      ...act,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timeOfDay: customActTimeOfDay,
    });
  };

  const handleCreateCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStopForActivity || !customActName.trim()) return;

    const newAct: Activity = {
      id: `custom-act-${Date.now()}`,
      name: customActName.trim(),
      type: 'Sightseeing',
      cost: Number(customActCost) || 0,
      durationHours: Number(customActDuration) || 2,
      description: 'Custom planned royal experience.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      timeOfDay: customActTimeOfDay,
    };

    onAddActivityToStop(trip.id, selectedStopForActivity, newAct);
    setCustomActName('');
    setIsCustomMode(false);
  };

  const targetStop = trip.stops.find((s) => s.id === selectedStopForActivity);
  const relevantActivities = allActivities.filter((act) => {
    const matchesSearch =
      act.name.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(activitySearchQuery.toLowerCase());
    const matchesType = activityTypeFilter === 'All' || act.type === activityTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="palace-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest">
              Itinerary Builder
            </span>
            <span className="text-xs text-[#b89f7a]">•</span>
            <span className="text-xs text-[#d6cbbe] font-medium">
              {totalDays} Days ({formatTripDates(trip.startDate, trip.endDate)})
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
            {trip.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#d6cbbe] font-light max-w-2xl">{trip.description}</p>
        </div>

        {/* Quick Screen Navigation Tabs (Responsive Flex Wrap) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="builder-nav-view-btn"
            onClick={() => onNavigate('itinerary-view')}
            className="gold-outline-btn px-3.5 py-2 text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Structured View</span>
          </button>
          <button
            id="builder-nav-budget-btn"
            onClick={() => onNavigate('budget')}
            className="gold-outline-btn px-3.5 py-2 text-xs"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Budget (${financials.totalCost.toLocaleString()})</span>
          </button>
          <button
            id="builder-nav-calendar-btn"
            onClick={() => onNavigate('calendar')}
            className="gold-outline-btn px-3.5 py-2 text-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            id="builder-nav-share-btn"
            onClick={() => onNavigate('public-share')}
            className="gold-btn px-3.5 py-2 text-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* Builder Content Area */}
      <div className="space-y-6">
        {/* Stops Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c5a880]/20 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <span>Destinations & Palace Sequence</span>
              <span className="text-xs font-serif font-bold px-2.5 py-0.5 rounded-full bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30">
                {trip.stops.length} Stops
              </span>
            </h2>
            <p className="text-xs text-[#b89f7a] font-light mt-0.5">
              Reorder stays, schedule royal dining & experiences, and customize daily timelines
            </p>
          </div>

          <button
            id="open-add-stop-modal-btn"
            onClick={() => setShowAddStopModal(true)}
            className="gold-btn px-5 py-2.5 text-xs shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Palace Stop</span>
          </button>
        </div>

        {/* Stops List */}
        {trip.stops.length === 0 ? (
          <div className="palace-card rounded-3xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center mx-auto">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">No stops in this voyage yet</h3>
            <p className="text-xs text-[#d6cbbe] max-w-sm mx-auto">
              Click "Add Palace Stop" to choose a destination, set stay dates, and attach experiences.
            </p>
            <button
              onClick={() => setShowAddStopModal(true)}
              className="gold-btn px-5 py-2.5 text-xs mt-2"
            >
              + Add First Destination
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trip.stops.map((stop, index) => {
              const stopNights = calculateDateDifferenceDays(stop.startDate, stop.endDate);
              const stopActTotal = stop.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
              const isCollapsed = expandedStops[stop.id] === false;

              return (
                <div
                  key={stop.id}
                  className="palace-card rounded-3xl transition-all overflow-hidden"
                >
                  {/* Stop Header (Zero-Overlap Flex Layout) */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-[#17130f] via-[#1f1913] to-[#17130f] border-b border-[#c5a880]/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8c734b] to-[#dfbe88] text-[#0e0b08] font-serif font-bold text-sm flex items-center justify-center shadow-md shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-serif font-bold text-white truncate">{stop.cityName}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0c0a08] border border-[#c5a880]/30 text-[#dfbe88] px-2.5 py-0.5 rounded-md">
                            {stop.country}
                          </span>
                        </div>
                        <p className="text-xs text-[#b89f7a] flex items-center gap-2 mt-0.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#dfbe88]" />
                          <span>
                            {formatTripDates(stop.startDate, stop.endDate)} ({stopNights} Nights)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Controls & Metrics (Clean Wrap Container) */}
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-[#c5a880]/15 shrink-0">
                      <div className="text-right mr-1 hidden lg:block">
                        <span className="text-[10px] uppercase tracking-wider text-[#b89f7a] block">Experiences</span>
                        <span className="text-xs font-serif font-bold text-[#faf7f2]">
                          {stop.activities.length} planned (${stopActTotal})
                        </span>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center bg-[#100d0a] border border-[#c5a880]/25 rounded-xl p-1">
                        <button
                          id={`reorder-stop-up-${stop.id}`}
                          onClick={() => onReorderStop(trip.id, index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-[#b89f7a] hover:text-[#dfbe88] disabled:opacity-20 rounded-lg transition cursor-pointer"
                          title="Move Stop Earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`reorder-stop-down-${stop.id}`}
                          onClick={() => onReorderStop(trip.id, index, 'down')}
                          disabled={index === trip.stops.length - 1}
                          className="p-1.5 text-[#b89f7a] hover:text-[#dfbe88] disabled:opacity-20 rounded-lg transition cursor-pointer"
                          title="Move Stop Later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Add Activity Button */}
                      <button
                        id={`add-activity-btn-${stop.id}`}
                        onClick={() => {
                          setSelectedStopForActivity(stop.id);
                        }}
                        className="gold-outline-btn px-3 py-1.5 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Experience
                      </button>

                      {/* Remove Stop */}
                      <button
                        id={`remove-stop-btn-${stop.id}`}
                        onClick={() => onRemoveStop(trip.id, stop.id)}
                        className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition cursor-pointer shrink-0"
                        title="Remove Destination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Collapse Toggle */}
                      <button
                        onClick={() => toggleExpand(stop.id)}
                        className="p-2 text-[#b89f7a] hover:text-white rounded-xl transition cursor-pointer shrink-0"
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Stop Notes if any */}
                  {stop.notes && !isCollapsed && (
                    <div className="px-5 py-2.5 bg-[#1f1912] border-b border-[#c5a880]/20 text-xs text-[#dfbe88] flex items-center gap-2">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-[#dfbe88]">Curator Note:</span>
                      <span className="font-light">{stop.notes}</span>
                    </div>
                  )}

                  {/* Stop Activities Body */}
                  {!isCollapsed && (
                    <div className="p-5 space-y-3">
                      {stop.activities.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#14100c] border border-dashed border-[#c5a880]/20 text-center space-y-2">
                          <p className="text-xs text-[#b89f7a]">No experiences or dining scheduled for this stop yet.</p>
                          <button
                            onClick={() => setSelectedStopForActivity(stop.id)}
                            className="text-xs font-serif font-bold text-[#dfbe88] hover:text-white underline cursor-pointer"
                          >
                            + Browse royal dining & experiences for {stop.cityName}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {stop.activities.map((activity, actIdx) => {
                            const badge = getActivityCategoryBadge(activity.type);

                            return (
                              <div
                                key={activity.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-[#15110d] hover:bg-[#1f1913] border border-[#c5a880]/20 transition-all gap-3"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <img
                                    src={activity.image}
                                    alt={activity.name}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#c5a880]/30 shadow-md"
                                  />
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-xs sm:text-sm font-serif font-bold text-white truncate">
                                        {activity.name}
                                      </h4>
                                      <span
                                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                                      >
                                        {activity.type}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-[#b89f7a]">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-[#dfbe88]" />
                                        {activity.durationHours} hrs
                                      </span>
                                      {activity.timeOfDay && (
                                        <span className="font-semibold text-[#faf7f2] bg-[#221b14] px-2 py-0.5 rounded-md border border-[#c5a880]/20">
                                          {activity.timeOfDay}
                                        </span>
                                      )}
                                      <span className="font-serif font-bold text-[#dfbe88]">
                                        ${activity.cost}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Reorder & Remove Activity */}
                                <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
                                  <div className="flex items-center bg-[#100d0a] rounded-xl border border-[#c5a880]/25 p-1">
                                    <button
                                      id={`reorder-act-up-${activity.id}`}
                                      onClick={() =>
                                        onReorderActivity(trip.id, stop.id, actIdx, 'up')
                                      }
                                      disabled={actIdx === 0}
                                      className="p-1 text-[#b89f7a] hover:text-[#dfbe88] disabled:opacity-20 transition cursor-pointer"
                                      title="Move up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      id={`reorder-act-down-${activity.id}`}
                                      onClick={() =>
                                        onReorderActivity(trip.id, stop.id, actIdx, 'down')
                                      }
                                      disabled={actIdx === stop.activities.length - 1}
                                      className="p-1 text-[#b89f7a] hover:text-[#dfbe88] disabled:opacity-20 transition cursor-pointer"
                                      title="Move down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <button
                                    id={`remove-activity-btn-${activity.id}`}
                                    onClick={() =>
                                      onRemoveActivityFromStop(trip.id, stop.id, activity.id)
                                    }
                                    className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                                    title="Remove Experience"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#120f0c] rounded-3xl shadow-2xl border border-[#c5a880]/30 max-w-lg w-full overflow-hidden text-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#c5a880]/20 bg-[#191410]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">Add Palace Destination Stop</h3>
              </div>
              <button
                onClick={() => setShowAddStopModal(false)}
                className="p-1.5 text-[#b89f7a] hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStopSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5">
                  Select Palace Destination *
                </label>
                <select
                  id="select-stop-city"
                  value={selectedCityId}
                  onChange={(e) => {
                    setSelectedCityId(e.target.value);
                    const c = cities.find((city) => city.id === e.target.value);
                    if (c) setStopStayCost(c.avgDailyCost);
                  }}
                  className="w-full px-4 py-2.5 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm font-semibold text-white focus:outline-hidden focus:border-[#dfbe88]"
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id} className="bg-[#120f0c] text-white">
                      {city.name}, {city.country} — ${city.avgDailyCost}/day
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">
                    Arrival Date *
                  </label>
                  <input
                    id="stop-arrival-date-input"
                    type="date"
                    required
                    value={stopStartDate}
                    onChange={(e) => setStopStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#dfbe88]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">
                    Departure Date *
                  </label>
                  <input
                    id="stop-departure-date-input"
                    type="date"
                    required
                    value={stopEndDate}
                    onChange={(e) => setStopEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#dfbe88]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">
                  Est. Suite Accommodation / Night ($)
                </label>
                <input
                  id="stop-stay-cost-input"
                  type="number"
                  min="0"
                  value={stopStayCost}
                  onChange={(e) => setStopStayCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#dfbe88]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">
                  Curator Notes & Suite Preferences
                </label>
                <textarea
                  id="stop-notes-input"
                  rows={2}
                  placeholder="e.g. Reserve lakefront balcony suite with private butler service..."
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-xs text-white placeholder:text-[#b89f7a]/50 focus:outline-hidden focus:border-[#dfbe88]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c5a880]/20">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="gold-outline-btn px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  id="confirm-add-stop-btn"
                  type="submit"
                  className="gold-btn px-5 py-2 text-xs"
                >
                  Add Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Selector Modal / Panel */}
      {selectedStopForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#120f0c] rounded-3xl shadow-2xl border border-[#c5a880]/30 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#191410] border-b border-[#c5a880]/20 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Add Experience to {targetStop ? targetStop.cityName : 'Stop'}
                </h3>
                <p className="text-xs text-[#b89f7a]">
                  Select curated dining and spa rituals or enter a custom experience.
                </p>
              </div>
              <button
                onClick={() => setSelectedStopForActivity(null)}
                className="p-1.5 text-[#b89f7a] hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subheader Filters & Mode Toggle */}
            <div className="p-4 border-b border-[#c5a880]/20 bg-[#120f0c] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-[#1a1511] border border-[#c5a880]/25 p-1 rounded-xl">
                  <button
                    onClick={() => setIsCustomMode(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      !isCustomMode ? 'bg-[#dfbe88] text-[#14100b] shadow-xs' : 'text-[#b89f7a] hover:text-white'
                    }`}
                  >
                    Curated Catalog
                  </button>
                  <button
                    onClick={() => setIsCustomMode(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isCustomMode ? 'bg-[#dfbe88] text-[#14100b] shadow-xs' : 'text-[#b89f7a] hover:text-white'
                    }`}
                  >
                    + Custom Experience
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#b89f7a]">Time Slot:</span>
                  <select
                    value={customActTimeOfDay}
                    onChange={(e) =>
                      setCustomActTimeOfDay(
                        e.target.value as 'Morning' | 'Afternoon' | 'Evening' | 'Night'
                      )
                    }
                    className="text-xs font-semibold bg-[#1a1511] border border-[#c5a880]/30 text-white rounded-lg px-2.5 py-1"
                  >
                    <option value="Morning" className="bg-[#120f0c]">Morning</option>
                    <option value="Afternoon" className="bg-[#120f0c]">Afternoon</option>
                    <option value="Evening" className="bg-[#120f0c]">Evening</option>
                    <option value="Night" className="bg-[#120f0c]">Night</option>
                  </select>
                </div>
              </div>

              {!isCustomMode && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#b89f7a] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="activity-search-modal-input"
                      type="text"
                      placeholder="Search fine dining, spa, boat cruise..."
                      value={activitySearchQuery}
                      onChange={(e) => setActivitySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-xs text-white placeholder:text-[#b89f7a]/50 focus:outline-hidden focus:border-[#dfbe88]"
                    />
                  </div>
                  <select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                    className="text-xs bg-[#1a1511] border border-[#c5a880]/30 text-white rounded-xl px-3 py-1.5"
                  >
                    <option value="All" className="bg-[#120f0c]">All Categories</option>
                    <option value="Food & Culinary" className="bg-[#120f0c]">Food & Culinary</option>
                    <option value="Sightseeing" className="bg-[#120f0c]">Sightseeing</option>
                    <option value="Relaxation" className="bg-[#120f0c]">Relaxation</option>
                    <option value="Culture & Arts" className="bg-[#120f0c]">Culture & Arts</option>
                  </select>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-96 space-y-3">
              {isCustomMode ? (
                <form onSubmit={handleCreateCustomActivity} className="space-y-3">
                  <div>
                    <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">
                      Experience Title *
                    </label>
                    <input
                      id="custom-act-name-input"
                      type="text"
                      required
                      placeholder="e.g. Private Candlelight Terrace Wine Tasting"
                      value={customActName}
                      onChange={(e) => setCustomActName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-xs text-white placeholder:text-[#b89f7a]/50 focus:outline-hidden focus:border-[#dfbe88]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">
                        Est. Cost ($)
                      </label>
                      <input
                        id="custom-act-cost-input"
                        type="number"
                        min="0"
                        value={customActCost}
                        onChange={(e) => setCustomActCost(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#dfbe88]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">
                        Duration (Hours)
                      </label>
                      <input
                        id="custom-act-duration-input"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={customActDuration}
                        onChange={(e) => setCustomActDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#dfbe88]"
                      />
                    </div>
                  </div>
                  <button
                    id="submit-custom-activity-btn"
                    type="submit"
                    className="gold-btn w-full py-2.5 text-xs mt-2"
                  >
                    + Add Custom Experience to Stop
                  </button>
                </form>
              ) : relevantActivities.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#b89f7a]">
                  No matching experiences found. Try another search or create a custom experience.
                </div>
              ) : (
                relevantActivities.map((act) => {
                  const isAlreadyAdded = targetStop?.activities.some((a) => a.name === act.name);

                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl border border-[#c5a880]/20 hover:border-[#dfbe88]/40 bg-[#15110d] flex items-center justify-between gap-3 transition hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={act.image}
                          alt={act.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#c5a880]/30"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <span className="text-[10px] font-bold text-[#dfbe88] uppercase">
                            {act.type}
                          </span>
                          <h4 className="text-xs font-serif font-bold text-white truncate">{act.name}</h4>
                          <p className="text-[11px] text-[#b89f7a] line-clamp-1 font-light">{act.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[#d6cbbe]">
                            <span>{act.durationHours} hrs</span>
                            <span>•</span>
                            <span className="font-serif font-bold text-[#dfbe88]">${act.cost}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id={`attach-act-${act.id}`}
                        onClick={() => handleAddActivityFromCatalog(act)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
                          isAlreadyAdded
                            ? 'bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30'
                            : 'gold-btn'
                        }`}
                      >
                        {isAlreadyAdded ? <Check className="w-3 h-3 text-[#dfbe88]" /> : <Plus className="w-3 h-3" />}
                        <span>{isAlreadyAdded ? 'Add Again' : 'Add Experience'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
