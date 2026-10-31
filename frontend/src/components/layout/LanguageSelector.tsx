import React, { useState, useRef, useEffect } from 'react';
import { useI18n, Language } from '../../i18n/i18nContext';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  variant?: 'header' | 'demobar' | 'minimal';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = languages.find((l) => l.code === language) || languages[0];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all select-none ${
          variant === 'demobar'
            ? 'bg-[#14402F] text-[#FDFBF4] border border-[#2A6347] hover:border-[#D08A1E]'
            : 'bg-[#F8F1DE] text-[#14402F] border border-[#D6CAA8] hover:bg-[#E6DAB9]'
        }`}
      >
        <Languages className="w-3.5 h-3.5 text-[#D08A1E] flex-shrink-0" />
        <span className="font-bold">{currentOption.nativeLabel}</span>
        <span className="text-[10px] opacity-70 hidden sm:inline">({currentOption.label})</span>
        <ChevronDown
          className={`w-3 h-3 text-[#7C766B] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-48 rounded-lg bg-[#FDFBF4] border-2 border-[#14402F] shadow-2xl z-50 overflow-hidden font-sans py-1"
            role="listbox"
          >
            <div className="px-3 py-1.5 border-b border-[#D6CAA8]/60 text-[10px] font-mono uppercase tracking-wider text-[#8A6446] font-bold">
              Select Language / ಭಾಷೆ / மொழி
            </div>
            {languages.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors text-xs ${
                    isSelected
                      ? 'bg-[#14402F] text-[#FDFBF4] font-bold'
                      : 'text-[#2B2620] hover:bg-[#F8F1DE]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div>
                    <div className="font-bold text-sm leading-tight">{item.nativeLabel}</div>
                    <div
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-[#D08A1E]' : 'text-[#7C766B]'
                      }`}
                    >
                      {item.label} · {item.script}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#D08A1E]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

