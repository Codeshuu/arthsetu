import React, { useState } from 'react';
import { Observation } from '../../services/types';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { Stamp } from '../fragments/Stamp';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ObservationCardProps {
  observation: Observation;
  className?: string;
}

export const ObservationCard: React.FC<ObservationCardProps> = ({
  observation,
  className = '',
}) => {
  const { language } = useI18n();
  const resolveObs = useArthSetuStore((s) => s.resolveObservation);
  const dismissObs = useArthSetuStore((s) => s.dismissObservation);
  const [justResolved, setJustResolved] = useState(false);

  const isHi = language === 'hi';
  const title = isHi ? observation.titleHi : observation.titleEn;
  const explanation = isHi ? observation.plainExplanationHi : observation.plainExplanationEn;
  const actionText = isHi ? observation.suggestedActionHi : observation.suggestedActionEn;

  const handleResolve = () => {
    resolveObs(observation.id, 'Confirmed and reviewed by merchant');
    setJustResolved(true);
  };

  return (
    <div
      className={`relative p-4 rounded border transition-all ${
        observation.resolved
          ? 'bg-[#E4EAD6]/40 border-[#B7C4A0] text-[#7C766B]'
          : observation.severity === 'attention'
          ? 'bg-[#FDFBF4] border-[#B5532F]/50 shadow-paper-lift'
          : 'bg-[#FDFBF4] border-[#D6CAA8] shadow-paper-lift'
      } ${className}`}
    >
      {/* Resolved Stamp Overlay */}
      {(observation.resolved || justResolved) && (
        <div className="absolute top-3 right-4 z-10 pointer-events-none">
          <Stamp variant="resolved" rotation={-4} animate={true} />
        </div>
      )}

      <div className="flex items-start space-x-2.5">
        <div className="mt-0.5">
          {observation.resolved ? (
            <CheckCircle className="w-4 h-4 text-[#2A6347]" />
          ) : (
            <AlertCircle
              className={`w-4 h-4 ${
                observation.severity === 'attention' ? 'text-[#B5532F]' : 'text-[#D08A1E]'
              }`}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-bold text-[#2B2620] leading-snug">{title}</h4>
            <span
              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                observation.severity === 'attention'
                  ? 'bg-[#E8C3B0] text-[#B5532F]'
                  : 'bg-[#F8F1DE] text-[#7A5A16]'
              }`}
            >
              {observation.severity}
            </span>
          </div>

          <p className="text-xs text-[#5A3E2B] mt-1.5 leading-relaxed font-sans">{explanation}</p>

          {/* Potential Value Shift Preview */}
          {observation.potentialValueShift && !observation.resolved && (
            <div className="mt-2 text-[11px] font-mono text-[#14402F] bg-[#E4EAD6]/60 p-1.5 rounded border border-[#939F5B]/40">
              💡 Fixing this will reclassify ₹{observation.potentialValueShift.amount.toLocaleString('en-IN')} from{' '}
              <span className="text-[#B5532F]">Unclassified</span> to{' '}
              <span className="text-[#7A5A16]">Document Supplied</span>.
            </div>
          )}

          {/* Actions */}
          {!observation.resolved && (
            <div className="mt-3 pt-2 border-t border-[#D6CAA8]/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <Link
                to={observation.type === 'missing_record' ? '/app/records' : '/app/records/review'}
                className="inline-flex items-center space-x-1 font-bold text-[#14402F] hover:text-[#D08A1E]"
              >
                <span>{actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResolve}
                  className="px-2.5 py-1 rounded bg-[#14402F] text-white text-[11px] font-semibold hover:bg-[#0F2E22] transition-colors"
                >
                  Mark Resolved
                </button>
                <button
                  type="button"
                  onClick={() => dismissObs(observation.id)}
                  className="text-[11px] text-[#7C766B] hover:text-[#2B2620] underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

