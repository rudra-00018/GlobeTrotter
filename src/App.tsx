import { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Activity, City, Stop, ToastMessage, Trip, User, ViewType } from './types';
import { DEFAULT_USER, MOCK_ACTIVITIES, MOCK_CITIES, SEED_TRIPS } from './data/mockData';
import { activityService, adminService, authService, cityService, tripService } from './services';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/NotificationToast';
import { TravelHomeView } from './views/TravelHomeView';
import { MyTripsView } from './views/MyTripsView';
import { CreateTripModal } from './views/CreateTripModal';
import { ItineraryBuilderView } from './views/ItineraryBuilderView';
import { ItineraryView } from './views/ItineraryView';
import { CitySearchView } from './views/CitySearchView';
import { ActivitySearchView } from './views/ActivitySearchView';
import { BudgetBreakdownView } from './views/BudgetBreakdownView';
import { CalendarTimelineView } from './views/CalendarTimelineView';
import { PublicShareView } from './views/PublicShareView';
import { ProfileSettingsView } from './views/ProfileSettingsView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';
import { AuthView } from './views/AuthView';
import { AITripGeneratorModal } from './views/AITripGeneratorModal';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('globetrotter_user') || 'null'); } catch { return null; }
  });
  const [trips, setTrips] = useState<Trip[]>(() => {
    try { return JSON.parse(localStorage.getItem('globetrotter_trips') || JSON.stringify(SEED_TRIPS)); } catch { return clone(SEED_TRIPS); }
  });
  const [cities, setCities] = useState<City[]>(clone(MOCK_CITIES));
  const [activities, setActivities] = useState<Activity[]>(clone(MOCK_ACTIVITIES));
  const [activeTripId, setActiveTripId] = useState<string | null>(() => localStorage.getItem('globetrotter_active_trip') || SEED_TRIPS[0]?.id || null);
  const [currentView, setCurrentView] = useState<ViewType>(() => (user ? 'dashboard' : 'auth'));
  const [backendConnected, setBackendConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [cityToAdd, setCityToAdd] = useState<City | null>(null);
  const [cityDates, setCityDates] = useState({ start: '', end: '' });

  const activeTrip = useMemo(() => trips.find((trip) => trip.id === activeTripId) || trips[0] || null, [trips, activeTripId]);
  const notify = useCallback((title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    setToasts((items) => [...items, { id: `${Date.now()}-${Math.random()}`, title, message, type }]);
  }, []);
  const replaceTrip = (updated: Trip) => setTrips((items) => items.map((trip) => trip.id === updated.id ? updated : trip));

  useEffect(() => { try { localStorage.setItem('globetrotter_trips', JSON.stringify(trips)); } catch {} }, [trips]);
  useEffect(() => { try { user ? localStorage.setItem('globetrotter_user', JSON.stringify(user)) : localStorage.removeItem('globetrotter_user'); } catch {} }, [user]);
  useEffect(() => { if (activeTripId) localStorage.setItem('globetrotter_active_trip', activeTripId); }, [activeTripId]);

  useEffect(() => {
    let mounted = true;
    Promise.all([adminService.checkHealth(), cityService.getCities(), activityService.getActivities(), tripService.getTrips()])
      .then(([health, fetchedCities, fetchedActivities, fetchedTrips]) => {
        if (!mounted) return;
        setBackendConnected(health.status === 'ok');
        if (fetchedCities.length) setCities(fetchedCities);
        if (fetchedActivities.length) setActivities(fetchedActivities);
        if (fetchedTrips.length) setTrips(fetchedTrips);
      })
      .catch(() => mounted && setBackendConnected(false));
    return () => { mounted = false; };
  }, []);

  const handleLogin = (nextUser: User) => { setUser(nextUser); setCurrentView('dashboard'); notify('Welcome to GlobeTrotter', 'Your travel workspace is ready.'); };
  const handleLogout = async () => { await authService.logout(); setUser(null); setCurrentView('auth'); notify('Signed out', 'Your local trip workspace remains available when you return.', 'info'); };
  const openCreate = () => { setEditingTrip(null); setCreateOpen(true); };
  const handleSaveTrip = async (data: Omit<Trip, 'id' | 'createdAt' | 'authorName'>) => {
    if (editingTrip) {
      const fallback = { ...editingTrip, ...data };
      const updated = await tripService.updateTrip(editingTrip.id, data).catch(() => fallback);
      replaceTrip(updated); notify('Trip updated', `${updated.name} has been saved.`);
    } else {
      const fallback: Trip = { ...data, id: `trip-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), authorId: user?.id, authorName: user?.name || 'Traveler' };
      const created = await tripService.createTrip({ ...data, authorId: user?.id, authorName: user?.name || 'Traveler' }).catch(() => fallback);
      setTrips((items) => [created, ...items]); setActiveTripId(created.id); setCurrentView('itinerary-builder'); notify('Journey created', 'Add cities, dates and activities to start building your itinerary.');
    }
    setEditingTrip(null); setCreateOpen(false);
  };
  const handleDeleteTrip = async (id: string) => {
    const target = trips.find((trip) => trip.id === id);
    await tripService.deleteTrip(id).catch(() => true);
    setTrips((items) => items.filter((trip) => trip.id !== id));
    if (activeTripId === id) setActiveTripId(trips.find((trip) => trip.id !== id)?.id || null);
    notify('Trip deleted', `${target?.name || 'Journey'} was removed.`, 'info');
  };
  const handleDuplicate = async (trip: Trip) => {
    const fallback: Trip = { ...clone(trip), id: `trip-${Date.now()}`, name: `${trip.name} (Copy)`, createdAt: new Date().toISOString().slice(0, 10) };
    const created = await tripService.duplicateTrip(trip.id).catch(() => fallback);
    setTrips((items) => [created, ...items]); setActiveTripId(created.id); notify('Trip copied', 'You can now personalize the copied itinerary.');
  };
  const mutateTrip = async (id: string, action: () => Promise<Trip>, fallback: (trip: Trip) => Trip) => {
    const local = trips.find((trip) => trip.id === id); if (!local) return;
    const updated = await action().catch(() => fallback(local)); replaceTrip(updated);
  };
  const addStop = (tripId: string, data: Omit<Stop, 'id' | 'order' | 'activities'>) => mutateTrip(tripId, () => tripService.addStop(tripId, data), (trip) => ({ ...trip, stops: [...trip.stops, { ...data, id: `stop-${Date.now()}`, order: trip.stops.length + 1, activities: [] }] }));
  const removeStop = (tripId: string, stopId: string) => mutateTrip(tripId, () => tripService.deleteStop(tripId, stopId), (trip) => ({ ...trip, stops: trip.stops.filter((stop) => stop.id !== stopId).map((stop, index) => ({ ...stop, order: index + 1 })) }));
  const reorderStop = (tripId: string, index: number, direction: 'up' | 'down') => mutateTrip(tripId, () => tripService.reorderStops(tripId, index, direction), (trip) => { const stops = [...trip.stops]; const next = direction === 'up' ? index - 1 : index + 1; if (next >= 0 && next < stops.length) [stops[index], stops[next]] = [stops[next], stops[index]]; return { ...trip, stops: stops.map((stop, order) => ({ ...stop, order: order + 1 })) }; });
  const addActivity = (tripId: string, stopId: string, activity: Activity) => mutateTrip(tripId, () => tripService.addActivityToStop(tripId, stopId, activity), (trip) => ({ ...trip, stops: trip.stops.map((stop) => stop.id === stopId ? { ...stop, activities: [...stop.activities, activity] } : stop) }));
  const removeActivity = (tripId: string, stopId: string, activityId: string) => mutateTrip(tripId, () => tripService.removeActivityFromStop(tripId, stopId, activityId), (trip) => ({ ...trip, stops: trip.stops.map((stop) => stop.id === stopId ? { ...stop, activities: stop.activities.filter((activity) => activity.id !== activityId) } : stop) }));
  const reorderActivity = (tripId: string, stopId: string, index: number, direction: 'up' | 'down') => mutateTrip(tripId, () => tripService.reorderActivities(tripId, stopId, index, direction), (trip) => ({ ...trip, stops: trip.stops.map((stop) => { if (stop.id !== stopId) return stop; const items = [...stop.activities]; const next = direction === 'up' ? index - 1 : index + 1; if (next >= 0 && next < items.length) [items[index], items[next]] = [items[next], items[index]]; return { ...stop, activities: items }; }) }));
  const updateDailyBudget = (tripId: string, dailyBudget: number) => mutateTrip(tripId, () => tripService.updateTrip(tripId, { dailyBudget }), (trip) => ({ ...trip, dailyBudget }));
  const toggleSavedCity = async (cityId: string) => {
    if (!user) { setCurrentView('auth'); notify('Sign in to save destinations', 'Create an account to keep your travel inspiration.', 'info'); return; }
    const existing = user.savedDestinations;
    const savedDestinations = await authService.toggleSavedDestination(cityId).catch(() => existing.includes(cityId) ? existing.filter((id) => id !== cityId) : [...existing, cityId]);
    setUser({ ...user, savedDestinations });
  };
  const openAddCity = (city: City) => {
    if (!activeTrip) { openCreate(); notify('Create a trip first', 'You need an active journey before adding a destination.', 'warning'); return; }
    setCityDates({ start: activeTrip.startDate, end: activeTrip.endDate }); setCityToAdd(city);
  };
  const confirmAddCity = () => {
    if (!cityToAdd || !activeTrip) return;
    if (!cityDates.start || !cityDates.end || cityDates.end < cityDates.start) { notify('Choose valid stop dates', 'The stop end date must be after its start date.', 'warning'); return; }
    addStop(activeTrip.id, { cityId: cityToAdd.id, cityName: cityToAdd.name, country: cityToAdd.country, startDate: cityDates.start, endDate: cityDates.end, stayCostPerNight: cityToAdd.avgDailyCost, notes: `Added from destination discovery.` });
    setCityToAdd(null); setCurrentView('itinerary-builder'); notify('Destination added', `${cityToAdd.name} is now a stop on your itinerary.`);
  };
  const updateUser = async (updates: Partial<User>) => { if (!user) return; const updated = await authService.updateProfile(updates).catch(() => ({ ...user, ...updates })); setUser(updated); notify('Profile saved', 'Your travel preferences have been updated.'); };
  const deleteAccount = async () => { await authService.deleteAccount().catch(() => true); setUser(null); setCurrentView('auth'); notify('Account removed', 'Your session has been cleared.', 'info'); };
  const resetSeed = async () => { await adminService.resetSeedData().catch(() => null); setTrips(clone(SEED_TRIPS)); setCities(clone(MOCK_CITIES)); setActivities(clone(MOCK_ACTIVITIES)); setActiveTripId(SEED_TRIPS[0]?.id || null); notify('Demo data restored', 'The starter trips, destinations and activities have been reset.'); };
  const onAiGenerated = (trip: Trip) => { setTrips((items) => [trip, ...items]); setActiveTripId(trip.id); setCurrentView('itinerary-builder'); };

  const content = () => {
    switch (currentView) {
      case 'auth': return <AuthView onLoginSuccess={handleLogin} onCancel={() => setCurrentView('dashboard')} />;
      case 'my-trips': return <MyTripsView trips={trips} onNavigate={setCurrentView} onOpenCreateTrip={openCreate} onOpenAIGenerator={() => setAiOpen(true)} onSelectTrip={setActiveTripId} onEditTrip={(trip) => { setEditingTrip(trip); setCreateOpen(true); }} onDuplicateTrip={handleDuplicate} onDeleteTrip={handleDeleteTrip} onResetSeedData={resetSeed} />;
      case 'itinerary-builder': return <ItineraryBuilderView trip={activeTrip} cities={cities} allActivities={activities} onNavigate={setCurrentView} onAddStop={addStop} onRemoveStop={removeStop} onReorderStop={reorderStop} onAddActivityToStop={addActivity} onRemoveActivityFromStop={removeActivity} onReorderActivity={reorderActivity} onOpenCreateTrip={openCreate} />;
      case 'itinerary-view': return <ItineraryView trip={activeTrip} onNavigate={setCurrentView} onSelectTrip={setActiveTripId} />;
      case 'city-search': return <CitySearchView cities={cities} trips={trips} activeTripId={activeTripId} user={user} onToggleSaveCity={toggleSavedCity} onAddCityToTripModal={openAddCity} onNavigate={setCurrentView} />;
      case 'activity-search': return <ActivitySearchView activities={activities} trips={trips} activeTripId={activeTripId} onAddActivityToStop={addActivity} cities={cities} />;
      case 'budget': return <BudgetBreakdownView trip={activeTrip} onUpdateDailyBudget={updateDailyBudget} onNavigate={setCurrentView} />;
      case 'calendar': return <CalendarTimelineView trip={activeTrip} onNavigate={setCurrentView} onReorderActivity={reorderActivity} onRemoveActivity={removeActivity} />;
      case 'public-share': return <PublicShareView trip={activeTrip} onDuplicateTrip={handleDuplicate} onNavigate={setCurrentView} onShowToast={notify} />;
      case 'profile': return <ProfileSettingsView user={user} cities={cities} onUpdateUser={updateUser} onToggleSaveCity={toggleSavedCity} onResetSeedData={resetSeed} onDeleteAccount={deleteAccount} onNavigate={setCurrentView} onAddCityToTripModal={openAddCity} />;
      case 'admin': return user?.role === 'admin' ? <AdminAnalyticsView trips={trips} cities={cities} onDeleteTrip={handleDeleteTrip} /> : <TravelHomeView user={user} trips={trips} cities={cities} onNavigate={setCurrentView} onOpenCreateTrip={openCreate} onOpenAIGenerator={() => setAiOpen(true)} onSelectTrip={setActiveTripId} onToggleSaveCity={toggleSavedCity} onAddCityToTripModal={openAddCity} />;
      default: return <TravelHomeView user={user} trips={trips} cities={cities} onNavigate={setCurrentView} onOpenCreateTrip={openCreate} onOpenAIGenerator={() => setAiOpen(true)} onSelectTrip={setActiveTripId} onToggleSaveCity={toggleSavedCity} onAddCityToTripModal={openAddCity} />;
    }
  };

  return <div className="min-h-screen bg-[#050505] text-white">
    {currentView !== 'auth' && <Navbar currentView={currentView} onNavigate={setCurrentView} user={user} onLogout={handleLogout} onOpenCreateTrip={openCreate} onOpenAIGenerator={() => setAiOpen(true)} trips={trips} activeTripId={activeTripId} onSelectTrip={setActiveTripId} backendConnected={backendConnected} />}
    {content()}
    <CreateTripModal isOpen={createOpen} onClose={() => { setCreateOpen(false); setEditingTrip(null); }} onSaveTrip={handleSaveTrip} editingTrip={editingTrip} onOpenAIGenerator={() => { setCreateOpen(false); setAiOpen(true); }} />
    <AITripGeneratorModal isOpen={aiOpen} onClose={() => setAiOpen(false)} onTripGenerated={onAiGenerated} onShowToast={notify} />
    {cityToAdd && <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"><form onSubmit={(event) => { event.preventDefault(); confirmAddCity(); }} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111] p-6 shadow-2xl"><button type="button" onClick={() => setCityToAdd(null)} className="float-right rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button><p className="text-xs font-bold uppercase tracking-wider text-teal-300">Add to itinerary</p><h2 className="mt-2 text-2xl font-bold">{cityToAdd.name}, {cityToAdd.country}</h2><p className="mt-2 text-sm text-white/60">Choose dates for this stop in {activeTrip?.name}.</p><div className="mt-6 grid grid-cols-2 gap-4"><label className="text-xs text-white/60">Arrival<input required type="date" value={cityDates.start} onChange={(event) => setCityDates({ ...cityDates, start: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#1b1b1b] p-3 text-white outline-none focus:ring-2 focus:ring-teal-500" /></label><label className="text-xs text-white/60">Departure<input required type="date" value={cityDates.end} min={cityDates.start} onChange={(event) => setCityDates({ ...cityDates, end: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#1b1b1b] p-3 text-white outline-none focus:ring-2 focus:ring-teal-500" /></label></div><button className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 px-4 py-3 text-sm font-bold">Add {cityToAdd.name} to trip</button></form></div>}
    <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((items) => items.filter((toast) => toast.id !== id))} />
  </div>;
}
