import React from 'react';
import {
  Compass,
  PlusCircle,
  Calendar,
  MapPin,
  Sparkles,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Bookmark,
  Share2,
  PieChart,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Crown,
  Star,
} from 'lucide-react';
import { City, Trip, User, ViewType } from '../types';
import { calculateDateDifferenceDays, calculateTripFinancials, formatTripDates } from '../utils/tripHelpers';

interface DashboardViewProps {
  user: User | null;
  trips: Trip[];
  cities: City[];
  onNavigate: (view: ViewType) => void;
  onOpenCreateTrip: () => void;
  onOpenAIGenerator?: () => void;
  onSelectTrip: (tripId: string) => void;
  onToggleSaveCity: (cityId: string) => void;
  onAddCityToTripModal: (city: City) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  trips,
  cities,
  onNavigate,
  onOpenCreateTrip,
  onOpenAIGenerator,
  onSelectTrip,
  onToggleSaveCity,
  onAddCityToTripModal,
}) => {
  // Aggregate stats
  const totalDestinations = trips.reduce((acc, t) => acc + t.stops.length, 0);
  const totalActivities = trips.reduce(
    (acc, t) => acc + t.stops.reduce((sAcc, s) => sAcc + s.activities.length, 0),
    0
  );
  const totalEstimatedSpend = trips.reduce((acc, t) => {
    const fin = calculateTripFinancials(t);
    return acc + fin.totalCost;
  }, 0);

  const recommendedCities = cities.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in text-[#f5f1eb]">
      {/* The Leela Grand Hero Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-r from-[#17130e] via-[#241c14] to-[#120f0c] border border-[#c5a880]/30 text-white p-8 sm:p-12">
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"
            alt="Palace architecture background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a08]/90 via-[#0c0a08]/40 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c5a880]/15 border border-[#dfbe88]/40 text-[#dfbe88] text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md">
              <Crown className="w-3.5 h-3.5" />
              <span>The Art of True Luxury Voyages</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Welcome to Your Sanctuary,{' '}
              <span className="text-gold-gradient italic">
                {user ? user.name.split(' ')[0] : 'Distinguished Traveler'}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#d6cbbe] font-light leading-relaxed max-w-2xl">
              Curate multi-city voyages with automated day-by-day itineraries, live budget management, and bespoke recommendations crafted in true palace luxury.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            {onOpenAIGenerator && (
              <button
                id="hero-ai-plan-btn"
                onClick={onOpenAIGenerator}
                className="gold-outline-btn px-6 py-3.5 text-xs group"
              >
                <Sparkles className="w-4 h-4 text-[#dfbe88] group-hover:scale-110 transition" />
                <span>✨ AI Concierge Planner</span>
              </button>
            )}
            <button
              id="hero-plan-trip-btn"
              onClick={onOpenCreateTrip}
              className="gold-btn px-6 py-3.5 text-xs shadow-lg shadow-[#b89658]/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Plan New Voyage</span>
            </button>
            <button
              id="hero-explore-cities-btn"
              onClick={() => onNavigate('city-search')}
              className="px-5 py-3.5 rounded-xl bg-[#181410]/80 hover:bg-[#251f18] border border-[#c5a880]/30 text-[#e5dfd5] font-semibold text-xs uppercase tracking-wider backdrop-blur-md transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#dfbe88]" />
              <span>Explore Destinations</span>
            </button>
          </div>
        </div>

        {/* Palace Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-[#c5a880]/20 text-center sm:text-left">
          <div className="bg-[#181410]/70 border border-[#c5a880]/20 rounded-2xl p-4 backdrop-blur-sm shadow-md">
            <p className="text-3xl font-serif font-bold text-gold-gradient">{trips.length}</p>
            <p className="text-xs uppercase tracking-widest text-[#b89f7a] font-semibold mt-0.5">Active Voyages</p>
          </div>
          <div className="bg-[#181410]/70 border border-[#c5a880]/20 rounded-2xl p-4 backdrop-blur-sm shadow-md">
            <p className="text-3xl font-serif font-bold text-[#faf7f2]">{totalDestinations}</p>
            <p className="text-xs uppercase tracking-widest text-[#b89f7a] font-semibold mt-0.5">Destination Stops</p>
          </div>
          <div className="bg-[#181410]/70 border border-[#c5a880]/20 rounded-2xl p-4 backdrop-blur-sm shadow-md">
            <p className="text-3xl font-serif font-bold text-[#dfbe88]">{totalActivities}</p>
            <p className="text-xs uppercase tracking-widest text-[#b89f7a] font-semibold mt-0.5">Curated Experiences</p>
          </div>
          <div className="bg-[#181410]/70 border border-[#c5a880]/20 rounded-2xl p-4 backdrop-blur-sm shadow-md">
            <p className="text-3xl font-serif font-bold text-[#e5c992]">${totalEstimatedSpend.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-widest text-[#b89f7a] font-semibold mt-0.5">Total Est. Budget</p>
          </div>
        </div>
      </div>

      {/* Main Grid: User Voyages & Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: User's Curated Voyages */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[#c5a880]/15 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#faf7f2]">Your Curated Voyages</h2>
              <p className="text-xs text-[#b89f7a] uppercase tracking-wider">Upcoming and ongoing multi-stop journeys</p>
            </div>
            <button
              id="view-all-trips-btn"
              onClick={() => onNavigate('my-trips')}
              className="text-xs font-semibold text-[#dfbe88] hover:text-white flex items-center gap-1 transition uppercase tracking-wider"
            >
              View all ({trips.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {trips.length === 0 ? (
            <div className="palace-card rounded-3xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center mx-auto shadow-md">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">No voyages created yet</h3>
              <p className="text-xs text-[#d6cbbe] max-w-md mx-auto leading-relaxed">
                Begin crafting your bespoke itinerary or let our AI Concierge generate an entire royal tour for you.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {onOpenAIGenerator && (
                  <button onClick={onOpenAIGenerator} className="gold-outline-btn px-4 py-2 text-xs">
                    <Sparkles className="w-3.5 h-3.5" /> AI Planner
                  </button>
                )}
                <button onClick={onOpenCreateTrip} className="gold-btn px-5 py-2.5 text-xs">
                  <PlusCircle className="w-3.5 h-3.5" /> Plan Voyage
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {trips.slice(0, 3).map((trip) => {
                const financials = calculateTripFinancials(trip);
                const duration = calculateDateDifferenceDays(trip.startDate, trip.endDate);

                return (
                  <div
                    key={trip.id}
                    className="palace-card rounded-3xl overflow-hidden group flex flex-col sm:flex-row"
                  >
                    {/* Cover Photo */}
                    <div className="sm:w-56 h-48 sm:h-auto relative overflow-hidden shrink-0">
                      <img
                        src={trip.coverPhoto}
                        alt={trip.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a08]/90 via-transparent to-transparent sm:hidden"></div>
                      <span className="absolute bottom-3 left-3 sm:top-3 sm:bottom-auto px-2.5 py-1 rounded-lg bg-[#0c0a08]/80 backdrop-blur-md text-[10px] font-bold text-[#dfbe88] uppercase tracking-wider border border-[#c5a880]/30 shadow-md">
                        {duration} Days Voyage
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-serif font-bold text-[#faf7f2] group-hover:text-[#dfbe88] transition">
                            {trip.name}
                          </h3>
                          <span className="text-xs font-serif font-bold px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 shadow-xs">
                            ${financials.totalCost.toLocaleString()} est.
                          </span>
                        </div>
                        <p className="text-xs text-[#b89f7a] flex items-center gap-1.5 mt-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#dfbe88]" />
                          {formatTripDates(trip.startDate, trip.endDate)}
                        </p>
                      </div>

                      {/* Stops Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#b89f7a] tracking-wider">Route:</span>
                        {trip.stops.map((stop, idx) => (
                          <span
                            key={stop.id}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#1a1612] border border-[#c5a880]/20 text-[#e5dfd5] px-2.5 py-1 rounded-lg"
                          >
                            <MapPin className="w-3 h-3 text-[#dfbe88]" />
                            {stop.cityName}
                            {idx < trip.stops.length - 1 && <span className="text-[#b89f7a]/60">→</span>}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-[#c5a880]/15 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            id={`dashboard-builder-btn-${trip.id}`}
                            onClick={() => {
                              onSelectTrip(trip.id);
                              onNavigate('itinerary-builder');
                            }}
                            className="px-3.5 py-1.5 bg-[#dfbe88] hover:bg-[#ebd2a4] text-[#14100b] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" /> Builder
                          </button>
                          <button
                            id={`dashboard-view-btn-${trip.id}`}
                            onClick={() => {
                              onSelectTrip(trip.id);
                              onNavigate('itinerary-view');
                            }}
                            className="px-3 py-1.5 bg-[#1a1612] hover:bg-[#251f18] border border-[#c5a880]/25 text-[#f1ece1] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#dfbe88]" /> View
                          </button>
                          <button
                            id={`dashboard-budget-btn-${trip.id}`}
                            onClick={() => {
                              onSelectTrip(trip.id);
                              onNavigate('budget');
                            }}
                            className="px-3 py-1.5 bg-[#1a1612] hover:bg-[#251f18] border border-[#c5a880]/25 text-[#f1ece1] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-[#dfbe88]" /> Budget
                          </button>
                        </div>

                        <button
                          id={`dashboard-share-btn-${trip.id}`}
                          onClick={() => {
                            onSelectTrip(trip.id);
                            onNavigate('public-share');
                          }}
                          className="text-xs font-semibold text-[#b89f7a] hover:text-[#dfbe88] flex items-center gap-1.5 transition uppercase tracking-wider"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Budget Highlights Widget & Fast Links */}
        <div className="space-y-6">
          {/* Budget Overview Widget */}
          <div className="palace-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c5a880]/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#c5a880]/20 border border-[#dfbe88]/30 text-[#dfbe88] flex items-center justify-center font-bold shadow-xs">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-serif font-bold text-white">Financial Ledger</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b89f7a]">All Voyages</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#16120e] border border-[#c5a880]/20 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#b89f7a]">Total Planned Spend</span>
                <span className="font-serif font-bold text-base text-[#faf7f2]">${totalEstimatedSpend.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#b89f7a]">Avg Cost / Stop</span>
                <span className="font-serif font-bold text-sm text-[#dfbe88]">
                  ${totalDestinations > 0 ? Math.round(totalEstimatedSpend / totalDestinations) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#b89f7a]">Est. Daily Average</span>
                <span className="font-serif font-bold text-sm text-[#dfbe88]">$165</span>
              </div>
            </div>

            <p className="text-xs text-[#d6cbbe] leading-relaxed font-light">
              Automatic tabulations for palace suites, private transit transfers, dining, and scheduled cultural tours.
            </p>

            {trips.length > 0 && (
              <button
                id="budget-widget-detail-btn"
                onClick={() => {
                  onSelectTrip(trips[0].id);
                  onNavigate('budget');
                }}
                className="gold-outline-btn w-full py-2.5 text-xs"
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Open Financial Breakdown</span>
              </button>
            )}
          </div>

          {/* Quick Discover Banner */}
          <div className="relative rounded-3xl p-7 text-white shadow-2xl overflow-hidden border border-[#c5a880]/35 bg-gradient-to-br from-[#261e16] via-[#1a140f] to-[#120e0a]">
            <div className="relative z-10 space-y-3">
              <div className="inline-flex p-2.5 rounded-xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-serif font-bold leading-snug text-[#faf7f2]">
                Explore World-Class Destinations
              </h4>
              <p className="text-xs text-[#d6cbbe] font-light leading-relaxed">
                Browse 18+ handpicked cultural destinations with live cost indices, weather, and signature attractions.
              </p>
              <button
                id="widget-explore-cities-btn"
                onClick={() => onNavigate('city-search')}
                className="gold-btn w-full py-3 text-xs mt-2"
              >
                <span>Explore Destination Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Destinations Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-[#c5a880]/15 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#faf7f2]">
              Signature Destinations
            </h2>
            <p className="text-xs text-[#b89f7a] uppercase tracking-wider">
              Hand-curated global cities with traveler popularity and estimated daily budgets
            </p>
          </div>
          <button
            id="browse-all-destinations-btn"
            onClick={() => onNavigate('city-search')}
            className="text-xs font-semibold text-[#dfbe88] hover:text-white flex items-center gap-1 transition uppercase tracking-wider"
          >
            Explore all {cities.length} destinations
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedCities.map((city) => {
            const isSaved = user?.savedDestinations.includes(city.id);

            return (
              <div
                key={city.id}
                className="palace-card rounded-3xl overflow-hidden group flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a08]/90 via-[#0c0a08]/30 to-transparent"></div>

                  {/* Bookmark button */}
                  <button
                    id={`bookmark-city-${city.id}`}
                    onClick={() => onToggleSaveCity(city.id)}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition ${
                      isSaved
                        ? 'bg-[#dfbe88] text-[#14100b] shadow-md shadow-[#dfbe88]/30'
                        : 'bg-[#0c0a08]/70 text-[#d6cbbe] hover:text-white hover:bg-[#0c0a08] border border-[#c5a880]/30'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Save to Favorites'}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#dfbe88] bg-[#0c0a08]/80 px-2.5 py-0.5 rounded-md border border-[#c5a880]/30 backdrop-blur-xs">
                      {city.country}
                    </span>
                    <h3 className="text-xl font-serif font-bold mt-1.5 leading-tight text-[#faf7f2]">{city.name}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-[#d6cbbe] line-clamp-2 leading-relaxed font-light">
                    {city.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#c5a880]/15 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#b89f7a]">Cost Level:</span>
                      <span className="font-serif font-bold text-[#dfbe88]">
                        {'$'.repeat(city.costIndex)}
                        <span className="text-[#b89f7a]/30">{'$'.repeat(5 - city.costIndex)}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#b89f7a]">Avg Daily Spend:</span>
                      <span className="font-serif font-bold text-sm text-[#faf7f2]">${city.avgDailyCost}/day</span>
                    </div>
                  </div>

                  <button
                    id={`quick-add-city-${city.id}`}
                    onClick={() => onAddCityToTripModal(city)}
                    className="gold-outline-btn w-full py-2.5 text-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add to Voyage</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
