import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Share2,
  Trash2,
  Edit,
  Copy,
  SlidersHorizontal,
  Eye,
  LayoutGrid,
  List,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Crown,
} from 'lucide-react';
import { Trip, ViewType } from '../types';
import { calculateDateDifferenceDays, calculateTripFinancials, formatTripDates } from '../utils/tripHelpers';

interface MyTripsViewProps {
  trips: Trip[];
  onNavigate: (view: ViewType) => void;
  onOpenCreateTrip: () => void;
  onOpenAIGenerator?: () => void;
  onSelectTrip: (tripId: string) => void;
  onEditTrip: (trip: Trip) => void;
  onDuplicateTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onResetSeedData: () => void;
}

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  trips,
  onNavigate,
  onOpenCreateTrip,
  onOpenAIGenerator,
  onSelectTrip,
  onEditTrip,
  onDuplicateTrip,
  onDeleteTrip,
  onResetSeedData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  const filteredTrips = trips.filter((trip) => {
    const matchesName = trip.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDescription = trip.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = trip.stops.some(
      (s) =>
        s.cityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesName || matchesDescription || matchesCity;
  });

  const confirmDelete = () => {
    if (tripToDelete) {
      onDeleteTrip(tripToDelete.id);
      setTripToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#c5a880]/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] text-[10px] font-bold uppercase tracking-widest border border-[#dfbe88]/30 mb-1">
            <Crown className="w-3.5 h-3.5" />
            <span>Royal Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Curated Voyages
          </h1>
          <p className="text-xs sm:text-sm text-[#b89f7a] font-light">
            Manage, customize, and share all your palace itineraries
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onOpenAIGenerator && (
            <button
              id="my-trips-ai-plan-btn"
              onClick={onOpenAIGenerator}
              className="gold-outline-btn px-4 py-2.5 text-xs"
            >
              <Sparkles className="w-4 h-4 text-[#dfbe88]" />
              <span>AI Concierge</span>
            </button>
          )}
          <button
            id="my-trips-plan-new-btn"
            onClick={onOpenCreateTrip}
            className="gold-btn px-5 py-2.5 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Voyage</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 palace-card p-3.5 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#b89f7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="my-trips-search-input"
            type="text"
            placeholder="Search by voyage or palace city name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-xs text-white placeholder:text-[#b89f7a]/50 focus:outline-hidden focus:border-[#dfbe88] transition"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <span className="text-xs text-[#b89f7a] font-light">
            Showing <strong className="text-white font-serif">{filteredTrips.length}</strong> of{' '}
            {trips.length} voyages
          </span>

          <div className="flex items-center bg-[#17130f] p-1 rounded-xl border border-[#c5a880]/25">
            <button
              id="trips-view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#dfbe88] text-[#14100b] shadow-xs font-bold' : 'text-[#b89f7a] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="trips-view-list-btn"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list' ? 'bg-[#dfbe88] text-[#14100b] shadow-xs font-bold' : 'text-[#b89f7a] hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trips Collection */}
      {filteredTrips.length === 0 ? (
        <div className="palace-card rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white">
            {searchQuery ? 'No voyages match your search' : 'No voyages planned yet'}
          </h3>
          <p className="text-xs text-[#d6cbbe] max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? `We couldn't find any voyages matching "${searchQuery}". Try a different keyword.`
              : 'Create a new royal itinerary or restore sample journeys to explore the curator features.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="gold-outline-btn px-4 py-2 text-xs"
              >
                Clear Search
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenCreateTrip}
                  className="gold-btn px-5 py-2.5 text-xs"
                >
                  + Create Voyage
                </button>
                <button
                  onClick={onResetSeedData}
                  className="gold-outline-btn px-4 py-2.5 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Sample Voyages
                </button>
              </>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const financials = calculateTripFinancials(trip);
            const duration = calculateDateDifferenceDays(trip.startDate, trip.endDate);
            const totalActivitiesCount = trip.stops.reduce(
              (acc, s) => acc + s.activities.length,
              0
            );

            return (
              <div
                key={trip.id}
                className="palace-card rounded-3xl overflow-hidden flex flex-col group transition hover:border-[#dfbe88]/50"
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.coverPhoto}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090807]/90 via-black/30 to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#090807]/80 backdrop-blur-md text-[#dfbe88] text-[11px] font-bold border border-[#c5a880]/30 shadow-md">
                      {duration} Days Voyage
                    </span>
                    {trip.isPublic && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#c5a880]/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-[#dfbe88]/40">
                        Public
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      id={`trip-edit-btn-${trip.id}`}
                      onClick={() => onEditTrip(trip)}
                      className="p-2 rounded-full bg-[#090807]/80 hover:bg-[#090807] text-[#d6cbbe] hover:text-white transition backdrop-blur-md border border-[#c5a880]/30 cursor-pointer"
                      title="Edit Voyage Settings"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`trip-duplicate-btn-${trip.id}`}
                      onClick={() => onDuplicateTrip(trip)}
                      className="p-2 rounded-full bg-[#090807]/80 hover:bg-[#090807] text-[#d6cbbe] hover:text-white transition backdrop-blur-md border border-[#c5a880]/30 cursor-pointer"
                      title="Duplicate Voyage"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`trip-delete-btn-${trip.id}`}
                      onClick={() => setTripToDelete(trip)}
                      className="p-2 rounded-full bg-[#090807]/80 hover:bg-rose-600 hover:text-white text-rose-400 transition backdrop-blur-md border border-[#c5a880]/30 cursor-pointer"
                      title="Delete Voyage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="text-[11px] font-medium text-[#dfbe88] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatTripDates(trip.startDate, trip.endDate)}
                    </p>
                    <h2 className="text-lg font-serif font-bold leading-tight truncate text-[#faf7f2]">
                      {trip.name}
                    </h2>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-[#d6cbbe] line-clamp-2 leading-relaxed font-light">
                    {trip.description}
                  </p>

                  {/* Stops Sequence */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#b89f7a]">
                      <span>Stops ({trip.stops.length})</span>
                      <span>{totalActivitiesCount} experiences</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {trip.stops.length === 0 ? (
                        <span className="text-xs text-[#b89f7a]/50 italic">No stops added yet</span>
                      ) : (
                        trip.stops.map((stop, idx) => (
                          <span
                            key={stop.id}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#17130f] border border-[#c5a880]/20 text-[#e5dfd5] px-2 py-0.5 rounded-md"
                          >
                            <MapPin className="w-2.5 h-2.5 text-[#dfbe88]" />
                            {stop.cityName}
                            {idx < trip.stops.length - 1 && <span className="text-[#b89f7a]/40">→</span>}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Financial Mini Bar */}
                  <div className="pt-3 border-t border-[#c5a880]/15 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[#b89f7a]">
                      <DollarSign className="w-3.5 h-3.5 text-[#dfbe88]" />
                      <span>Estimated Spend:</span>
                    </div>
                    <span className="font-serif font-bold text-sm text-[#dfbe88]">
                      ${financials.totalCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Actions Grid (Strict Height & Zero Overlap) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      id={`trip-card-builder-${trip.id}`}
                      onClick={() => {
                        onSelectTrip(trip.id);
                        onNavigate('itinerary-builder');
                      }}
                      className="h-9 px-3 bg-[#dfbe88] hover:bg-[#ebd2a4] text-[#14100b] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Builder</span>
                    </button>
                    <button
                      id={`trip-card-view-${trip.id}`}
                      onClick={() => {
                        onSelectTrip(trip.id);
                        onNavigate('itinerary-view');
                      }}
                      className="h-9 px-3 bg-[#171410] hover:bg-[#251f18] border border-[#c5a880]/25 text-[#f1ece1] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#dfbe88]" />
                      <span>View</span>
                    </button>
                    <button
                      id={`trip-card-budget-${trip.id}`}
                      onClick={() => {
                        onSelectTrip(trip.id);
                        onNavigate('budget');
                      }}
                      className="h-9 px-3 bg-[#171410] hover:bg-[#251f18] border border-[#c5a880]/25 text-[#f1ece1] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-[#dfbe88]" />
                      <span>Budget</span>
                    </button>
                    <button
                      id={`trip-card-share-${trip.id}`}
                      onClick={() => {
                        onSelectTrip(trip.id);
                        onNavigate('public-share');
                      }}
                      className="h-9 px-3 bg-[#171410] hover:bg-[#251f18] border border-[#c5a880]/25 text-[#f1ece1] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#dfbe88]" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode View */
        <div className="palace-card rounded-3xl overflow-hidden shadow-lg divide-y divide-[#c5a880]/15">
          {filteredTrips.map((trip) => {
            const financials = calculateTripFinancials(trip);
            const duration = calculateDateDifferenceDays(trip.startDate, trip.endDate);

            return (
              <div
                key={trip.id}
                className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[#c5a880]/10 transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={trip.coverPhoto}
                    alt={trip.name}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#c5a880]/30 shadow-md"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-serif font-bold text-white">{trip.name}</h3>
                      {trip.isPublic && (
                        <span className="text-[10px] font-bold bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 px-2 py-0.5 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#b89f7a] flex items-center gap-2">
                      <span>{formatTripDates(trip.startDate, trip.endDate)}</span>
                      <span>•</span>
                      <span>{duration} Days</span>
                      <span>•</span>
                      <span>{trip.stops.length} Stops</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {trip.stops.map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] bg-[#171410] border border-[#c5a880]/20 text-[#e5dfd5] font-medium px-2 py-0.5 rounded-md"
                        >
                          {s.cityName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  <div className="text-right hidden sm:block mr-2">
                    <p className="text-[10px] text-[#b89f7a] uppercase">Total Estimate</p>
                    <p className="text-sm font-serif font-bold text-[#dfbe88]">
                      ${financials.totalCost.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTrip(trip.id);
                      onNavigate('itinerary-builder');
                    }}
                    className="gold-btn px-3.5 py-2 text-xs cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Builder
                  </button>
                  <button
                    onClick={() => {
                      onSelectTrip(trip.id);
                      onNavigate('itinerary-view');
                    }}
                    className="gold-outline-btn px-3 py-2 text-xs cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onDuplicateTrip(trip)}
                    className="p-2 text-[#b89f7a] hover:text-white hover:bg-[#c5a880]/15 rounded-xl transition cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditTrip(trip)}
                    className="p-2 text-[#b89f7a] hover:text-white hover:bg-[#c5a880]/15 rounded-xl transition cursor-pointer"
                    title="Edit Settings"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTripToDelete(trip)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#120f0c] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#c5a880]/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-serif font-bold text-white">Delete Voyage?</h3>
              <p className="text-xs text-[#d6cbbe]">
                Are you sure you want to delete <strong className="text-white">"{tripToDelete.name}"</strong>? This will permanently remove its stops, experiences, and budget plans.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setTripToDelete(null)}
                className="gold-outline-btn flex-1 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-trip-btn"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Delete Voyage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
