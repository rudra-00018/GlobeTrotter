import { ActivityCategory, Stop, Trip } from '../types';

export function calculateDateDifferenceDays(startStr?: string, endStr?: string): number {
  if (!startStr || !endStr) return 1;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function formatTripDates(startStr?: string, endStr?: string): string {
  if (!startStr || !endStr) return 'Dates flexible';
  try {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const yearOptions: Intl.DateTimeFormatOptions = { year: 'numeric' };
    return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}, ${e.toLocaleDateString('en-US', yearOptions)}`;
  } catch {
    return `${startStr} to ${endStr}`;
  }
}

export function formatSingleDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export interface TripFinancials {
  totalDays: number;
  transportTotal: number;
  accommodationTotal: number;
  activitiesTotal: number;
  mealsTotal: number;
  totalCost: number;
  totalBudget: number;
  dailyBudget: number;
  avgDailyCost: number;
  isOverBudget: boolean;
  budgetDelta: number; // positive = under budget, negative = over budget
  overBudgetDays: { date: string; cost: number; threshold: number; cityName: string }[];
  stopCosts: { cityName: string; stayCost: number; activitiesCost: number; total: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
}

export function calculateTripFinancials(trip: Trip): TripFinancials {
  const totalDays = calculateDateDifferenceDays(trip.startDate, trip.endDate);
  const totalBudget = (trip.dailyBudget || 180) * totalDays;

  // Transport calculation: base trip transport + sum of stop transfers
  const stopTransfers = trip.stops.reduce((acc, stop) => acc + (stop.transportToNextCost || 0), 0);
  const transportTotal = (trip.transportCost || 0) + stopTransfers;

  // Accommodation calculation
  let accommodationTotal = 0;
  const stopCosts: { cityName: string; stayCost: number; activitiesCost: number; total: number }[] = [];

  trip.stops.forEach((stop) => {
    const stopNights = calculateDateDifferenceDays(stop.startDate, stop.endDate);
    const perNight = stop.stayCostPerNight || trip.stayCostPerNight || 120;
    const stayCost = stopNights * perNight;
    accommodationTotal += stayCost;

    const activitiesCost = stop.activities.reduce((sum, act) => sum + (act.cost || 0), 0);
    stopCosts.push({
      cityName: stop.cityName,
      stayCost,
      activitiesCost,
      total: stayCost + activitiesCost,
    });
  });

  // Activities calculation across all stops
  const activitiesTotal = trip.stops.reduce((sum, stop) => {
    return sum + stop.activities.reduce((actSum, act) => actSum + (act.cost || 0), 0);
  }, 0);

  // Meals calculation (approx $45/day per person default estimate)
  const mealsTotal = totalDays * 45;

  const totalCost = transportTotal + accommodationTotal + activitiesTotal + mealsTotal;
  const avgDailyCost = Math.round(totalCost / totalDays);
  const isOverBudget = totalCost > totalBudget;
  const budgetDelta = totalBudget - totalCost;

  // Over budget day estimation based on stop days + scheduled activities
  const overBudgetDays: { date: string; cost: number; threshold: number; cityName: string }[] = [];
  const dailyThreshold = trip.dailyBudget || 180;

  // Check stops
  trip.stops.forEach((stop) => {
    const nights = calculateDateDifferenceDays(stop.startDate, stop.endDate);
    const dayStay = stop.stayCostPerNight || trip.stayCostPerNight || 120;
    const stopActTotal = stop.activities.reduce((s, a) => s + (a.cost || 0), 0);
    const avgDayAct = stopActTotal / nights;
    const estimatedDayCost = dayStay + avgDayAct + 45;

    if (estimatedDayCost > dailyThreshold) {
      overBudgetDays.push({
        date: `${stop.startDate} (${nights}d)`,
        cost: Math.round(estimatedDayCost),
        threshold: dailyThreshold,
        cityName: stop.cityName,
      });
    }
  });

  const categoryBreakdown = [
    { name: 'Accommodation', value: accommodationTotal, color: '#0ea5e9' }, // sky-500
    { name: 'Transport', value: transportTotal, color: '#f97316' }, // orange-500
    { name: 'Activities & Tours', value: activitiesTotal, color: '#10b981' }, // emerald-500
    { name: 'Meals & Food', value: mealsTotal, color: '#8b5cf6' }, // violet-500
  ];

  return {
    totalDays,
    transportTotal,
    accommodationTotal,
    activitiesTotal,
    mealsTotal,
    totalCost,
    totalBudget,
    dailyBudget: trip.dailyBudget || 180,
    avgDailyCost,
    isOverBudget,
    budgetDelta,
    overBudgetDays,
    stopCosts,
    categoryBreakdown,
  };
}

export function getActivityCategoryBadge(category: ActivityCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'Sightseeing':
      return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'Food & Culinary':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Adventure & Nature':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Culture & Arts':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'Relaxation':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    case 'Nightlife':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
