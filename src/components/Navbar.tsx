import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  PlusCircle,
  Sparkles,
  User,
  Shield,
  Menu,
  X,
  LogOut,
  FolderHeart,
  ChevronDown,
  Layers,
  Crown,
} from 'lucide-react';
import { Trip, User as UserType, ViewType } from '../types';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  user: UserType | null;
  onLogout: () => void;
  onOpenCreateTrip: () => void;
  onOpenAIGenerator?: () => void;
  trips: Trip[];
  activeTripId: string | null;
  onSelectTrip: (id: string) => void;
  backendConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onLogout,
  onOpenCreateTrip,
  onOpenAIGenerator,
  trips,
  activeTripId,
  onSelectTrip,
  backendConnected = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [tripDropdownOpen, setTripDropdownOpen] = useState(false);

  const activeTrip = trips.find((t) => t.id === activeTripId);

  const handleNavClick = (view: ViewType) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setTripDropdownOpen(false);
  };

  const navItems: { label: string; view: ViewType; icon: React.ReactNode }[] = [
    { label: 'Palace Hub', view: 'dashboard', icon: <Compass className="w-3.5 h-3.5 shrink-0" /> },
    { label: 'My Voyages', view: 'my-trips', icon: <Layers className="w-3.5 h-3.5 shrink-0" /> },
    { label: 'Destinations', view: 'city-search', icon: <MapPin className="w-3.5 h-3.5 shrink-0" /> },
    { label: 'Experiences', view: 'activity-search', icon: <Sparkles className="w-3.5 h-3.5 shrink-0" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c0a08]/95 backdrop-blur-md border-b border-[#c5a880]/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-20 py-2 gap-4">
          {/* Brand Logo with Leela Royal Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="nav-logo-btn"
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8c734b] via-[#dfbe88] to-[#b89658] p-0.5 shadow-lg shadow-[#b89658]/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <div className="w-full h-full bg-[#0c0a08] rounded-[14px] flex items-center justify-center text-[#dfbe88]">
                  <Crown className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-serif font-bold tracking-wider text-gold-gradient block">
                  The Leela
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#b89f7a] block -mt-1">
                  Palace Voyage Curator
                </span>
              </div>
            </button>

            {/* Backend connection pill */}
            <div
              className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${
                backendConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
              title={backendConnected ? 'Backend API connected' : 'Connecting to backend...'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{backendConnected ? 'Database Live' : 'Connecting...'}</span>
            </div>

            {/* Active Voyage Quick Selector */}
            {trips.length > 0 && (
              <div className="hidden lg:flex items-center ml-2 pl-3 border-l border-[#c5a880]/20 relative">
                <button
                  id="active-trip-selector-btn"
                  onClick={() => setTripDropdownOpen(!tripDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#171410] hover:bg-[#201c17] border border-[#c5a880]/25 text-xs font-medium text-[#f1ece1] transition cursor-pointer"
                  title="Current Active Voyage"
                >
                  <span className="w-2 h-2 rounded-full bg-[#dfbe88] animate-pulse shrink-0"></span>
                  <span className="text-[#b89f7a] font-normal uppercase text-[10px] tracking-wider shrink-0">Voyage:</span>
                  <span className="font-serif font-semibold text-[#faf7f2] truncate max-w-[110px]">
                    {activeTrip ? activeTrip.name : 'Select Voyage'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#b89f7a] shrink-0" />
                </button>

                {tripDropdownOpen && (
                  <div className="absolute top-full left-3 mt-2 w-72 bg-[#120f0c] rounded-2xl shadow-2xl border border-[#c5a880]/30 py-2 z-50 animate-fade-in text-white">
                    <div className="px-4 py-2 text-[10px] font-bold uppercase text-[#b89f7a] tracking-[0.2em] border-b border-[#c5a880]/15">
                      Curated Voyages
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                      {trips.map((trip) => (
                        <button
                          key={trip.id}
                          id={`trip-option-${trip.id}`}
                          onClick={() => {
                            onSelectTrip(trip.id);
                            setTripDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-[#c5a880]/10 transition ${
                            trip.id === activeTripId
                              ? 'bg-[#c5a880]/15 font-semibold text-[#dfbe88] border-l-2 border-[#dfbe88]'
                              : 'text-[#e5dfd5]'
                          }`}
                        >
                          <span className="truncate pr-2 font-serif text-sm">{trip.name}</span>
                          <span className="text-[10px] text-[#b89f7a] bg-[#c5a880]/10 px-2 py-0.5 rounded-md border border-[#c5a880]/20 shrink-0">
                            {trip.stops.length} stops
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[#c5a880]/15 mt-1 pt-2 px-3">
                      <button
                        onClick={() => {
                          setTripDropdownOpen(false);
                          onOpenCreateTrip();
                        }}
                        className="w-full text-center py-2 text-xs text-[#dfbe88] font-bold hover:bg-[#c5a880]/15 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Plan New Voyage
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 flex-wrap">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  id={`nav-link-${item.view}`}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#c5a880]/20 text-[#f7ecd7] border border-[#dfbe88]/50 shadow-xs'
                      : 'text-[#d6cbbe] hover:text-[#f7ecd7] hover:bg-[#c5a880]/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Itinerary & Budget quick links if active trip */}
            {activeTrip && (
              <div className="hidden xl:flex items-center gap-1 ml-1 pl-2 border-l border-[#c5a880]/20">
                <button
                  id="nav-link-builder"
                  onClick={() => handleNavClick('itinerary-builder')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                    currentView === 'itinerary-builder'
                      ? 'bg-[#dfbe88] text-[#14100b] shadow-xs'
                      : 'text-[#d6cbbe] hover:text-[#dfbe88] hover:bg-[#c5a880]/10'
                  }`}
                >
                  Builder
                </button>
                <button
                  id="nav-link-itinerary-view"
                  onClick={() => handleNavClick('itinerary-view')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                    currentView === 'itinerary-view'
                      ? 'bg-[#dfbe88] text-[#14100b] shadow-xs'
                      : 'text-[#d6cbbe] hover:text-[#dfbe88] hover:bg-[#c5a880]/10'
                  }`}
                >
                  Overview
                </button>
                <button
                  id="nav-link-budget"
                  onClick={() => handleNavClick('budget')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition ${
                    currentView === 'budget'
                      ? 'bg-[#dfbe88] text-[#14100b] shadow-xs'
                      : 'text-[#d6cbbe] hover:text-[#dfbe88] hover:bg-[#c5a880]/10'
                  }`}
                >
                  <DollarSign className="w-3 h-3" /> Budget
                </button>
              </div>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* AI Concierge Trigger */}
            {onOpenAIGenerator && (
              <button
                id="nav-ai-planner-btn"
                onClick={onOpenAIGenerator}
                className="gold-outline-btn px-3.5 py-2 text-xs group shrink-0 hidden sm:inline-flex"
                title="Bespoke voyage generated by AI Concierge"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#dfbe88] group-hover:scale-110 group-hover:rotate-12 transition" />
                <span>AI Concierge</span>
              </button>
            )}

            {/* Plan Voyage Primary CTA */}
            <button
              id="nav-create-trip-btn"
              onClick={onOpenCreateTrip}
              className="gold-btn px-4 py-2 text-xs shrink-0"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Plan Voyage</span>
              <span className="sm:hidden">Plan</span>
            </button>

            {user ? (
              <div className="relative shrink-0">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#dfbe88] transition cursor-pointer"
                  title="Guest Account"
                >
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#c5a880]/40 shadow-md"
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#120f0c] rounded-2xl shadow-2xl border border-[#c5a880]/30 py-2.5 z-50 animate-fade-in text-white">
                    <div className="px-4 py-3 border-b border-[#c5a880]/15">
                      <p className="text-sm font-serif font-bold text-[#faf7f2]">{user.name}</p>
                      <p className="text-xs text-[#b89f7a] truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold text-[#dfbe88] bg-[#dfbe88]/15 border border-[#dfbe88]/30 px-2 py-0.5 rounded-full">
                          Palace Curator
                        </span>
                      )}
                    </div>

                    <button
                      id="dropdown-profile-btn"
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#d6cbbe] hover:text-[#f7ecd7] hover:bg-[#c5a880]/10 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#b89f7a]" /> Profile & Preferences
                    </button>

                    <button
                      id="dropdown-saved-btn"
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#d6cbbe] hover:text-[#f7ecd7] hover:bg-[#c5a880]/10 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <FolderHeart className="w-4 h-4 text-[#b89f7a]" /> Saved Destinations
                    </button>

                    {user.role === 'admin' && (
                      <button
                        id="dropdown-admin-btn"
                        onClick={() => handleNavClick('admin')}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#dfbe88] hover:bg-[#dfbe88]/10 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-[#dfbe88]" /> Curator Analytics
                      </button>
                    )}

                    <div className="border-t border-[#c5a880]/15 mt-1 pt-1.5">
                      <button
                        id="dropdown-logout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={() => onNavigate('auth')}
                className="gold-btn px-4 py-2 text-xs shrink-0"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#b89f7a] hover:text-[#dfbe88] hover:bg-[#c5a880]/10 focus:outline-hidden cursor-pointer shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#100d0a] border-b border-[#c5a880]/20 px-4 pt-3 pb-6 space-y-2 animate-fade-in text-white">
          {activeTrip && (
            <div className="p-3.5 bg-[#171410] rounded-2xl mb-3 border border-[#c5a880]/25">
              <span className="text-[10px] font-bold uppercase text-[#b89f7a] tracking-widest block mb-1">
                Active Voyage
              </span>
              <p className="text-sm font-serif font-bold text-[#faf7f2]">{activeTrip.name}</p>
              <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                <button
                  onClick={() => handleNavClick('itinerary-builder')}
                  className="px-2 py-1.5 rounded-lg bg-[#dfbe88] text-[#14100b] text-[11px] font-bold text-center"
                >
                  Builder
                </button>
                <button
                  onClick={() => handleNavClick('itinerary-view')}
                  className="px-2 py-1.5 rounded-lg bg-[#c5a880]/15 text-[#dfbe88] text-[11px] font-medium text-center"
                >
                  View
                </button>
                <button
                  onClick={() => handleNavClick('budget')}
                  className="px-2 py-1.5 rounded-lg bg-[#c5a880]/15 text-[#dfbe88] text-[11px] font-medium text-center"
                >
                  Budget
                </button>
                <button
                  onClick={() => handleNavClick('calendar')}
                  className="px-2 py-1.5 rounded-lg bg-[#c5a880]/15 text-[#dfbe88] text-[11px] font-medium text-center"
                >
                  Calendar
                </button>
              </div>
            </div>
          )}

          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                currentView === item.view
                  ? 'bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/40'
                  : 'text-[#d6cbbe] hover:bg-[#c5a880]/10 hover:text-[#f7ecd7]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {onOpenAIGenerator && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAIGenerator();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c5a880]/15 border border-[#dfbe88]/40 text-[#dfbe88] text-xs font-bold uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" /> AI Concierge Planner
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCreateTrip();
            }}
            className="gold-btn w-full py-3 mt-2"
          >
            <PlusCircle className="w-4 h-4" /> Plan New Voyage
          </button>
        </div>
      )}
    </header>
  );
};
