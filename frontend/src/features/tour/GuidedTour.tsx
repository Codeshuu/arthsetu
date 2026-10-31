import React from 'react';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const TOUR_STEPS = [
  {
    step: 1,
    title: '1. The Living Ledger Dashboard',
    desc: 'Notice that ArthSetu looks like a real accounts book, not a generic dashboard. Ruled lines, margin marks, Fraunces numerals, and the Evidence Ribbon show your financial state at a glance.',
    route: '/app',
    beat: '② ORGANISED',
  },
  {
    step: 2,
    title: '2. The Evidence Trace',
    desc: 'Every single number is traceable to where it came from. Tap "Trace" next to any headline number to see the exact contributing transactions and source files behind it.',
    route: '/app',
    beat: '③ EVIDENCED',
  },
  {
    step: 3,
    title: '3. Cleaning & Review Queue',
    desc: 'In Records > Review, ArthSetu suggests classifications (e.g. wholesale supplier, school fees) with transparent reasons. A suggestion never becomes official until you confirm it.',
    route: '/app/records/review',
    beat: '② to ③ TRANSFORMATION',
  },
  {
    step: 4,
    title: '4. Evidence Centre & Observations',
    desc: 'The physical "Document Shelf" holds your uploaded statements with non-authenticated stamps. Observations explain gaps and discrepancies in neutral, encouraging terms.',
    route: '/app/evidence',
    beat: '③ EVIDENCED',
  },
  {
    step: 5,
    title: '5. The Financial Visibility Passport',
    desc: 'An authentic A4 paged document with cover stamp, Four Dimensions, operating continuity, mandatory Limitations page, and a SHA-256 cryptographic fingerprint.',
    route: '/app/passport',
    beat: '⑤ PASSPORT',
  },
  {
    step: 6,
    title: '6. The Voluntary Institution View',
    desc: 'When you share your passport with a bank officer, they see a sober reading pane without owner editing tools. Voluntary, transparent, and respectful of small business dignity.',
    route: '/institution/demo',
    beat: '⑤ SHARING',
  },
];

export const GuidedTour: React.FC = () => {
  const tourActive = useArthSetuStore((s) => s.tourActive);
  const tourStep = useArthSetuStore((s) => s.tourStep);
  const nextStep = useArthSetuStore((s) => s.nextTourStep);
  const prevStep = useArthSetuStore((s) => s.prevTourStep);
  const endTour = useArthSetuStore((s) => s.endTour);
  const navigate = useNavigate();

  if (!tourActive || tourStep < 1 || tourStep > 6) return null;

  const current = TOUR_STEPS[tourStep - 1];

  const handleNext = () => {
    if (tourStep === 6) {
      endTour();
      navigate('/app');
    } else {
      nextStep();
      const nextRoute = TOUR_STEPS[tourStep].route;
      navigate(nextRoute);
    }
  };

  const handlePrev = () => {
    if (tourStep > 1) {
      prevStep();
      const prevRoute = TOUR_STEPS[tourStep - 2].route;
      navigate(prevRoute);
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-6 sm:right-6 sm:left-auto sm:w-96 bg-[#FDFBF4] border-2 border-[#14402F] rounded-lg shadow-2xl z-50 p-5 select-none font-sans">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E] bg-[#F8F1DE] px-2 py-0.5 rounded border border-[#D6CAA8]">
          Tour {tourStep} of 6 · {current.beat}
        </span>
        <button
          onClick={endTour}
          className="text-[#7C766B] hover:text-[#2B2620] p-1 rounded"
          aria-label="Close tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-display font-bold text-lg text-[#14402F] my-1">
        {current.title}
      </h3>
      <p className="text-xs text-[#5A3E2B] leading-relaxed my-2 font-sans">
        {current.desc}
      </p>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#D6CAA8]">
        <button
          onClick={handlePrev}
          disabled={tourStep === 1}
          className={`flex items-center space-x-1 text-xs font-semibold text-[#5A3E2B] ${
            tourStep === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:text-[#14402F]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center space-x-1 px-3 py-1.5 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold hover:bg-[#0F2E22] transition-colors"
        >
          <span>{tourStep === 6 ? 'Finish Tour' : 'Next Step'}</span>
          {tourStep === 6 ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

