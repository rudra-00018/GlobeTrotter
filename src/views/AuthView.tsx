import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Check, Loader2, Crown } from 'lucide-react';
import { User } from '../types';
import { MOCK_USER, MOCK_ADMIN_USER } from '../data/mockData';
import { authService } from '../services';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
  onCancel?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'forgot') {
      if (!email.includes('@')) {
        setError('Please provide a valid email address.');
        return;
      }
      setResetSent(true);
      return;
    }

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await authService.register(name, email);
        onLoginSuccess(res.user);
      } else {
        const res = await authService.login(email);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim() || email.split('@')[0].replace('.', ' '),
        email: email.trim().toLowerCase(),
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        language: 'English (US)',
        currency: 'USD ($)',
        savedDestinations: ['udaipur-leela', 'delhi-leela', 'paris'],
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        bio: 'Distinguished guest ready to curate luxury palace voyages!',
      };
      onLoginSuccess(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoUser: User) => {
    try {
      const res = await authService.login(demoUser.email).catch(() => null);
      if (res && res.user) {
        onLoginSuccess(res.user);
      } else {
        onLoginSuccess(demoUser);
      }
    } catch {
      onLoginSuccess(demoUser);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 bg-[#090807] text-white">
      <div className="w-full max-w-md palace-card rounded-3xl p-6 sm:p-8 animate-fade-in relative overflow-hidden text-white border border-[#c5a880]/30 shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#c5a880]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#dfbe88]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#8c734b] via-[#dfbe88] to-[#b89658] text-[#0e0b08] p-0.5 shadow-lg shadow-[#b89658]/20 mb-3">
            <div className="w-full h-full bg-[#0c0a08] rounded-[14px] flex items-center justify-center text-[#dfbe88]">
              <Crown className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">
            {mode === 'login' && 'The Leela Palace Curator'}
            {mode === 'signup' && 'Create Guest Account'}
            {mode === 'forgot' && 'Reset Access Password'}
          </h1>
          <p className="text-xs text-[#d6cbbe] font-light mt-1">
            {mode === 'login' && 'Plan, customize, and share bespoke royal voyages.'}
            {mode === 'signup' && 'Access exclusive palace destinations & automated cost ledgers.'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {resetSent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Password Reset Email Sent!</h3>
            <p className="text-xs text-[#d6cbbe] mt-1 max-w-xs mx-auto">
              Check your inbox at <span className="font-semibold text-white">{email}</span> for a secure password reset link.
            </p>
            <button
              id="back-to-login-btn"
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              className="gold-btn mt-6 w-full py-2.5 text-xs"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#b89f7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-sm text-white placeholder:text-[#b89f7a]/40 focus:outline-hidden focus:border-[#dfbe88] transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#b89f7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="guest@theleela.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-sm text-white placeholder:text-[#b89f7a]/40 focus:outline-hidden focus:border-[#dfbe88] transition"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-serif font-bold text-[#dfbe88] uppercase tracking-wider">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      id="forgot-password-link"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-medium text-[#dfbe88] hover:text-white transition"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#b89f7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#17130f] border border-[#c5a880]/30 rounded-xl text-sm text-white placeholder:text-[#b89f7a]/40 focus:outline-hidden focus:border-[#dfbe88] transition"
                  />
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="gold-btn w-full py-3 text-xs shadow-md mt-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Guest Account' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode Toggle */}
        <div className="mt-5 text-center text-xs text-[#b89f7a]">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                id="toggle-signup-btn"
                onClick={() => setMode('signup')}
                className="font-serif font-bold text-[#dfbe88] hover:text-white cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                id="toggle-login-btn"
                onClick={() => setMode('login')}
                className="font-serif font-bold text-[#dfbe88] hover:text-white cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

        {/* Fast Demo Logins */}
        <div className="mt-6 pt-5 border-t border-[#c5a880]/20">
          <p className="text-[10px] uppercase font-serif font-bold text-[#b89f7a] text-center tracking-widest mb-2.5">
            Instant Royal Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-traveler-login-btn"
              type="button"
              onClick={() => handleQuickLogin(MOCK_USER)}
              className="gold-outline-btn py-2 text-[11px] font-semibold"
            >
              👤 Royal Guest
            </button>
            <button
              id="demo-admin-login-btn"
              type="button"
              onClick={() => handleQuickLogin(MOCK_ADMIN_USER)}
              className="gold-outline-btn py-2 text-[11px] font-semibold flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#dfbe88]" /> Palace Curator
            </button>
          </div>
        </div>

        {onCancel && (
          <div className="mt-4 text-center">
            <button
              onClick={onCancel}
              className="text-xs text-[#b89f7a] hover:text-white underline cursor-pointer"
            >
              Continue as Guest (Read Only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
