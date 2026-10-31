import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const CreditsPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto font-sans select-none space-y-6">
      <div className="flex items-center space-x-3 border-b border-[#D6CAA8] pb-4">
        <Link to="/" className="p-1.5 rounded hover:bg-[#F8F1DE] text-[#14402F]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
          Asset & Typography Credits
        </h1>
      </div>

      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-6 sm:p-8 shadow-paper-lift space-y-4 text-xs font-mono">
        <p className="font-sans text-sm text-[#5A3E2B] leading-relaxed">
          ArthSetu is designed with authentic Indian merchant visual language, featuring hand-crafted SVG Fragment Kit elements, open cultural typography, and zero external runtime requests.
        </p>

        <div className="border-t border-[#D6CAA8] pt-4 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[#14402F] mb-1">Open Fonts</h3>
            <ul className="space-y-1 text-[#2B2620]">
              <li>• <strong>Fraunces</strong>: Display typography by Phaedra Charles & Flavia Zimbardi (SIL OFL)</li>
              <li>• <strong>Manrope</strong>: Modern UI font by Mikhail Sharanda (SIL OFL)</li>
              <li>• <strong>IBM Plex Mono</strong>: Tabular numerals by Mike Abbink (SIL OFL)</li>
              <li>• <strong>Kalam</strong>: Handwritten bahi-khata script by Indian Type Foundry (SIL OFL)</li>
              <li>• <strong>Noto Sans Devanagari</strong>: Devanagari UI script by Google (SIL OFL)</li>
            </ul>
          </div>

          <div className="border-t border-[#D6CAA8]/60 pt-4">
            <h3 className="font-bold text-sm text-[#14402F] mb-1">Illustrations & Fragment Kit</h3>
            <p className="text-[#2B2620] font-sans leading-relaxed">
              All Fragment Kit components (<code className="bg-[#F8F1DE] px-1 py-0.5 rounded">&lt;KhataPage&gt;</code>, <code className="bg-[#F8F1DE] px-1 py-0.5 rounded">&lt;UpiSlip&gt;</code>, <code className="bg-[#F8F1DE] px-1 py-0.5 rounded">&lt;InvoiceSheet&gt;</code>, <code className="bg-[#F8F1DE] px-1 py-0.5 rounded">&lt;Stamp&gt;</code>, <code className="bg-[#F8F1DE] px-1 py-0.5 rounded">&lt;KiranaCounterScene&gt;</code>) are custom SVG vector compositions built specifically for ArthSetu and licensed under CC0 / Open Cultural Archive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

