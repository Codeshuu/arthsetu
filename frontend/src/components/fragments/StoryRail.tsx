import React from 'react';

export type StoryBeat = 1 | 2 | 3 | 4 | 5;

interface StoryRailProps {
  currentBeat: StoryBeat;
  className?: string;
  showLabels?: boolean;
}

const BEATS = [
  { id: 1, label: 'Scattered', labelHi: 'बिखरा हुआ' },
  { id: 2, label: 'Organised', labelHi: 'व्यवस्थित' },
  { id: 3, label: 'Evidenced', labelHi: 'प्रमाणित' },
  { id: 4, label: 'Understood', labelHi: 'स्पष्ट' },
  { id: 5, label: 'Passport', labelHi: 'पासपोर्ट' },
] as const;

export const StoryRail: React.FC<StoryRailProps> = ({
  currentBeat,
  className = '',
  showLabels = false,
}) => {
  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#F8F1DE] border border-[#D6CAA8] select-none ${className}`}
      title={`Story Spine Beat ${currentBeat}: ${BEATS[currentBeat - 1].label}`}
    >
      <span className="text-[10px] font-mono font-bold text-[#8A6446] mr-1 hidden sm:inline">
        SPINE:
      </span>
      {BEATS.map((beat) => {
        const isCurrent = beat.id === currentBeat;
        const isPast = beat.id < currentBeat;

        return (
          <div key={beat.id} className="flex items-center space-x-1">
            <div
              className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono font-bold transition-all ${
                isCurrent
                  ? 'bg-[#14402F] text-[#FDFBF4] ring-2 ring-[#D08A1E] scale-105'
                  : isPast
                  ? 'bg-[#DCE8DD] text-[#2A6347] border border-[#B7C4A0]'
                  : 'bg-[#E6DAB9]/60 text-[#7C766B] border border-[#D6CAA8]'
              }`}
            >
              {beat.id}
            </div>
            {showLabels && isCurrent && (
              <span className="text-[11px] font-semibold text-[#14402F] ml-1">
                {beat.label}
              </span>
            )}
            {beat.id < 5 && (
              <div
                className={`w-2 sm:w-3 h-0.5 ${
                  isPast ? 'bg-[#2A6347]' : 'bg-[#D6CAA8]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

