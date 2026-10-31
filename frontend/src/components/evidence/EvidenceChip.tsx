import React from 'react';
import { EvidenceClass } from '../../services/types';
import { EVIDENCE_CLASS_CONFIG } from '../../design/tokens';
import { useI18n } from '../../i18n/i18nContext';
import { FileText, PenTool, HelpCircle, Lock } from 'lucide-react';

interface EvidenceChipProps {
  evidenceClass: EvidenceClass;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
  onClick?: () => void;
}

export const EvidenceChip: React.FC<EvidenceChipProps> = ({
  evidenceClass,
  size = 'md',
  className = '',
  onClick,
}) => {
  const { language } = useI18n();
  const config = EVIDENCE_CLASS_CONFIG[evidenceClass];

  let label = config.labelEn;
  let description = config.descriptionEn;

  if (language === 'hi') {
    label = config.labelHi;
    description = config.descriptionHi;
  } else if (language === 'kn') {
    label = config.labelKn;
    description = config.descriptionKn;
  } else if (language === 'ta') {
    label = config.labelTa;
    description = config.descriptionTa;
  }

  const getIcon = () => {
    switch (evidenceClass) {
      case 'source_authenticated':
        return <Lock className="w-3 h-3 text-white mr-1" />;
      case 'document_supplied':
        return <FileText className="w-3 h-3 mr-1" style={{ color: config.textColor }} />;
      case 'owner_declared':
        return <PenTool className="w-3 h-3 mr-1" style={{ color: config.textColor }} />;
      case 'estimated':
        return <span className="font-mono font-bold mr-1 text-xs">~</span>;
      case 'unclassified':
        return <HelpCircle className="w-3 h-3 mr-1" style={{ color: config.textColor }} />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
    lg: 'text-xs px-3 py-1.5',
  };

  const getStyle = () => {
    switch (evidenceClass) {
      case 'source_authenticated':
        return {
          backgroundColor: '#14402F',
          color: '#FDFBF4',
          borderColor: '#0F2E22',
        };
      case 'document_supplied':
        return {
          backgroundColor: '#F8F1DE',
          color: '#7A5A16',
          borderColor: '#B28A33',
        };
      case 'owner_declared':
        return {
          backgroundColor: '#F1E8D0',
          color: '#5A3E2B',
          borderColor: '#8A6446',
          textDecoration: 'underline',
          textDecorationStyle: 'wavy' as const,
        };
      case 'estimated':
        return {
          backgroundColor: '#E4EAD6',
          color: '#14402F',
          borderColor: '#6B7A3A',
        };
      case 'unclassified':
        return {
          backgroundColor: '#E8C3B0',
          color: '#B5532F',
          borderColor: '#B5532F',
          borderStyle: 'dashed' as const,
        };
    }
  };

  return (
    <span
      onClick={onClick}
      title={`${label}: ${description}`}
      className={`inline-flex items-center font-mono font-semibold rounded-sm border select-none transition-transform hover:scale-[1.02] ${
        onClick ? 'cursor-pointer' : ''
      } ${sizeClasses[size]} ${className}`}
      style={getStyle()}
    >
      {getIcon()}
      <span>{label}</span>
      {evidenceClass === 'source_authenticated' && (
        <span className="ml-1 text-[8px] bg-forest-900 px-1 rounded uppercase tracking-wider">
          Demo: ₹0
        </span>
      )}
    </span>
  );
};
