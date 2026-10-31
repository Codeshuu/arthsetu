import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { BusinessCategory, OwnershipType } from '../../services/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { KhataPage } from '../../components/fragments/KhataPage';

const CATEGORIES: { id: BusinessCategory; label: string; desc: string; emoji: string }[] = [
  { id: 'kirana', label: 'Kirana & Grocery', desc: 'Daily provisions, grains, pulses, dairy & FMCG', emoji: '🏪' },
  { id: 'festival_goods', label: 'Festival & Seasonal Goods', desc: 'Diyas, lights, idols, rakhis & seasonal stalls', emoji: '🪔' },
  { id: 'general_retail', label: 'General / Variety Retail', desc: 'Plasticware, hardware, household utilities', emoji: '🛒' },
  { id: 'vegetable_fruit', label: 'Vegetables & Fruits', desc: 'Fresh perishable produce & mandi procurement', emoji: '🥦' },
  { id: 'garments', label: 'Garments & Clothing', desc: 'Textiles, readymade wear, tailoring materials', emoji: '👗' },
  { id: 'stationery', label: 'Stationery & Xerox', desc: 'School books, printing paper, office supplies', emoji: '📚' },
  { id: 'other', label: 'Other Corner Store', desc: 'Local neighbourhood retail commerce', emoji: '🏬' },
];

