import React, { useState } from 'react';
import {
  User,
  Mail,
  Globe,
  DollarSign,
  Bookmark,
  Trash2,
  RotateCcw,
  Sparkles,
  Check,
  Shield,
  MapPin,
  AlertTriangle,
  PlusCircle,
  Crown,
} from 'lucide-react';
import { City, User as UserType, ViewType } from '../types';

interface ProfileSettingsViewProps {
  user: UserType | null;
  cities: City[];
  onUpdateUser: (updatedData: Partial<UserType>) => void;
  onToggleSaveCity: (cityId: string) => void;
  onResetSeedData: () => void;
  onDeleteAccount: () => void;
  onNavigate: (view: ViewType) => void;
  onAddCityToTripModal: (city: City) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
];

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  user,
  cities,
  onUpdateUser,
  onToggleSaveCity,
  onResetSeedData,
  onDeleteAccount,
  onNavigate,
  onAddCityToTripModal,
}) => {
  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex.morgan@theleela.com');
  const [photo, setPhoto] = useState(user?.photo || AVATAR_PRESETS[0]);
  const [language, setLanguage] = useState(user?.language || 'English (US)');
  const [currency, setCurrency] = useState(user?.currency || 'USD ($)');
  const [bio, setBio] = useState(user?.bio || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const savedCities = cities.filter((c) => user?.savedDestinations.includes(c.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim(),
      email: email.trim(),
      photo,
      language,
      currency,
      bio: bio.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="space-y-2 border-b border-[#c5a880]/20 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfbe88] border border-[#dfbe88]/30 text-[10px] font-bold uppercase tracking-widest">
          <Crown className="w-3.5 h-3.5" />
          <span>Guest Account</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
          Guest Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#d6cbbe] font-light">
          Manage your guest credentials, currency display, and saved palace destinations.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="palace-card rounded-3xl p-6 sm:p-8 shadow-lg">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar and Info Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#c5a880]/20">
            <div className="relative group shrink-0">
              <img
                src={photo}
                alt={name}
                className="w-24 h-24 rounded-3xl object-cover border-2 border-[#dfbe88] shadow-md"
              />
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <span className="text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider block">Choose Avatar:</span>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhoto(preset)}
                    className={`w-10 h-10 rounded-2xl overflow-hidden border-2 transition cursor-pointer ${
                      photo === preset
                        ? 'border-[#dfbe88] ring-2 ring-[#dfbe88]/50'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="url"
                placeholder="Or paste avatar URL: https://..."
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-[#17130f] border border-[#c5a880]/30 text-white rounded-xl placeholder:text-[#b89f7a]/40 focus:border-[#dfbe88] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">Full Name</label>
              <input
                id="profile-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-sm font-semibold text-white focus:border-[#dfbe88] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">Email Address</label>
              <input
                id="profile-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-sm text-white focus:border-[#dfbe88] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Language & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#dfbe88]" /> Language Preference
              </label>
              <select
                id="profile-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-sm text-white focus:border-[#dfbe88] focus:outline-hidden [&>option]:bg-[#120f0c]"
              >
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Spanish (Español)">Spanish (Español)</option>
                <option value="French (Français)">French (Français)</option>
                <option value="German (Deutsch)">German (Deutsch)</option>
                <option value="Japanese (日本語)">Japanese (日本語)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#dfbe88]" /> Currency Display
              </label>
              <select
                id="profile-currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-sm text-white focus:border-[#dfbe88] focus:outline-hidden [&>option]:bg-[#120f0c]"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
                <option value="AUD ($)">AUD ($) - Australian Dollar</option>
                <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">Guest Bio</label>
            <textarea
              id="profile-bio-input"
              rows={3}
              placeholder="Tell other travelers about your travel style and favorite palace experiences..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-xs text-white placeholder:text-[#b89f7a]/40 focus:border-[#dfbe88] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="save-profile-btn"
              type="submit"
              className="gold-btn px-6 py-2.5 text-xs cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Saved / Favorite Destinations Section */}
      <div className="palace-card rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center font-bold">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white">Saved Destinations</h2>
              <p className="text-xs text-[#b89f7a]">
                Bookmarked palace cities for your future trip planning
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('city-search')}
            className="text-xs font-serif font-bold text-[#dfbe88] hover:text-white uppercase tracking-wider transition cursor-pointer"
          >
            Explore More Destinations
          </button>
        </div>

        {savedCities.length === 0 ? (
          <p className="text-xs text-[#b89f7a] py-4 text-center font-light">
            You haven't saved any cities yet. Click the bookmark icon on any destination card to save it here!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {savedCities.map((city) => (
              <div
                key={city.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-[#c5a880]/20 bg-[#15110d] hover:border-[#dfbe88]/40 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#c5a880]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-serif font-bold text-white truncate">{city.name}</h4>
                    <p className="text-[11px] text-[#b89f7a]">{city.country} • ${city.avgDailyCost}/day</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onAddCityToTripModal(city)}
                    className="p-2 bg-[#17130f] text-[#dfbe88] hover:bg-[#c5a880]/20 rounded-xl text-xs font-bold border border-[#c5a880]/30 cursor-pointer"
                    title="Plan voyage with this destination"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleSaveCity(city.id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger / Data Management Zone */}
      <div className="palace-card rounded-3xl border border-rose-500/25 p-6 sm:p-8 shadow-lg space-y-4">
        <h3 className="text-xs font-serif font-bold text-rose-400 uppercase tracking-widest">
          Data Management & Account Actions
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#17130f] border border-[#c5a880]/20">
          <div>
            <p className="text-xs font-serif font-bold text-white">Restore Sample Palaces & Voyages</p>
            <p className="text-[11px] text-[#b89f7a] font-light">
              Reset your itineraries back to the rich default seed trips and palace destinations.
            </p>
          </div>
          <button
            id="reset-demo-data-btn"
            type="button"
            onClick={() => setShowResetModal(true)}
            className="gold-outline-btn px-4 py-2.5 text-xs shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Seed Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25">
          <div>
            <p className="text-xs font-serif font-bold text-rose-300">Delete Account & Clear Local Cache</p>
            <p className="text-[11px] text-rose-400/80 font-light">
              Permanently wipes all active trips, preferences, and session data.
            </p>
          </div>
          <button
            id="delete-account-btn"
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#120f0c] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#c5a880]/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-serif font-bold text-white">Delete Account & Data?</h3>
              <p className="text-xs text-[#d6cbbe]">
                Are you sure? This will wipe all your custom planned voyages, experiences, and settings.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="gold-outline-btn flex-1 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-account-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteAccount();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#120f0c] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#c5a880]/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a880]/20 text-[#dfbe88] border border-[#dfbe88]/30 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-serif font-bold text-white">Restore Sample Voyages?</h3>
              <p className="text-xs text-[#d6cbbe]">
                This will reload the pre-populated Leela Royal India and European luxury sample itineraries.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="gold-outline-btn flex-1 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                id="confirm-restore-seed-btn"
                onClick={() => {
                  setShowResetModal(false);
                  onResetSeedData();
                }}
                className="gold-btn flex-1 py-2.5 text-xs cursor-pointer"
              >
                Restore Samples
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
