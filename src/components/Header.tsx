import React from 'react';
import { Zap, ShieldCheck, Building2 } from 'lucide-react';
import tariffsData from '../engine/tariffs.json';

interface HeaderProps {
  selectedDisco: string;
  onSelectDisco: (discoId: string) => void;
  language: 'english' | 'roman_urdu' | 'urdu';
  onSelectLanguage: (lang: 'english' | 'roman_urdu' | 'urdu') => void;
  onOpenSroModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDisco,
  onSelectDisco,
  language,
  onSelectLanguage,
  onOpenSroModal,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-neutral-100 tracking-tight">
                Bijli Ustad
              </span>
              <button
                onClick={onOpenSroModal}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/70 border border-emerald-700/40 text-emerald-300 hover:bg-emerald-900/80 transition-colors"
                title="Click to inspect Gazette SROs and NEPRA legal determinations"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'urdu' ? 'نیپرا ایس آر او سے تصدیق شدہ' : 'NEPRA SRO Verified'}
              </button>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              {language === 'urdu'
                ? 'بجلی بل ایکسپلینر، ڈپلیکیٹ بل پورٹل اور نیپرا چیٹ'
                : 'Bill Explainer, Duplicate Bill Portal & Grounded RAG'}
            </p>
          </div>
        </div>

        {/* Controls: DISCO & Language & SRO Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* DISCO Selector */}
          <div className="flex items-center gap-1 bg-neutral-800/80 border border-neutral-700/60 rounded-lg px-2 py-1.5 text-xs text-neutral-300 max-w-[125px] sm:max-w-none">
            <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={selectedDisco}
              onChange={(e) => onSelectDisco(e.target.value)}
              aria-label="Select DISCO"
              className="bg-transparent text-neutral-200 outline-none cursor-pointer font-medium max-w-[95px] sm:max-w-none truncate h-9 min-h-[36px]"
            >
              {tariffsData.discos.map((d) => (
                <option key={d.id} value={d.id} className="bg-neutral-900 text-neutral-200">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-neutral-800/80 border border-neutral-700/60 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onSelectLanguage('english')}
              aria-label="Switch language to English"
              className={`min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded font-medium transition-colors ${
                language === 'english'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onSelectLanguage('roman_urdu')}
              aria-label="Switch language to Roman Urdu"
              className={`min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded font-medium transition-colors ${
                language === 'roman_urdu'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Roman
            </button>
            <button
              onClick={() => onSelectLanguage('urdu')}
              aria-label="Switch language to Urdu"
              className={`min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded font-medium font-nastaliq transition-colors ${
                language === 'urdu'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              اردو
            </button>
          </div>

          {/* SRO Inspect Button on Mobile */}
          <button
            onClick={onOpenSroModal}
            aria-label="Inspect NEPRA SROs"
            className="sm:hidden min-w-[36px] min-h-[36px] p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 flex items-center justify-center"
            title="Inspect NEPRA SROs"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
