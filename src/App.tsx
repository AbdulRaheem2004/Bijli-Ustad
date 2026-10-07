import React, { useState } from 'react';
import { 
  Calculator, 
  FileText, 
  UploadCloud, 
  MessageSquare, 
  ShieldCheck, 
  Lock
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { BillEstimatorView } from './components/BillEstimatorView.tsx';
import { DuplicateBillView } from './components/DuplicateBillView.tsx';
import { UploadBillView } from './components/UploadBillView.tsx';
import { RagChatDrawer } from './components/RagChatDrawer.tsx';
import { SroModal } from './components/SroModal.tsx';
import type { BillCalculationResult } from './engine/types.ts';

type ActiveTab = 'estimator' | 'duplicate_bill' | 'upload_parse' | 'rag_chat';

export const App: React.FC = () => {
  const [selectedDisco, setSelectedDisco] = useState<string>('lesco');
  const [language, setLanguage] = useState<'english' | 'roman_urdu' | 'urdu'>('roman_urdu');
  const [activeTab, setActiveTab] = useState<ActiveTab>('estimator');
  const [isSroModalOpen, setIsSroModalOpen] = useState<boolean>(false);
  const [activeBillContext, setActiveBillContext] = useState<BillCalculationResult | null>(null);
  const [estimatorUnits, setEstimatorUnits] = useState<number>(180);

  const handleSendToChat = (calculation: BillCalculationResult) => {
    setActiveBillContext(calculation);
    setActiveTab('rag_chat');
  };

  const handleLoadIntoEstimator = (units: number, _refNo: string) => {
    setEstimatorUnits(units);
    setActiveTab('estimator');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
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
        <div className="border-b border-neutral-800 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('estimator')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'estimator'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Bill Estimator &amp; Slabs</span>
          </button>

          <button
            onClick={() => setActiveTab('duplicate_bill')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'duplicate_bill'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Print Duplicate Bill</span>
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
            <span>Paste / Parse Bill</span>
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
            <span>Bijli Sahulat RAG Chat</span>
          </button>
        </div>

        {/* Tab Content Views */}
        <div>
          {activeTab === 'estimator' && (
            <BillEstimatorView
              selectedDisco={selectedDisco}
              language={language}
              initialUnits={estimatorUnits}
              onOpenSroModal={() => setIsSroModalOpen(true)}
              onSendToChat={handleSendToChat}
            />
          )}

          {activeTab === 'duplicate_bill' && (
            <DuplicateBillView
              selectedDisco={selectedDisco}
              onSelectDisco={setSelectedDisco}
              language={language}
              onLoadIntoEstimator={handleLoadIntoEstimator}
            />
          )}

          {activeTab === 'upload_parse' && (
            <UploadBillView
              language={language}
              onLoadIntoEstimator={handleLoadIntoEstimator}
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
