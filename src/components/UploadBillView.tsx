import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { BillParserService, type ParsedBillFields } from '../services/billParser.ts';

interface UploadBillViewProps {
  language: 'english' | 'roman_urdu' | 'urdu';
  onLoadIntoEstimator: (units: number, refNo: string) => void;
}

export const UploadBillView: React.FC<UploadBillViewProps> = ({
  language,
  onLoadIntoEstimator,
}) => {
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedFields, setParsedFields] = useState<ParsedBillFields | null>(null);

  const handleParseText = () => {
    if (!pastedText.trim()) return;
    const result = BillParserService.parseBillText(pastedText);
    setParsedFields(result);
  };

  const handleSampleFill = () => {
    const sample = `
LAHORE ELECTRIC SUPPLY COMPANY (LESCO)
Reference No: 08 11234 5678901 U
Tariff: A-1a(01) DOMESTIC (PROTECTED)
Units Consumed: 195
Payable Within Due Date: Rs. 4,850
F.P.A Charges: Rs. 339.30
Due Date: 20-OCT-2024
    `.trim();
    setPastedText(sample);
    const result = BillParserService.parseBillText(sample);
    setParsedFields(result);
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>Local Bill Parser (Zero Uploads)</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {language === 'roman_urdu'
                ? 'Apne bill ka text paste karein. Hamara parser foran units aur reference number extract kar lega bina kisi server par data bhejay.'
                : 'Paste text from your digital duplicate bill. Our local parser extracts units and reference number entirely on your device with 100% privacy.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-300 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Pure Client-Side</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-4 space-y-3">
          <textarea
            rows={5}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste text copied from your duplicate bill PDF or bill SMS here (e.g., LESCO Ref: 08112345678901 Units: 195)..."
            className="w-full p-3.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-neutral-200 outline-none focus:border-emerald-500 placeholder:text-neutral-600"
          ></textarea>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSampleFill}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline"
            >
              Paste Sample LESCO Bill Text
            </button>

            <button
              type="button"
              onClick={handleParseText}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Extract Bill Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extracted Fields Card */}
      {parsedFields && (
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Extracted Bill Values</span>
            </h3>

            {parsedFields.units !== undefined && (
              <button
                type="button"
                onClick={() =>
                  onLoadIntoEstimator(
                    parsedFields.units || 180,
                    parsedFields.referenceNumber || ''
                  )
                }
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Load {parsedFields.units} Units into Estimator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase">Units Consumed</span>
              <div className="font-bold text-neutral-100 text-base font-mono tabular-nums mt-0.5">
                {parsedFields.units !== undefined ? `${parsedFields.units} kWh` : 'Not Detected'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase">Reference Number</span>
              <div className="font-mono text-neutral-200 text-xs mt-1 truncate">
                {parsedFields.referenceNumber || 'Not Detected'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase">Tariff Category</span>
              <div className="font-semibold text-emerald-400 text-xs mt-1 truncate">
                {parsedFields.tariffCode || 'Standard'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase">Amount Payable</span>
              <div className="font-bold text-neutral-100 text-sm font-mono mt-1">
                {parsedFields.amountPayable ? `Rs. ${parsedFields.amountPayable.toLocaleString()}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
