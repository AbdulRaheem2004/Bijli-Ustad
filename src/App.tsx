import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  UploadCloud, 
  MessageSquare, 
  ShieldCheck, 
  Lock
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { BillExplainerView } from './components/BillExplainerView.tsx';
import { DuplicateBillView } from './components/DuplicateBillView.tsx';
import { UploadBillView } from './components/UploadBillView.tsx';
import { RagChatDrawer } from './components/RagChatDrawer.tsx';
import { SroModal } from './components/SroModal.tsx';
import type { BillCalculationResult } from './engine/types.ts';

type ActiveTab = 'explainer' | 'duplicate_bill' | 'upload_parse' | 'rag_chat';

export const App: React.FC = () => {
  const [selectedDisco, setSelectedDisco] = useState<string>('lesco');
  const [language, setLanguage] = useState<'english' | 'roman_urdu' | 'urdu'>('roman_urdu');
  const [activeTab, setActiveTab] = useState<ActiveTab>('explainer');
  const [isSroModalOpen, setIsSroModalOpen] = useState<boolean>(false);
  const [activeBillContext, setActiveBillContext] = useState<BillCalculationResult | null>(null);
  const [activeUnits, setActiveUnits] = useState<number>(195);
  const [activeRefNo, setActiveRefNo] = useState<string | undefined>(undefined);

  const handleSendToChat = (calculation: BillCalculationResult) => {
    setActiveBillContext(calculation);
    setActiveTab('rag_chat');
  };

  const handleLoadIntoExplainer = (units: number, refNo: string) => {
    setActiveUnits(units);
    setActiveRefNo(refNo);
    setActiveTab('explainer');
  };

  const isRtl = language === 'urdu';

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans ${isRtl ? 'font-nastaliq' : ''}`}>
      {/* Header */}
      <Header
        selectedDisco={selectedDisco}
        onSelectDisco={setSelectedDisco}
        language={language}
        onSelectLanguage={setLanguage}
        onOpenSroModal={() => setIsSroModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div
          className={`border-b border-neutral-800 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar ${
            isRtl ? 'flex-row-reverse' : ''
          }`}
        >
          <button
            onClick={() => setActiveTab('explainer')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'explainer'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'urdu' ? 'بل ایکسپلینر' : 'Bill Explainer'}</span>
          </button>

          <button
            onClick={() => setActiveTab('duplicate_bill')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'duplicate_bill'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'urdu' ? 'ڈپلیکیٹ بل پرنٹ کریں' : 'Fetch & Print Bill'}</span>
          </button>

          <button
            onClick={() => setActiveTab('upload_parse')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'upload_parse'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{language === 'urdu' ? 'بل پیسٹ / پارس کریں' : 'Paste / Parse Bill'}</span>
          </button>

          <button
            onClick={() => setActiveTab('rag_chat')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'rag_chat'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>{language === 'urdu' ? 'بجلی سہولت ریگولیٹری چیٹ' : 'Bijli Sahulat RAG Chat'}</span>
          </button>
        </div>

        {/* Tab Content Views */}
        <div>
          {activeTab === 'explainer' && (
            <BillExplainerView
              selectedDisco={selectedDisco}
              language={language}
              initialUnits={activeUnits}
              initialRefNo={activeRefNo}
              onOpenSroModal={() => setIsSroModalOpen(true)}
              onSendToChat={handleSendToChat}
              onSwitchToFetch={() => setActiveTab('duplicate_bill')}
            />
          )}

          {activeTab === 'duplicate_bill' && (
            <DuplicateBillView
              selectedDisco={selectedDisco}
              onSelectDisco={setSelectedDisco}
              language={language}
              onLoadIntoEstimator={handleLoadIntoExplainer}
            />
          )}

          {activeTab === 'upload_parse' && (
            <UploadBillView
              language={language}
              onLoadIntoEstimator={handleLoadIntoExplainer}
            />
          )}

          {activeTab === 'rag_chat' && (
            <RagChatDrawer
              billContext={activeBillContext}
              language={language}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              Pakistani Electricity Ground Truth — Strictly based on NEPRA Determinations &amp; Gazette SROs.
            </span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              100% Client-Side Privacy (Zero Server Storage)
            </span>
            <button
              onClick={() => setIsSroModalOpen(true)}
              className="text-emerald-400 hover:underline"
            >
              Audit SROs
            </button>
          </div>
        </div>
      </footer>

      {/* Official SRO Ground Truth Modal */}
      <SroModal
        isOpen={isSroModalOpen}
        onClose={() => setIsSroModalOpen(false)}
      />
    </div>
  );
};
