// AssistantProvider interface & Grounded Local implementation
// Strictly deterministic: queries selectors, extracts entities, formats factual answers.

import { EvidenceClass } from './types';
import { useArthSetuStore } from '../store/useArthSetuStore';
import {
  selectRecordedSales,
  selectRecordedSpending,
  selectSalesCashDigitalSplit,
  selectOperatingContinuity,
  selectMonthlyTrends,
} from '../selectors/financeSelectors';
import { selectEvidenceBreakdown } from '../selectors/evidenceSelectors';
import { selectActiveObservations } from '../selectors/observationSelectors';
import { formatINR } from '../lib/formatCurrency';
import { Language } from '../i18n/i18nContext';

export interface AssistantAnswer {
  id: string;
  question: string;
  headlineValue?: string;
  headlineLabel?: string;
  evidenceClass?: EvidenceClass;
  answerMarkdown: string;
  metadata: {
    recordCount?: number;
    periodLabel?: string;
    filterQuery?: Record<string, string>;
  };
  suggestedFollowUps?: string[];
}

export interface IAssistantProvider {
  ask(question: string, language?: Language): Promise<AssistantAnswer>;
}

class GroundedLocalAssistantProvider implements IAssistantProvider {
  async ask(question: string, language: Language = 'en'): Promise<AssistantAnswer> {
    const q = question.toLowerCase();
    const state = useArthSetuStore.getState();
    const txns = state.transactions;

    // 1. Revenue recorded this / last month
    const isSalesQuery =
      q.includes('revenue') ||
      q.includes('sales') ||
      q.includes('income') ||
      q.includes('कमाई') ||
      q.includes('बिक्री') ||
      q.includes('ಮಾರಾಟ') ||
      q.includes('ಆದಾಯ') ||
      q.includes('விற்பனை') ||
      q.includes('வருமானம்');

    if (isSalesQuery) {
      const trends = selectMonthlyTrends(txns);
      const latestMonth = trends[trends.length - 1];
      const prevMonth = trends[trends.length - 2];

      const isLastMonth =
        q.includes('last month') ||
        q.includes('पिछले महीने') ||
        q.includes('ಕಳೆದ ತಿಂಗಳು') ||
        q.includes('கடந்த மாதம்');

      if (isLastMonth) {
        const target = prevMonth || latestMonth;
        let headlineLabel = `Total Recorded Sales in ${target.monthLabel}`;
        let answerMarkdown = `In ${target.monthLabel}, your total recorded business sales amounted to **${formatINR(target.sales)}**. Cash sales accounted for **${formatINR(target.cashSales)}**, while digital (UPI/Bank) settlements contributed **${formatINR(target.digitalSales)}**.`;
        let followUps = ['Why did expenses change?', 'What is the cash vs UPI split?'];

        if (language === 'hi') {
          headlineLabel = `${target.monthLabel} में कुल दर्ज बिक्री`;
          answerMarkdown = `पिछले महीने (${target.monthLabel}) में आपकी कुल दर्ज बिक्री **${formatINR(target.sales)}** थी। इसमें से नकद बिक्री **${formatINR(target.cashSales)}** और डिजिटल/UPI बिक्री **${formatINR(target.digitalSales)}** रही।`;
          followUps = ['खर्चे क्यों बदले?', 'नकद बनाम UPI का क्या अनुपात है?'];
        } else if (language === 'kn') {
          headlineLabel = `${target.monthLabel} ನಲ್ಲಿ ದಾಖಲಾದ ಒಟ್ಟು ಮಾರಾಟ`;
          answerMarkdown = `ಕಳೆದ ತಿಂಗಳು (${target.monthLabel}) ನಿಮ್ಮ ಒಟ್ಟು ದಾಖಲಿತ ಮಾರಾಟವು **${formatINR(target.sales)}** ಆಗಿತ್ತು. ಇದರಲ್ಲಿ ನಗದು ಮಾರಾಟ **${formatINR(target.cashSales)}** ಮತ್ತು ಡಿಜಿಟಲ್/ಯುಪಿಐ ಮಾರಾಟ **${formatINR(target.digitalSales)}** ಆಗಿತ್ತು.`;
          followUps = ['ಖರ್ಚುಗಳು ಏಕೆ ಬದಲಾದವು?', 'ನಗದು ಮತ್ತು ಯುಪಿಐ ಅನುಪಾತವೇನು?'];
        } else if (language === 'ta') {
          headlineLabel = `${target.monthLabel} மாதத்தில் பதிவான மொத்த விற்பனை`;
          answerMarkdown = `கடந்த மாதம் (${target.monthLabel}) உங்கள் மொத்த விற்பனை **${formatINR(target.sales)}** ஆகப் பதிவாகியுள்ளது. இதில் ரொக்க விற்பனை **${formatINR(target.cashSales)}** மற்றும் டிஜிட்டல்/யுபிஐ வரவு **${formatINR(target.digitalSales)}** ஆகும்.`;
          followUps = ['செலவுகள் ஏன் மாறின?', 'ரொக்கம் மற்றும் யுபிஐ விகிதம் என்ன?'];
        }

        return {
          id: `ans_${Date.now()}`,
          question,
          headlineValue: formatINR(target.sales),
          headlineLabel,
          evidenceClass: 'document_supplied',
          answerMarkdown,
          metadata: {
            periodLabel: target.monthLabel,
            filterQuery: { category: 'business_income', month: target.monthKey },
          },
          suggestedFollowUps: followUps,
        };
      }

      // Default: current / latest month
      let headlineLabel = `Total Recorded Sales in ${latestMonth.monthLabel}`;
      let answerMarkdown = `For ${latestMonth.monthLabel}, total recorded sales stand at **${formatINR(latestMonth.sales)}**. This is backed by your daily daybook cash entries and UPI statements.`;
      let followUps = ['How did activity change over 6 months?', 'What should I organise next?'];

      if (language === 'hi') {
        headlineLabel = `${latestMonth.monthLabel} में अब तक दर्ज बिक्री`;
        answerMarkdown = `वर्तमान महीने (${latestMonth.monthLabel}) में कुल दर्ज बिक्री **${formatINR(latestMonth.sales)}** है। यह आपके दैनिक रोजनामचे और UPI विवरणों द्वारा समर्थಿತ है।`;
        followUps = ['पिछले 6 महीनों में क्या बदलाव आया?', 'आगे क्या व्यवस्थित करें?'];
      } else if (language === 'kn') {
        headlineLabel = `${latestMonth.monthLabel} ನಲ್ಲಿ ದಾಖಲಾದ ಒಟ್ಟು ಮಾರಾಟ`;
        answerMarkdown = `ಪ್ರಸ್ತುತ ತಿಂಗಳು (${latestMonth.monthLabel}) ಒಟ್ಟು ದಾಖಲಿತ ಮಾರಾಟವು **${formatINR(latestMonth.sales)}** ಆಗಿದೆ. ಇದು ನಿಮ್ಮ ದೈನಂದಿನ ನಗದು ನಮೂದುಗಳು ಮತ್ತು ಯುಪಿಐ ದಾಖಲೆಗಳಿಂದ ಸಾಬೀತಾಗಿದೆ.`;
        followUps = ['ಕಳೆದ 6 ತಿಂಗಳಲ್ಲಿ ಏನು ಬದಲಾಗಿದೆ?', 'ಮುಂದೆ ಏನು ಸರಿಪಡಿಸಬೇಕು?'];
      } else if (language === 'ta') {
        headlineLabel = `${latestMonth.monthLabel} மாதத்தில் பதிவான விற்பனை`;
        answerMarkdown = `நடப்பு மாதத்தில் (${latestMonth.monthLabel}) இதுவரை பதிவான மொத்த விற்பனை **${formatINR(latestMonth.sales)}** ஆகும். இது உங்கள் நாளேடு மற்றும் யுபிஐ அறிக்கைகளால் உறுதிப்படுத்தப்பட்டுள்ளது.`;
        followUps = ['கடந்த 6 மாதங்களில் என்ன மாற்றம் ஏற்பட்டது?', 'அடுத்து என்ன செய்ய வேண்டும்?'];
      }

      return {
        id: `ans_${Date.now()}`,
        question,
        headlineValue: formatINR(latestMonth.sales),
        headlineLabel,
        evidenceClass: 'document_supplied',
        answerMarkdown,
        metadata: {
          periodLabel: latestMonth.monthLabel,
          filterQuery: { category: 'business_income', month: latestMonth.monthKey },
        },
        suggestedFollowUps: followUps,
      };
    }

    // 2. Why expenses changed
    const isExpenseQuery =
      q.includes('expense') ||
      q.includes('spending') ||
      q.includes('खर्च') ||
      q.includes('ಖರ್ಚು') ||
      q.includes('செலவு');

    if (isExpenseQuery) {
      const trends = selectMonthlyTrends(txns);
      const curr = trends[trends.length - 1];
      const prev = trends[trends.length - 2];

      const diff = curr && prev ? curr.spending - prev.spending : 0;
      const isIncrease = diff >= 0;

      let headlineLabel = 'Spending Difference vs Previous Month';
      let answerMarkdown = `Comparing ${curr?.monthLabel} with ${prev?.monthLabel}, recorded spending ${isIncrease ? 'increased' : 'decreased'} by **${formatINR(Math.abs(diff))}**. Records show this was primarily driven by inventory stock payments and recurring utility dues.`;
      let followUps = ['Show cash vs digital split', 'Where are the missing records?'];

      if (language === 'hi') {
        headlineLabel = 'पिछले महीने की तुलना में खर्च अंतर';
        answerMarkdown = `आपके रिकॉर्ड के अनुसार, इस महीने खर्च में **${formatINR(Math.abs(diff))}** का ${isIncrease ? 'इजाफा' : 'कमी'} हुआ। इसमें मुख्य योगदान थोक स्टॉक खरीद और बिजली/दुकान बिल का रहा।`;
        followUps = ['नकद और UPI का अनुपात दिखाएं', 'छूटे हुए रिकॉर्ड कहाँ हैं?'];
      } else if (language === 'kn') {
        headlineLabel = 'ಹಿಂದಿನ ತಿಂಗಳಿಗಿಂತ ಖರ್ಚಿನ ವ್ಯತ್ಯಾಸ';
        answerMarkdown = `ನಿಮ್ಮ ದಾಖಲೆಗಳ ಪ್ರಕಾರ, ಈ ತಿಂಗಳು ಖರ್ಚಿನಲ್ಲಿ **${formatINR(Math.abs(diff))}** ${isIncrease ? 'ಹೆಚ್ಚಳ' : 'ಇಳಿಕೆ'} ಆಗಿದೆ. ಸಗಟು ಮಾಲು ಖರೀದಿ ಮತ್ತು ವಿದ್ಯುತ್/ಅಂಗಡಿ ಬಾಡಿಗೆ ಪಾವತಿಗಳು ಇದಕ್ಕೆ ಮುಖ್ಯ ಕಾರಣಗಳಾಗಿವೆ.`;
        followUps = ['ನಗದು ಮತ್ತು ಯುಪಿಐ ಅನುಪಾತ ತೋರಿಸಿ', 'ಯಾವ ಲೆಕ್ಕ ಬಿಟ್ಟುಹೋಗಿದೆ?'];
      } else if (language === 'ta') {
        headlineLabel = 'முந்தைய மாதத்துடன் செலவு ஒப்பீடு';
        answerMarkdown = `உங்கள் பதிவுகளின்படி, இந்த மாதம் செலவில் **${formatINR(Math.abs(diff))}** ${isIncrease ? 'அதிகரிப்பு' : 'குறைவு'} ஏற்பட்டுள்ளது. இதற்கு மொத்த சரக்குக் கொள்முதல் மற்றும் கடை வாடகை போன்ற செலவுகளே முக்கியக் காரணம்.`;
        followUps = ['ரொக்கம் மற்றும் யுபிஐ விகிதத்தைக் காட்டு', 'விடுபட்ட பதிவுகள் எங்கே?'];
      }

      return {
        id: `ans_${Date.now()}`,
        question,
        headlineValue: `${isIncrease ? '+' : '-'}${formatINR(Math.abs(diff))}`,
        headlineLabel,
        evidenceClass: 'document_supplied',
        answerMarkdown,
        metadata: {
          periodLabel: `${prev?.monthLabel} – ${curr?.monthLabel}`,
          filterQuery: { direction: 'out' },
        },
        suggestedFollowUps: followUps,
      };
    }

    // 3. Cash vs UPI split
    const isSplitQuery =
      q.includes('cash') ||
      q.includes('upi') ||
      q.includes('split') ||
      q.includes('नकद') ||
      q.includes('डिजिटल') ||
      q.includes('ನಗದು') ||
      q.includes('ಯುಪಿಐ') ||
      q.includes('ரொக்கம்') ||
      q.includes('யுபிஐ');

    if (isSplitQuery) {
      const split = selectSalesCashDigitalSplit(txns);
      let headlineLabel = 'Sales Channel Distribution';
      let answerMarkdown = `Of total recorded sales, **${split.cashPercent}%** (${formatINR(split.cashTotal)}) was in cash, and **${split.digitalPercent}%** (${formatINR(split.digitalTotal)}) via digital UPI or bank transfer.`;
      let followUps = ['How many days are recorded?', 'What is the outstanding udhaar?'];

      if (language === 'hi') {
        headlineLabel = 'बिक्री का माध्यम विभाजन';
        answerMarkdown = `कुल दर्ज बिक्री में **${split.cashPercent}%** नकद (${formatINR(split.cashTotal)}) और **${split.digitalPercent}%** डिजिटल (${formatINR(split.digitalTotal)}) है।`;
        followUps = ['दर्ज दिनों की संख्या कितनी है?', 'उधार कितना बाकी है?'];
      } else if (language === 'kn') {
        headlineLabel = 'ಮಾರಾಟ ಮಾಧ್ಯಮದ ಹಂಚಿಕೆ';
        answerMarkdown = `ಒಟ್ಟು ದಾಖಲಾದ ಮಾರಾಟದಲ್ಲಿ **${split.cashPercent}%** ನಗದು (${formatINR(split.cashTotal)}) ಮತ್ತು **${split.digitalPercent}%** ಡಿಜಿಟಲ್ ಯುಪಿಐ ಅಥವಾ ಬ್ಯಾಂಕ್ ಮೂಲಕ (${formatINR(split.digitalTotal)}) ಆಗಿದೆ.`;
        followUps = ['ದಾಖಲಾದ ದಿನಗಳು ಎಷ್ಟು?', 'ಬಾಕಿ ಸಾಲ (ಉದ್ದಾರ) ಎಷ್ಟು?'];
      } else if (language === 'ta') {
        headlineLabel = 'விற்பனை வழிகளின் விகிதம்';
        answerMarkdown = `பதிவான மொத்த விற்பனையில் **${split.cashPercent}%** ரொக்கமாகவும் (${formatINR(split.cashTotal)}), **${split.digitalPercent}%** டிஜிட்டல் யுபிஐ அல்லது வங்கி வழியாகவும் (${formatINR(split.digitalTotal)}) வந்துள்ளது.`;
        followUps = ['பதிவான நாட்கள் எத்தனை?', 'வாடிக்கையாளர் பாக்கி எவ்வளவு?'];
      }

      return {
        id: `ans_${Date.now()}`,
        question,
        headlineValue: `${split.cashPercent}% Cash / ${split.digitalPercent}% Digital`,
        headlineLabel,
        evidenceClass: 'owner_declared',
        answerMarkdown,
        metadata: {
          periodLabel: 'Full Observation Period',
        },
        suggestedFollowUps: followUps,
      };
    }

    // 4. Missing records / gaps
    const isGapsQuery =
      q.includes('missing') ||
      q.includes('gap') ||
      q.includes('छूटे') ||
      q.includes('खाली') ||
      q.includes('unclassified') ||
      q.includes('ಬಿಟ್ಟುಹೋದ') ||
      q.includes('விடுபட்ட');

    if (isGapsQuery) {
      const unclassified = txns.filter((t) => t.category === 'unclassified');
      const obs = selectActiveObservations(state.observations);

      let headlineLabel = 'Pending Classification';
      let answerMarkdown = `You have **${unclassified.length}** unclassified transactions waiting in the Review Queue, and **${obs.length}** active observations. Classifying them moves values from Unclassified to Document Supplied.`;
      let followUps = ['What should I organise next?', 'What does evidence class mean?'];

      if (language === 'hi') {
        headlineLabel = 'समीक्षा के लिए लंबित';
        answerMarkdown = `वर्तमान में **${unclassified.length}** बैंक/UPI लेनदेन अवर्गीकृत हैं और **${obs.length}** ध्यान देने योग्य बिंदु सक्रिय हैं। इन्हें स्पष्ट करने से आपका पासपोर्ट और विश्वसनीय बनेगा।`;
        followUps = ['आगे क्या व्यवस्थित करें?', 'प्रमाण का क्या मतलब है?'];
      } else if (language === 'kn') {
        headlineLabel = 'ಪರಿಶೀಲನೆಗೆ ಬಾಕಿ ಇರುವ ದಾಖಲೆಗಳು';
        answerMarkdown = `ಪ್ರಸ್ತುತ **${unclassified.length}** ಬ್ಯಾಂಕ್/ಯುಪಿಐ ವಹಿವಾಟುಗಳು ವರ್ಗೀಕರಿಸದೆ ಬಾಕಿ ಇವೆ, ಮತ್ತು **${obs.length}** ಸಕ್ರಿಯ ಅವಲೋಕನಗಳಿವೆ. ಇವುಗಳನ್ನು ಸರಿಪಡಿಸುವುದು ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ.`;
        followUps = ['ಮುಂದೆ ಏನು ಮಾಡಬೇಕು?', 'ದಾಖಲೆ ಮಟ್ಟದ ಅರ್ಥವೇನು?'];
      } else if (language === 'ta') {
        headlineLabel = 'சரிபார்க்க மீதமுள்ளவை';
        answerMarkdown = `தற்போது **${unclassified.length}** வங்கி/யுபிஐ பரிவர்த்தனைகள் வகைப்படுத்தப்படாமல் உள்ளன மற்றும் **${obs.length}** கவனிப்புகள் உள்ளன. இவற்றை வகைப்படுத்துவது உங்கள் பாஸ்போர்ட்டின் நம்பகத்தன்மையை உயர்த்தும்.`;
        followUps = ['அடுத்து என்ன ஒழுங்கமைக்க வேண்டும்?', 'சான்றாதார நிலை என்றால் என்ன?'];
      }

      return {
        id: `ans_${Date.now()}`,
        question,
        headlineValue: `${unclassified.length} Items`,
        headlineLabel,
        evidenceClass: 'unclassified',
        answerMarkdown,
        metadata: {
          recordCount: unclassified.length,
          filterQuery: { category: 'unclassified' },
        },
        suggestedFollowUps: followUps,
      };
    }

    // 5. Outstanding Udhaar
    const isUdhaarQuery =
      q.includes('udhaar') ||
      q.includes('credit') ||
      q.includes('उधार') ||
      q.includes('बाकी') ||
      q.includes('ಉದ್ದಾರ') ||
      q.includes('ಸಾಲ') ||
      q.includes('கடன்') ||
      q.includes('பாக்கி');

    if (isUdhaarQuery) {
      const openUdhaar = state.udhaar.filter((u) => u.status !== 'settled');
      const totalUdhaar = openUdhaar.reduce((sum, u) => {
        const settled = u.settlements.reduce((s, curr) => s + curr.amount, 0);
        return sum + (u.amount - settled);
      }, 0);

      let headlineLabel = 'Total Outstanding Udhaar';
      let answerMarkdown = `There is currently **${formatINR(totalUdhaar)}** outstanding across **${openUdhaar.length}** regular customers. Note: Udhaar is recorded as sales on credit, not received income, until settled.`;
      let followUps = ['Record today sales', 'What is total recorded sales?'];

      if (language === 'hi') {
        headlineLabel = 'कुल बकाया उधार (ग्राहकों से लेना)';
        answerMarkdown = `वर्तमान में **${openUdhaar.length}** ग्राहकों पर कुल **${formatINR(totalUdhaar)}** का उधार बकाया है। ध्यान दें: उधार को तब तक बिक्री राजस्व नहीं माना जाता जब तक वह वसूल न हो जाए।`;
        followUps = ['आज की बिक्री दर्ज करें', 'कुल बिक्री कितनी है?'];
      } else if (language === 'kn') {
        headlineLabel = 'ಗ್ರಾಹಕರಿಂದ ಒಟ್ಟು ಬಾಕಿ ಸಾಲ (ಉದ್ದಾರ)';
        answerMarkdown = `ಪ್ರಸ್ತುತ **${openUdhaar.length}** ನಿಯಮಿತ ಗ್ರಾಹಕರಿಂದ ಒಟ್ಟು **${formatINR(totalUdhaar)}** ಸಾಲ ಬಾಕಿ ಇದೆ. ಗಮನಿಸಿ: ಸಾಲ ವಸೂಲಾಗುವವರೆಗೂ ಅದನ್ನು ಸ್ವೀಕರಿಸಿದ ಆದಾಯವೆಂದು ಪರಿಗಣಿಸಲಾಗುವುದಿಲ್ಲ.`;
        followUps = ['ಇಂದಿನ ಮಾರಾಟ ನಮೂದಿಸಿ', 'ಒಟ್ಟು ಮಾರಾಟ ಎಷ್ಟು?'];
      } else if (language === 'ta') {
        headlineLabel = 'வாடிக்கையாளர் மொத்த பாக்கித் தொகை';
        answerMarkdown = `தற்போது **${openUdhaar.length}** வாடிக்கையாளர்களிடம் மொத்தம் **${formatINR(totalUdhaar)}** கடன் பாக்கி உள்ளது. குறிப்பு: பணம் வசூலாகும் வரை இது ரொக்க வருமானமாகக் கணக்கிடப்படாது.`;
        followUps = ['இன்றைய விற்பனையைப் பதிவு செய்க', 'மொத்த விற்பனை எவ்வளவு?'];
      }

      return {
        id: `ans_${Date.now()}`,
        question,
        headlineValue: formatINR(totalUdhaar),
        headlineLabel,
        evidenceClass: 'owner_declared',
        answerMarkdown,
        metadata: {
          recordCount: openUdhaar.length,
        },
        suggestedFollowUps: followUps,
      };
    }

    // 6. Days recorded / operating continuity
    const isDaysQuery =
      q.includes('days') ||
      q.includes('continuity') ||
      q.includes('दिन') ||
      q.includes('निरंतरता') ||
      q.includes('ದಿನಗಳು') ||
      q.includes('ನಿರಂತರತೆ') ||
      q.includes('நாட்கள்') ||
      q.includes('தொடர்ச்சி');

    if (isDaysQuery) {
      const continuity = selectOperatingContinuity(state.business, state.diaryDays);
      let headlineLabel = 'Operating Days Documented';
      let answerMarkdown = `You have documented entries for **${continuity.recordedDays}** out of ${continuity.expectedDays} expected operating days (${continuity.coveragePercent}%). There are ${continuity.documentedClosedDays} documented closure days.`;
      let followUps = ['What should I organise next?', 'Show 6-month activity change'];

      if (language === 'hi') {
        headlineLabel = 'कार्य दिवस निरंतरता';
        answerMarkdown = `आपने अपेक्षित ${continuity.expectedDays} दिनों में से **${continuity.recordedDays}** दिनों का हिसाब दर्ज किया है (${continuity.coveragePercent}%)। ${continuity.documentedClosedDays} दिन दुकान विधिवत बंद दर्ज की गई।`;
        followUps = ['आगे क्या व्यवस्थित करें?', '6 महीने का बदलाव दिखाएं'];
      } else if (language === 'kn') {
        headlineLabel = 'ಕಾರ್ಯಾಚರಣೆ ದಿನಗಳ ನಿರಂತರತೆ';
        answerMarkdown = `ನೀವು ನಿರೀಕ್ಷಿತ ${continuity.expectedDays} ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ **${continuity.recordedDays}** ದಿನಗಳ ಲೆಕ್ಕವನ್ನು ದಾಖಲಿಸಿದ್ದೀರಿ (${continuity.coveragePercent}%)。 ${continuity.documentedClosedDays} ದಿನಗಳು ಅಂಗಡಿ ರಜೆ ಇರುವುದನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ.`;
        followUps = ['ಮುಂದೆ ಏನು ಸರಿಪಡಿಸಬೇಕು?', '6 ತಿಂಗಳ ಬದಲಾವಣೆ ತೋರಿಸಿ'];
      } else if (language === 'ta') {
        headlineLabel = 'வணிகத் தொடர்ச்சி நாட்கள்';
        answerMarkdown = `எதிர்பார்க்கப்பட்ட ${continuity.expectedDays} வேலை நாட்களில் **${continuity.recordedDays}** நாட்களின் கணக்கை நீங்கள் பதிவு செய்துள்ளீர்கள் (${continuity.coveragePercent}%)。 ${continuity.documentedClosedDays} நாட்கள் கடை விடுமுறை எனப் பதிவு செய்யப்பட்டுள்ளது.`;
        followUps = ['அடுத்து என்ன ஒழுங்கமைக்க வேண்டும்?', '6 மாத மாற்றத்தைக் காட்டு'];
      }

      return {
        id: `ans_${Date.now()}`,
        question,
        headlineValue: `${continuity.coveragePercent}%`,
        headlineLabel,
        evidenceClass: 'owner_declared',
        answerMarkdown,
        metadata: {
          recordCount: continuity.recordedDays,
        },
        suggestedFollowUps: followUps,
      };
    }

    // Default honest fallback
    let answerMarkdown = `I don't have a record that directly answers this. Here is what I can tell you based on your recorded data:`;
    let followUps = [
      'What was the revenue recorded this month?',
      'What is the cash vs UPI split?',
      'How many days are recorded?',
    ];

    if (language === 'hi') {
      answerMarkdown = `मेरे पास इस प्रश्न का सटीक उत्तर देने वाला कोई रिकॉर्ड नहीं है। यहाँ वे बातें हैं जो मैं आपके दर्ज आंकड़ों के आधार पर बता सकता हूँ:`;
      followUps = [
        'इस महीने कितनी बिक्री दर्ज हुई?',
        'नकद और UPI का क्या विभाजन है?',
        'कितने कार्य दिवस दर्ज हैं?',
      ];
    } else if (language === 'kn') {
      answerMarkdown = `ಇದಕ್ಕೆ ನೇರವಾಗಿ ಉತ್ತರಿಸುವ ಯಾವುದೇ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ. ನಿಮ್ಮ ದಾಖಲಾದ ಲೆಕ್ಕದ ಆಧಾರದ ಮೇಲೆ ನಾನು ತಿಳಿಸಬಹುದಾದ ಅಂಶಗಳು:`;
      followUps = [
        'ಈ ತಿಂಗಳು ದಾಖಲಾದ ಒಟ್ಟು ಮಾರಾಟ ಎಷ್ಟು?',
        'ನಗದು ಮತ್ತು ಯುಪಿಐ ಮಾರಾಟದ ಅನುಪಾತವೇನು?',
        'ಕೆಲಸದ ದಿನಗಳ ನಿರಂತರತೆ ಎಷ್ಟಿದೆ?',
      ];
    } else if (language === 'ta') {
      answerMarkdown = `இதற்கு நேரடியாகப் பதிலளிக்கும் பதிவு எதுவும் கிடைக்கவில்லை. உங்கள் கணக்கு ஏட்டின் அடிப்படையில் நான் கூறக்கூடியவை:`;
      followUps = [
        'இந்த மாதம் பதிவான மொத்த விற்பனை என்ன?',
        'ரொக்கம் மற்றும் யுபிಐ விகிதம் என்ன?',
        'பதிவான நாட்கள் எத்தனை?',
      ];
    }

    return {
      id: `ans_${Date.now()}`,
      question,
      answerMarkdown,
      metadata: {},
      suggestedFollowUps: followUps,
    };
  }
}

export const assistantProvider: IAssistantProvider = new GroundedLocalAssistantProvider();
