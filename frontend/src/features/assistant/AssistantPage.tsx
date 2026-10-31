import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/i18nContext';
import { assistantProvider, AssistantAnswer } from '../../services/AssistantProvider';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import { Send, ArrowRight, CornerDownRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  answer?: AssistantAnswer;
}

export const AssistantPage: React.FC = () => {
  const { t, language } = useI18n();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'hi'
          ? 'नमस्ते! मैं अर्थसेतु सहायक हूँ। आप अपने बही-खाते, बिक्री, खर्च और प्रमाण के बारे में कुछ भी पूछ सकते हैं।'
          : language === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಾನು ಅರ್ಥಸೇತು ದಿನವಹಿ ಸಹಾಯಕ. ನಿಮ್ಮ ದಾಖಲಾದ ಮಾರಾಟ, ಖರ್ಚು ಮತ್ತು ಪ್ರಮಾಣಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ.'
          : language === 'ta'
          ? 'வணக்கம்! நான் அர்த்தசேது நாளேடு உதவியாளர். உங்களது பதிவு செய்யப்பட்ட விற்பனை, செலவுகள் மற்றும் சான்றுகள் குறித்து ஏதேனும் கேட்கலாம்.'
          : 'Namaste! I am the ArthSetu Ledger Assistant. Ask me anything about your recorded sales, expense shifts, or evidence classifications.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    t('assistant.q1'),
    t('assistant.q2'),
    t('assistant.q3'),
    t('assistant.q4'),
    t('assistant.q5'),
    t('assistant.q6'),
  ];

  const handleAsk = async (question: string) => {
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const answer = await assistantProvider.ask(question, language);
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: answer.answerMarkdown,
        answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CAA8] pb-4">
        <div className="flex items-center space-x-3">
          {/* Setu Bridge Mark */}
          <div className="w-9 h-9 rounded bg-[#14402F] flex items-center justify-center text-[#D08A1E] font-display font-bold text-lg shadow-sm">
            अ
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
              {t('assistant.badge')}
            </span>
            <h1 className="font-display text-2xl font-bold text-[#14402F]">
              {t('assistant.title')}
            </h1>
          </div>
        </div>
        <div className="text-xs font-mono text-[#7C766B]">
          {t('assistant.subNotice')}
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div>
        <div className="text-xs font-mono font-bold uppercase text-[#8A6446] mb-2">
          {t('assistant.suggestedLabel')}
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#FDFBF4] border border-[#D6CAA8] text-[#14402F] hover:bg-[#F8F1DE] hover:border-[#14402F] transition-all font-medium text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger-Notes Conversation Stream */}
      <div className="space-y-5 min-h-[380px] bg-khata-page p-5 rounded-lg border border-[#D6CAA8] shadow-paper-elevated">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              /* User Prompt styled as margin-style handwritten prompt */
              <div key={msg.id} className="flex justify-end pl-12">
                <div className="bg-[#F8F1DE] border-b-2 border-r-2 border-[#D6CAA8] rounded-bl-lg rounded-tl-lg rounded-tr-lg p-3.5 shadow-sm text-right">
                  <span className="text-[10px] font-mono uppercase text-[#8A6446] font-bold block mb-1">
                    Your Question
                  </span>
                  <div className="font-kalam text-lg sm:text-xl font-bold text-[#5A3E2B]">
                    "{msg.text}"
                  </div>
                </div>
              </div>
            );
          }

          /* Assistant Response styled as ruled ledger notes */
          return (
            <div key={msg.id} className="pr-12">
              <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 shadow-paper-lift space-y-3">
                <div className="flex justify-between items-center border-b border-[#D6CAA8]/60 pb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#14402F] flex items-center space-x-1">
                    <span>{t('assistant.groundedStamp')}</span>
                  </span>
                  {msg.answer?.evidenceClass && (
                    <EvidenceChip evidenceClass={msg.answer.evidenceClass} size="sm" />
                  )}
                </div>

                {/* Optional Headline Number */}
                {msg.answer?.headlineValue && (
                  <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8] text-center my-2">
                    <div className="text-xs font-mono text-[#7C766B]">
                      {msg.answer.headlineLabel || 'Calculated Metric'}
                    </div>
                    <div className="font-display text-3xl sm:text-4xl font-bold text-[#14402F] mt-0.5">
                      {msg.answer.headlineValue}
                    </div>
                  </div>
                )}

                {/* Plain Answer Text */}
                <p className="text-sm text-[#2B2620] leading-relaxed font-sans">
                  {msg.text}
                </p>

                {/* Audit Trail & Deep Links */}
                {msg.answer?.metadata && (
                  <div className="pt-2 border-t border-[#D6CAA8]/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#7C766B]">
                    <span>
                      {t('assistant.auditNotice')} · {msg.answer.metadata.periodLabel || '2025–2026'}
                    </span>
                    {msg.answer.metadata.filterQuery && (
                      <Link
                        to="/app/records"
                        className="text-[#14402F] font-bold hover:underline flex items-center space-x-1"
                      >
                        <span>{t('assistant.showMatching')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="text-xs font-mono text-[#8A6446] animate-pulse flex items-center space-x-2 p-3">
            <div className="w-2 h-2 rounded-full bg-[#14402F]" />
            <span>{t('assistant.consulting')}</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputQuestion);
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={t('assistant.placeholder')}
          className="flex-1 px-4 py-3 rounded bg-[#FDFBF4] border border-[#D6CAA8] text-sm text-[#2B2620] shadow-sm focus:outline-none focus:border-[#14402F]"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="px-5 py-3 rounded bg-[#14402F] text-[#FDFBF4] text-sm font-bold hover:bg-[#0F2E22] transition-colors disabled:opacity-50 flex items-center space-x-1.5 shadow"
        >
          <span>Ask</span>
          <Send className="w-4 h-4 text-[#D08A1E]" />
        </button>
      </form>

      <div className="text-center text-[11px] font-mono text-[#7C766B]">
        Answers come strictly from your recorded data · No cloud AI or hallucinated facts
      </div>
    </div>
  );
};

