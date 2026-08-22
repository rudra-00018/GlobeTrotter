import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  DollarSign,
  TrendingUp,
  Bookmark,
  PlusCircle,
  Filter,
  Check,
  Building,
  Crown,
} from 'lucide-react';
import { City, Trip, User, ViewType } from '../types';

interface CitySearchViewProps {
  cities: City[];
  trips: Trip[];
  activeTripId: string | null;
  user: User | null;
  onToggleSaveCity: (cityId: string) => void;
  onAddCityToTripModal: (city: City) => void;
  onNavigate: (view: ViewType) => void;
}

export const CitySearchView: React.FC<CitySearchViewProps> = ({
  cities,
  trips,
  activeTripId,
  user,
  onToggleSaveCity,
  onAddCityToTripModal,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCostIndex, setSelectedCostIndex] = useState<number | 'All'>('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'cost-asc' | 'cost-desc' | 'name'>('popularity');

  const regions = ['All', 'Europe', 'Asia', 'Americas', 'Africa & Middle East', 'Oceania'];

  const filteredCities = cities
    .filter((city) => {
      const matchesSearch =
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.topAttractions.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
      const matchesCost = selectedCostIndex === 'All' || city.costIndex === selectedCostIndex;

      return matchesSearch && matchesRegion && matchesCost;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      if (sortBy === 'cost-asc') return a.avgDailyCost - b.avgDailyCost;
      if (sortBy === 'cost-desc') return b.avgDailyCost - a.avgDailyCost;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="space-y-2 border-b border-[#c5a880]/20 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-[#dfbe88]" />
            Destination Directory
          </span>
          <span className="text-xs text-[#b89f7a]">•</span>
          <span className="text-xs text-[#d6cbbe] font-medium">{cities.length} Signature Destinations</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
          Discover Palaces & Global Destinations
        </h1>
        <p className="text-xs sm:text-sm text-[#d6cbbe] font-light max-w-2xl">
          Explore curated palace resorts and iconic global cities with verified daily cost estimates and signature attractions.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="palace-card rounded-3xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#b89f7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="city-search-input"
              type="text"
              placeholder="Search by palace name, city, country, or attraction (e.g. Udaipur, Paris, Jamavar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-xs sm:text-sm text-white placeholder:text-[#b89f7a]/50 focus:outline-hidden focus:border-[#dfbe88] transition"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <span className="text-xs font-semibold text-[#b89f7a] whitespace-nowrap">Sort by:</span>
            <select
              id="city-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-auto text-xs font-semibold bg-[#17130f] border border-[#c5a880]/30 text-white rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-[#dfbe88]"
            >
              <option value="popularity" className="bg-[#120f0c]">Most Popular</option>
              <option value="cost-asc" className="bg-[#120f0c]">Cost: Low to High</option>
              <option value="cost-desc" className="bg-[#120f0c]">Cost: High to Low</option>
              <option value="name" className="bg-[#120f0c]">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Region Pills (Horizontal Scroll Container - No Wrap Overlap) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs max-w-full">
          <span className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest shrink-0 mr-1">
            Region:
          </span>
          {regions.map((region) => (
            <button
              key={region}
              id={`filter-region-${region.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedRegion(region)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedRegion === region
                  ? 'bg-[#dfbe88] text-[#14100b] shadow-xs'
                  : 'bg-[#17130f] border border-[#c5a880]/25 text-[#d6cbbe] hover:text-white'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Cost Index Pills */}
        <div className="flex items-center gap-2 text-xs pt-2 border-t border-[#c5a880]/15 flex-wrap">
          <span className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest">
            Cost Tier:
          </span>
          <button
            onClick={() => setSelectedCostIndex('All')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              selectedCostIndex === 'All' ? 'bg-[#dfbe88] text-[#14100b]' : 'bg-[#17130f] border border-[#c5a880]/25 text-[#d6cbbe] hover:text-white'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5].map((idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCostIndex(idx)}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedCostIndex === idx ? 'bg-[#dfbe88] text-[#14100b]' : 'bg-[#17130f] border border-[#c5a880]/25 text-[#d6cbbe] hover:text-white'
              }`}
            >
              {'$'.repeat(idx)}
            </button>
          ))}
        </div>
      </div>

      {/* City Cards Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-[#b89f7a] px-1">
          <span>
            Found <strong className="text-white font-serif">{filteredCities.length}</strong> destination cities
          </span>
        </div>

        {filteredCities.length === 0 ? (
          <div className="palace-card rounded-3xl p-12 text-center space-y-3">
            <p className="text-[#d6cbbe] text-sm font-light">No destinations match your filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('All');
                setSelectedCostIndex('All');
              }}
              className="gold-btn px-5 py-2 text-xs mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => {
              const isSaved = user?.savedDestinations.includes(city.id);

              return (
                <div
                  key={city.id}
                  className="palace-card rounded-3xl overflow-hidden flex flex-col group transition hover:border-[#dfbe88]/50"
                >
                  {/* City Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090807]/90 via-black/30 to-transparent"></div>

                    {/* Bookmark */}
                    <button
                      id={`city-bookmark-${city.id}`}
                      onClick={() => onToggleSaveCity(city.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition border border-[#c5a880]/30 cursor-pointer ${
                        isSaved
                          ? 'bg-[#dfbe88] text-[#14100b] shadow-md'
                          : 'bg-[#090807]/70 text-[#d6cbbe] hover:text-white hover:bg-[#090807]'
                      }`}
                      title={isSaved ? 'Saved to Profile' : 'Save Destination'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#090807]/80 text-[#dfbe88] px-2.5 py-0.5 rounded-md border border-[#c5a880]/30 backdrop-blur-xs">
                          {city.country}
                        </span>
                        <span className="text-[10px] font-semibold text-[#d6cbbe]">
                          {city.weather}
                        </span>
                      </div>
                      <h2 className="text-xl font-serif font-bold leading-tight mt-1 text-[#faf7f2]">
                        {city.name}
                      </h2>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-[#d6cbbe] line-clamp-3 leading-relaxed font-light">
                      {city.description}
                    </p>

                    {/* Top Attractions Tags */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest block">
                        Signature Highlights:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {city.topAttractions.slice(0, 4).map((attr) => (
                          <span
                            key={attr}
                            className="text-[10px] font-medium bg-[#17130f] border border-[#c5a880]/20 text-[#e5dfd5] px-2 py-0.5 rounded-md"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="pt-3 border-t border-[#c5a880]/15 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#b89f7a] uppercase block">Cost Index</span>
                        <span className="font-serif font-bold text-[#dfbe88]">
                          {'$'.repeat(city.costIndex)}
                          <span className="text-[#b89f7a]/30">{'$'.repeat(5 - city.costIndex)}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#b89f7a] uppercase block">Avg Daily Cost</span>
                        <span className="font-serif font-bold text-sm text-[#faf7f2]">${city.avgDailyCost}/day</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      id={`add-city-btn-${city.id}`}
                      onClick={() => onAddCityToTripModal(city)}
                      className="gold-btn w-full py-2.5 text-xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add to Voyage</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