const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const updateBusiness = useArthSetuStore((s) => s.updateBusiness);
  const existingBiz = useArthSetuStore((s) => s.business);

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(existingBiz.name);
  const [category, setCategory] = useState<BusinessCategory>(existingBiz.category);
  const [ownership, setOwnership] = useState<OwnershipType>(existingBiz.ownership);
  const [yearsOperating, setYearsOperating] = useState<number>(existingBiz.yearsOperating);
  const [city, setCity] = useState(existingBiz.location.city);
  const [state, setState] = useState(existingBiz.location.state);
  const [pincode, setPincode] = useState(existingBiz.location.pincode);
  const [area, setArea] = useState(existingBiz.location.area);
  const [operatingDays, setOperatingDays] = useState<number[]>(existingBiz.operatingDays);
  const [closedOnFestivals, setClosedOnFestivals] = useState<boolean>(existingBiz.closedOnFestivals);

  const toggleDay = (d: number) => {
    if (operatingDays.includes(d)) {
      if (operatingDays.length > 1) {
        setOperatingDays(operatingDays.filter((day) => day !== d));
      }
    } else {
      setOperatingDays([...operatingDays, d].sort());
    }
  };

  const handleFinish = () => {
    updateBusiness({
      name,
      category,
      ownership,
      yearsOperating,
      location: { city, state, pincode, area },
      operatingDays,
      closedOnFestivals,
    });
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#F1E8D0] flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background: faded khata ruling pattern */}
      <div className="absolute inset-0 bg-ledger-ruled opacity-50 pointer-events-none" />
      {/* Decorative corner motif */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-6">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M200 0 Q100 100 200 200" fill="none" stroke="#D08A1E" strokeWidth="1" strokeOpacity="0.3" />
          <path d="M200 20 Q120 100 200 180" fill="none" stroke="#14402F" strokeWidth="0.7" strokeOpacity="0.2" />
          {[0,30,60,90].map(a => {
            const r = (a * Math.PI) / 180;
            return <circle key={a} cx={200 - Math.cos(r) * 60} cy={Math.sin(r) * 60 + 20} r="3" fill="#D08A1E" fillOpacity="0.15" />;
          })}
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto w-full">
        {/* Animated Progress Thread */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-mono text-[#8A6446] mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#14402F] flex items-center justify-center text-[#D08A1E] font-display font-bold text-base">अ</div>
              <span className="font-bold text-[#14402F] hidden sm:block">Opening Your Ledger Book</span>
              <span className="font-bold text-[#14402F] sm:hidden">Your Ledger</span>
            </div>
            <span className="font-bold">Step {step} of 5</span>
          </div>
          <div className="w-full h-2 bg-[#D6CAA8] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#14402F] to-[#2A6347] rounded-full"
              initial={{ width: '20%' }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {['Identity', 'Structure', 'Location', 'Schedule', 'Confirm'].map((label, i) => (
              <span
                key={label}
                className={`text-[9px] font-mono font-bold uppercase ${
                  i + 1 <= step ? 'text-[#14402F]' : 'text-[#C9C3B5]'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Card Stage */}
        <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-lg shadow-paper-elevated p-6 sm:p-8 bg-khata-page min-h-[440px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D08A1E]">
                    Step 1 · Identity
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[#14402F] mt-1">
                    What is the name of your shop or business?
                  </h2>
                  <p className="text-xs text-[#5A3E2B] mt-1">
                    This will appear on the cover of your Financial Visibility Passport.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2B2620] mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Lakshmi Kirana & General Stores"
                      className="w-full px-3.5 py-2.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm text-[#2B2620] focus:outline-none focus:border-[#14402F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2620] mb-1.5">
                      Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {CATEGORIES.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all flex items-start gap-3 ${
                            category === cat.id
                              ? 'bg-[#14402F] text-[#FDFBF4] border-[#0F2E22] shadow-sm'
                              : 'bg-[#F8F1DE] text-[#2B2620] border-[#D6CAA8] hover:bg-[#E6DAB9] hover:border-[#B7C4A0]'
                          }`}
                        >
                          <span className="text-xl mt-0.5 flex-shrink-0">
                            {cat.id === 'kirana' ? '🏪' :
                             cat.id === 'festival_goods' ? '🪔' :
                             cat.id === 'general_retail' ? '🛒' :
                             cat.id === 'vegetable_fruit' ? '🥦' :
                             cat.id === 'garments' ? '👗' :
                             cat.id === 'stationery' ? '📚' : '🏬'}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold">{cat.label}</div>
                            <div
                              className={`text-[10px] mt-0.5 line-clamp-1 ${
                                category === cat.id ? 'text-[#B7C4A0]' : 'text-[#7C766B]'
                              }`}
                            >
                              {cat.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D08A1E]">
                    Step 2 · Structure
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[#14402F] mt-1">
                    Ownership and operating history
                  </h2>
                  <p className="text-xs text-[#5A3E2B] mt-1">
                    Helps contextualise your business continuity.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2B2620] mb-2">
                      Ownership Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'sole_proprietorship', label: 'Sole Owner' },
                        { id: 'family_run', label: 'Family Run' },
                        { id: 'partnership', label: 'Partnership' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setOwnership(item.id as OwnershipType)}
                          className={`p-3 rounded border text-center transition-all ${
                            ownership === item.id
                              ? 'bg-[#14402F] text-white border-[#0F2E22] font-bold'
                              : 'bg-[#F8F1DE] text-[#2B2620] border-[#D6CAA8]'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-[#2B2620]">
                        Years in Operation
                      </label>
                      <span className="font-mono font-bold text-sm text-[#14402F]">
                        {yearsOperating} {yearsOperating === 1 ? 'Year' : 'Years'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={yearsOperating}
                      onChange={(e) => setYearsOperating(parseInt(e.target.value, 10))}
                      className="w-full accent-[#14402F]"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-[#7C766B] mt-1">
                      <span>1 Year</span>
                      <span>10 Years</span>
                      <span>25+ Years</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D08A1E]">
                    Step 3 · Location
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[#14402F] mt-1">
                    Where is your store situated?
                  </h2>
                  <p className="text-xs text-[#5A3E2B] mt-1">
                    No location tracking API. Your geographic trading context.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2B2620] mb-1">City / Town</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2B2620] mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2B2620] mb-1">Area / Market</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Durgad Bail Market"
                      className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2B2620] mb-1">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-sm font-mono"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D08A1E]">
                    Step 4 · Schedule
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[#14402F] mt-1">
                    Which days is your business normally open?
                  </h2>
                  <p className="text-xs text-[#5A3E2B] mt-1">
                    Used to calculate your operating continuity without penalising intentional days off.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2B2620] mb-2">
                      Weekly Trading Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((item) => {
                        const isSelected = operatingDays.includes(item.day);
                        return (
                          <button
                            key={item.day}
                            type="button"
                            onClick={() => toggleDay(item.day)}
                            className={`w-11 h-11 rounded-full border text-xs font-bold flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#14402F] text-white border-[#0F2E22] shadow'
                                : 'bg-[#F8F1DE] text-[#7C766B] border-[#D6CAA8]'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D6CAA8]">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={closedOnFestivals}
                        onChange={(e) => setClosedOnFestivals(e.target.checked)}
                        className="w-4 h-4 accent-[#14402F] rounded"
                      />
                      <span className="text-xs text-[#2B2620] font-medium">
                        Shop is usually closed on major festive holidays
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D08A1E]">
                    Step 5 · Confirmation
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[#14402F] mt-1">
                    Your first ledger page is ready
                  </h2>
                  <p className="text-xs text-[#5A3E2B] mt-1">
                    Review your business profile summary below. Everything can be edited anytime.
                  </p>
                </div>

                <div className="bg-[#F8F1DE] border border-[#D6CAA8] p-4 rounded text-xs space-y-2 font-mono">
                  <div className="flex justify-between border-b border-[#D6CAA8]/60 pb-1">
                    <span className="text-[#7C766B]">Business:</span>
                    <span className="font-bold text-[#14402F] font-sans">{name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D6CAA8]/60 pb-1">
                    <span className="text-[#7C766B]">Category:</span>
                    <span className="font-bold text-[#2B2620]">{category}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D6CAA8]/60 pb-1">
                    <span className="text-[#7C766B]">Location:</span>
                    <span className="text-[#2B2620]">
                      {area}, {city}, {state} ({pincode})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#D6CAA8]/60 pb-1">
                    <span className="text-[#7C766B]">Operating Days:</span>
                    <span className="text-[#14402F] font-bold">
                      {operatingDays.length} days / week
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav Controls */}
          <div className="flex justify-between items-center pt-6 border-t border-[#D6CAA8] mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-1 text-xs font-bold text-[#5A3E2B] hover:text-[#14402F]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold hover:bg-[#0F2E22] transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded bg-[#D08A1E] text-white text-xs font-bold hover:bg-[#B57415] shadow transition-colors"
              >
                <span>Open My Ledger</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

