import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { KhataPage } from '../../components/fragments/KhataPage';
import { UpiSlip } from '../../components/fragments/UpiSlip';
import { InvoiceSheet } from '../../components/fragments/InvoiceSheet';
import { BankRow } from '../../components/fragments/BankRow';
import { CashNote } from '../../components/fragments/CashNote';
import { Stamp } from '../../components/fragments/Stamp';
import { LanguageSelector } from '../../components/layout/LanguageSelector';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import {
  KiranaShopIllustration,
  KhataBookIllustration,
  UpiFlowIllustration,
  ScatterToLedgerIllustration,
  PassportIllustration,
  MarigoldDivider,
} from '../../components/illustrations/IndianIllustrations';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
  Share2,
  ChevronDown,
  BookOpen,
  Smartphone,
  BarChart3,
  FileCheck2,
  Star,
  IndianRupee,
} from 'lucide-react';

/* ─── Scroll-reveal wrapper ─── */
const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  fromY?: number;
  className?: string;
}> = ({ children, delay = 0, fromY = 24, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: fromY }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Animated rupee counter ─── */
const CountUp: React.FC<{ value: number; prefix?: string }> = ({ value, prefix = '₹' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplayed(value); clearInterval(timer); }
      else setDisplayed(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}{displayed.toLocaleString('en-IN')}
    </span>
  );
};

