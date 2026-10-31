import React from 'react';
import { Link } from 'react-router-dom';
import { KhataPage } from '../../components/fragments/KhataPage';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F1E8D0] flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="transform -rotate-2">
          <KhataPage
            title="खोया हुआ पन्ना (Lost Page 404)"
            date="31 Oct 2026"
            pageNo={404}
            entries={[
              { particular: 'यह पन्ना बही-खाते में नहीं मिला', amount: 404, isStruckThrough: true },
              { particular: 'This page was torn or does not exist', amount: 0 },
            ]}
          />
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-[#14402F]">
            Page Not Found in the Book
          </h2>
          <p className="text-xs text-[#5A3E2B]">
            The requested register route does not exist or has been filed under a different section.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded bg-[#14402F] text-white text-xs font-bold hover:bg-[#0F2E22] transition-colors shadow"
        >
          <ArrowLeft className="w-4 h-4 text-[#D08A1E]" />
          <span>Return to Front Page</span>
        </Link>
      </div>
    </div>
  );
};

