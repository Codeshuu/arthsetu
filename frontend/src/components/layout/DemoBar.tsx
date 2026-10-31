import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { RotateCcw, Sparkles, UserCheck, LogOut } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

export const DemoBar: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useArthSetuStore((s) => s.currentUser);
  const currentBusinessId = useArthSetuStore((s) => s.currentBusinessId);
  const getUserBusinesses = useArthSetuStore((s) => s.getUserBusinesses);
  const switchBusiness = useArthSetuStore((s) => s.switchBusiness);
  const resetDemoData = useArthSetuStore((s) => s.resetDemoData);
  const startTour = useArthSetuStore((s) => s.startTour);
  const logout = useArthSetuStore((s) => s.logout);
  const { t } = useI18n();

  const userBusinesses = getUserBusinesses();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      aria-label="Private shopkeeper session and demonstration bar"
      className="bg-[#2B231D] text-[#F4E6CE] py-1.5 px-3 sm:px-6 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 border-b border-[#B94F35]/40 relative z-40 select-none shadow-sm"
    >
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        <span className="font-bold tracking-wider text-[#E8A04B] uppercase flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{currentUser ? currentUser.name : 'Private Session'}</span>
        </span>
        <span className="text-[#D8BDA0] text-[10px] hidden sm:inline">
          · Private Account ({userBusinesses.length} {userBusinesses.length === 1 ? 'store' : 'stores'} owned)
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Language Selector */}
        <LanguageSelector variant="demobar" />

        {/* Business Selector (Strictly filtered to businesses owned by current user) */}
        {userBusinesses.length > 1 ? (
          <div className="flex items-center space-x-1">
            <label htmlFor="user-biz-selector" className="text-[#D8BDA0] text-[10px]">
              {t('nav.business', 'Store')}:
            </label>
            <select
              id="user-biz-selector"
              aria-label="Select active business"
              value={currentBusinessId}
              onChange={(e) => switchBusiness(e.target.value)}
              className="bg-[#4A3B31] text-[#F4E6CE] border border-[#B94F35]/60 rounded px-1.5 py-0.5 text-[11px] font-sans focus:outline-none focus:border-[#E8A04B]"
            >
              {userBusinesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="hidden md:inline text-[10px] text-[#D8BDA0] bg-[#3E3027] px-2 py-0.5 rounded border border-[#76513B]/40">
            {userBusinesses[0]?.name || 'Private Vault'}
          </span>
        )}

        {/* Reset Active Store Data */}
        <button
          onClick={resetDemoData}
          className="flex items-center space-x-1 text-[#D8BDA0] hover:text-white px-1.5 py-0.5 rounded hover:bg-[#76513B] transition-colors"
          title="Reset current store demonstration state"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">{t('nav.reset', 'Reset')}</span>
        </button>

        {/* Guided Tour */}
        <button
          onClick={startTour}
          className="flex items-center space-x-1 text-[#E8A04B] hover:text-white font-bold px-2 py-0.5 rounded bg-[#4A3B31] border border-[#E8A04B]/50 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-[#E8A04B]" />
          <span>{t('nav.tour', 'Tour')}</span>
        </button>

        {/* Logout / Switch User */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 text-[#F87171] hover:text-white px-2 py-0.5 rounded hover:bg-[#DC2626]/80 transition-colors border border-[#DC2626]/40"
          title="Sign out of this shopkeeper account"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
