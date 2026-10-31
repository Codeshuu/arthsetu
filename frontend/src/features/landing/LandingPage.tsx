import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { KhataPage } from '../../components/fragments/KhataPage';
import { UpiSlip } from '../../components/fragments/UpiSlip';
import { InvoiceSheet } from '../../components/fragments/InvoiceSheet';
import { BankRow } from '../../components/fragments/BankRow';
import { CashNote } from '../../components/fragments/CashNote';
import { LanguageSelector } from '../../components/layout/LanguageSelector';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import {
  KiranaShopIllustration,
  KhataBookIllustration,
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
  BarChart3,
  FileCheck2,
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

export const LandingPage: React.FC = () => {
  const { t, language } = useI18n();
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);
  const [demoKeypadAmount, setDemoKeypadAmount] = useState('850');
  const [demoClassifiedChoice, setDemoClassifiedChoice] = useState<'business' | 'personal' | null>(null);

  // Mouse parallax motion values for Hero section
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth lagging response
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Transforms for foreground illustration, floating slips, and background
  const shopX = useTransform(springX, [-0.5, 0.5], [-14, 14]);
  const shopY = useTransform(springY, [-0.5, 0.5], [-10, 10]);
  const shopRotateY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  const slip1X = useTransform(springX, [-0.5, 0.5], [20, -20]);
  const slip1Y = useTransform(springY, [-0.5, 0.5], [16, -16]);

  const slip2X = useTransform(springX, [-0.5, 0.5], [-24, 24]);
  const slip2Y = useTransform(springY, [-0.5, 0.5], [-18, 18]);

  const bgGlowX = useTransform(springX, [-0.5, 0.5], [30, -30]);
  const bgGlowY = useTransform(springY, [-0.5, 0.5], [25, -25]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const problemSources = [
    {
      icon: '🏦',
      title: t('landing.problemSavingsTitle', 'Personal Bank Account'),
      subtitle: 'Mixed with household groceries',
      problem: t('landing.problemSavingsDesc'),
      fragment: <BankRow date="28/10" narration="ATM WDL/Local Market" debit={4000} />,
      color: '#A64D3D',
    },
    {
      icon: '📱',
      title: t('landing.problemUpiTitle', 'UPI Merchant QR'),
      subtitle: 'Hundreds of daily micro-payments',
      problem: t('landing.problemUpiDesc'),
      fragment: <UpiSlip amount={340} sender="Customer QR Scan" />,
      color: '#D99A28',
    },
    {
      icon: '💵',
      title: t('landing.problemCashTitle', 'Counter Cash Sales'),
      subtitle: 'Zero digital footprint',
      problem: t('landing.problemCashDesc'),
      fragment: <CashNote amount={500} label="Counter Cash" />,
      color: '#B94F35',
    },
    {
      icon: '📖',
      title: t('landing.problemKhataTitle', 'Handwritten Khata Register'),
      subtitle: 'Disciplined records unreadable by banks',
      problem: t('landing.problemKhataDesc'),
      fragment: <KhataPage date="Today" pageNo={42} />,
      color: '#76513B',
    },
    {
      icon: '🧾',
      title: t('landing.problemInvoiceTitle', 'Wholesale Purchase Bills'),
      subtitle: 'Paper bills in cartons',
      problem: t('landing.problemInvoiceDesc'),
      fragment: <InvoiceSheet distributorName="Shree Ganesh Agro Wholesale" />,
      color: '#E8A04B',
    },
  ];

  return (
    <div className="bg-[#F4E6CE] text-[#39332E] select-none font-sans overflow-x-hidden">
      {/* ══════════════════════════════════════════
          TOP NAVIGATION
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#FDFBF4]/95 backdrop-blur-md border-b border-[#D8BDA0] shadow-paper-lift">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          {/* Brand mark */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#A64D3D] flex items-center justify-center text-white font-display font-bold text-lg shadow-sm border border-[#8A2A1A]">
              <BookOpen className="w-5 h-5 text-[#E8A04B]" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-[#A64D3D] tracking-tight leading-none block">
                ArthSetu
              </span>
              <span className="text-[10px] block font-mono text-[#76513B] leading-tight">
                {t('landing.tagline')}
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <LanguageSelector variant="header" />
            <Link
              to="/login"
              className="hidden sm:block text-xs font-mono font-bold text-[#A64D3D] hover:text-[#B94F35] px-3 py-1.5 rounded hover:bg-[#F4E6CE] transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/app"
              className="px-4 py-2 rounded-lg bg-[#B94F35] text-white text-xs font-bold font-mono tracking-wide hover:bg-[#A64D3D] shadow-sm transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <span>{t('landing.tryDemo')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E8A04B]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO SECTION — WARM INDIAN DUKANDAAR IDENTITY WITH MOUSE PARALLAX
      ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[90vh] flex flex-col overflow-hidden bg-gradient-to-br from-[#8A2A1A] via-[#A64D3D] to-[#76513B] text-white"
      >
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 bg-jali-pattern opacity-10" />

        {/* Mouse-responsive glow background element */}
        <motion.div
          style={{ x: bgGlowX, y: bgGlowY }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#E8A04B] opacity-15 blur-3xl rounded-full pointer-events-none"
        />

        {/* Bottom smooth fade into warm cream page */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#F4E6CE] to-transparent pointer-events-none" />

        {/* Hero content grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-14 sm:py-20 flex-1">
          {/* LEFT: Editorial text */}
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center space-x-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#E8A04B] bg-white/10 border border-[#E8A04B]/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                <span>✦</span>
                <span>{t('landing.tagline')}</span>
                <span>✦</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight"
            >
              {t('landing.scatteredTitle')}
              <span className="block text-[#E8A04B]">{t('landing.organisedTitle')}</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-1 text-[#F4E6CE]/90 font-normal">
                {t('landing.evidencedTitle')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-sm sm:text-base text-[#F4E6CE] leading-relaxed max-w-lg mx-auto lg:mx-0 font-sans"
            >
              {t('landing.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start pt-1"
            >
              {[
                { val: '63M+', label: 'Indian micro-merchants' },
                { val: '100%', label: 'Private & client-side' },
                { val: '4', label: 'Languages supported' },
              ].map((stat) => (
                <div key={stat.val} className="text-center">
                  <div className="font-display font-bold text-2xl text-[#E8A04B]">{stat.val}</div>
                  <div className="text-[10px] font-mono text-[#F4E6CE]/80 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-3.5 justify-center lg:justify-start pt-2"
            >
              <Link
                to="/app"
                className="group px-7 py-3.5 rounded-xl bg-[#E8A04B] text-[#39332E] text-sm font-bold font-mono tracking-wide hover:bg-[#D99A28] shadow-lg transition-all active:scale-95 flex items-center space-x-2"
              >
                <span>{t('landing.tryDemo')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/institution/demo"
                className="px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                {t('landing.seeSample')}
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Authentic Indian Kirana Shop with Mouse Parallax & Floating Slips */}
          <div className="lg:w-1/2 relative flex items-center justify-center min-h-[420px] w-full">
            <motion.div
              style={{
                x: shopX,
                y: shopY,
                rotateY: shopRotateY,
                transformPerspective: 1000,
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-lg"
            >
              {/* Kirana Counter Scene SVG */}
              <KiranaShopIllustration className="w-full h-auto drop-shadow-2xl" opacity={0.96} />

              {/* Floating UPI slip responding to mouse movement */}
              <motion.div
                style={{ x: slip1X, y: slip1Y }}
                animate={{ rotate: [-6, -4, -6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-4 hidden sm:block pointer-events-none"
              >
                <UpiSlip amount={850} sender="Rajesh Kumar (QR Scan)" />
              </motion.div>

              {/* Floating Cash Slip with counter parallax */}
              <motion.div
                style={{ x: slip2X, y: slip2Y }}
                animate={{ rotate: [4, 7, 4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute -bottom-4 -right-4 hidden sm:block pointer-events-none"
              >
                <CashNote amount={500} label="Galla Counter Cash" />
              </motion.div>

              {/* ArthSetu Credibility Badge */}
              <div className="absolute top-4 right-4 bg-[#A64D3D] text-[#F4E6CE] px-3 py-2 rounded-lg shadow-lg border border-[#E8A04B]/40 text-center">
                <div className="text-[10px] font-mono text-[#E8A04B] uppercase tracking-wider font-bold">
                  ArthSetu
                </div>
                <div className="font-display font-bold text-sm">Organised Ledger</div>
                <div className="text-[10px] font-mono text-[#F4E6CE]/80">12 Mo Verified</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[#E8A04B] flex flex-col items-center space-y-1 pointer-events-none"
        >
          <span className="text-[10px] font-mono text-[#F4E6CE]/80">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* Marigold Decorative Divider */}
      <section className="bg-[#F4E6CE] py-4 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <MarigoldDivider className="w-full max-w-2xl mx-auto opacity-70" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2: THE PROBLEM — SCATTERED RECORD REALITY
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden bg-[#F4E6CE]">
        <div className="absolute inset-0 bg-ledger-ruled opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Khata book visual */}
            <Reveal delay={0.1}>
              <div className="relative">
                <div className="relative bg-[#FDFBF4] rounded-2xl shadow-paper-elevated overflow-hidden border border-[#D8BDA0]">
                  <div className="bg-[#A64D3D] px-4 py-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#E8A04B] uppercase tracking-widest font-bold">
                      Typical Micro-Merchant Reality
                    </span>
                    <div className="flex space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#B94F35]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E8A04B]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D99A28]" />
                    </div>
                  </div>
                  <div className="p-5">
                    <KhataBookIllustration className="w-full h-auto" opacity={0.95} />
                  </div>
                  <div className="px-4 py-3 bg-[#F4E6CE]/70 border-t border-[#D8BDA0] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#76513B]">Disciplined · Credible · Unreadable by Bank Systems</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right: Problem description */}
            <Reveal delay={0.2}>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#B94F35] tracking-widest">
                    {t('landing.problemTag')}
                  </span>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#A64D3D] mt-2 leading-tight">
                    {t('landing.problemTitle')}
                  </h2>
                  <p className="text-sm text-[#76513B] leading-relaxed mt-3 font-sans">
                    {t('landing.problemSubtitle')}
                  </p>
                </div>

                {/* Interactive source inspector */}
                <div className="space-y-2.5">
                  {problemSources.map((item, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => setActiveSourceIndex(idx)}
                      whileHover={{ x: 3 }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        activeSourceIndex === idx
                          ? 'bg-[#FDFBF4] border-[#B94F35] shadow-paper-lift'
                          : 'bg-[#FDFBF4]/70 border-[#D8BDA0] hover:bg-[#FDFBF4]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-[#39332E]">{item.title}</span>
                            <span className="text-[10px] text-[#B94F35] font-mono ml-2 flex-shrink-0">
                              {activeSourceIndex === idx ? '▸ Selected' : 'Tap'}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#76513B] font-mono">{item.subtitle}</div>
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
                            <p className="text-xs text-[#76513B] mt-2 font-sans leading-relaxed pl-9">
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
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3: SCATTER TO LEDGER BRIDGE
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#FDFBF4] relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
          <Reveal className="text-center space-y-3 mb-12">
            <span className="text-[10px] font-mono uppercase font-bold text-[#B94F35] tracking-widest">
              {t('landing.howItWorksTag')}
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#A64D3D]">
              {t('landing.howItWorksTitle')}
            </h2>
            <p className="text-sm text-[#76513B] max-w-xl mx-auto leading-relaxed">
              {t('landing.howItWorksSubtitle')}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="bg-[#F4E6CE]/70 rounded-2xl border border-[#D8BDA0] p-6 sm:p-10 shadow-paper-elevated overflow-hidden">
              <ScatterToLedgerIllustration className="w-full h-auto max-h-56" opacity={0.9} />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
            {[
              { icon: BookOpen, step: '01', title: 'Record Daybook', desc: 'Daily counter cash and UPI sales logged into an authentic Indian khatabook.' },
              { icon: Layers, step: '02', title: 'Classify & Trace', desc: 'Distinguish store procurement from household expenses with clear rules.' },
              { icon: FileCheck2, step: '03', title: 'Generate Passport', desc: 'A formal, evidence-backed report ready for review by banks and credit officers.' },
            ].map((item, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <div className="card-lift p-5 bg-[#FDFBF4] border border-[#D8BDA0] rounded-xl shadow-paper-lift space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#A64D3D] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#E8A04B]" />
                    </div>
                    <span className="font-mono text-xs text-[#B94F35] font-bold">STEP {item.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#39332E]">{item.title}</h3>
                  <p className="text-xs text-[#76513B] leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4: FINANCIAL VISIBILITY PASSPORT TEASER (FORMAL PREVIEW)
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#F4E6CE] relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Passport illustration */}
          <Reveal delay={0.05}>
            <div className="relative flex justify-center lg:justify-start">
              <div className="relative bg-white rounded-2xl shadow-report-sheet border border-slate-300 p-6 max-w-sm">
                <PassportIllustration className="w-full h-auto" opacity={0.95} />
              </div>
            </div>
          </Reveal>

          {/* Right: Text content */}
          <Reveal delay={0.15}>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#B94F35] tracking-widest">
                  Bank-Facing Architecture
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#A64D3D] mt-2 leading-tight">
                  {t('passport.title')}
                </h2>
                <p className="text-sm text-[#76513B] leading-relaxed mt-3 font-sans">
                  A formal, evidence-backed document prepared for review by credit appraisal teams, NBFCs, and financial institutions.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: IndianRupee, title: 'Consolidated Statement', desc: 'Separated cash and UPI sales compared against verified procurement.' },
                  { icon: BarChart3, title: 'Four Independent Dimensions', desc: 'Activity, Completeness, Pattern Consistency, and Evidence Reliability.' },
                  { icon: ShieldCheck, title: 'Cryptographic Integrity Digest', desc: 'SHA-256 fingerprint generated client-side to ensure document immutability.' },
                  { icon: Share2, title: 'Time-Bounded Consent Sharing', desc: 'Merchant-controlled read-only links with immediate revocation capability.' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#FDFBF4] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#FDFBF4] border border-[#D8BDA0] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-[#B94F35]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#39332E]">{feature.title}</div>
                      <div className="text-xs text-[#76513B] mt-0.5">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app/passport"
                  className="px-5 py-2.5 rounded-xl bg-[#0A2540] text-white text-xs font-bold font-mono tracking-wide hover:bg-slate-900 transition-colors shadow-sm flex items-center gap-2"
                >
                  <span>View Full Passport</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
                </Link>
                <Link
                  to="/institution/demo"
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Institution View →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-[#39332E] text-[#D8BDA0] py-12 px-4 sm:px-8 border-t border-[#76513B]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#B94F35] flex items-center justify-center text-white font-display font-bold text-lg">
                  <BookOpen className="w-4 h-4 text-[#E8A04B]" />
                </div>
                <span className="font-display font-bold text-xl text-white">ArthSetu</span>
              </div>
              <p className="text-xs leading-relaxed text-[#D8BDA0]">
                {t('landing.tagline')}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-mono font-bold text-[#E8A04B] uppercase tracking-wider mb-3">Quick Links</div>
              {[
                { to: '/app', label: 'Dashboard' },
                { to: '/app/records', label: 'Transactions' },
                { to: '/app/passport', label: 'Financial Visibility Passport' },
                { to: '/institution/demo', label: 'Institution View' },
              ].map((link) => (
                <div key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-mono font-bold text-[#E8A04B] uppercase tracking-wider mb-3">System Integrity</div>
              <p className="text-[11px] leading-relaxed">
                Deterministic offline prototype. All calculations run strictly in client-side memory. Zero external network dependencies.
              </p>
              <p className="text-[11px] text-[#D8BDA0]/70">
                React · TypeScript · Vite · Tailwind · Framer Motion · Recharts · jsPDF
              </p>
            </div>
          </div>
          <div className="border-t border-[#76513B]/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#D8BDA0]/60">
            <span>ArthSetu · Making Small Businesses Financially Visible</span>
            <span>Version 2.0 · Professional Banking & Dukandaar System</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
