// ArthSetu Design Tokens
// Earthy, warm, natural palette tailored for Indian micro-enterprises

export const COLORS = {
  // Brand Greens
  forest: {
    900: '#0F2E22',
    800: '#14402F', // Primary brand
    600: '#2A6347',
    100: '#DCE8DD',
  },
  olive: {
    600: '#6B7A3A',
    400: '#939F5B',
  },
  sage: {
    300: '#B7C4A0',
    100: '#E4EAD6',
  },

  // Papers (Surfaces)
  ivory: {
    50: '#FDFBF4',
  },
  cream: {
    100: '#F8F1DE',
  },
  paper: {
    200: '#F1E8D0', // Default app background
    300: '#E6DAB9',
  },
  beige: {
    400: '#D9CBA3',
  },

  // Accents
  saffron: {
    500: '#D08A1E', // Key primary actions & highlights
    600: '#B57415',
  },
  gold: {
    700: '#7A5A16', // Gold for text on paper (AA compliant)
    500: '#B28A33', // Antique gold
    200: '#E8D6A3',
  },
  terracotta: {
    500: '#B5532F', // Attention / unclassified (never alarming red)
    200: '#E8C3B0',
  },
  brown: {
    700: '#5A3E2B', // Earthy sepia ink
    500: '#8A6446',
  },

  // Neutrals
  ink: {
    900: '#2B2620', // Primary text
    700: '#4B4740',
  },
  stone: {
    500: '#7C766B',
    300: '#C9C3B5',
  },
  rule: '#D6CAA8', // Ledger lines
} as const;

export type EvidenceClass =
  | 'source_authenticated'
  | 'document_supplied'
  | 'owner_declared'
  | 'estimated'
  | 'unclassified';

export const EVIDENCE_CLASS_CONFIG: Record<
  EvidenceClass,
  {
    labelEn: string;
    labelHi: string;
    labelKn: string;
    labelTa: string;
    color: string;
    textColor: string;
    borderColor: string;
    bgPattern: string;
    icon: string;
    descriptionEn: string;
    descriptionHi: string;
    descriptionKn: string;
    descriptionTa: string;
    isLocked?: boolean;
  }
