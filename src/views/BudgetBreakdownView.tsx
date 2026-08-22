import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Crown,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Trip, ViewType } from '../types';
import { calculateTripFinancials, formatTripDates } from '../utils/tripHelpers';

interface BudgetBreakdownViewProps {
  trip: Trip | null;
  onUpdateDailyBudget: (tripId: string, newDailyBudget: number) => void;
  onNavigate: (view: ViewType) => void;
}

export const BudgetBreakdownView: React.FC<BudgetBreakdownViewProps> = ({
  trip,
  onUpdateDailyBudget,
  onNavigate,
}) => {
  const [customDailyBudget, setCustomDailyBudget] = useState<number>(
    trip ? trip.dailyBudget || 450 : 450
  );

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 text-white">
        <h2 className="text-xl font-serif font-bold text-white">No voyage selected for budget review</h2>
        <button
          onClick={() => onNavigate('my-trips')}
          className="gold-btn px-5 py-2.5 text-xs"
        >
          Select a Voyage
        </button>
      </div>
    );
  }

  const financials = calculateTripFinancials({
    ...trip,
    dailyBudget: customDailyBudget,
  });

  const handleBudgetSliderChange = (newVal: number) => {
    setCustomDailyBudget(newVal);
    onUpdateDailyBudget(trip.id, newVal);
  };

  const stopBarData = financials.stopCosts.map((sc) => ({
    name: sc.cityName,
    Accommodation: sc.stayCost,
    Activities: sc.activitiesCost,
    Total: sc.total,
  }));

  const COLORS = ['#dfbe88', '#b89658', '#e5c992', '#8c734b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-white">
      {/* Header Banner */}
      <div className="palace-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              Financial Ledger & Budget Planner
            </span>
            <span className="text-xs text-[#b89f7a]">•</span>
            <span className="text-xs text-[#d6cbbe] font-medium">
              {formatTripDates(trip.startDate, trip.endDate)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            {trip.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#d6cbbe] font-light">
            Real-time automatic tabulation of palace suites, transit, fine dining, and experiences.
          </p>
        </div>

        <button
          onClick={() => onNavigate('itinerary-builder')}
          className="gold-btn px-5 py-2.5 text-xs shrink-0 cursor-pointer"
        >
          Open Itinerary Builder
        </button>
      </div>

      {/* Target Daily Budget Slider Card */}
      <div className="palace-card rounded-3xl p-6 text-white border border-[#c5a880]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-lg">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#dfbe88]" />
            <h3 className="text-base font-serif font-bold text-white">Adjust Target Daily Budget</h3>
          </div>
          <p className="text-xs text-[#d6cbbe] font-light">
            Slide to adjust your daily spending target. Over-budget alerts and destination warnings update dynamically.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto bg-[#17130f] border border-[#c5a880]/30 p-3.5 rounded-2xl backdrop-blur-md">
          <span className="text-xs text-[#b89f7a] font-medium">Daily Limit:</span>
          <span className="text-xl font-serif font-bold text-[#dfbe88] w-16">${customDailyBudget}</span>
          <input
            id="daily-budget-slider"
            type="range"
            min="100"
            max="1000"
            step="25"
            value={customDailyBudget}
            onChange={(e) => handleBudgetSliderChange(Number(e.target.value))}
            className="w-36 sm:w-48 accent-[#dfbe88] cursor-pointer"
          />
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="palace-card rounded-2xl p-5 shadow-lg">
          <p className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest">
            Total Estimated Cost
          </p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            ${financials.totalCost.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#d6cbbe] font-light mt-1">
            Across {financials.totalDays} days of travel
          </p>
        </div>

        {/* Target Budget */}
        <div className="palace-card rounded-2xl p-5 shadow-lg">
          <p className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest">
            Total Target Budget
          </p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#dfbe88] mt-1">
            ${financials.totalBudget.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#d6cbbe] font-light mt-1">
            ${customDailyBudget}/day × {financials.totalDays} days
          </p>
        </div>

        {/* Avg Daily Cost */}
        <div className="palace-card rounded-2xl p-5 shadow-lg">
          <p className="text-[10px] font-bold text-[#b89f7a] uppercase tracking-widest">
            Avg Cost Per Day
          </p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            ${financials.avgDailyCost}
          </p>
          <p
            className={`text-[11px] font-bold mt-1 ${
              financials.avgDailyCost > customDailyBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {financials.avgDailyCost > customDailyBudget
              ? `+$${financials.avgDailyCost - customDailyBudget} over target`
              : `-$${customDailyBudget - financials.avgDailyCost} within target`}
          </p>
        </div>

        {/* Over/Under Status */}
        <div
          className={`rounded-2xl border p-5 shadow-lg ${
            financials.isOverBudget
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Budget Status</p>
          <div className="flex items-center gap-2 mt-1">
            {financials.isOverBudget ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-lg font-serif font-bold text-amber-300">
                  Over by ${Math.abs(financials.budgetDelta).toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-lg font-serif font-bold text-emerald-300">
                  Under by ${financials.budgetDelta.toLocaleString()}
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-[#d6cbbe] font-light mt-1">
            {financials.isOverBudget
              ? 'Consider adjusting suite tiers or experiences'
              : 'Your itinerary fits comfortably within target budget'}
          </p>
        </div>
      </div>

      {/* Visual Alerts for Over-budget Days */}
      {financials.overBudgetDays.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Over-Budget City Stop Alerts ({financials.overBudgetDays.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {financials.overBudgetDays.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#17130f] rounded-xl border border-amber-500/20 text-xs flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-white">{alert.cityName}</p>
                  <p className="text-[11px] text-[#b89f7a]">{alert.date}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-400">${alert.cost}/day</span>
                  <span className="text-[10px] text-[#b89f7a] block">target ${alert.threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Data Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Category Breakdown */}
        <div className="palace-card rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-white">Cost by Category</h3>
              <p className="text-xs text-[#b89f7a]">Distribution of expenditures</p>
            </div>
            <PieChartIcon className="w-5 h-5 text-[#dfbe88]" />
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financials.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {financials.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#120f0c',
                    borderColor: 'rgba(197, 168, 128, 0.3)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs font-medium text-[#d6cbbe]">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quick numbers list */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#c5a880]/15 text-xs">
            {financials.categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#17130f] border border-[#c5a880]/20">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  <span className="text-[#d6cbbe] truncate">{cat.name}</span>
                </div>
                <span className="font-serif font-bold text-[#dfbe88]">${cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Per-City Expense Breakdown */}
        <div className="palace-card rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-white">Per-Stop Spending Comparison</h3>
              <p className="text-xs text-[#b89f7a]">Suite Stay vs Experiences per destination</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#dfbe88]" />
          </div>

          <div className="h-64 sm:h-72 w-full">
            {stopBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#b89f7a]">
                No stops added to compare.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stopBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(197,168,128,0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#b89f7a' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#b89f7a' }} />
                  <Tooltip
                    formatter={(val: any) => [`$${val}`, '']}
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: '#120f0c',
                      borderColor: 'rgba(197, 168, 128, 0.3)',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(val) => (
                      <span className="text-xs font-medium text-[#d6cbbe]">{val}</span>
                    )}
                  />
                  <Bar dataKey="Accommodation" fill="#dfbe88" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Activities" fill="#b89658" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="text-[11px] text-[#b89f7a] text-center pt-2 border-t border-[#c5a880]/15 font-light">
            Compare destination costs to optimize duration in higher or lower cost locations.
          </p>
        </div>
      </div>

      {/* Summary Cost Table */}
      <div className="palace-card rounded-3xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-[#c5a880]/20">
          <h3 className="text-base font-serif font-bold text-white">Destination Cost Breakdown Summary</h3>
          <p className="text-xs text-[#b89f7a]">Detailed line items per stop in your voyage</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17130f] text-[#b89f7a] font-serif font-bold uppercase tracking-wider border-b border-[#c5a880]/20">
              <tr>
                <th className="py-3 px-5">Palace Stop</th>
                <th className="py-3 px-5">Suite Cost</th>
                <th className="py-3 px-5">Experiences Total</th>
                <th className="py-3 px-5 text-right">Total Estimated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5a880]/15 text-[#f7f3ed] font-medium">
              {financials.stopCosts.map((stop, i) => (
                <tr key={i} className="hover:bg-[#c5a880]/10 transition-colors">
                  <td className="py-3.5 px-5 font-serif font-bold text-white">{stop.cityName}</td>
                  <td className="py-3.5 px-5">${stop.stayCost.toLocaleString()}</td>
                  <td className="py-3.5 px-5">${stop.activitiesCost.toLocaleString()}</td>
                  <td className="py-3.5 px-5 text-right font-serif font-bold text-[#dfbe88]">
                    ${stop.total.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#17130f] font-semibold">
                <td className="py-3.5 px-5 text-white font-serif">Transfers & Airfare</td>
                <td colSpan={2} className="py-3.5 px-5 text-[#b89f7a] font-light">
                  Flights & Private Luxury Transfers
                </td>
                <td className="py-3.5 px-5 text-right font-serif font-bold text-[#dfbe88]">
                  ${financials.transportTotal.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-[#17130f] font-semibold">
                <td className="py-3.5 px-5 text-white font-serif">Royal Fine Dining Allowance</td>
                <td colSpan={2} className="py-3.5 px-5 text-[#b89f7a] font-light">
                  Estimated $90/day dining allocation
                </td>
                <td className="py-3.5 px-5 text-right font-serif font-bold text-[#dfbe88]">
                  ${financials.mealsTotal.toLocaleString()}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-[#17130f] font-bold text-white border-t border-[#c5a880]/20">
              <tr>
                <td className="py-4 px-5 text-sm font-serif" colSpan={3}>
                  Grand Total Estimated
                </td>
                <td className="py-4 px-5 text-right text-lg font-serif text-[#dfbe88]">
                  ${financials.totalCost.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
