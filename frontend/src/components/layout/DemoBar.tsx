import React from 'react';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { BUSINESS_IDS } from '../../data/seedConstants';
import { RotateCcw, Sparkles } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

export const DemoBar: React.FC = () => {
  const currentBusinessId = useArthSetuStore((s) => s.currentBusinessId);
  const switchBusiness = useArthSetuStore((s) => s.switchBusiness);
  const resetDemoData = useArthSetuStore((s) => s.resetDemoData);
  const startTour = useArthSetuStore((s) => s.startTour);
  const { t } = useI18n();

  return (
    <aside
      aria-label="Demonstration environment bar"
      className="bg-[#0F2E22] text-[#F8F1DE] py-1 px-3 sm:px-6 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 border-b border-[#D08A1E]/30 relative z-40 select-none"
    >
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-[#D08A1E] animate-pulse" />
        <span className="font-bold tracking-wider text-[#D08A1E] uppercase">
          {t('nav.demoData', 'DEMONSTRATION DATA')}
        </span>
        <span className="hidden md:inline text-[#B7C4A0] opacity-80">
          · No real bank or AA network connections exist in this prototype.
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Language Selector */}
        <LanguageSelector variant="demobar" />

        {/* Switcher */}
        <div className="flex items-center space-x-1">
          <label htmlFor="demo-biz-selector" className="text-[#E6DAB9] text-[10px]">
            {t('nav.business', 'Business')}:
          </label>
          <select
            id="demo-biz-selector"
            aria-label="Select demonstration business"
            value={currentBusinessId}
            onChange={(e) => switchBusiness(e.target.value)}
            className="bg-[#14402F] text-[#FDFBF4] border border-[#2A6347] rounded px-1.5 py-0.5 text-[11px] font-sans focus:outline-none focus:border-[#D08A1E]"
          >
            <option value={BUSINESS_IDS.A_LAKSHMI_KIRANA}>Lakshmi Kirana (Mature · 12 Mo)</option>
            <option value={BUSINESS_IDS.B_RANGOLI_BAZAAR}>Rangoli Bazaar (Seasonal · 12 Mo)</option>
            <option value={BUSINESS_IDS.C_SUNITA_VARIETY}>Sunita Variety (Review Journey · 7 Mo)</option>
          </select>
        </div>

        {/* Reset */}
        <button
          onClick={resetDemoData}
          className="flex items-center space-x-1 text-[#E6DAB9] hover:text-white px-1.5 py-0.5 rounded hover:bg-[#14402F] transition-colors"
          title="Reset demonstration state"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">{t('nav.reset', 'Reset')}</span>
        </button>

        {/* Guided Tour */}
        <button
          onClick={startTour}
          className="flex items-center space-x-1 text-[#D08A1E] hover:text-[#E8D6A3] font-bold px-1.5 py-0.5 rounded bg-[#14402F] border border-[#D08A1E]/40 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>{t('nav.tour', 'Tour')}</span>
        </button>
      </div>
    </aside>
  );
};
