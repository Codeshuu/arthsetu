import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { DemoBar } from '../../components/layout/DemoBar';
import { LanguageSelector } from '../../components/layout/LanguageSelector';
import { StoryRail, StoryBeat } from '../../components/fragments/StoryRail';
import { GuidedTour } from '../../features/tour/GuidedTour';
import {
  Home,
  BookOpen,
  Receipt,
  BarChart3,
  ShieldCheck,
  FileText,
  MessageSquare,
  User,
  Share2,
  PlusCircle,
  Menu,
  X,
  Languages,
} from 'lucide-react';

export const OwnerShell: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const business = useArthSetuStore((s) => s.business);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { label: t('nav.home'), path: '/app', icon: Home, beat: 2 },
    { label: t('nav.diary'), path: '/app/diary', icon: BookOpen, beat: 2 },
    { label: t('nav.records'), path: '/app/records', icon: Receipt, beat: 3 },
    { label: t('nav.analytics'), path: '/app/analytics', icon: BarChart3, beat: 4 },
    { label: t('nav.evidence'), path: '/app/evidence', icon: ShieldCheck, beat: 3 },
    { label: t('nav.passport'), path: '/app/passport', icon: FileText, beat: 5 },
    { label: t('nav.ask'), path: '/app/ask', icon: MessageSquare, beat: 4 },
    { label: t('nav.profile'), path: '/app/profile', icon: User, beat: 2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F1E8D0] text-[#2B2620]">
      {/* Demo Announcement Bar */}
      <DemoBar />

      {/* Main Top Header */}
      <header className="bg-[#FDFBF4] border-b border-[#D6CAA8] px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 select-none shadow-paper-lift">
        {/* Left: Brand Mark */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-[#14402F] hover:bg-[#F8F1DE]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#14402F] flex items-center justify-center text-[#FDFBF4] shadow-sm border border-[#0F2E22]">
              <span className="font-display font-bold text-lg text-[#D08A1E]">अ</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-[#14402F] tracking-tight leading-none">
                ArthSetu
              </span>
              <span className="text-[10px] block font-mono text-[#8A6446] leading-tight">अर्थसेतु</span>
            </div>
          </Link>

          <div className="hidden lg:block pl-3 border-l border-[#D6CAA8]">
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">{
                business.category === 'kirana' ? '🏪' :
                business.category === 'garments' ? '👗' :
                business.category === 'vegetable_fruit' ? '🥦' :
                business.category === 'festival_goods' ? '🪔' :
                business.category === 'stationery' ? '📚' : '🛒'
              }</span>
              <div>
                <div className="text-xs font-bold text-[#14402F] truncate max-w-[180px]">{business.name}</div>
                <div className="text-[10px] text-[#7C766B] truncate">{business.location.city}, {business.location.state}</div>
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
          {/* Beautiful 4-Language Selector */}
          <LanguageSelector variant="header" />

          {/* Share Passport Button */}
          <Link
            to="/app/passport/share"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#D08A1E] text-white text-xs font-bold shadow hover:bg-[#B57415] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('nav.sharePassport')}</span>
            <span className="sm:hidden">Share</span>
          </Link>
        </div>
      </header>

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar */}
        <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-[#FDFBF4] border-r border-[#D6CAA8] select-none flex-shrink-0">
          {/* Business info card at top of sidebar */}
          <div className="p-3 border-b border-[#D6CAA8] bg-[#F8F1DE]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#14402F] flex items-center justify-center text-xl flex-shrink-0">
                {business.category === 'kirana' ? '🏪' :
                 business.category === 'garments' ? '👗' :
                 business.category === 'vegetable_fruit' ? '🥦' :
                 business.category === 'festival_goods' ? '🪔' :
                 business.category === 'stationery' ? '📚' : '🛒'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#14402F] truncate">{business.name}</div>
                <div className="text-[9px] text-[#8A6446] font-mono truncate">{business.location.city} · {business.yearsOperating}y</div>
              </div>
            </div>
          </div>

          <nav className="p-2 space-y-0.5 flex-1">
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
                      ? 'bg-[#14402F] text-[#FDFBF4] shadow-sm font-bold'
                      : 'text-[#4B4740] hover:bg-[#F8F1DE] hover:text-[#14402F]'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#D08A1E]' : 'text-[#8A6446]'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-[#D08A1E] flex-shrink-0" />}
                </Link>
              );
            })}
          </nav>

          {/* Quick Diary CTA */}
          <div className="p-3 border-t border-[#D6CAA8] space-y-2">
            <Link
              to="/app/diary"
              className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-[#14402F] text-[#FDFBF4] text-xs font-bold hover:bg-[#0F2E22] transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#D08A1E]" />
              <span>+ Record Today's Sale</span>
            </Link>
            <div className="text-[9px] text-center font-mono text-[#B7C4A0]">
              ArthSetu v1.0 · Offline Ledger
            </div>
          </div>
        </aside>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[88px] bg-[#2B2620]/40 z-40" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="bg-[#FDFBF4] border-b border-[#D6CAA8] p-4 space-y-1 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
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
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium ${
                      isActive ? 'bg-[#14402F] text-white font-bold' : 'text-[#2B2620]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Routed Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (Thumb-friendly with raised '+' Diary button) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FDFBF4] border-t border-[#D6CAA8] px-2 py-1 flex items-center justify-around z-40 select-none shadow-paper-elevated"
      >
        <Link
          to="/app"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold ${
            location.pathname === '/app' ? 'text-[#14402F] font-bold' : 'text-[#7C766B]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>{t('nav.home')}</span>
        </Link>

        <Link
          to="/app/records"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold ${
            location.pathname.startsWith('/app/records')
              ? 'text-[#14402F] font-bold'
              : 'text-[#7C766B]'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>{t('nav.records')}</span>
        </Link>

        {/* Raised center '+' Diary button */}
        <Link
          to="/app/diary"
          className="flex flex-col items-center -mt-5 bg-[#14402F] text-[#FDFBF4] rounded-full p-2.5 shadow-lg border-2 border-[#D08A1E] hover:scale-105 transition-transform"
          aria-label="Add Diary Entry"
        >
          <PlusCircle className="w-6 h-6 text-[#D08A1E]" />
        </Link>

        <Link
          to="/app/passport"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold ${
            location.pathname.startsWith('/app/passport')
              ? 'text-[#14402F] font-bold'
              : 'text-[#7C766B]'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>{t('nav.passport')}</span>
        </Link>

        <Link
          to="/app/ask"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold ${
            location.pathname.startsWith('/app/ask')
              ? 'text-[#14402F] font-bold'
              : 'text-[#7C766B]'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>{t('nav.ask')}</span>
        </Link>
      </nav>

      {/* Guided Tour Spotlight */}
      <GuidedTour />
    </div>
  );
};

