import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Clock,
  DollarSign,
  PlusCircle,
  Check,
  MapPin,
  Filter,
  Crown,
} from 'lucide-react';
import { Activity, ActivityCategory, City, Trip } from '../types';
import { getActivityCategoryBadge } from '../utils/tripHelpers';

interface ActivitySearchViewProps {
  activities: Activity[];
  trips: Trip[];
  activeTripId: string | null;
  onAddActivityToStop: (tripId: string, stopId: string, activity: Activity) => void;
  cities: City[];
}

export const ActivitySearchView: React.FC<ActivitySearchViewProps> = ({
  activities,
  trips,
  activeTripId,
  onAddActivityToStop,
  cities,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [assigningActivity, setAssigningActivity] = useState<Activity | null>(null);

  // Target Stop Selection State inside modal
  const [targetTripId, setTargetTripId] = useState<string>(activeTripId || trips[0]?.id || '');
  const targetTrip = trips.find((t) => t.id === targetTripId) || trips[0];
  const [targetStopId, setTargetStopId] = useState<string>(targetTrip?.stops[0]?.id || '');

  const categories: (ActivityCategory | 'All')[] = [
    'All',
    'Food & Culinary',
    'Sightseeing',
    'Relaxation',
    'Culture & Arts',
    'Adventure & Nature',
  ];

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.location && act.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'All' || act.type === selectedType;
    const matchesPrice = act.cost <= maxPrice;
    const matchesDuration =
      selectedDuration === 'All' ||
      (selectedDuration === 'short' && act.durationHours <= 3) ||
      (selectedDuration === 'medium' && act.durationHours > 3 && act.durationHours <= 5) ||
      (selectedDuration === 'long' && act.durationHours > 5);

    return matchesSearch && matchesType && matchesPrice && matchesDuration;
  });

  const handleConfirmAttach = () => {
    if (!assigningActivity || !targetTripId || !targetStopId) return;

    onAddActivityToStop(targetTripId, targetStopId, {
      ...assigningActivity,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    });

    setAssigningActivity(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="space-y-2 border-b border-[#c5a880]/20 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-[#dfbe88]" />
            Royal Experience Catalog
          </span>
          <span className="text-xs text-[#b89f7a]">•</span>
          <span className="text-xs text-[#d6cbbe] font-medium">
            {activities.length} Curated Experiences
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
          Royal Dining, Spa & Cultural Experiences
        </h1>
        <p className="text-xs sm:text-sm text-[#d6cbbe] font-light max-w-2xl">
          Discover signature Jamavar fine dining, Anya Spa wellness rituals, Lake Pichola boat cruises, and landmark tours.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="palace-card rounded-3xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#b89f7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="activity-search-input"
              type="text"
              placeholder="Search experiences (e.g. Jamavar, Shikara, Spa, Eiffel, Omakase)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-xs sm:text-sm text-white placeholder:text-[#b89f7a]/50 focus:outline-hidden focus:border-[#dfbe88]"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[#b89f7a] font-semibold whitespace-nowrap">Max Price:</span>
              <span className="font-serif font-bold text-[#dfbe88] w-12">${maxPrice}</span>
              <input
                id="activity-price-range"
                type="range"
                min="30"
                max="300"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 sm:w-32 accent-[#dfbe88] cursor-pointer"
              />
            </div>

            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="text-xs font-semibold bg-[#17130f] border border-[#c5a880]/30 text-white rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-[#dfbe88]"
            >
              <option value="All" className="bg-[#120f0c]">All Durations</option>
              <option value="short" className="bg-[#120f0c]">≤ 3 hours (Quick)</option>
              <option value="medium" className="bg-[#120f0c]">3 - 5 hours (Half Day)</option>
              <option value="long" className="bg-[#120f0c]">&gt; 5 hours (Full Day)</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Scrollable Container - No Overlap) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs max-w-full">
          <span className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedType === cat
                  ? 'bg-[#dfbe88] text-[#14100b] shadow-xs'
                  : 'bg-[#17130f] border border-[#c5a880]/25 text-[#d6cbbe] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-[#b89f7a] px-1">
          <span>
            Found <strong className="text-white font-serif">{filteredActivities.length}</strong> matching experiences
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="palace-card rounded-3xl p-12 text-center space-y-3">
            <p className="text-[#d6cbbe] text-sm font-light">No experiences match your current filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setMaxPrice(300);
                setSelectedDuration('All');
              }}
              className="gold-btn px-5 py-2 text-xs mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => {
              const badge = getActivityCategoryBadge(act.type);

              return (
                <div
                  key={act.id}
                  className="palace-card rounded-3xl overflow-hidden flex flex-col group transition hover:border-[#dfbe88]/50"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={act.image}
                      alt={act.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090807]/90 via-black/20 to-transparent"></div>

                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {act.type}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white flex justify-between items-end">
                      {act.location && (
                        <span className="text-[11px] font-medium text-[#dfbe88] truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#dfbe88]" />
                          {act.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-serif font-bold text-white group-hover:text-[#dfbe88] transition leading-tight">
                        {act.name}
                      </h3>
                      <p className="text-xs text-[#d6cbbe] line-clamp-2 mt-1.5 leading-relaxed font-light">
                        {act.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#c5a880]/15 flex items-center justify-between text-xs font-medium">
                      <span className="text-[#b89f7a] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#dfbe88]" />
                        {act.durationHours} Hours
                      </span>
                      <span className="text-base font-serif font-bold text-[#dfbe88]">${act.cost}</span>
                    </div>

                    <button
                      id={`attach-activity-${act.id}`}
                      onClick={() => setAssigningActivity(act)}
                      className="gold-btn w-full py-2.5 text-xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Attach to Voyage Stop</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attach to Trip Stop Modal */}
      {assigningActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#120f0c] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#c5a880]/30 space-y-4">
            <div>
              <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#dfbe88]">
                Schedule Experience
              </span>
              <h3 className="text-base font-serif font-bold text-white mt-0.5">
                {assigningActivity.name}
              </h3>
              <p className="text-xs text-[#d6cbbe]">
                Choose the voyage and destination stop to schedule this experience.
              </p>
            </div>

            {trips.length === 0 ? (
              <p className="text-xs text-rose-400">
                You don't have any voyages created yet. Please create a voyage first!
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">Target Voyage:</label>
                  <select
                    value={targetTripId}
                    onChange={(e) => {
                      setTargetTripId(e.target.value);
                      const t = trips.find((trip) => trip.id === e.target.value);
                      if (t && t.stops.length > 0) setTargetStopId(t.stops[0].id);
                    }}
                    className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 text-white rounded-xl font-semibold focus:outline-hidden focus:border-[#dfbe88]"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#120f0c]">
                        {t.name} ({t.stops.length} stops)
                      </option>
                    ))}
                  </select>
                </div>

                {targetTrip && targetTrip.stops.length > 0 ? (
                  <div>
                    <label className="block font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">Destination Stop:</label>
                    <select
                      value={targetStopId}
                      onChange={(e) => setTargetStopId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1511] border border-[#c5a880]/30 text-white rounded-xl font-semibold focus:outline-hidden focus:border-[#dfbe88]"
                    >
                      {targetTrip.stops.map((stop, idx) => (
                        <option key={stop.id} value={stop.id} className="bg-[#120f0c]">
                          Stop {idx + 1}: {stop.cityName}, {stop.country}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-[#dfbe88] bg-[#c5a880]/15 border border-[#dfbe88]/30 p-2.5 rounded-xl">
                    This voyage doesn't have any stops yet. Please add a city stop first in the Itinerary Builder.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-[#c5a880]/20">
              <button
                onClick={() => setAssigningActivity(null)}
                className="gold-outline-btn flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                id="confirm-attach-activity-btn"
                onClick={handleConfirmAttach}
                disabled={!targetTrip || targetTrip.stops.length === 0}
                className="gold-btn flex-1 py-2 text-xs disabled:opacity-40"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
