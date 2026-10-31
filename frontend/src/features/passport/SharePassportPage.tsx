import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { shareService } from '../../services/ShareService';
import { formatINR } from '../../lib/formatCurrency';
import { ArrowLeft, Copy, Check, MessageCircle, ShieldCheck, Trash2, ExternalLink } from 'lucide-react';

export const SharePassportPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const business = useArthSetuStore((s) => s.business);
  const shares = useArthSetuStore((s) => s.shares);
  const revokeShare = useArthSetuStore((s) => s.revokeShareGrant);

  const [recipient, setRecipient] = useState('');
  const [duration, setDuration] = useState<7 | 30 | 90>(30);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const grant = await shareService.createShare({
      recipientLabel: recipient || 'Commercial Bank Branch Officer',
      durationDays: duration,
      sections: ['profile', 'dimensions', 'trends', 'evidence', 'limitations', 'integrity'],
    });
    setGeneratedToken(grant.token);
  };

  const shareUrl = generatedToken ? `${window.location.origin}/institution/${generatedToken}` : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto font-sans select-none">
      {/* Top Header */}
      <div className="flex items-center space-x-3 border-b border-[#D6CAA8] pb-4">
        <Link
          to="/app/passport"
          className="p-1.5 rounded hover:bg-[#F8F1DE] text-[#14402F]"
          aria-label="Back to Passport"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            {t('share.badge')}
          </span>
          <h1 className="font-display text-2xl font-bold text-[#14402F]">
            {t('share.title')}
          </h1>
        </div>
      </div>

      {/* Creation Stage or Success Modal */}
      {!generatedToken ? (
        <form
          onSubmit={handleCreateShare}
          className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-lg p-6 sm:p-8 shadow-paper-elevated space-y-5 bg-khata-page"
        >
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-[#14402F]">
              {t('share.createShareTitle')}
            </h3>
            <p className="text-xs text-[#5A3E2B] leading-relaxed">
              {t('share.createShareDesc')}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#2B2620] mb-1 font-mono">
                {t('share.recipientLabel')}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={t('share.recipientPlaceholder')}
                className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs text-[#2B2620] focus:outline-none focus:border-[#14402F]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2620] mb-1 font-mono">
                {t('share.durationLabel')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { days: 7, label: t('share.duration7') },
                  { days: 30, label: t('share.duration30') },
                  { days: 90, label: t('share.duration90') },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setDuration(item.days as any)}
                    className={`p-3 rounded border text-center transition-all ${
                      duration === item.days
                        ? 'bg-[#14402F] text-white border-[#0F2E22] font-bold shadow'
                        : 'bg-[#F8F1DE] text-[#2B2620] border-[#D6CAA8]'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.days} Days</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mandatory Invariant Notice */}
            <div className="p-3 bg-[#E4EAD6] border border-[#939F5B] rounded text-xs space-y-1 text-[#14402F]">
              <div className="font-bold flex items-center space-x-1 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2A6347]" />
                <span>MANDATORY PRIVACY INVARIANTS:</span>
              </div>
              <ul className="text-[11px] list-disc list-inside space-y-0.5 text-[#2A6347]">
                <li>Report Limitations page is always included.</li>
                <li>SHA-256 cryptographic integrity fingerprint is always attached.</li>
                <li>Uploaded documents remain labelled as unauthenticated by third-party.</li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D6CAA8]">
            <button
              type="submit"
              className="w-full py-3 rounded bg-[#D08A1E] text-white font-bold text-xs hover:bg-[#B57415] shadow transition-colors font-mono tracking-wide uppercase"
            >
              {t('share.generateBtn')}
            </button>
          </div>
        </form>
      ) : (
        /* Generated Link View */
        <div className="bg-[#FDFBF4] border-2 border-[#14402F] rounded-lg p-6 sm:p-8 shadow-2xl space-y-4 bg-khata-page text-center">
          <div className="w-12 h-12 rounded-full bg-[#E4EAD6] text-[#2A6347] flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-2xl text-[#14402F]">
            {t('share.linkCreated')}
          </h3>
          <p className="text-xs text-[#5A3E2B] max-w-md mx-auto">
            {t('share.createdDesc')}
          </p>

          <div className="p-3 bg-[#F8F1DE] border border-[#D6CAA8] rounded font-mono text-xs flex items-center justify-between text-[#2B2620] break-all">
            <span className="truncate mr-2">{shareUrl}</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded bg-[#14402F] text-white font-bold text-xs flex items-center space-x-1 flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? t('share.copiedBtn') : t('share.copyBtn')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={shareService.generateWhatsAppLink(generatedToken, recipient)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded bg-[#25D366] text-white text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('share.whatsAppBtn')}</span>
            </a>

            <Link
              to={`/institution/${generatedToken}`}
              className="px-4 py-2 rounded bg-[#14402F] text-white text-xs font-bold flex items-center space-x-1.5"
            >
              <span>{t('share.previewBtn')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Active Shares List */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 shadow-paper-lift space-y-3">
        <h3 className="font-display font-bold text-lg text-[#14402F] border-b border-[#D6CAA8] pb-2">
          {t('share.activeSharesTitle')} ({shares.filter((s) => !s.revokedAt).length})
        </h3>

        <div className="divide-y divide-[#D6CAA8]/60 text-xs font-mono">
          {shares.map((s) => (
            <div key={s.token} className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#2B2620] font-sans">{s.recipientLabel}</div>
                <div className="text-[10px] text-[#7C766B]">
                  {t('share.expiresLabel')}: {s.expiresAt.split('T')[0]} · {s.revokedAt ? t('share.revokedLabel') : t('share.activeLabel')}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/institution/${s.token}`}
                  className="px-2 py-1 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#14402F] hover:bg-[#E6DAB9]"
                >
                  View
                </Link>
                {!s.revokedAt && (
                  <button
                    onClick={() => revokeShare(s.token)}
                    className="p-1 rounded text-[#B5532F] hover:bg-[#E8C3B0]"
                    title={t('share.revokeBtn')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

