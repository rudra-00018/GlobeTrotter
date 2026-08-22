import { useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, CalendarDays, ChevronRight, Compass, Crown, MapPin, Plus, Route, Search, Sparkles, Star, WalletCards } from 'lucide-react';
import { City, Trip, User, ViewType } from '../types';
import { calculateTripFinancials, formatTripDates } from '../utils/tripHelpers';

interface TravelHomeViewProps {
  user: User | null;
  trips: Trip[];
  cities: City[];
  onNavigate: (view: ViewType) => void;
  onOpenCreateTrip: () => void;
  onOpenAIGenerator: () => void;
  onSelectTrip: (id: string) => void;
  onToggleSaveCity: (id: string) => void;
  onAddCityToTripModal: (city: City) => void;
}

export function TravelHomeView({
  user,
  trips,
  cities,
  onNavigate,
  onOpenCreateTrip,
  onOpenAIGenerator,
  onSelectTrip,
  onToggleSaveCity,
  onAddCityToTripModal,
}: TravelHomeViewProps) {
  const [search, setSearch] = useState('');
  const ideas = useMemo(() => cities.slice(0, 4), [cities]);
  const recentTrips = trips.slice(0, 3);
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    onNavigate('city-search');
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#090807] pb-16 text-[#f7f3ed] space-y-12">
      {/* Hero Banner Section with Integrated Search Bar (No Overlap) */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#18130e] via-[#120e0b] to-[#090807] border-b border-[#c5a880]/20 px-4 py-12 sm:px-6 lg:px-12 lg:py-20">
        <div
          className="absolute inset-0 -z-10 opacity-30 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#090807] via-[#090807]/60 to-transparent" />

        <div className="mx-auto max-w-5xl text-center text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a880]/15 border border-[#dfbe88]/40 text-[#dfbe88] text-xs font-semibold tracking-[0.25em] uppercase backdrop-blur-md">
            <Crown className="w-4 h-4" />
            <span>The Leela Palaces & Voyage Curator</span>
          </div>

          <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-6xl text-white leading-tight">
            Curate Royal Voyages. <br />
            <span className="text-gold-gradient italic">Experience Pure Luxury.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#d6cbbe] font-light leading-relaxed">
            Craft multi-city itineraries across premier palace destinations, discover curated royal experiences, and oversee your travel finances effortlessly.
          </p>

          {/* Integrated Search Bar (Clean Inline Layout - No Overlap) */}
          <form
            onSubmit={submitSearch}
            className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-[#17130f]/90 border border-[#c5a880]/35 p-2.5 shadow-2xl backdrop-blur-md focus-within:border-[#dfbe88] transition"
          >
            <div className="flex items-center gap-3 flex-1 px-3 w-full">
              <Search className="shrink-0 text-[#dfbe88] w-5 h-5" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full border-0 bg-transparent py-2 text-sm text-[#f7f3ed] outline-none placeholder:text-[#b89f7a]/60"
                placeholder="Search royal palaces & destinations... (e.g. Udaipur, Paris, Tokyo)"
              />
            </div>
            <button
              type="submit"
              className="gold-btn w-full sm:w-auto px-7 py-3 text-xs shrink-0 cursor-pointer"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Quick Action Feature Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          <button
            onClick={onOpenCreateTrip}
            className="palace-card group flex items-center gap-4 rounded-3xl p-6 text-left shadow-lg transition hover:-translate-y-1 cursor-pointer"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30">
              <Plus size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-base font-serif text-white">Plan New Voyage</strong>
              <small className="mt-0.5 block text-xs text-[#b89f7a]">Dates, royal stays and stops</small>
            </div>
            <ChevronRight className="ml-auto text-[#b89f7a] group-hover:text-[#dfbe88] group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="palace-card group flex items-center gap-4 rounded-3xl p-6 text-left shadow-lg transition hover:-translate-y-1 cursor-pointer"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30">
              <Sparkles size={23} />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-base font-serif text-white">Build with AI Concierge</strong>
              <small className="mt-0.5 block text-xs text-[#b89f7a]">Automated royal tour itinerary</small>
            </div>
            <ChevronRight className="ml-auto text-[#b89f7a] group-hover:text-[#dfbe88] group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          <button
            onClick={() => onNavigate('activity-search')}
            className="palace-card group flex items-center gap-4 rounded-3xl p-6 text-left shadow-lg transition hover:-translate-y-1 cursor-pointer"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30">
              <Compass size={23} />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-base font-serif text-white">Royal Experiences</strong>
              <small className="mt-0.5 block text-xs text-[#b89f7a]">Dining, spa and cultural tours</small>
            </div>
            <ChevronRight className="ml-auto text-[#b89f7a] group-hover:text-[#dfbe88] group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </div>
      </section>

      {/* Main Section: Recent Voyages & Feature Aside */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.55fr_.85fr] lg:px-10">
        <div className="space-y-5">
          <div className="flex items-end justify-between border-b border-[#c5a880]/20 pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#dfbe88]">Your Curated Journeys</p>
              <h2 className="mt-1 text-2xl font-serif font-bold text-white">
                Welcome back, {user?.name.split(' ')[0] || 'Distinguished Guest'}.
              </h2>
            </div>
            <button
              onClick={() => onNavigate('my-trips')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#dfbe88] hover:text-white uppercase tracking-wider transition cursor-pointer"
            >
              View all <ArrowRight size={15} />
            </button>
          </div>

          <div className="space-y-4">
            {recentTrips.map((trip) => {
              const budget = calculateTripFinancials(trip);
              return (
                <article
                  key={trip.id}
                  className="palace-card overflow-hidden rounded-3xl sm:flex group transition hover:border-[#dfbe88]/50"
                >
                  <img
                    src={trip.coverPhoto}
                    alt={trip.name}
                    className="h-44 w-full object-cover sm:h-auto sm:w-48 group-hover:scale-105 transition-transform duration-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1 p-6 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#c5a880]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#dfbe88] border border-[#c5a880]/30">
                          {trip.stops.length} Stops
                        </span>
                        <span className="text-xs text-[#b89f7a] font-medium">
                          {formatTripDates(trip.startDate, trip.endDate)}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate text-xl font-serif font-bold text-white">{trip.name}</h3>
                      <p className="mt-1 line-clamp-1 text-xs text-[#d6cbbe] font-light">{trip.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#c5a880]/15">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#dfbe88]">
                        <WalletCards size={16} className="text-[#dfbe88]" />
                        ${budget.totalCost.toLocaleString()} est.
                      </span>
                      <button
                        onClick={() => {
                          onSelectTrip(trip.id);
                          onNavigate('itinerary-builder');
                        }}
                        className="gold-btn px-4 py-2 text-xs shrink-0 cursor-pointer"
                      >
                        Open Voyage
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="palace-card rounded-3xl p-7 text-white shadow-xl space-y-6 flex flex-col justify-between border border-[#c5a880]/30">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#dfbe88]">Curated Excellence</p>
            <h2 className="text-2xl font-serif font-bold leading-tight">Everything for an Unforgettable Journey.</h2>

            <div className="space-y-5 pt-2">
              {[
                [Route, 'Multi-Palace Routing', 'Sequence stays across luxury palace hotels and global cities in one timeline.'],
                [CalendarDays, 'Day-by-Day Timeline', 'Schedule dining, spa rituals, and cultural tours with time slots.'],
                [WalletCards, 'Automated Cost Ledger', 'Track stays, flights, and activity expenses in live real-time currency.'],
              ].map(([Icon, title, description]) => {
                const I = Icon as typeof Route;
                return (
                  <div key={title as string} className="flex gap-3">
                    <span className="mt-1 text-[#dfbe88] shrink-0">
                      <I size={20} />
                    </span>
                    <div>
                      <strong className="block text-sm font-serif font-bold text-white">{title as string}</strong>
                      <small className="mt-0.5 block leading-relaxed text-xs text-[#d6cbbe] font-light">{description as string}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('my-trips')}
            className="gold-btn w-full py-3 text-xs mt-4 cursor-pointer"
          >
            <span>Manage My Voyages</span>
            <ArrowRight size={16} />
          </button>
        </aside>
      </section>

      {/* Popular Destinations Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-end justify-between border-b border-[#c5a880]/20 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#dfbe88]">Signature Stays & Palaces</p>
            <h2 className="mt-1 text-2xl font-serif font-bold text-white">Popular Destinations</h2>
          </div>
          <button
            onClick={() => onNavigate('city-search')}
            className="text-xs font-bold text-[#dfbe88] hover:text-white uppercase tracking-wider transition cursor-pointer"
          >
            Browse all destinations
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {ideas.map((city) => (
            <article key={city.id} className="palace-card overflow-hidden rounded-3xl flex flex-col justify-between group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090807]/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-bold text-[#dfbe88] uppercase tracking-wider bg-[#090807]/80 px-2 py-0.5 rounded-md border border-[#c5a880]/30 backdrop-blur-xs">
                    {city.country}
                  </span>
                  <h3 className="mt-1 text-xl font-serif font-bold text-white leading-tight">{city.name}</h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="line-clamp-2 text-xs leading-relaxed text-[#d6cbbe] font-light">{city.description}</p>
                <div className="pt-3 border-t border-[#c5a880]/15 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#b89f7a]">Est. Daily:</span>
                  <span className="text-[#dfbe88] font-serif font-bold">${city.avgDailyCost}/day</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAddCityToTripModal(city)}
                    className="gold-btn flex-1 py-2 text-xs shrink-0 cursor-pointer"
                  >
                    Add to Voyage
                  </button>
                  <button
                    onClick={() => onToggleSaveCity(city.id)}
                    className="gold-outline-btn px-3 py-2 text-xs shrink-0 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-7xl border-t border-[#c5a880]/20 px-4 py-8 text-center text-xs text-[#b89f7a] sm:px-6 lg:px-10 font-light">
        © 2026 The Leela Palaces, Hotels and Resorts & GlobeTrotter Voyage Curator. All rights reserved.
      </footer>
    </main>
  );
}