> = {
  source_authenticated: {
    labelEn: 'Source Authenticated',
    labelHi: 'स्रोत प्रमाणित',
    labelKn: 'ಮೂಲ ಪರಿಶೀಲಿತ',
    labelTa: 'மூலச் சான்றளிக்கப்பட்டவை',
    color: '#14402F',
    textColor: '#FDFBF4',
    borderColor: '#0F2E22',
    bgPattern: 'solid',
    icon: 'shield-check',
    descriptionEn: 'Consented direct source connection (e.g. Account Aggregator). Locked at ₹0 in this prototype.',
    descriptionHi: 'प्रत्यक्ष स्रोत कनेक्शन (जैसे अकाउंट एग्रीगेटर)। इस डेमो में उपलब्ध नहीं है।',
    descriptionKn: 'ನೇರ ಬ್ಯಾಂಕ್ ಸಂಪರ್ಕ (ಅಕೌಂಟ್ ಅಗ್ರಿಗೇಟರ್). ಈ ಡೆಮೊದಲ್ಲಿ ₹0 ಎಂದು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.',
    descriptionTa: 'நேரடி வங்கி இணைப்பு (அக்கவுண்ட் அக்ரிகேட்டர்). இந்த டெமோவில் ₹0 எனப் பூட்டப்பட்டுள்ளது.',
    isLocked: true,
  },
  document_supplied: {
    labelEn: 'Document Supplied',
    labelHi: 'दस्तावेज़ संलग्न',
    labelKn: 'ದಾಖಲೆ ಒದಗಿಸಲಾಗಿದೆ',
    labelTa: 'ஆவணம் வழங்கப்பட்டது',
    color: '#B28A33',
    textColor: '#7A5A16',
    borderColor: '#7A5A16',
    bgPattern: 'border-solid',
    icon: 'file-text',
    descriptionEn: 'Uploaded CSV bank/UPI statements, bills or purchase receipts. Not independently authenticated.',
    descriptionHi: 'अपलोड किए गए बैंक/UPI विवरण या रसीदें। स्वतंत्र रूप से सत्यापित नहीं हैं।',
    descriptionKn: 'ವ್ಯಾಪಾರಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್, ಯುಪಿಐ ಮತ್ತು ಸಗಟು ಬಿಲ್‌ಗಳು.',
    descriptionTa: 'வணிகரால் பதிவேற்றப்பட்ட வங்கி அறிக்கை, யுபிಐ மற்றும் மொத்தப் பில்கள்.',
  },
  owner_declared: {
    labelEn: 'Owner Declared',
    labelHi: 'दुकानदार द्वारा घोषित',
    labelKn: 'ವ್ಯಾಪಾರಿ ಘೋಷಿಸಿದ್ದು',
    labelTa: 'வணிகர் அறிவித்தது',
    color: '#5A3E2B',
    textColor: '#5A3E2B',
    borderColor: '#8A6446',
    bgPattern: 'underline-handwritten',
    icon: 'pen-line',
    descriptionEn: 'Daily cash sales, shopkeeper diary notes, and recorded credit (udhaar).',
    descriptionHi: 'दैनिक नकद बिक्री, डायरी प्रविष्टियाँ, और दर्ज किया गया उधार।',
    descriptionKn: 'ದಿನವಹಿ ಖಾತಾ ಪುಸ್ತಕದಲ್ಲಿ ಅಂಗಡಿಕಾರರು ನಮೂದಿಸಿದ ಕೌಂಟರ್ ನಗದು ಮತ್ತು ಸಾಲ.',
    descriptionTa: 'நாளேட்டில் கடைக்காரரால் பதிவு செய்யப்பட்ட ரொக்கம் மற்றும் கடன்.',
  },
  estimated: {
    labelEn: 'Estimated',
    labelHi: 'अनुमानित',
    labelKn: 'ಅಂದಾಜು',
    labelTa: 'மதிப்பிடப்பட்டது',
    color: '#6B7A3A',
    textColor: '#14402F',
    borderColor: '#6B7A3A',
    bgPattern: 'diagonal-hatch',
    icon: 'tilde',
    descriptionEn: 'Inferred figures or shopkeeper estimates with a ~ prefix.',
    descriptionHi: 'अनुमानित आंकड़े या दुकानदार के अनुमान (~ के साथ)।',
    descriptionKn: 'ಐತಿಹಾಸಿಕ ಸರಾಸರಿಗಳಿಂದ ಲೆಕ್ಕಹಾಕಲಾದ ಅಂದಾಜು ದಿನದ ಮಾರಾಟ.',
    descriptionTa: 'முந்தைய சராசரிகளிலிருந்து கணக்கிடப்பட்ட மதிப்பீட்டு விற்பனை.',
  },
  unclassified: {
    labelEn: 'Unclassified',
    labelHi: 'अवर्गीकृत (समीक्षा बाकी)',
    labelKn: 'ವರ್ಗೀಕರಿಸದ',
    labelTa: 'வகைப்படுத்தப்படாதவை',
    color: '#B5532F',
    textColor: '#B5532F',
    borderColor: '#B5532F',
    bgPattern: 'border-dotted',
    icon: 'help-circle',
    descriptionEn: 'Imported entries awaiting categorization into business vs personal.',
    descriptionHi: 'आयातित प्रविष्टियाँ जिनकी व्यावसायिक या व्यक्तिगत समीक्षा बाकी है।',
    descriptionKn: 'ಇನ್ನೂ ವ್ಯಾಪಾರ ಅಥವಾ ವೈಯಕ್ತಿಕ ಎಂದು ಪರಿಶೀಲಿಸದ ಹೊಸ ಬ್ಯಾಂಕ್/ಯುಪಿಐ ಜಮೆಗಳು.',
    descriptionTa: 'இன்னும் வணிகமா அல்லது தனிநபரா எனச் சரிபார்க்கப்படாத வரவுகள்.',
  },
};

export const CHANNEL_COLORS = {
  cash: '#8A6446', // Warm brown
  upi: '#6B7A3A',  // Olive green
  bank: '#7C766B', // Stone neutral
  spending: '#B5532F', // Terracotta
  sales: '#2A6347', // Forest green
} as const;
