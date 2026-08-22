import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, Image as ImageIcon, Sparkles, ArrowRight, Wand2, Crown } from 'lucide-react';
import { Trip } from '../types';
import { calculateDateDifferenceDays, formatTripDates } from '../utils/tripHelpers';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'authorName'>) => void;
  editingTrip?: Trip | null;
  onOpenAIGenerator?: () => void;
}

const COVER_PRESETS = [
  { label: 'Udaipur Palace', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Delhi Palace', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Bengaluru Gardens', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Jaipur Fort Views', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Kovalam Beach Resort', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Paris Architecture', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80' },
];

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onSaveTrip,
  editingTrip,
  onOpenAIGenerator,
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-12');
  const [description, setDescription] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(COVER_PRESETS[0].url);
  const [dailyBudget, setDailyBudget] = useState(450);
  const [stayCostPerNight, setStayCostPerNight] = useState(400);
  const [transportCost, setTransportCost] = useState(500);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTrip) {
      setName(editingTrip.name);
      setStartDate(editingTrip.startDate);
      setEndDate(editingTrip.endDate);
      setDescription(editingTrip.description);
      setCoverPhoto(editingTrip.coverPhoto);
      setDailyBudget(editingTrip.dailyBudget);
      setStayCostPerNight(editingTrip.stayCostPerNight);
      setTransportCost(editingTrip.transportCost);
      setIsPublic(editingTrip.isPublic);
    } else {
      setName('');
      setStartDate('2026-10-01');
      setEndDate('2026-10-12');
      setDescription('');
      setCoverPhoto(COVER_PRESETS[0].url);
      setDailyBudget(450);
      setStayCostPerNight(400);
      setTransportCost(500);
      setIsPublic(true);
    }
  }, [editingTrip, isOpen]);

  if (!isOpen) return null;

  const durationDays = calculateDateDifferenceDays(startDate, endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a title for your royal voyage.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select valid start and end dates.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Trip start date must be before or equal to the end date.');
      return;
    }

    onSaveTrip({
      name: name.trim(),
      startDate,
      endDate,
      description: description.trim() || 'A curated royal palace voyage created with The Leela Collection.',
      coverPhoto: coverPhoto || COVER_PRESETS[0].url,
      dailyBudget: Number(dailyBudget) || 450,
      stayCostPerNight: Number(stayCostPerNight) || 400,
      transportCost: Number(transportCost) || 0,
      isPublic,
      stops: editingTrip ? editingTrip.stops : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in text-white">
      <div className="bg-[#120f0c] rounded-3xl shadow-2xl border border-[#c5a880]/30 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c5a880]/20 bg-[#191410]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white">
                {editingTrip ? 'Edit Voyage Settings' : 'Plan a Royal Voyage'}
              </h2>
              <p className="text-xs text-[#b89f7a]">
                Set dates, budget targets, and luxury cover imagery.
              </p>
            </div>
          </div>
          <button
            id="close-create-trip-modal-btn"
            onClick={onClose}
            className="p-2 text-[#b89f7a] hover:text-white rounded-xl hover:bg-[#c5a880]/15 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Generator Shortcut Banner (for new trips) */}
        {!editingTrip && onOpenAIGenerator && (
          <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-[#211a13] to-[#17130e] border border-[#c5a880]/35 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c5a880]/20 flex items-center justify-center text-[#dfbe88] border border-[#dfbe88]/30 shrink-0">
                <Wand2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-serif font-bold text-white">Let AI Concierge Build Your Voyage</p>
                <p className="text-[11px] text-[#b89f7a]">Auto-generates multi-palace routes, fine dining & experiences.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAIGenerator();
              }}
              className="gold-btn px-3.5 py-2 text-xs shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Concierge
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Trip Name */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5">Voyage Title *</label>
            <input
              id="trip-name-input"
              type="text"
              required
              placeholder="e.g. The Leela Royal Palaces of India Tour"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm font-medium text-white placeholder:text-[#b89f7a]/40 focus:outline-hidden focus:border-[#dfbe88] transition"
            />
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#dfbe88]" /> Start Date *
              </label>
              <input
                id="trip-start-date-input"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm font-medium text-white focus:outline-hidden focus:border-[#dfbe88] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#dfbe88]" /> End Date *
              </label>
              <input
                id="trip-end-date-input"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm font-medium text-white focus:outline-hidden focus:border-[#dfbe88] transition"
              />
            </div>
          </div>

          <div className="text-[11px] text-[#b89f7a] flex items-center gap-2">
            <span>Duration: <strong className="text-[#dfbe88] font-bold font-serif">{durationDays} days</strong></span>
            <span>•</span>
            <span>{formatTripDates(startDate, endDate)}</span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5">Description & Purpose</label>
            <textarea
              id="trip-description-input"
              rows={2}
              placeholder="What are the goals or highlights of this royal journey?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm font-medium text-white placeholder:text-[#b89f7a]/40 focus:outline-hidden focus:border-[#dfbe88] transition"
            />
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#dfbe88]" /> Cover Photo URL
            </label>
            <input
              id="trip-cover-input"
              type="url"
              placeholder="Paste image URL or choose below"
              value={coverPhoto}
              onChange={(e) => setCoverPhoto(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm font-medium text-white placeholder:text-[#b89f7a]/40 focus:outline-hidden focus:border-[#dfbe88] transition mb-2"
            />

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COVER_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setCoverPhoto(preset.url)}
                  className={`relative rounded-xl overflow-hidden aspect-video border-2 transition cursor-pointer ${
                    coverPhoto === preset.url ? 'border-[#dfbe88] scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-[#090807]/50 text-[9px] font-bold text-white flex items-center justify-center p-1 text-center leading-tight">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Financials & Daily Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#c5a880]/20">
            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5">
                Target Daily Budget ($)
              </label>
              <input
                id="trip-daily-budget-input"
                type="number"
                min="10"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm text-white focus:outline-hidden focus:border-[#dfbe88]"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5">
                Avg Stay / Night ($)
              </label>
              <input
                id="trip-stay-cost-input"
                type="number"
                min="0"
                value={stayCostPerNight}
                onChange={(e) => setStayCostPerNight(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm text-white focus:outline-hidden focus:border-[#dfbe88]"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1.5">
                Transit / Transfers ($)
              </label>
              <input
                id="trip-transport-cost-input"
                type="number"
                min="0"
                value={transportCost}
                onChange={(e) => setTransportCost(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[#1a1511] border border-[#c5a880]/30 rounded-xl text-sm text-white focus:outline-hidden focus:border-[#dfbe88]"
              />
            </div>
          </div>

          {/* Public / Private Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#17130f] border border-[#c5a880]/25">
            <div>
              <p className="text-xs font-serif font-bold text-white">Publicly Discoverable Voyage</p>
              <p className="text-[11px] text-[#b89f7a]">Allow other guests to view and clone this royal itinerary.</p>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 accent-[#dfbe88] rounded cursor-pointer"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c5a880]/20">
            <button
              type="button"
              onClick={onClose}
              className="gold-outline-btn px-4 py-2.5 text-xs"
            >
              Cancel
            </button>
            <button
              id="save-trip-submit-btn"
              type="submit"
              className="gold-btn px-6 py-2.5 text-xs cursor-pointer"
            >
              <span>{editingTrip ? 'Save Changes' : 'Create Itinerary'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
