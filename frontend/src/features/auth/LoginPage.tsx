import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { SEED_USERS } from '../../data/seedUsers';
import {
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const login = useArthSetuStore((s) => s.login);
  const loginAsDemoUser = useArthSetuStore((s) => s.loginAsDemoUser);

  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number or email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (res.success) {
        navigate('/app');
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your mobile/email and password.');
      }
    }, 250);
  };

  const handleQuickDemoSelect = (userId: string) => {
    loginAsDemoUser(userId);
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5] select-none font-sans">
      {/* Left Column: Authentic Indian Shopkeeper Identity & Branding */}
      <div className="md:w-1/2 bg-[#0E281F] text-[#FDFBF4] p-8 sm:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#081813] relative overflow-hidden">
        {/* Top Header Branding */}
        <div className="relative z-10 space-y-4">
          <Link to="/" className="inline-flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#B94F35] flex items-center justify-center text-white shadow-md border border-[#A64D3D]">
              <BookOpen className="w-6 h-6 text-[#E8A04B]" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl text-[#FDFBF4] tracking-tight leading-none block">
                ArthSetu
              </span>
              <span className="text-[11px] block font-mono text-[#D8BDA0] tracking-wider uppercase mt-0.5">
                Financial Visibility Protocol
              </span>
            </div>
          </Link>

          <div className="pt-4 max-w-md">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#FDFBF4] leading-snug">
              Making Local Indian Small Businesses Financially Visible
            </h2>
            <p className="text-xs sm:text-sm text-[#C4D1BF] mt-3 leading-relaxed">
              ArthSetu transforms everyday dukandaar records — daily counter cash, UPI soundbox collections, and traditional khata registers — into bank-ready Financial Visibility Passports.
            </p>
          </div>
        </div>

        {/* Subtle, Authentic Indian Dukaan SVG Illustration */}
        <div className="my-8 relative z-10 hidden sm:block max-w-sm mx-auto">
          <div className="p-5 rounded-xl bg-[#14382C] border border-[#1C4D3D] shadow-inner text-center space-y-3">
            <svg
              className="w-full h-36 mx-auto text-[#D8BDA0]"
              viewBox="0 0 320 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Store Awning / Chajja */}
              <path d="M20 30 L300 30 L290 15 L30 15 Z" fill="#B94F35" stroke="#E8A04B" strokeWidth="1.5" />
              <path d="M20 30 Q35 40 50 30 Q65 40 80 30 Q95 40 110 30 Q125 40 140 30 Q155 40 170 30 Q185 40 200 30 Q215 40 230 30 Q245 40 260 30 Q275 40 290 30 Q295 40 300 30" stroke="#E8A04B" strokeWidth="1.5" fill="none" />
              {/* Shelves with kirana jars */}
              <line x1="40" y1="60" x2="280" y2="60" stroke="#D8BDA0" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="40" y1="85" x2="280" y2="85" stroke="#D8BDA0" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Glass Jars */}
              <rect x="50" y="44" width="16" height="15" rx="2" stroke="#E8A04B" strokeWidth="1.2" fill="#14382C" />
              <rect x="75" y="44" width="16" height="15" rx="2" stroke="#E8A04B" strokeWidth="1.2" fill="#14382C" />
              <rect x="100" y="44" width="16" height="15" rx="2" stroke="#E8A04B" strokeWidth="1.2" fill="#14382C" />
              <rect x="135" y="44" width="18" height="15" rx="2" stroke="#D8BDA0" strokeWidth="1.2" fill="#14382C" />
              <rect x="160" y="44" width="18" height="15" rx="2" stroke="#D8BDA0" strokeWidth="1.2" fill="#14382C" />
              <rect x="195" y="44" width="16" height="15" rx="2" stroke="#E8A04B" strokeWidth="1.2" fill="#14382C" />
              <rect x="220" y="44" width="16" height="15" rx="2" stroke="#E8A04B" strokeWidth="1.2" fill="#14382C" />
              {/* Counter desk */}
              <rect x="35" y="95" width="250" height="35" rx="3" fill="#1E4F3E" stroke="#D8BDA0" strokeWidth="1.5" />
              {/* Traditional Red Khata Book on counter */}
              <rect x="60" y="85" width="40" height="24" rx="2" fill="#B94F35" stroke="#E8A04B" strokeWidth="1.2" />
              <line x1="68" y1="85" x2="68" y2="109" stroke="#E8A04B" strokeWidth="1" />
              <circle cx="82" cy="97" r="4" fill="#E8A04B" />
              {/* Weighing scale */}
              <path d="M140 105 L150 88 L160 105 Z" fill="#D8BDA0" opacity="0.8" />
              <line x1="130" y1="88" x2="170" y2="88" stroke="#E8A04B" strokeWidth="1.5" />
              {/* UPI Soundbox Standee */}
              <rect x="235" y="80" width="22" height="30" rx="3" fill="#0A2540" stroke="#0284C7" strokeWidth="1.2" />
              <rect x="240" y="85" width="12" height="12" fill="#FFFFFF" />
              <circle cx="246" cy="103" r="2" fill="#0284C7" />
            </svg>
            <div className="text-[11px] text-[#A7BAA0] font-mono">
              Strict Private Vault · Zero Cloud Leakage · 100% Client-Side
            </div>
          </div>
        </div>

        {/* Security & Isolation Assurance */}
        <div className="relative z-10 pt-4 border-t border-[#1C4D3D] text-[11px] text-[#8EA28A] font-mono flex items-center justify-between">
          <span>Private Shopkeeper Accounts</span>
          <span>Offline Architecture</span>
        </div>
      </div>

      {/* Right Column: Clean, Trustworthy Sign In Form */}
      <div className="md:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-[#FAF8F5]">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#E4EAD6] text-[#2A6347] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Merchant Portal</span>
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#1E293B]">
              Shopkeeper Sign In
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Enter your credentials to access your private business ledger and financial passport.
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Sign In Error</span>
                <span className="text-[11px] text-red-700">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Forgot Password Alert Modal / Banner */}
          {showForgotNotice && (
            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>Account Recovery Assistance</span>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(false)}
                  className="text-blue-500 hover:text-blue-700 font-mono text-[10px]"
                >
                  Close
                </button>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                For pre-seeded demo accounts, the password is <code className="font-bold bg-blue-100 px-1 py-0.5 rounded">password123</code>. For newly registered accounts, your password was set during store registration.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier: Mobile or Email */}
            <div>
              <label htmlFor="auth-identifier" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Mobile Number or Email Address
              </label>
              <input
                id="auth-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or ramesh@lakshmikirana.in"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F] focus:border-[#14402F] transition-all font-mono"
                required
              />
            </div>

            {/* Password with Show/Hide toggle */}
            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F] focus:border-[#14402F] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#14402F] focus:ring-[#14402F]"
                />
                <span>Remember me on this browser</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotNotice(true)}
                className="text-[#14402F] font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-[#14402F] text-white font-bold text-sm hover:bg-[#0F2E22] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center space-x-2 mt-2"
            >
              <span>{isLoading ? 'Verifying Account...' : 'Sign In to Your Khata'}</span>
              <ArrowRight className="w-4 h-4 text-[#E8A04B]" />
            </button>
          </form>

          {/* Link to Registration */}
          <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Need a private ledger for your business?{' '}
            <Link to="/register" className="text-[#B94F35] font-bold hover:underline">
              Create an account (Register your shop)
            </Link>
          </div>

          {/* Quick Demo Switcher Section for Institutional Review */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                Demonstration Shopkeeper Accounts
              </span>
              <span className="text-[9px] font-mono text-[#059669] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                100% Data Isolation
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Select any pre-configured shopkeeper to test strict data separation:
            </p>

            <div className="grid grid-cols-1 gap-2 font-mono text-xs">
              {SEED_USERS.map((u) => {
                const storeLabel =
                  u.id === 'usr_ramesh'
                    ? 'Lakshmi Kirana (12M Kirana · Hubballi)'
                    : u.id === 'usr_priya'
                    ? 'Rangoli Bazaar (12M Festival Goods · Jaipur)'
                    : 'Sunita Variety (7M Stationery · Varanasi)';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoSelect(u.id)}
                    className="p-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:border-[#14402F] hover:bg-[#F8FAF7] transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-[#1E293B] group-hover:text-[#14402F] flex items-center gap-1.5">
                        <span>{u.name}</span>
                        <span className="text-[10px] text-[#64748B] font-normal">({u.phone})</span>
                      </div>
                      <div className="text-[10px] text-[#64748B] font-sans truncate">{storeLabel}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#14402F] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
