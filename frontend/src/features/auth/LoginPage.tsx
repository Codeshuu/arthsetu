import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/AuthService';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { ArrowRight, Sparkles, Check, ShieldCheck } from 'lucide-react';
import { KhataPage } from '../../components/fragments/KhataPage';

export const LoginPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('owner@kirana.store');
  const [otp, setOtp] = useState('123456');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (authMethod === 'phone') {
      await authService.loginWithPhone(phone, otp);
    } else {
      await authService.loginWithEmail(email, password);
    }
    setIsLoading(false);
    navigate('/app');
  };

  const handleDemoBypass = async () => {
    await authService.loginAsDemo('biz_lakshmi_kirana');
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F1E8D0] select-none font-sans">
      {/* Left Column: Forest Brand Panel with Story Spine Atmosphere */}
      <div className="md:w-1/2 bg-[#14402F] text-[#FDFBF4] p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#0F2E22] relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-[#FDFBF4] flex items-center justify-center text-[#14402F] font-bold font-display text-lg">
              अ
            </div>
            <span className="font-display font-bold text-xl text-[#FDFBF4]">ArthSetu</span>
          </Link>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#D08A1E] font-bold">
            The Bridge of Evidence
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#FDFBF4] max-w-sm">
            Making Small Businesses Financially Visible
          </h2>
        </div>

        {/* Khata Page Fragment Floating in Left Panel */}
        <div className="my-8 transform -rotate-3 scale-95 opacity-90 hidden sm:block">
          <KhataPage
            title="दुकानदार बही-खाता (Secure Ledger)"
            date="Demo Session"
            pageNo={1}
            entries={[
              { particular: 'स्थानीय डेटा सुरक्षा (100% Offline)', amount: 100 },
              { particular: 'कोई रिमोट सर्वर नहीं (Client-Only)', amount: 100 },
            ]}
          />
        </div>

        <div className="relative z-10 text-xs text-[#B7C4A0] font-mono">
          Prototype Environment · Deterministic Demonstration Mode
        </div>
      </div>

      {/* Right Column: Paper Form */}
      <div className="md:w-1/2 p-8 sm:p-14 flex items-center justify-center bg-[#FDFBF4] bg-khata-page">
        <div className="max-w-md w-full space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
              {t('auth.badge')}
            </span>
            <h3 className="font-display font-bold text-2xl text-[#14402F]">
              {t('auth.title')}
            </h3>
            <p className="text-xs text-[#5A3E2B] mt-1">
              {t('auth.subtitle')}
            </p>
          </div>

          {/* Quick Demo Bypass Button */}
          <div className="p-3 bg-[#E4EAD6] border border-[#939F5B] rounded-md flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#14402F]">{t('auth.demoBypassTitle')}</div>
              <div className="text-[11px] text-[#2A6347]">{t('auth.demoBypassDesc')}</div>
            </div>
            <button
              type="button"
              onClick={handleDemoBypass}
              className="px-3.5 py-1.5 rounded bg-[#14402F] text-white font-bold hover:bg-[#0F2E22] transition-colors font-mono"
            >
              {t('auth.demoBypassBtn')}
            </button>
          </div>

          {/* Auth Method Selector */}
          <div className="flex border-b border-[#D6CAA8] text-xs font-mono font-bold">
            <button
              onClick={() => setAuthMethod('phone')}
              className={`pb-2 px-3 border-b-2 transition-all ${
                authMethod === 'phone'
                  ? 'border-[#14402F] text-[#14402F]'
                  : 'border-transparent text-[#7C766B]'
              }`}
            >
              {t('auth.phoneTab')}
            </button>
            <button
              onClick={() => setAuthMethod('email')}
              className={`pb-2 px-3 border-b-2 transition-all ${
                authMethod === 'email'
                  ? 'border-[#14402F] text-[#14402F]'
                  : 'border-transparent text-[#7C766B]'
              }`}
            >
              {t('auth.emailTab')}
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            {authMethod === 'phone' ? (
              <>
                <div>
                  <label className="block text-[#2B2620] font-bold mb-1">
                    {t('auth.phoneLabel')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm text-[#2B2620]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2B2620] font-bold mb-1">
                    {t('auth.otpLabel')}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm text-[#2B2620] tracking-widest"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[#2B2620] font-bold mb-1">{t('auth.emailLabel')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm text-[#2B2620]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2B2620] font-bold mb-1">{t('auth.passwordLabel')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm text-[#2B2620]"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded bg-[#14402F] text-[#FDFBF4] font-bold text-xs hover:bg-[#0F2E22] transition-colors shadow flex items-center justify-center space-x-1"
            >
              <span>{isLoading ? 'Verifying...' : t('auth.loginBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D08A1E]" />
            </button>
          </form>

          <div className="text-center text-xs text-[#7C766B] font-mono">
            New store?{' '}
            <Link to="/onboarding" className="text-[#14402F] font-bold underline">
              Create your book (Onboarding)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