export const LandingPage: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);
  const [demoKeypadAmount, setDemoKeypadAmount] = useState('850');
  const [demoClassifiedChoice, setDemoClassifiedChoice] = useState<'business' | 'personal' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const problemSources = [
    {
      icon: '🏦',
      title: 'Personal Bank Account',
      subtitle: 'Mixed with household transactions',
      problem: 'Bank statements show school fees, vegetable market cash withdrawals, and UPI customer transfers all in one undifferentiated row.',
      fragment: <BankRow date="28/10" narration="ATM WDL/Local Market" debit={4000} />,
      color: '#4080B0',
    },
    {
      icon: '📱',
      title: 'UPI Merchant QR',
      subtitle: 'Hundreds of daily micro-payments',
      problem: 'Hundreds of daily ₹30–₹400 credits disappear into month-end aggregates without invoice matching.',
      fragment: <UpiSlip amount={340} sender="Customer QR Scan" />,
      color: '#6B7A3A',
    },
    {
      icon: '💵',
      title: 'Counter Cash Sales',
      subtitle: 'Zero digital footprint',
      problem: 'Physical notes exchanged at the counter leave zero digital footprint unless recorded in a bahi-khata daybook.',
      fragment: <CashNote amount={500} label="काउंटर नकद" />,
      color: '#8A6446',
    },
    {
      icon: '📖',
      title: 'Handwritten Khata Register',
      subtitle: 'Credible but unreadable by banks',
      problem: 'Credible, disciplined records kept in red cloth-bound registers, but unreadable by standard bank underwriting systems.',
      fragment: <KhataPage date="Today" pageNo={42} />,
      color: '#C0241C',
    },
    {
      icon: '🧾',
      title: 'Supplier Purchase Bills',
      subtitle: 'Paper bills in cardboard boxes',
      problem: 'Paper bills from wholesale grain, oil, and FMCG distributors kept in cardboard boxes without digital linkage.',
      fragment: <InvoiceSheet distributorName="Shree Ganesh Agro Wholesale" />,
      color: '#D08A1E',
    },
  ];

  return (
    <div className="bg-[#F1E8D0] text-[#2B2620] selection:bg-[#D08A1E]/20 select-none font-sans overflow-x-hidden">

      {/* ══════════════════════════════════════════
          TOP NAVIGATION
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#FDFBF4]/97 backdrop-blur-md border-b border-[#D6CAA8] shadow-paper-lift">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          {/* Brand mark */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#14402F] flex items-center justify-center text-[#FDFBF4] font-display font-bold text-xl shadow-sm border border-[#0F2E22]">
              अ
            </div>
            <div>
              <span className="font-display font-bold text-xl text-[#14402F] tracking-tight leading-none">
                ArthSetu
              </span>
              <span className="text-[10px] block font-mono text-[#8A6446] leading-tight">
                Making Small Businesses Financially Visible
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <LanguageSelector variant="header" />
            <Link
              to="/login"
              className="hidden sm:block text-xs font-mono font-bold text-[#14402F] hover:text-[#D08A1E] px-3 py-1.5 rounded hover:bg-[#F8F1DE] transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/app"
              className="px-4 py-2 rounded-lg bg-[#14402F] text-[#FDFBF4] text-xs font-bold font-mono tracking-wide hover:bg-[#0F2E22] shadow-sm transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <span>{t('landing.tryDemo')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D08A1E]" />
            </Link>
          </div>
        </div>
      </header>


      {/* ══════════════════════════════════════════
          HERO SECTION — EDITORIAL SPLIT SCREEN
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col overflow-hidden">
        {/* Full-bleed background: dark green with Indian pattern overlay */}
        <div className="absolute inset-0 bg-[#0F2E22]">
          {/* Jali lattice pattern */}
          <div className="absolute inset-0 bg-jali-pattern opacity-30" />
          {/* Gradient overlay to punch through left side for text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2E22] via-[#0F2E22]/90 to-transparent" />
          {/* Bottom fade into paper */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F1E8D0] to-transparent" />
          {/* Warm amber top-right glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D08A1E] opacity-8 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Hero content grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-16 sm:py-24 flex-1">

          {/* LEFT: Editorial text */}
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center space-x-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#D08A1E] bg-[#D08A1E]/10 border border-[#D08A1E]/30 px-3 py-1.5 rounded-full">
                <span>✦</span>
                <span>॥ {t('landing.tagline')} ॥</span>
                <span>✦</span>
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#FDFBF4] leading-tight tracking-tight"
            >
              Every shop
              <span className="block text-[#D08A1E]">has a story.</span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl mt-1 text-[#B7C4A0]">
                Let's make its numbers visible.
              </span>
            </motion.h1>

            {/* Supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-sm sm:text-base text-[#B7C4A0] leading-relaxed max-w-lg mx-auto lg:mx-0 font-sans"
            >
              From daily cash sales and UPI payments to handwritten records and business expenses, ArthSetu brings your business activity together in one organised financial record.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start"
            >
              {[
                { val: '63M+', label: 'micro-businesses in India' },
                { val: '₹0', label: 'backend servers needed' },
                { val: '4', label: 'languages supported' },
              ].map((stat) => (
                <div key={stat.val} className="text-center">
                  <div className="font-display font-bold text-2xl text-[#D08A1E]">{stat.val}</div>
                  <div className="text-[10px] font-mono text-[#7C9A80] uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <Link
                to="/app"
                className="group px-6 py-3 rounded-xl bg-[#D08A1E] text-white text-sm font-bold font-mono tracking-wide hover:bg-[#B57415] shadow-lg transition-all active:scale-95 flex items-center space-x-2"
              >
                <span>Explore ArthSetu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/institution/demo"
                className="px-5 py-3 rounded-xl bg-[#FDFBF4]/10 border border-[#FDFBF4]/20 text-[#FDFBF4] text-sm font-bold hover:bg-[#FDFBF4]/15 transition-colors backdrop-blur-sm"
              >
                View Sample Passport
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Animated visual composition */}
          <div className="lg:w-1/2 relative flex items-center justify-center min-h-[400px] w-full">
            {/* Kirana shop illustration as the primary visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-lg"
            >
              <KiranaShopIllustration className="w-full h-auto drop-shadow-2xl" opacity={0.92} />

              {/* Floating financial slips */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [-8, -6, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-4 hidden sm:block"
                style={{ transformOrigin: 'center' }}
              >
                <UpiSlip amount={850} sender="Rajesh Kumar" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0], rotate: [5, 7, 5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute -bottom-4 -right-6 hidden sm:block"
                style={{ transformOrigin: 'center' }}
              >
                <CashNote amount={500} label="UPI Sale" />
              </motion.div>

              {/* ArthSetu badge overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute top-4 right-4 bg-[#14402F] text-[#FDFBF4] px-3 py-2 rounded-lg shadow-lg text-center"
              >
                <div className="text-[10px] font-mono text-[#D08A1E] uppercase tracking-wider">ArthSetu</div>
                <div className="font-display font-bold text-sm">Organised</div>
                <div className="text-[10px] font-mono text-[#B7C4A0]">₹12.4L recorded</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[#D08A1E] flex flex-col items-center space-y-1"
        >
          <span className="text-[10px] font-mono text-[#7C9A80]">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>


      {/* ══════════════════════════════════════════
          KHATA BOOK INTRO BAND
      ══════════════════════════════════════════ */}
      <section className="bg-[#F1E8D0] py-6 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <MarigoldDivider className="w-full max-w-2xl mx-auto opacity-70" />
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SECTION 2: THE PROBLEM — EDITORIAL SPLIT
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden">
        {/* Background: subtle khata ruling */}
        <div className="absolute inset-0 bg-ledger-ruled opacity-60" />
        {/* Faded illustration background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 opacity-5 pointer-events-none hidden lg:block">
          <KhataBookIllustration className="w-full h-auto" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Khata book illustration */}
            <Reveal delay={0.1}>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-[#C0241C]/5 rounded-2xl transform rotate-2" />
                <div className="relative bg-[#FDFBF4] rounded-2xl shadow-paper-elevated overflow-hidden border border-[#D6CAA8]">
                  <div className="bg-[#14402F] px-4 py-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#D08A1E] uppercase tracking-widest font-bold">
                      Typical Micro-Merchant Reality
                    </span>
                    <div className="flex space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#B5532F]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D08A1E]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6B7A3A]" />
                    </div>
                  </div>
                  <div className="p-5">
                    <KhataBookIllustration className="w-full h-auto" opacity={0.9} />
                  </div>
                  <div className="px-4 py-3 bg-[#F8F1DE] border-t border-[#D6CAA8] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8A6446]">Handwritten · Credible · Unreadable by banks</span>
                    <Stamp variant="supplied_not_authenticated" rotation={-3} />
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right: Problem description */}
            <Reveal delay={0.2}>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E] tracking-widest">
                    The Fundamental Dilemma
                  </span>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#14402F] mt-2 leading-tight">
                    "Profitable for years, yet nothing a bank can read."
                  </h2>
                  <p className="text-sm text-[#5A3E2B] leading-relaxed mt-3 font-sans">
                    The problem is not a lack of revenue or hard work. The problem is that the financial trail is fragmented across personal savings accounts, loose UPI slips, and handwritten bahi-khatas.
                  </p>
                </div>

                {/* Interactive source inspector */}
                <div className="space-y-2">
                  {problemSources.map((item, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => setActiveSourceIndex(idx)}
                      whileHover={{ x: 3 }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        activeSourceIndex === idx
                          ? 'bg-[#FDFBF4] border-[#14402F] shadow-paper-lift'
                          : 'bg-[#F8F1DE]/60 border-[#D6CAA8] hover:bg-[#F8F1DE]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-[#14402F]">{item.title}</span>
                            <span className="text-[10px] text-[#D08A1E] font-mono ml-2 flex-shrink-0">
                              {activeSourceIndex === idx ? '▸ Inspecting' : 'Tap'}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#8A6446] font-mono">{item.subtitle}</div>
                        </div>
                      </div>
                      <AnimatePresence>
                        {activeSourceIndex === idx && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-[#5A3E2B] mt-2 font-sans leading-relaxed pl-9">
                              {item.problem}
                            </p>
                            <div className="pl-9 mt-2 transform scale-90 origin-left">
                              {item.fragment}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <span className="font-mono text-xs font-bold text-[#8A6446]">
                    5 SCATTERED SOURCES · 1 VIBRANT BUSINESS
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          MARIGOLD DIVIDER
      ══════════════════════════════════════════ */}
      <div className="max-w-3xl mx-auto px-4 py-2">
        <MarigoldDivider className="w-full opacity-50" />
      </div>


      {/* ══════════════════════════════════════════
          SECTION 3: SCATTER → LEDGER VISUAL
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#FDFBF4] relative overflow-hidden">
        {/* Background rangoli dots */}
        <div className="absolute inset-0 bg-rangoli-dots opacity-40" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <Reveal className="text-center space-y-3 mb-12">
            <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E] tracking-widest">
              The ArthSetu Bridge
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#14402F]">
              Scattered Records → Organised Ledger
            </h2>
            <p className="text-sm text-[#5A3E2B] max-w-xl mx-auto leading-relaxed">
              ArthSetu consolidates every scattered financial source into one coherent, evidence-labelled record — ready for voluntary sharing.
            </p>
          </Reveal>

          {/* Main illustration */}
          <Reveal delay={0.15}>
            <div className="bg-[#F8F1DE] rounded-2xl border border-[#D6CAA8] p-6 sm:p-10 shadow-paper-elevated overflow-hidden">
              <ScatterToLedgerIllustration className="w-full h-auto max-h-56" opacity={0.9} />
            </div>
          </Reveal>

          {/* Step cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: BookOpen, step: '01', title: 'Record Everything', desc: 'Daily cash, UPI, bank credits and supplier bills — one unified diary.' },
              { icon: Layers, step: '02', title: 'Classify & Organise', desc: 'Rule-based engine suggests business vs personal. You confirm with one tap.' },
              { icon: FileCheck2, step: '03', title: 'Generate Passport', desc: 'A tamper-evident Financial Visibility Passport with cryptographic integrity.' },
            ].map((item, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <div className="card-lift p-5 bg-[#FDFBF4] border border-[#D6CAA8] rounded-xl shadow-paper-lift space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#14402F] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#D08A1E]" />
                    </div>
                    <span className="font-mono text-xs text-[#D08A1E] font-bold">STEP {item.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#14402F]">{item.title}</h3>
                  <p className="text-xs text-[#5A3E2B] leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SECTION 4: INTERACTIVE HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#F1E8D0] relative overflow-hidden">
        <div className="absolute inset-0 bg-ledger-watermark opacity-60" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-10">
          <Reveal className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E] tracking-widest">
              Live Micro-Demonstrations
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#14402F]">
              Try It Right Here
            </h2>
            <p className="text-sm text-[#5A3E2B] max-w-md mx-auto">
              Interactive previews of the actual ArthSetu recording and classification experience.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demo 1: Quick entry keypad */}
            <Reveal delay={0.1}>
              <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-2xl shadow-paper-elevated overflow-hidden">
                <div className="bg-[#14402F] px-5 py-3">
                  <span className="text-[10px] font-mono text-[#D08A1E] uppercase tracking-wider font-bold">STEP 1 · RECORD</span>
                  <h3 className="font-display font-bold text-lg text-[#FDFBF4] mt-0.5">Daily Habit in 30 Seconds</h3>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-[#5A3E2B] leading-relaxed">
                    Tap a tile, enter the ₹ cash or UPI amount, and tap Record. It saves instantly to your daybook.
                  </p>
                  <div className="bg-[#F8F1DE] rounded-xl p-4 space-y-4 border border-[#E6DAB9]">
                    <div className="text-center">
                      <div className="text-[10px] font-mono text-[#8A6446] uppercase">Current Entry</div>
                      <motion.div
                        key={demoKeypadAmount}
                        initial={{ scale: 1.1, color: '#D08A1E' }}
                        animate={{ scale: 1, color: '#14402F' }}
                        className="font-display text-4xl font-bold text-[#14402F]"
                      >
                        ₹{demoKeypadAmount}
                      </motion.div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                      {['150', '250', '350', '500', '750', '1000'].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setDemoKeypadAmount(amt)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${
                            demoKeypadAmount === amt
                              ? 'bg-[#14402F] text-white shadow-sm'
                              : 'bg-white border border-[#D6CAA8] text-[#14402F] hover:bg-[#E6DAB9]'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {}}
                      className="w-full py-2.5 rounded-xl bg-[#D08A1E] text-white text-xs font-bold font-mono tracking-wide hover:bg-[#B57415] transition-colors active:scale-95"
                    >
                      ✓ Record Cash Sale
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Demo 2: Classification */}
            <Reveal delay={0.2}>
              <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-2xl shadow-paper-elevated overflow-hidden">
                <div className="bg-[#6B7A3A] px-5 py-3">
                  <span className="text-[10px] font-mono text-[#E4EAD6] uppercase tracking-wider font-bold">STEP 2 · CLASSIFY</span>
                  <h3 className="font-display font-bold text-lg text-[#FDFBF4] mt-0.5">Rule-Assisted Classification</h3>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-[#5A3E2B] leading-relaxed">
                    ArthSetu detects wholesale distributor keywords and suggests categories with transparent reasons.
                  </p>
                  <div className="bg-[#F8F1DE] rounded-xl p-4 space-y-4 border border-[#E6DAB9]">
                    <div className="p-3 bg-white rounded-lg border border-[#D6CAA8] text-xs">
                      <div className="font-mono text-[#8A6446] text-[10px] mb-1">IMPORTED BANK CREDIT</div>
                      <div className="font-bold text-[#2B2620]">"NEFT to Shree Ganesh Wholesale Agro Grains · ₹8,500"</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-[#E4EAD6] text-[#14402F] rounded text-[10px] font-mono font-bold">Suggested: Business (Wholesale)</span>
                        <span className="text-[10px] text-[#6B7A3A]">87% confidence</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDemoClassifiedChoice('business')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          demoClassifiedChoice === 'business'
                            ? 'bg-[#14402F] text-white border-[#0F2E22] shadow-sm'
                            : 'bg-white border-[#D6CAA8] text-[#14402F] hover:bg-[#E4EAD6]'
                        }`}
                      >
                        ✓ Business
                      </button>
                      <button
                        onClick={() => setDemoClassifiedChoice('personal')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          demoClassifiedChoice === 'personal'
                            ? 'bg-[#8A6446] text-white border-[#5A3E2B]'
                            : 'bg-white border-[#D6CAA8] text-[#5A3E2B] hover:bg-[#F8E8D8]'
                        }`}
                      >
                        Personal
                      </button>
                    </div>
                    <AnimatePresence>
                      {demoClassifiedChoice && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] text-[#2A6347] font-mono bg-[#E4EAD6] rounded-lg px-3 py-2"
                        >
                          ✓ Recorded as <strong>{demoClassifiedChoice}</strong>. Evidence Ribbon updated!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SECTION 5: EVIDENCE — RADICAL HONESTY
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#FDFBF4] relative overflow-hidden">
        <div className="absolute inset-0 bg-khata-page opacity-30" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Reveal className="text-center space-y-3 mb-12">
            <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E] tracking-widest">
              Radical Honesty
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#14402F]">
              We Show What Records Can and Cannot Prove
            </h2>
            <p className="text-sm text-[#5A3E2B] max-w-lg mx-auto leading-relaxed">
              No marketing exaggerations. Uploaded files are stamped as unauthenticated. Every source is labelled with its exact evidence class.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Evidence tier 1 */}
            <Reveal delay={0.05}>
              <div className="card-lift p-5 bg-[#FDFBF4] border-2 border-[#B28A33] rounded-2xl shadow-paper-lift space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#B28A33]/5 rounded-bl-full" />
                <EvidenceChip evidenceClass="document_supplied" />
                <h4 className="font-display font-bold text-base text-[#14402F]">Uploaded Bank & UPI CSVs</h4>
                <p className="text-xs text-[#5A3E2B] leading-relaxed font-sans">
                  Proves a monetary transaction was recorded in a supplied statement, but not third-party authenticated.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8A6446]">
                  <span className="w-2 h-2 rounded-full bg-[#B28A33]" />
                  Document Supplied · Not Authenticated
                </div>
              </div>
            </Reveal>

            {/* Evidence tier 2 */}
            <Reveal delay={0.1}>
              <div className="card-lift p-5 bg-[#FDFBF4] border-2 border-[#8A6446] rounded-2xl shadow-paper-lift space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#8A6446]/5 rounded-bl-full" />
                <EvidenceChip evidenceClass="owner_declared" />
                <h4 className="font-display font-bold text-base text-[#5A3E2B]">Bahi-Khata Cash Entries</h4>
                <p className="text-xs text-[#5A3E2B] leading-relaxed font-sans">
                  Owner-declared cash sales and udhaar. Reflected with full transparency as self-reported entries.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8A6446]">
                  <span className="w-2 h-2 rounded-full bg-[#8A6446]" />
                  Owner Declared · Diary Entries
                </div>
              </div>
            </Reveal>

            {/* Evidence tier 3 — locked */}
            <Reveal delay={0.15}>
              <div className="card-lift p-5 bg-[#0F2E22] rounded-2xl shadow-paper-lift space-y-3 relative overflow-hidden border border-[#2A6347]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#D08A1E]/10 rounded-bl-full" />
                <div className="flex items-center space-x-2 text-[#D08A1E] font-bold font-mono text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>LOCKED IN PROTOTYPE</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#FDFBF4]">Source Authenticated</h4>
                <p className="text-xs text-[#B7C4A0] leading-relaxed font-sans">
                  Requires live Account Aggregator connection. Locked at ₹0 in this offline demonstration — we don't pretend it works.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6B9A80]">
                  <ShieldCheck className="w-3 h-3" />
                  AA Framework Ready (Not Implemented)
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SECTION 6: FINANCIAL VISIBILITY PASSPORT
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#F1E8D0] relative overflow-hidden">
        <div className="absolute inset-0 bg-ledger-ruled opacity-40" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Passport illustration */}
          <Reveal delay={0.05}>
            <div className="relative flex justify-center lg:justify-start">
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-full h-full bg-[#14402F]/15 rounded-2xl rotate-3" />
                <div className="absolute -top-1.5 -left-1.5 w-full h-full bg-[#D08A1E]/10 rounded-2xl rotate-1.5" />
                <div className="relative bg-[#FDFBF4] rounded-2xl shadow-paper-elevated border border-[#D6CAA8] p-4 max-w-xs">
                  <PassportIllustration className="w-full h-auto" opacity={0.95} />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: Text content */}
          <Reveal delay={0.15}>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E] tracking-widest">
                  ॥ वित्तीय दृश्यता पासपोर्ट ॥
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#14402F] mt-2 leading-tight">
                  The Financial Visibility Passport
                </h2>
                <p className="text-sm text-[#5A3E2B] leading-relaxed mt-3 font-sans">
                  A transparent, tamper-evident document the business owner can download and voluntarily share with banks or NBFCs as supplementary information.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: IndianRupee, title: 'Recorded Financial Statement', desc: 'Sales, spending, and net cash movement from organised records.' },
                  { icon: BarChart3, title: 'Four Dimensions of Visibility', desc: 'Activity, Completeness, Pattern Consistency, and Evidence Reliability.' },
                  { icon: ShieldCheck, title: 'Cryptographic Integrity', desc: 'SHA-256 fingerprint across all canonical transaction hashes.' },
                  { icon: Share2, title: 'Voluntary Consent Sharing', desc: 'Time-bounded read-only links. Revoke access at any time.' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#FDFBF4] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#E4EAD6] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-[#2A6347]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#14402F]">{feature.title}</div>
                      <div className="text-xs text-[#5A3E2B] mt-0.5">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app/passport"
                  className="px-5 py-2.5 rounded-xl bg-[#14402F] text-white text-xs font-bold font-mono tracking-wide hover:bg-[#0F2E22] transition-colors active:scale-95 flex items-center gap-2"
                >
                  <span>View Demo Passport</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D08A1E]" />
                </Link>
                <Link
                  to="/institution/demo"
                  className="px-5 py-2.5 rounded-xl bg-[#F8F1DE] border border-[#D6CAA8] text-[#14402F] text-xs font-bold hover:bg-[#E6DAB9] transition-colors"
                >
                  Institution View →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SECTION 7: FOUR DIMENSIONS
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#FDFBF4]">
        <div className="max-w-6xl mx-auto space-y-12">
          <Reveal className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E] tracking-widest">
              Balanced Intelligence
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#14402F]">
              No Single Score. Four Honest Views.
            </h2>
            <p className="text-sm text-[#5A3E2B] max-w-md mx-auto leading-relaxed">
              Credit scores reduce a business to a single opaque number. ArthSetu evaluates four distinct, measurable dimensions.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: '1', icon: '📅', title: 'Business Activity', desc: 'Share of operating days documented in daybook', pct: 92, color: '#14402F' },
              { num: '2', icon: '📋', title: 'Record Completeness', desc: 'Share of transactions reviewed & categorized', pct: 86, color: '#2A6347' },
              { num: '3', icon: '📈', title: 'Pattern Consistency', desc: 'Predictability across months and festive seasons', pct: 78, color: '#6B7A3A' },
              { num: '4', icon: '🛡️', title: 'Evidence Reliability', desc: 'Share backed by bills and supplied statements', pct: 68, color: '#B28A33' },
            ].map((dim, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <div className="card-lift p-5 bg-[#F8F1DE] border border-[#D6CAA8] rounded-2xl shadow-paper-lift space-y-4 text-center">
                  <div className="text-3xl">{dim.icon}</div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#D08A1E] uppercase tracking-wider mb-1">
                      DIMENSION {dim.num}
                    </div>
                    <h4 className="font-display font-bold text-base text-[#14402F]">{dim.title}</h4>
                    <p className="text-[11px] text-[#7C766B] font-sans mt-1 leading-relaxed">{dim.desc}</p>
                  </div>
                  {/* Animated progress bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-mono mb-1">
                      <span className="text-[#8A6446]">Substantial</span>
                      <span className="font-bold" style={{ color: dim.color }}>{dim.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#E6DAB9] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${dim.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.1 * i, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: dim.color }}
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SECTION 8: WHAT IT IS NOT — DARK BAND
      ══════════════════════════════════════════ */}
      <section className="bg-[#0F2E22] text-[#FDFBF4] py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden">
        {/* Background jali pattern */}
        <div className="absolute inset-0 bg-jali-pattern opacity-20" />
        {/* Gold accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-[#D08A1E]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-[#D08A1E]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
          <Reveal>
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D08A1E] font-bold">
                Guaranteed Principles
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#FDFBF4]">
                What ArthSetu is <span className="text-[#B5532F]">NOT</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              {[
                { text: 'NOT a Loan Application', icon: '✕' },
                { text: 'NOT a Payment Gateway', icon: '✕' },
                { text: 'NOT a Credit Scorer', icon: '✕' },
                { text: 'NOT an Underwriter', icon: '✕' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#14402F] border border-[#2A6347] flex flex-col items-center justify-center space-y-2 text-center hover:border-[#D08A1E] transition-colors"
                >
                  <span className="text-xl font-bold text-[#B5532F]">{item.icon}</span>
                  <span className="font-bold tracking-tight text-[#E6DAB9] leading-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-sm text-[#B7C4A0] font-sans max-w-lg mx-auto leading-relaxed">
              You decide what to share, with which institution, and for how long. You hold the sovereign key to your financial narrative.
            </p>
          </Reveal>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SECTION 9: THREE DEMO BUSINESSES
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#F1E8D0] relative overflow-hidden">
        <div className="absolute inset-0 bg-ledger-ruled opacity-50" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-10">
          <Reveal className="text-center space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E] tracking-widest">
              Live Demonstration Data
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#14402F]">
              Three Seeded Micro-Businesses
            </h2>
            <p className="text-sm text-[#5A3E2B] max-w-md mx-auto leading-relaxed">
              Fully functional prototype with deterministic demonstration data. Switch between businesses to see how ArthSetu adapts.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                emoji: '🏪',
                name: 'Lakshmi Kirana & General Store',
                location: 'Hubballi, Karnataka',
                category: 'Kirana & Grocery',
                years: 12,
                sales: '₹8.24L',
                completeness: 86,
                bg: '#E4EAD6',
                border: '#939F5B',
              },
              {
                emoji: '👗',
                name: 'Rangoli Bazaar Garments',
                location: 'Jaipur, Rajasthan',
                category: 'Garments & Textiles',
                years: 8,
                sales: '₹5.60L',
                completeness: 72,
                bg: '#F8E8D8',
                border: '#D08A1E',
              },
              {
                emoji: '🛒',
                name: "Sunita's Variety Corner",
                location: 'Nagpur, Maharashtra',
                category: 'General Retail',
                years: 3,
                sales: '₹2.80L',
                completeness: 58,
                bg: '#FDFBF4',
                border: '#D6CAA8',
              },
            ].map((biz, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <Link
                  to="/app"
                  className="block card-lift p-5 rounded-2xl border-2 shadow-paper-lift space-y-4"
                  style={{ backgroundColor: biz.bg, borderColor: biz.border }}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{biz.emoji}</span>
                    <span className="text-[10px] font-mono font-bold text-[#D08A1E] bg-white/60 px-2 py-0.5 rounded-full">
                      {biz.years} years
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[#14402F] leading-tight">{biz.name}</h3>
                    <p className="text-xs text-[#8A6446] font-mono mt-0.5">{biz.location}</p>
                    <p className="text-[10px] text-[#6B7A3A] font-mono">{biz.category}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#5A3E2B]">Recorded Sales</span>
                      <span className="font-bold font-mono text-[#14402F]">{biz.sales}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-[#8A6446]">
                        <span>Record Completeness</span>
                        <span className="font-bold text-[#14402F]">{biz.completeness}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#14402F] rounded-full"
                          style={{ width: `${biz.completeness}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#14402F] font-mono font-bold">Explore →</span>
                    <ArrowRight className="w-4 h-4 text-[#D08A1E]" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-8 overflow-hidden bg-[#FDFBF4]">
        {/* Background: large faded kirana shop illustration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <KiranaShopIllustration className="w-full max-w-4xl h-auto" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF4]/80 via-transparent to-[#FDFBF4]/80" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <Reveal>
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#D08A1E] font-bold">
                Ready to Begin?
              </div>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-[#14402F] leading-tight">
                Make Your Business
                <span className="block text-[#D08A1E]">Financially Visible.</span>
              </h2>
              <p className="text-sm text-[#5A3E2B] leading-relaxed max-w-md mx-auto font-sans">
                Start with our three seeded demo micro-enterprises. Fully functional, completely offline, no signup required.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/app"
                className="group px-8 py-3.5 rounded-xl bg-[#D08A1E] text-white text-sm font-bold font-mono tracking-wide hover:bg-[#B57415] shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Launch Demo App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/credits"
                className="px-6 py-3.5 rounded-xl bg-[#F8F1DE] border border-[#D6CAA8] text-[#14402F] text-sm font-bold hover:bg-[#E6DAB9] transition-colors"
              >
                Asset Credits & Licences
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#8A6446]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7A3A]" />
                100% Frontend-Only
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7A3A]" />
                Works Completely Offline
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7A3A]" />
                4 Languages
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7A3A]" />
                No Data Leaves Your Device
              </span>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-[#14402F] text-[#B7C4A0] py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#D08A1E] flex items-center justify-center text-[#0F2E22] font-display font-bold text-lg">
                  अ
                </div>
                <span className="font-display font-bold text-xl text-[#FDFBF4]">ArthSetu</span>
              </div>
              <p className="text-xs leading-relaxed">
                Making Small Businesses Financially Visible. A national hackathon prototype.
              </p>
            </div>
            {/* Links */}
            <div className="space-y-2 text-xs">
              <div className="font-mono font-bold text-[#D08A1E] uppercase tracking-wider mb-3">Quick Links</div>
              {[
                { to: '/app', label: 'Dashboard' },
                { to: '/app/diary', label: 'Financial Diary' },
                { to: '/app/passport', label: 'Visibility Passport' },
                { to: '/institution/demo', label: 'Institution View' },
                { to: '/credits', label: 'Asset Credits' },
              ].map((link) => (
                <div key={link.to}>
                  <Link to={link.to} className="hover:text-[#FDFBF4] transition-colors">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
            {/* Tech */}
            <div className="space-y-2 text-xs">
              <div className="font-mono font-bold text-[#D08A1E] uppercase tracking-wider mb-3">Technical</div>
              <p className="text-[11px] leading-relaxed">
                Deterministic offline prototype. All data runs strictly in browser memory (Zustand + localStorage). No network requests after load.
              </p>
              <p className="text-[11px] text-[#6B9A80]">
                React · TypeScript · Vite · Tailwind · Framer Motion · Recharts · PapaParse · jsPDF
              </p>
            </div>
          </div>
          <div className="border-t border-[#2A6347] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#6B9A80]">
            <span>ArthSetu · अर्थसेतु · Making Small Businesses Financially Visible</span>
            <Link to="/credits" className="underline hover:text-[#FDFBF4] transition-colors">
              Image Credits & Licenses
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
