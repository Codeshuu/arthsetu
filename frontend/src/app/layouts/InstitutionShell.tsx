import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { DemoBar } from '../../components/layout/DemoBar';
import { ShieldCheck, Info } from 'lucide-react';

export const InstitutionShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1E8D0] text-[#2B2620]">
      {/* Demo announcement bar */}
      <DemoBar />

      {/* Formal Institution Header */}
      <header className="bg-[#14402F] text-[#FDFBF4] border-b-2 border-[#D08A1E] px-4 sm:px-8 py-3.5 shadow-md select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#FDFBF4] flex items-center justify-center text-[#14402F] shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#14402F]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-lg sm:text-xl text-[#FDFBF4] tracking-tight">
                  ArthSetu
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#2A6347] text-[#E8D6A3] border border-[#D08A1E]/40 font-bold">
                  Institutional Read-Only View
                </span>
              </div>
              <p className="text-[11px] text-[#B7C4A0] font-sans">
                Supplementary voluntary financial visibility disclosure provided directly by the business owner.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-[#0F2E22] px-3 py-1.5 rounded border border-[#2A6347] flex items-center space-x-1.5 text-[#E6DAB9]">
              <Info className="w-3.5 h-3.5 text-[#D08A1E]" />
              <span>Not a Credit Assessment · Read-Only</span>
            </div>
            <Link
              to="/app"
              className="px-3 py-1.5 rounded bg-[#D08A1E] text-white font-bold hover:bg-[#B57415] transition-colors"
            >
              Switch to Owner App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Formal Footer */}
      <footer className="bg-[#0F2E22] text-[#B7C4A0] text-[11px] py-4 px-6 text-center border-t border-[#2A6347] font-mono">
        ArthSetu Financial Visibility Platform · Confidential Voluntary Disclosure · Independent Audit Protocol
      </footer>
    </div>
  );
};

