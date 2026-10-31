import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { BusinessCategory } from '../../services/types';
import {
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Store,
  Lock,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const register = useArthSetuStore((s) => s.register);

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory>('kirana');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!emailAddress.trim() || !emailAddress.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!businessName.trim()) {
      setErrorMessage('Please enter your business trading name.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('Please accept the Terms of Service to proceed.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = register({
        name: fullName.trim(),
        phone: cleanPhone,
        email: emailAddress.trim(),
        password,
        businessName: businessName.trim(),
        category: businessCategory,
      });

      setIsLoading(false);
      if (res.success) {
        navigate('/app');
      } else {
        setErrorMessage(res.error || 'Failed to create account. An account with this email/phone may already exist.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5] select-none font-sans">
      {/* Left Column: Authentic Indian Shopkeeper Identity */}
      <div className="md:w-5/12 bg-[#0E281F] text-[#FDFBF4] p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#081813] relative overflow-hidden">
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

          <div className="pt-4 max-w-sm">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#FDFBF4] leading-snug">
              Open Your Private Shopkeeper Ledger
            </h2>
            <p className="text-xs sm:text-sm text-[#C4D1BF] mt-3 leading-relaxed">
              Register your business to begin recording daily counter transactions, tracking udhaar credit, and creating a credible Financial Visibility Passport for institutional appraisal.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="my-8 relative z-10 space-y-3 font-mono text-xs text-[#D8BDA0]">
          <div className="p-3 bg-[#14382C] rounded-lg border border-[#1C4D3D] space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-[#E8A04B]" />
              <span>100% Private Business Vault</span>
            </div>
            <p className="text-[11px] text-[#A7BAA0] font-sans">
              Your store data is isolated to your private account. Other merchants and external parties cannot view your transactions.
            </p>
          </div>

          <div className="p-3 bg-[#14382C] rounded-lg border border-[#1C4D3D] space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E8A04B]" />
              <span>Deterministic Local Cryptography</span>
            </div>
            <p className="text-[11px] text-[#A7BAA0] font-sans">
              All financial summaries are cryptographically fingerprinted with SHA-256 for institutional verification.
            </p>
          </div>
        </div>

        {/* Footnote */}
        <div className="relative z-10 pt-4 border-t border-[#1C4D3D] text-[11px] text-[#8EA28A] font-mono flex items-center justify-between">
          <span>Sole Proprietorship & Retail</span>
          <span>Offline Architecture</span>
        </div>
      </div>

      {/* Right Column: Clean Registration Form */}
      <div className="md:w-7/12 p-6 sm:p-10 lg:p-14 flex items-center justify-center bg-[#FAF8F5] overflow-y-auto">
        <div className="max-w-xl w-full space-y-6">
          {/* Header */}
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#E4EAD6] text-[#2A6347] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Merchant Onboarding</span>
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#1E293B]">
              Register Your Business
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Fill in your business details below to create your private ledger.
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Registration Error</span>
                <span className="text-[11px] text-red-700">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F]"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9845012345"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F] font-mono"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="e.g. anand@anandkirana.in"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Business Trading Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Anand Provisions & Stores"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F]"
                  required
                />
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Business Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value as BusinessCategory)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F]"
                >
                  <option value="kirana">Kirana & Grocery Store</option>
                  <option value="garments">Garments & Textiles</option>
                  <option value="festival_goods">Festival & Pooja Goods</option>
                  <option value="stationery">Stationery & Book Depot</option>
                  <option value="vegetable_fruit">Fruits & Vegetables</option>
                  <option value="general_retail">General Retail / Variety</option>
                  <option value="other">Other Small Enterprise</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Password (min 6 characters) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F]"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14402F]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Accept Terms */}
            <div className="pt-2">
              <label className="flex items-start space-x-2.5 text-xs text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#14402F] focus:ring-[#14402F] mt-0.5"
                  required
                />
                <span className="leading-relaxed">
                  I accept the Terms of Service and understand that ArthSetu creates a private, isolated business vault strictly accessible by my account.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-[#14402F] text-white font-bold text-sm hover:bg-[#0F2E22] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center space-x-2 mt-4"
            >
              <span>{isLoading ? 'Creating Account & Vault...' : 'Create Shopkeeper Account'}</span>
              <ArrowRight className="w-4 h-4 text-[#E8A04B]" />
            </button>
          </form>

          {/* Link back to Login */}
          <div className="p-3.5 bg-white rounded-lg border border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Already have a registered account?{' '}
            <Link to="/login" className="text-[#14402F] font-bold hover:underline">
              Sign In to Your Khata
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

