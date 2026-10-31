import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { DemoBar } from '../../components/layout/DemoBar';
import { LanguageSelector } from '../../components/layout/LanguageSelector';
import { StoryRail, StoryBeat } from '../../components/fragments/StoryRail';
import { GuidedTour } from '../../features/tour/GuidedTour';
import { AddRecordKhataBookModal } from '../../components/khata/AddRecordKhataBookModal';
import {
  Home,
  Receipt,
  UploadCloud,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  FileText,
  User,
  Share2,
  PlusCircle,
  Menu,
  X,
  BookOpen,
  LogOut,
  UserCheck,
} from 'lucide-react';

export const OwnerShell: React.FC = () => {
  const { t, language } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useArthSetuStore((s) => s.currentUser);
  const business = useArthSetuStore((s) => s.business);
  const logout = useArthSetuStore((s) => s.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [khataModalOpen, setKhataModalOpen] = useState(false);

  // Authentication Guard: Redirect to /login if unauthenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine active story beat based on route
  const getBeatForRoute = (): StoryBeat => {
    const path = location.pathname;
    if (path.includes('/diary') || path.includes('/records/import')) return 2;
    if (path.includes('/records/review') || path.includes('/evidence')) return 3;
    if (path.includes('/analytics')) return 4;
    if (path.includes('/passport')) return 5;
    return 2; // Home / default
  };

  const currentBeat = getBeatForRoute();

  const navItems = [
    { label: t('nav.overview', 'Overview'), path: '/app', icon: Home, beat: 2 },
    { label: t('nav.transactions', 'Transactions'), path: '/app/records', icon: Receipt, beat: 3 },
    { label: t('nav.import', 'Import Records'), path: '/app/records/import', icon: UploadCloud, beat: 3 },
    { label: t('nav.reconciliation', 'Reconciliation'), path: '/app/records/review', icon: CheckCircle2, beat: 3 },
    { label: t('nav.insights', 'Insights & Data Quality'), path: '/app/analytics', icon: BarChart3, beat: 4 },
    { label: t('nav.evidence', 'Evidence Quality'), path: '/app/evidence', icon: ShieldCheck, beat: 3 },
    { label: t('nav.passport', 'Financial Passport'), path: '/app/passport', icon: FileText, beat: 5 },
    { label: t('nav.profile', 'Business Profile'), path: '/app/profile', icon: User, beat: 2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4E6CE] text-[#39332E]">
      {/* Demo & Multi-User Bar */}
      <DemoBar />

      {/* Main Top Header */}
      <header className="bg-[#FDFBF4] border-b border-[#D8BDA0] px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 select-none shadow-paper-lift">
        {/* Left: Brand Mark */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-[#B94F35] hover:bg-[#F4E6CE]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#B94F35] flex items-center justify-center text-white shadow-sm border border-[#A64D3D]">
              <BookOpen className="w-5 h-5 text-[#E8A04B]" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-[#A64D3D] tracking-tight leading-none block">
                ArthSetu
              </span>
              <span className="text-[10px] block font-mono text-[#76513B] leading-tight">
                {t('landing.tagline', 'Digital Khata Protocol')}
              </span>
            </div>
          </Link>

          <div className="hidden lg:block pl-3 border-l border-[#D8BDA0]">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{
                business.category === 'kirana' ? '🏪' :
                business.category === 'garments' ? '👗' :
                business.category === 'vegetable_fruit' ? '🥦' :
                business.category === 'festival_goods' ? '🪔' :
                business.category === 'stationery' ? '📚' : '🛒'
              }</span>
              <div>
                <div className="text-xs font-bold text-[#39332E] truncate max-w-[180px]">{business.name}</div>
                <div className="text-[10px] text-[#76513B] truncate">{business.location.city}, {business.location.state}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Story Rail */}
        <div className="hidden md:flex items-center">
          <StoryRail currentBeat={currentBeat} showLabels={true} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Add Record Khatabook Trigger Button */}
          <button
            type="button"
            onClick={() => setKhataModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#B94F35] text-white text-xs font-bold shadow-sm hover:bg-[#A64D3D] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#E8A04B]" />
            <span>{t('nav.recordTxn', '+ Record Entry')}</span>
          </button>

          {/* 4-Language Selector */}
          <LanguageSelector variant="header" />

          {/* Share Passport Button */}
          <Link
            to="/app/passport/share"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#D99A28] text-white text-xs font-bold shadow-sm hover:bg-[#B57415] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('nav.sharePassport')}</span>
            <span className="sm:hidden">Share</span>
          </Link>

          {/* Logout / Switch User */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center space-x-1 text-xs text-[#76513B] hover:text-[#DC2626] px-2 py-1.5 rounded hover:bg-[#F4E6CE] transition-colors"
            title="Sign out of account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar */}
        <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-[#FDFBF4] border-r border-[#D8BDA0] select-none flex-shrink-0">
          {/* Authenticated Shopkeeper Profile Card at top of sidebar */}
          <div className="p-3 border-b border-[#D8BDA0] bg-[#F4E6CE]/70">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-[#14402F] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#14402F] truncate flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <UserCheck className="w-3 h-3 text-[#10B981] flex-shrink-0" />
                </div>
                <div className="text-[10px] text-[#76513B] font-mono truncate">{currentUser.email}</div>
              </div>
            </div>
            <div className="p-1.5 bg-[#FDFBF4] rounded border border-[#D8BDA0] text-[10px] text-[#39332E]">
              <span className="font-bold block truncate">{business.name}</span>
              <span className="text-[#76513B] block font-mono">{business.location.city} · {business.category}</span>
            </div>
          </div>

          <nav className="p-2 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/app'
                  ? location.pathname === '/app'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#B94F35] text-white shadow-sm font-bold'
                      : 'text-[#39332E] hover:bg-[#F4E6CE] hover:text-[#B94F35]'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#E8A04B]' : 'text-[#76513B]'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E8A04B] flex-shrink-0" />}
                </Link>
              );
            })}
          </nav>

          {/* Quick Diary CTA - Khatabook Opening Trigger */}
          <div className="p-3 border-t border-[#D8BDA0] space-y-2 bg-[#FDFBF4]">
            <button
              type="button"
              onClick={() => setKhataModalOpen(true)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-[#B94F35] text-white text-xs font-bold hover:bg-[#A64D3D] transition-colors shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#E8A04B]" />
              <span>{t('nav.recordTxn', '+ Record Entry')}</span>
            </button>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#76513B] pt-1 border-t border-[#D8BDA0]/50">
              <span>Private Vault</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[#DC2626] hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[88px] bg-[#241A14]/50 z-40" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="bg-[#FDFBF4] border-b border-[#D8BDA0] p-4 space-y-1 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 mb-2 bg-[#F4E6CE] rounded-lg text-xs font-mono">
                <div className="font-bold text-[#14402F]">{currentUser.name}</div>
                <div className="text-[11px] text-[#76513B]">{business.name} ({business.location.city})</div>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/app'
                    ? location.pathname === '/app'
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-[#B94F35] text-white font-bold' : 'text-[#39332E]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-[#D8BDA0]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm text-[#DC2626] font-bold p-2 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Routed Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar with raised '+' Khatabook Record Button */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FDFBF4] border-t border-[#D8BDA0] px-2 py-1 flex items-center justify-around z-40 select-none shadow-paper-elevated"
      >
        <Link
          to="/app"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold ${
            location.pathname === '/app' ? 'text-[#B94F35] font-bold' : 'text-[#76513B]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>{t('nav.home')}</span>
        </Link>

        <Link
          to="/app/records"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold ${
            location.pathname.startsWith('/app/records')
              ? 'text-[#B94F35] font-bold'
              : 'text-[#76513B]'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>{t('nav.records')}</span>
        </Link>

        {/* Raised center '+' Khatabook opening button */}
        <button
          type="button"
          onClick={() => setKhataModalOpen(true)}
          className="flex flex-col items-center -mt-5 bg-[#B94F35] text-white rounded-full p-2.5 shadow-lg border-2 border-[#E8A04B] hover:scale-105 transition-transform"
          aria-label="Add Khatabook Record"
        >
          <PlusCircle className="w-6 h-6 text-[#E8A04B]" />
        </button>

        <Link
          to="/app/passport"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold ${
            location.pathname.startsWith('/app/passport')
              ? 'text-[#B94F35] font-bold'
              : 'text-[#76513B]'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>{t('nav.passport')}</span>
        </Link>

        <Link
          to="/app/analytics"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold ${
            location.pathname.startsWith('/app/analytics')
              ? 'text-[#B94F35] font-bold'
              : 'text-[#76513B]'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>{t('nav.insights', 'Insights')}</span>
        </Link>
      </nav>

      {/* Khatabook Opening Modal */}
      <AddRecordKhataBookModal
        isOpen={khataModalOpen}
        onClose={() => setKhataModalOpen(false)}
      />

      {/* Guided Tour Spotlight */}
      <GuidedTour />
    </div>
  );
};
