import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { reportService } from '../../services/ReportService';
import { BusinessCategory, OwnershipType } from '../../services/types';
import { Save, RotateCcw, Download, ShieldCheck, Check, UserCheck, LogOut, Lock } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const currentUser = useArthSetuStore((s) => s.currentUser);
  const business = useArthSetuStore((s) => s.business);
  const updateBusiness = useArthSetuStore((s) => s.updateBusiness);
  const resetDemoData = useArthSetuStore((s) => s.resetDemoData);
  const logout = useArthSetuStore((s) => s.logout);

  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState<BusinessCategory>(business.category);
  const [ownership, setOwnership] = useState<OwnershipType>(business.ownership);
  const [years, setYears] = useState(business.yearsOperating);
  const [city, setCity] = useState(business.location.city);
  const [state, setState] = useState(business.location.state);
  const [area, setArea] = useState(business.location.area);
  const [pincode, setPincode] = useState(business.location.pincode);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name,
      category,
      ownership,
      yearsOperating: years,
      location: { city, state, area, pincode },
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CAA8] pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            {t('profile.banner')}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
            {t('profile.title')}
          </h1>
        </div>

        {savedToast && (
          <div className="px-3 py-1.5 rounded bg-[#E4EAD6] border border-[#939F5B] text-xs font-mono font-bold text-[#2A6347] flex items-center space-x-1 animate-pulse">
            <Check className="w-4 h-4" />
            <span>Profile Updated Successfully!</span>
          </div>
        )}
      </div>

      {/* Private Shopkeeper Account Identity Card */}
      {currentUser && (
        <div className="bg-[#FAF8F5] border border-[#D8BDA0] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8BDA0]">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-[#14402F] text-white flex items-center justify-center text-base font-bold shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-lg text-[#14402F]">
                    {currentUser.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <UserCheck className="w-3 h-3" />
                    Verified Owner
                  </span>
                </div>
                <div className="text-xs text-[#76513B] font-mono">
                  {currentUser.email} · {currentUser.phone}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-mono font-bold hover:bg-red-100 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-white rounded-lg border border-[#D8BDA0]/60">
              <span className="text-[10px] text-slate-400 block uppercase">Account ID</span>
              <span className="font-bold text-slate-800 truncate block mt-0.5">{currentUser.id}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#D8BDA0]/60">
              <span className="text-[10px] text-slate-400 block uppercase">Active Store Vault</span>
              <span className="font-bold text-slate-800 truncate block mt-0.5">{business.id}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#D8BDA0]/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Data Partition</span>
                <span className="font-bold text-emerald-700 block mt-0.5">Strictly Isolated</span>
              </div>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Form */}
      <form
        onSubmit={handleSave}
        className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-6 sm:p-8 shadow-paper-elevated space-y-5 bg-khata-page"
      >
        <h3 className="font-display font-bold text-lg text-[#14402F] border-b border-[#D6CAA8] pb-2">
          {t('profile.formTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="block text-[#2B2620] font-bold mb-1">{t('profile.nameLabel')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620] font-sans"
            />
          </div>

          <div>
            <label className="block text-[#2B2620] font-bold mb-1">{t('profile.categoryLabel')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620]"
            >
              <option value="kirana">Kirana & Grocery</option>
              <option value="festival_goods">Festival Goods Trader</option>
              <option value="general_retail">General / Variety Store</option>
              <option value="vegetable_fruit">Vegetables & Fruits</option>
              <option value="garments">Garments & Textiles</option>
              <option value="stationery">Stationery & Xerox</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[#2B2620] font-bold mb-1">{t('profile.ownershipLabel')}</label>
            <select
              value={ownership}
              onChange={(e) => setOwnership(e.target.value as any)}
              className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620]"
            >
              <option value="sole_proprietorship">Sole Proprietorship</option>
              <option value="family_run">Family-Run Business</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>

          <div>
            <label className="block text-[#2B2620] font-bold mb-1">{t('profile.yearsLabel')}</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620]"
            />
          </div>

          <div>
            <label className="block text-[#2B2620] font-bold mb-1">{t('profile.marketLabel')}</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620]"
            />
          </div>

          <div>
            <label className="block text-[#2B2620] font-bold mb-1">{t('profile.cityLabel')}</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620]"
            />
          </div>

          <div>
            <label className="block text-[#2B2620] font-bold mb-1">{t('profile.stateLabel')}</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620]"
            />
          </div>

          <div>
            <label className="block text-[#2B2620] font-bold mb-1">{t('profile.pincodeLabel')}</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#D6CAA8] flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-[#14402F] text-white text-xs font-bold hover:bg-[#0F2E22] flex items-center space-x-1.5 shadow"
          >
            <Save className="w-4 h-4 text-[#D08A1E]" />
            <span>{t('profile.saveBtn')}</span>
          </button>
        </div>
      </form>

      {/* Local Data Sovereignty & Privacy Note */}
      <div className="bg-[#E4EAD6] border border-[#939F5B] rounded-md p-5 space-y-2 text-xs font-sans text-[#14402F]">
        <div className="flex items-center space-x-2 font-mono font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-[#2A6347]" />
          <span>{t('profile.sovereigntyTitle')}</span>
        </div>
        <p className="leading-relaxed">
          {t('profile.sovereigntyDesc')}
        </p>
      </div>

      {/* Data Management Actions */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 shadow-paper-lift space-y-3">
        <h4 className="font-display font-bold text-base text-[#14402F]">
          {t('profile.managementTitle')}
        </h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => reportService.exportJsonFile()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-mono font-bold text-[#14402F] hover:bg-[#E6DAB9]"
          >
            <Download className="w-4 h-4 text-[#8A6446]" />
            <span>{t('profile.backupBtn')}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to the clean demonstration seed?')) {
                resetDemoData();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#F8F1DE] border border-[#B5532F]/50 text-xs font-mono font-bold text-[#B5532F] hover:bg-[#E8C3B0]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('profile.resetBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
