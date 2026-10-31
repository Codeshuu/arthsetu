import React, { useState, useRef, useEffect } from 'react';
import { useI18n, Language } from '../../i18n/i18nContext';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  variant?: 'header' | 'demobar' | 'minimal' | 'passport';
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

  const getButtonStyles = () => {
    if (variant === 'passport') {
      return 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm';
    }
    if (variant === 'demobar') {
      return 'bg-[#76513B] text-[#F4E6CE] border border-[#A64D3D] hover:border-[#D99A28]';
    }
    return 'bg-[#F4E6CE] text-[#39332E] border border-[#D8BDA0] hover:bg-[#E8D6A3]';
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all select-none ${getButtonStyles()}`}
      >
        <Languages className={`w-3.5 h-3.5 flex-shrink-0 ${variant === 'passport' ? 'text-blue-700' : 'text-[#B94F35]'}`} />
        <span className="font-bold tracking-wide">{currentOption.nativeLabel}</span>
        <ChevronDown
          className={`w-3 h-3 text-current opacity-60 transition-transform duration-200 ${
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
            className="absolute right-0 mt-1.5 w-44 rounded-lg bg-[#FFFFFF] border border-[#D8BDA0] shadow-xl z-50 overflow-hidden font-sans py-1"
            role="listbox"
          >
            {languages.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors text-xs ${
                    isSelected
                      ? 'bg-[#B94F35] text-white font-bold'
                      : 'text-[#39332E] hover:bg-[#F4E6CE]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="font-bold text-sm leading-tight">{item.nativeLabel}</div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
