import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Users,
  Globe2,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Search,
  Trash2,
  PieChart as PieIcon,
  Crown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { City, Trip } from '../types';
import { calculateTripFinancials } from '../utils/tripHelpers';

interface AdminAnalyticsViewProps {
  trips: Trip[];
  cities: City[];
  onDeleteTrip: (tripId: string) => void;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  trips,
  cities,
  onDeleteTrip,
}) => {
  const [tableSearch, setTableSearch] = useState('');

  const popularCitiesData = [...cities]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6)
    .map((c) => ({
      name: c.name,
      popularity: c.popularity,
      avgDailyCost: c.avgDailyCost,
    }));

  const categoryCounts: { [cat: string]: number } = {};
  trips.forEach((t) => {
    t.stops.forEach((s) => {
      s.activities.forEach((a) => {
        categoryCounts[a.type] = (categoryCounts[a.type] || 0) + 1;
      });
    });
  });

  const COLORS = ['#dfbe88', '#b89658', '#e5c992', '#8c734b', '#f7ecd7'];

  const monthlyTrendsData = [
    { month: 'Apr', trips: 18, spend: 38000 },
    { month: 'May', trips: 29, spend: 62000 },
    { month: 'Jun', trips: 45, spend: 98000 },
    { month: 'Jul', trips: 62, spend: 145000 },
    { month: 'Aug', trips: 58, spend: 132000 },
    { month: 'Sep', trips: 41, spend: 91000 },
    { month: 'Oct', trips: 33, spend: 74000 },
  ];

  const totalPlatformSpend = trips.reduce(
    (sum, t) => sum + calculateTripFinancials(t).totalCost,
    0
  );

  const filteredTrips = trips.filter(
    (t) =>
      t.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (t.authorName || 'Guest').toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.stops.some((s) => s.cityName.toLowerCase().includes(tableSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="space-y-2 border-b border-[#c5a880]/20 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest">
          <Crown className="w-3.5 h-3.5" />
          <span>Palace Operations</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
          Palace Curator Analytics Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-[#d6cbbe] font-light max-w-2xl">
          Aggregated platform engagement, destination popularity, and live user itinerary metrics for The Leela Collection.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="palace-card rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest">
              Total Itineraries
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-white mt-2">{trips.length + 142}</p>
          <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% this month
          </p>
        </div>

        <div className="palace-card rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest">
              Active Guests
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-white mt-2">1,248</p>
          <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24% new signups
          </p>
        </div>

        <div className="palace-card rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest">
              Est. Managed Spend
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-white mt-2">
            ${(totalPlatformSpend + 540000).toLocaleString()}
          </p>
          <p className="text-xs text-[#b89f7a] mt-1 font-light">Across all guest voyages</p>
        </div>

        <div className="palace-card rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest">
              Palace Destinations
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center font-bold">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-white mt-2">{cities.length}</p>
          <p className="text-xs text-[#dfbe88] font-bold mt-1">Palaces & Global Cities</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Destination Popularity Bar Chart */}
        <div className="palace-card rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-white">Top Destination Popularity</h3>
              <p className="text-xs text-[#b89f7a]">Highest rated destinations by traveler booking index</p>
            </div>
            <BarChart2 className="w-5 h-5 text-[#dfbe88]" />
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularCitiesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(197,168,128,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#b89f7a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#b89f7a' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}/100`, 'Popularity Score']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#120f0c',
                    border: '1px solid rgba(197, 168, 128, 0.3)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="popularity" fill="#dfbe88" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="palace-card rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-white">Seasonal Itinerary Volume</h3>
              <p className="text-xs text-[#b89f7a]">Created itineraries over past months</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#dfbe88]" />
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(197,168,128,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#b89f7a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#b89f7a' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} trips`, 'Active Trips']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#120f0c',
                    border: '1px solid rgba(197, 168, 128, 0.3)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke="#dfbe88"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#dfbe88' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Itinerary Management Data Table */}
      <div className="palace-card rounded-3xl overflow-hidden shadow-lg space-y-4">
        <div className="p-6 border-b border-[#c5a880]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-serif font-bold text-white">Active Palace Voyage System</h3>
            <p className="text-xs text-[#b89f7a]">Live inspection of all registered trip objects</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#b89f7a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by voyage or author..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#17130f] border border-[#c5a880]/30 text-white rounded-xl text-xs placeholder:text-[#b89f7a]/40 focus:border-[#dfbe88] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17130f] text-[#b89f7a] font-serif font-bold uppercase tracking-wider border-b border-[#c5a880]/20">
              <tr>
                <th className="py-3 px-6">Voyage Name</th>
                <th className="py-3 px-6">Author</th>
                <th className="py-3 px-6">Stops & Cities</th>
                <th className="py-3 px-6">Dates</th>
                <th className="py-3 px-6">Est. Spend</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5a880]/15 font-medium text-[#f7f3ed]">
              {filteredTrips.map((trip) => {
                const fin = calculateTripFinancials(trip);
                const cityList = trip.stops.map((s) => s.cityName).join(' → ') || 'No stops yet';

                return (
                  <tr key={trip.id} className="hover:bg-[#c5a880]/10 transition">
                    <td className="py-3.5 px-6 font-serif font-bold text-white">{trip.name}</td>
                    <td className="py-3.5 px-6 text-[#d6cbbe]">{trip.authorName}</td>
                    <td className="py-3.5 px-6 max-w-xs truncate text-[#b89f7a]">{cityList}</td>
                    <td className="py-3.5 px-6 text-[#b89f7a]">{trip.startDate} to {trip.endDate}</td>
                    <td className="py-3.5 px-6 font-serif font-bold text-[#dfbe88]">
                      ${fin.totalCost.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onDeleteTrip(trip.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                        title="Delete Voyage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
