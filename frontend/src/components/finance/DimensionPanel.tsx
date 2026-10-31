import React from 'react';
import { motion } from 'framer-motion';
import { DimensionMetric } from '../../services/types';
import { useI18n, Language } from '../../i18n/i18nContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DimensionPanelProps {
  dimensions: DimensionMetric[];
  className?: string;
  onImproveClick?: (dimId: string) => void;
  readOnly?: boolean;
}

const DIMENSION_LOCALIZATION: Record<
  string,
  Record<Language, { name: string; levelMap: Record<string, string>; improveAction: string }>
> = {
  dim_activity: {
    en: {
      name: 'Business Activity',
      levelMap: { Extensive: 'Extensive', Substantial: 'Substantial', Emerging: 'Emerging', Limited: 'Limited' },
      improveAction: 'Keep daily ledger active',
    },
    hi: {
      name: 'व्यापारिक सक्रियता',
      levelMap: { Extensive: 'उत्कृष्ट', Substantial: 'मजबूत', Emerging: 'मध्यम', Limited: 'सीमित' },
      improveAction: 'दैनिक बही-खाता चालू रखें',
    },
    kn: {
      name: 'ವ್ಯಾಪಾರ ಚಟುವಟಿಕೆ',
      levelMap: { Extensive: 'ಉತ್ಕೃಷ್ಟ', Substantial: 'ಗಣನೀಯ', Emerging: 'ಮಧ್ಯಮ', Limited: 'ಸೀಮಿತ' },
      improveAction: 'ದಿನವಹಿ ಖಾತೆ ಸಕ್ರಿಯವಾಗಿರಲಿ',
    },
    ta: {
      name: 'வணிகச் சுறுசுறுப்பு',
      levelMap: { Extensive: 'மிகச் சிறப்பானது', Substantial: 'வலுவானது', Emerging: 'மிதமானது', Limited: 'வரம்பிற்குட்பட்டது' },
      improveAction: 'தினசரி நாளேட்டைத் தொடர்ந்து பராமரிக்கவும்',
    },
  },
  dim_completeness: {
    en: {
      name: 'Record Completeness',
      levelMap: { Extensive: 'Extensive', Substantial: 'Substantial', Emerging: 'Emerging', Limited: 'Limited' },
      improveAction: 'Review unclassified bank rows',
    },
    hi: {
      name: 'रिकॉर्ड पूर्णता',
      levelMap: { Extensive: 'उत्कृष्ट', Substantial: 'मजबूत', Emerging: 'मध्यम', Limited: 'सीमित' },
      improveAction: 'अवर्गीकृत बैंक लेन-देन की समीक्षा करें',
    },
    kn: {
      name: 'ದಾಖಲೆಗಳ ಪರಿಪೂರ್ಣತೆ',
      levelMap: { Extensive: 'ಉತ್ಕೃಷ್ಟ', Substantial: 'ಗಣನೀಯ', Emerging: 'ಮಧ್ಯಮ', Limited: 'ಸೀಮಿತ' },
      improveAction: 'ವರ್ಗೀಕರಿಸದ ಬ್ಯಾಂಕ್ ಸಾಲುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    },
    ta: {
      name: 'பதிவுகளின் முழுமை',
      levelMap: { Extensive: 'மிகச் சிறப்பானது', Substantial: 'வலுவானது', Emerging: 'மிதமானது', Limited: 'வரம்பிற்குட்பட்டது' },
      improveAction: 'வகைப்படுத்தப்படாத வங்கி வரிகளைச் சரிபார்க்கவும்',
    },
  },
  dim_patterns: {
    en: {
      name: 'Pattern Consistency',
      levelMap: { Extensive: 'Extensive', Substantial: 'Substantial', Emerging: 'Emerging', Limited: 'Limited' },
      improveAction: 'Maintain weekly supplier rhythm',
    },
    hi: {
      name: 'वित्तीय स्थिरता व निरंतरता',
      levelMap: { Extensive: 'उत्कृष्ट', Substantial: 'मजबूत', Emerging: 'मध्यम', Limited: 'सीमित' },
      improveAction: 'साप्ताहिक सप्लायर भुगतान लय बनाए रखें',
    },
    kn: {
      name: 'ಹಣಕಾಸು ಸ್ಥಿರತೆ ಮತ್ತು ಮಾದರಿಗಳು',
      levelMap: { Extensive: 'ಉತ್ಕೃಷ್ಟ', Substantial: 'ಗಣನೀಯ', Emerging: 'ಮಧ್ಯಮ', Limited: 'ಸೀಮಿತ' },
      improveAction: 'ವಾರದ ಸಗಟು ಪಾವತಿ ಕ್ರಮವನ್ನು ಉಳಿಸಿಕೊಳ್ಳಿ',
    },
    ta: {
      name: 'நிதி நிலைத்தன்மை & வடிவங்கள்',
      levelMap: { Extensive: 'மிகச் சிறப்பானது', Substantial: 'வலுவானது', Emerging: 'மிதமானது', Limited: 'வரம்பிற்குட்பட்டது' },
      improveAction: 'வாராந்திர சப்ளையர் பட்டுவாடா முறையைத் தொடரவும்',
    },
  },
  dim_reliability: {
    en: {
      name: 'Evidence Reliability',
      levelMap: { Extensive: 'Extensive', Substantial: 'Substantial', Emerging: 'Emerging', Limited: 'Limited' },
      improveAction: 'Upload wholesale bill receipts',
    },
    hi: {
      name: 'प्रमाण विश्वसनीयता',
      levelMap: { Extensive: 'उत्कृष्ट', Substantial: 'मजबूत', Emerging: 'मध्यम', Limited: 'सीमित' },
      improveAction: 'थोक सप्लायर बिल रसीदें अपलोड करें',
    },
    kn: {
      name: 'ಸಾಕ್ಷ್ಯ ವಿಶ್ವಾಸಾರ್ಹತೆ',
      levelMap: { Extensive: 'ಉತ್ಕೃಷ್ಟ', Substantial: 'ಗಣನೀಯ', Emerging: 'ಮಧ್ಯಮ', Limited: 'ಸೀಮಿತ' },
      improveAction: 'ಸಗಟು ಸರಕು ರಸೀದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    },
    ta: {
      name: 'சான்று நம்பகத்தன்மை',
      levelMap: { Extensive: 'மிகச் சிறப்பானது', Substantial: 'வலுவானது', Emerging: 'மிதமானது', Limited: 'வரம்பிற்குட்பட்டது' },
      improveAction: 'மொத்தக் கொள்முதல் பில் ரசீதுகளைப் பதிவேற்றவும்',
    },
  },
};

export const DimensionPanel: React.FC<DimensionPanelProps> = ({
  dimensions,
  className = '',
  onImproveClick,
  readOnly = false,
}) => {
  const { language, t } = useI18n();

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Extensive':
        return 'bg-[#14402F] text-[#FDFBF4] border-[#0F2E22]';
      case 'Substantial':
        return 'bg-[#2A6347] text-[#FDFBF4] border-[#14402F]';
      case 'Emerging':
      case 'Moderate':
        return 'bg-[#D08A1E] text-[#FDFBF4] border-[#B57415]';
      default:
        return 'bg-[#B5532F] text-[#FDFBF4] border-[#8A6446]';
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {dimensions.map((dim, idx) => {
        const loc = DIMENSION_LOCALIZATION[dim.id]?.[language] || DIMENSION_LOCALIZATION[dim.id]?.en;
        const name = loc?.name || (language === 'hi' ? dim.nameHi : dim.nameEn);
        const localizedLevel = loc?.levelMap[dim.level] || dim.level;
        const facts = language === 'hi' ? dim.factsHi : dim.factsEn;
        const improvement = loc?.improveAction || (language === 'hi' ? dim.improvementHi : dim.improvementEn);

        // Smooth staggered bar animation
        const duration = 0.8 + idx * 0.15;

        return (
          <motion.div
            key={dim.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 shadow-paper-lift flex flex-col justify-between select-none relative overflow-hidden bg-khata-page hover:shadow-paper-elevated transition-shadow"
          >
            {/* Top Row: Name and Level Badge */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6446] font-bold">
                    {language === 'kn' ? 'ಆಯಾಮ' : language === 'ta' ? 'பரிமாணம்' : language === 'hi' ? 'आयाम' : 'Dimension'} {idx + 1}
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#14402F] mt-0.5">{name}</h3>
                </div>
                <div
                  className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border shadow-xs ${getLevelBadgeColor(
                    dim.level
                  )}`}
                >
                  {localizedLevel}
                </div>
              </div>

              {/* Progress Bar with Percentage */}
              <div className="my-3">
                <div className="w-full h-2.5 rounded-full bg-[#E6DAB9] overflow-hidden p-0.5 border border-[#D6CAA8]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.scorePercent}%` }}
                    transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-[#14402F]"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[#7C766B] mt-1.5 font-bold">
                  <span>{language === 'kn' ? 'ವ್ಯಾಪ್ತಿ' : language === 'ta' ? 'முழுமை' : language === 'hi' ? 'कवरेज' : 'Coverage'}: {dim.scorePercent}%</span>
                  <span>{localizedLevel}</span>
                </div>
              </div>

              {/* Measurable Facts List */}
              <ul className="space-y-1.5 my-3.5 text-xs text-[#4B4740] font-sans">
                {facts.map((fact, fIdx) => (
                  <li key={fIdx} className="flex items-start space-x-2">
                    <span className="text-[#D08A1E] font-bold mt-0.5">▪</span>
                    <span className="leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Row: Improvement Action */}
            {!readOnly && (
              <div className="pt-3 border-t border-[#D6CAA8]/70 mt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#5A3E2B] font-medium truncate max-w-[70%]">
                  ⚡ {improvement}
                </span>
                <Link
                  to={dim.id === 'completeness' ? '/app/records/review' : '/app/evidence'}
                  className="text-xs font-mono font-bold text-[#14402F] hover:text-[#D08A1E] flex items-center space-x-1"
                >
                  <span>{language === 'kn' ? 'ಪರಿಶೀಲಿಸಿ' : language === 'ta' ? 'சரிபார்க்க' : language === 'hi' ? 'देखें' : 'Action'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
