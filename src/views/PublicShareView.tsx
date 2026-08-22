import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  QrCode,
  Globe,
  Sparkles,
  ArrowRight,
  Printer,
  X,
  Crown,
} from 'lucide-react';
import { Trip, ViewType } from '../types';
import { calculateDateDifferenceDays, calculateTripFinancials, formatTripDates, getActivityCategoryBadge } from '../utils/tripHelpers';

interface PublicShareViewProps {
  trip: Trip | null;
  onDuplicateTrip: (trip: Trip) => void;
  onNavigate: (view: ViewType) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PublicShareView: React.FC<PublicShareViewProps> = ({
  trip,
  onDuplicateTrip,
  onNavigate,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 text-white">
        <h2 className="text-xl font-serif font-bold text-white">No voyage selected for public sharing</h2>
        <button
          onClick={() => onNavigate('my-trips')}
          className="gold-btn px-5 py-2.5 text-xs"
        >
          Select a Voyage
        </button>
      </div>
    );
  }

  const shareableUrl = `${window.location.origin}?trip=${trip.id}&share=public`;
  const financials = calculateTripFinancials(trip);
  const durationDays = calculateDateDifferenceDays(trip.startDate, trip.endDate);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    onShowToast('Link copied to clipboard!', 'Anyone with this link can view this curated royal voyage.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClone = () => {
    onDuplicateTrip(trip);
    onShowToast('Voyage duplicated into your portfolio!', 'You can now customize this itinerary independently.');
    onNavigate('my-trips');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-white">
      {/* Public Share Controls Ribbon */}
      <div className="palace-card rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 border border-[#c5a880]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              Public Link Preview
            </span>
            <span className="text-xs text-[#b89f7a]">• Read-Only Share Mode</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-serif font-bold text-white">
            Share this Voyage with Guests & Friends
          </h2>
          <p className="text-xs text-[#d6cbbe] font-light">
            Anyone with the link can view the route, explore palace stays, and copy it to their account.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
          <button
            id="share-copy-link-btn"
            onClick={handleCopyLink}
            className="gold-btn px-4 py-2.5 text-xs flex-1 md:flex-none cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Share URL'}</span>
          </button>

          <button
            id="share-qr-code-btn"
            onClick={() => setShowQrModal(true)}
            className="gold-outline-btn p-2.5 text-xs cursor-pointer"
            title="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            id="share-duplicate-trip-btn"
            onClick={handleClone}
            className="gold-outline-btn px-4 py-2.5 text-xs flex-1 md:flex-none cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Copy to My Voyages</span>
          </button>
        </div>
      </div>

      {/* Shareable Link Input Bar */}
      <div className="flex items-center gap-2 bg-[#17130f] p-3.5 rounded-2xl border border-[#c5a880]/25 text-xs">
        <Globe className="w-4 h-4 text-[#dfbe88] shrink-0 ml-1" />
        <input
          type="text"
          readOnly
          value={shareableUrl}
          className="flex-1 bg-transparent text-[#d6cbbe] focus:outline-hidden font-mono text-[11px] truncate"
        />
        <button
          onClick={handleCopyLink}
          className="gold-outline-btn px-3 py-1.5 text-[11px] font-bold shrink-0 cursor-pointer"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Social Media Sharing Buttons (UI) */}
      <div className="flex items-center justify-between p-4 palace-card rounded-2xl text-xs">
        <span className="font-serif font-bold text-[#dfbe88]">Quick Share:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my voyage: ${trip.name} on The Leela Collection! ${shareableUrl}`)}`, '_blank');
            }}
            className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl font-bold transition cursor-pointer"
          >
            WhatsApp
          </button>
          <button
            onClick={() => {
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this royal palace voyage: ${trip.name}! ${shareableUrl}`)}`, '_blank');
            }}
            className="px-3.5 py-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 rounded-xl font-bold transition cursor-pointer"
          >
            Twitter / X
          </button>
          <button
            onClick={() => {
              window.open(`mailto:?subject=${encodeURIComponent(`Royal Voyage: ${trip.name}`)}&body=${encodeURIComponent(`Explore the full itinerary here: ${shareableUrl}`)}`);
            }}
            className="gold-outline-btn px-3.5 py-1.5 text-[11px] font-bold cursor-pointer"
          >
            Email
          </button>
        </div>
      </div>

      {/* Public Facing Itinerary Card */}
      <div className="palace-card rounded-3xl overflow-hidden shadow-xl space-y-6">
        {/* Cover Hero Banner */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img
            src={trip.coverPhoto}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090807]/90 via-black/40 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#dfbe88] text-[#14100b] text-xs font-bold uppercase tracking-wider">
                {durationDays} Days Royal Voyage
              </span>
              <span className="px-3 py-1 rounded-full bg-[#090807]/70 backdrop-blur-md text-[#d6cbbe] text-xs font-medium border border-[#c5a880]/30">
                Curated by {trip.authorName || 'The Leela Guest'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold leading-tight text-white">
              {trip.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#d6cbbe] font-light max-w-2xl">{trip.description}</p>
          </div>
        </div>

        {/* Stops Summary Row */}
        <div className="p-6 pt-0 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#17130f] border border-[#c5a880]/20 text-center">
            <div>
              <p className="text-[10px] text-[#b89f7a] uppercase">Total Duration</p>
              <p className="text-base font-serif font-bold text-white">{durationDays} Days</p>
            </div>
            <div>
              <p className="text-[10px] text-[#b89f7a] uppercase">Palace Destinations</p>
              <p className="text-base font-serif font-bold text-white">{trip.stops.length} Stops</p>
            </div>
            <div>
              <p className="text-[10px] text-[#b89f7a] uppercase">Experiences</p>
              <p className="text-base font-serif font-bold text-white">
                {trip.stops.reduce((a, s) => a + s.activities.length, 0)} Planned
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#b89f7a] uppercase">Est. Total Budget</p>
              <p className="text-base font-serif font-bold text-[#dfbe88]">
                ${financials.totalCost.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Detailed Stops Timeline */}
          <div className="space-y-6">
            <h2 className="text-lg font-serif font-bold text-white">
              Voyage Schedule & Experiences
            </h2>

            {trip.stops.map((stop, index) => {
              const stopNights = calculateDateDifferenceDays(stop.startDate, stop.endDate);

              return (
                <div
                  key={stop.id}
                  className="p-5 rounded-2xl border border-[#c5a880]/20 bg-[#15110d] shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#c5a880]/15 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8c734b] to-[#dfbe88] text-[#0e0b08] font-serif font-bold text-sm flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-white">
                          {stop.cityName}, {stop.country}
                        </h3>
                        <p className="text-xs text-[#b89f7a]">
                          {formatTripDates(stop.startDate, stop.endDate)} ({stopNights} Nights)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-serif font-bold text-[#dfbe88] bg-[#17130f] border border-[#c5a880]/20 px-3 py-1 rounded-lg">
                      {stop.activities.length} experiences
                    </span>
                  </div>

                  {/* Activities */}
                  <div className="space-y-2">
                    {stop.activities.map((act) => {
                      const badge = getActivityCategoryBadge(act.type);

                      return (
                        <div
                          key={act.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#17130f] border border-[#c5a880]/15 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={act.image}
                              alt={act.name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#c5a880]/20 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold ${badge.text}`}>
                                  {act.type}
                                </span>
                                {act.timeOfDay && (
                                  <span className="text-[10px] text-[#b89f7a]">• {act.timeOfDay}</span>
                                )}
                              </div>
                              <h4 className="font-serif font-bold text-white">{act.name}</h4>
                            </div>
                          </div>
                          <span className="font-serif font-bold text-[#dfbe88]">${act.cost}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#120f0c] rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-[#c5a880]/30 text-center space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-serif font-bold text-white">Scan to Load Voyage</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 text-[#b89f7a] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-[#17130f] rounded-2xl border border-[#c5a880]/20 inline-block">
              <div className="w-44 h-44 bg-white p-2 border border-white/10 rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-[#090807] rounded-lg">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        i % 2 === 0 || i % 3 === 0 ? 'bg-[#dfbe88]' : 'bg-transparent'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#d6cbbe] font-light">
              Point your smartphone camera to quickly load this royal itinerary.
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="gold-btn w-full py-2.5 text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
