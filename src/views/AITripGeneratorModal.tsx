import React, { useState } from 'react';
import { Sparkles, X, Compass, Calendar, DollarSign, Users, Flame, ArrowRight, Loader2, CheckCircle2, Crown } from 'lucide-react';
import { aiService, GenerateItineraryParams } from '../services/aiService';
import { Trip } from '../types';

interface AITripGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripGenerated: (trip: Trip) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AITripGeneratorModal: React.FC<AITripGeneratorModalProps> = ({
  isOpen,
  onClose,
  onTripGenerated,
  onShowToast,
}) => {
  const [destination, setDestination] = useState('Udaipur & Jaipur');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [budgetTier, setBudgetTier] = useState<'budget' | 'moderate' | 'luxury'>('luxury');
  const [vibe, setVibe] = useState<'culture' | 'foodie' | 'adventure' | 'relaxation' | 'balanced'>('culture');
  const [travelers, setTravelers] = useState<'solo' | 'couple' | 'family' | 'friends'>('couple');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      onShowToast('Destination Required', 'Please provide at least one destination city.', 'warning');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    try {
      const params: GenerateItineraryParams = {
        destination: destination.trim(),
        durationDays,
        budgetTier,
        vibe,
        travelers,
      };

      const result = await aiService.generateItinerary(params);
      clearInterval(stepInterval);
      setGenerationStep(4);

      setTimeout(() => {
        setIsGenerating(false);
        onTripGenerated(result.trip);
        onShowToast(
          '✨ Royal AI Itinerary Crafted!',
          `Successfully generated ${result.trip.name} with ${result.trip.stops.length} stops and scheduled experiences.`
        );
        onClose();
      }, 600);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      onShowToast('AI Concierge Notice', err.message || 'Failed to generate itinerary.', 'error');
    }
  };

  const steps = [
    'Connecting to The Leela AI Concierge Engine...',
    'Mapping palace routes & day allocation...',
    'Curating royal dining, spa & landmark tours...',
    'Finalizing palace budget ledger & itinerary...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className="relative w-full max-w-2xl bg-[#120f0c] rounded-3xl border border-[#c5a880]/30 shadow-2xl shadow-[#b89658]/10 overflow-hidden text-white">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#c5a880]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#dfbe88]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#c5a880]/20 flex items-center justify-between relative z-10 bg-[#191410]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8c734b] via-[#dfbe88] to-[#b89658] flex items-center justify-center shadow-lg text-[#0e0b08]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                AI Concierge Travel Planner
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#c5a880]/20 text-[#dfbe88] font-bold border border-[#dfbe88]/30 uppercase">
                  Powered by Gemini
                </span>
              </h2>
              <p className="text-xs text-[#b89f7a]">Generate complete multi-day palace itineraries with automated scheduling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-[#b89f7a] hover:text-white rounded-xl hover:bg-[#c5a880]/15 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="p-6 relative z-10">
          {isGenerating ? (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-[#c5a880]/15 border border-[#dfbe88]/40 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-[#dfbe88] animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white">Crafting Your Royal Journey...</h3>
                <p className="text-xs text-[#dfbe88] font-medium">{steps[generationStep] || steps[steps.length - 1]}</p>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto bg-[#1a1511] border border-[#c5a880]/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#b89658] via-[#dfbe88] to-[#c5a880] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, (generationStep + 1) * 25)}%` }}
                />
              </div>

              <p className="text-xs text-[#b89f7a] font-light">
                Personalizing daily timing, cost breakdown, and royal palace routes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Destination */}
              <div>
                <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-2">
                  Palace Destinations / Cities
                </label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-3.5 w-4 h-4 text-[#dfbe88]" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Udaipur & Jaipur, New Delhi & Kovalam, Paris & Rome"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1a1511] border border-[#c5a880]/30 focus:border-[#dfbe88] rounded-xl text-sm text-white placeholder-[#b89f7a]/40 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {['Udaipur & Jaipur', 'New Delhi & Bengaluru', 'Kovalam & Chennai', 'Paris & Tokyo', 'Rome & Barcelona'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDestination(preset)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      destination === preset
                        ? 'bg-[#c5a880]/20 border-[#dfbe88] text-[#dfbe88] font-bold'
                        : 'bg-[#1a1511] border-[#c5a880]/20 text-[#b89f7a] hover:text-white hover:bg-[#c5a880]/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Duration & Budget Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-2">
                    Duration (Days)
                  </label>
                  <div className="flex items-center gap-2">
                    {[3, 5, 7, 10, 14].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationDays(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          durationDays === d
                            ? 'bg-[#dfbe88] text-[#14100b] border-[#dfbe88] shadow-md'
                            : 'bg-[#1a1511] text-[#b89f7a] border-[#c5a880]/20 hover:bg-[#c5a880]/10'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Tier */}
                <div>
                  <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-2">
                    Budget Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { key: 'budget', label: 'Comfort', icon: '$' },
                        { key: 'moderate', label: 'Premium', icon: '$$' },
                        { key: 'luxury', label: 'Royal Luxury', icon: '$$$' },
                      ] as const
                    ).map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setBudgetTier(b.key)}
                        className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          budgetTier === b.key
                            ? 'bg-[#dfbe88] text-[#14100b] border-[#dfbe88] shadow-md'
                            : 'bg-[#1a1511] text-[#b89f7a] border-[#c5a880]/20 hover:bg-[#c5a880]/10'
                        }`}
                      >
                        <span className="block text-[10px] opacity-70">{b.icon}</span>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vibe / Travel Style */}
              <div>
                <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-2">
                  Voyage Focus & Vibe
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { key: 'culture', label: 'Culture & Heritage' },
                      { key: 'foodie', label: 'Fine Dining' },
                      { key: 'adventure', label: 'Outdoor Excursion' },
                      { key: 'relaxation', label: 'Spa & Wellness' },
                      { key: 'balanced', label: 'Balanced Mix' },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setVibe(v.key)}
                      className={`p-2.5 rounded-xl text-xs font-semibold transition border text-center cursor-pointer ${
                        vibe === v.key
                          ? 'bg-[#c5a880]/20 border-[#dfbe88] text-[#dfbe88] font-bold'
                          : 'bg-[#1a1511] border-[#c5a880]/20 text-[#b89f7a] hover:bg-[#c5a880]/10 hover:text-white'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travelers */}
              <div>
                <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-2">
                  Who is Traveling?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { key: 'solo', label: 'Solo Guest' },
                      { key: 'couple', label: 'Couple' },
                      { key: 'friends', label: 'Friends' },
                      { key: 'family', label: 'Family' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTravelers(t.key)}
                      className={`py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                        travelers === t.key
                          ? 'bg-[#c5a880]/20 border-[#dfbe88] text-[#dfbe88] font-bold'
                          : 'bg-[#1a1511] border-[#c5a880]/20 text-[#b89f7a] hover:bg-[#c5a880]/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-[#c5a880]/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="gold-outline-btn px-4 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-btn px-6 py-2.5 text-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Royal Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
