import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, ArrowRight, FileUp, Loader2 } from 'lucide-react';
import { BillParserService, type ParsedBillFields } from '../services/billParser.ts';

interface UploadBillViewProps {
  language: 'english' | 'roman_urdu' | 'urdu';
  onLoadIntoExplainer: (units: number, refNo: string) => void;
}

export const UploadBillView: React.FC<UploadBillViewProps> = ({
  language,
  onLoadIntoExplainer,
}) => {
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedFields, setParsedFields] = useState<ParsedBillFields | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleParseText = () => {
    if (!pastedText.trim()) return;
    const result = BillParserService.parseBillText(pastedText);
    setParsedFields(result);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setUploadedFileName(file.name);
    try {
      const result = await BillParserService.parseFile(file);
      setParsedFields(result);
      if (result.rawTextPreview) {
        setPastedText(result.rawTextPreview);
      }
    } catch (err) {
      console.error('Failed to parse bill file:', err);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSampleFill = () => {
    const sample = `
LAHORE ELECTRIC SUPPLY COMPANY (LESCO)
Reference No: 08 11234 5678901 U
Tariff: A-1a(01) DOMESTIC (PROTECTED)
Units Consumed: 195
Payable Within Due Date: Rs. 3,559.35
F.P.A Charges: Rs. 339.30
Due Date: 20-OCT-2024
    `.trim();
    setPastedText(sample);
    const result = BillParserService.parseBillText(sample);
    setParsedFields(result);
  };

  const isRtl = language === 'urdu';

  return (
    <div className={`space-y-6 ${isRtl ? 'font-nastaliq text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Intro */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>
                {language === 'urdu'
                  ? 'پی ڈی ایف بل اپ لوڈ / لوکل پارسر'
                  : 'PDF Bill Upload & In-Browser Parser'}
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {language === 'urdu'
                ? 'اپنے ڈیجیٹل ڈپلیکیٹ بل کی پی ڈی ایف فائل اپ لوڈ کریں یا ٹیکسٹ پیسٹ کریں۔'
                : language === 'roman_urdu'
                ? 'Apne bill ki PDF upload karein ya text paste karein. Hamara parser foran units aur reference number extract kar lega.'
                : 'Upload your digital duplicate bill PDF or paste bill text to automatically extract units, tariff, and reference number.'}
            </p>
          </div>
        </div>

        {/* Upload & Parse Zone */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Drag/Upload Card */}
          <label className="p-6 rounded-xl border-2 border-dashed border-neutral-700 hover:border-emerald-500 bg-neutral-950/70 hover:bg-neutral-950 transition-all flex flex-col items-center justify-center cursor-pointer text-center group">
            <input
              type="file"
              accept=".pdf,text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
            {isProcessingFile ? (
              <div className="flex flex-col items-center gap-2 py-4 text-emerald-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-medium">
                  {language === 'urdu' ? 'پی ڈی ایف بل کا ڈیٹا پڑھا جا رہا ہے...' : 'Extracting bill data from PDF...'}
                </span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileUp className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm text-neutral-200 mt-3">
                  {language === 'urdu' ? 'پی ڈی ایف بل فائل منتخب کریں' : 'Upload Duplicate Bill PDF'}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">
                  {language === 'urdu'
                    ? 'لیسکو، کے الیکٹرک، میپکو یا آئیسکو کا ڈاؤنلوڈ شدہ پی ڈی ایف بل یہاں لائیں'
                    : 'Click or drop your LESCO, IESCO, MEPCO, or KE digital PDF bill'}
                </p>
                {uploadedFileName && (
                  <span className="mt-3 inline-block px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-800 text-emerald-400 border border-neutral-700">
                    📄 {uploadedFileName}
                  </span>
                )}
              </>
            )}
          </label>

          {/* Paste Raw Text Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-400">
                {language === 'urdu' ? 'یا بل کا ٹیکسٹ یہاں پیسٹ کریں:' : 'Or Paste Raw Bill Text:'}
              </label>
              <button
                type="button"
                onClick={handleSampleFill}
                className="text-xs text-emerald-400 hover:underline"
              >
                {language === 'urdu' ? 'نمونہ بل لوڈ کریں' : 'Load Sample Bill Text'}
              </button>
            </div>
            <textarea
              rows={4}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste lines from your bill here (e.g. Reference No, Units Consumed, Payable Amount)..."
              className="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-neutral-200 placeholder-neutral-600 outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleParseText}
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
            >
              {language === 'urdu' ? 'بل کی تفصیلات نکالیں' : 'Parse Bill Details'}
            </button>
          </div>
        </div>

        {/* Extracted Fields Result */}
        {parsedFields && (
          <div className="mt-6 p-4 rounded-xl bg-neutral-950 border border-emerald-700/50 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-neutral-100">
                  {language === 'urdu' ? 'بل کا ڈیٹا کامیابی سے نکال لیا گیا:' : 'Extracted Bill Fields:'}
                </h3>
              </div>

              {parsedFields.units !== undefined && (
                <button
                  type="button"
                  onClick={() =>
                    onLoadIntoExplainer(
                      parsedFields.units || 180,
                      parsedFields.referenceNumber || ''
                    )
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>
                    {language === 'urdu'
                      ? `بل ایکسپلینر میں کھولیں (${parsedFields.units} یونٹ)`
                      : `Explain this Bill (${parsedFields.units} Units)`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase">
                  {language === 'urdu' ? 'استعمال شدہ یونٹس' : 'Units Consumed'}
                </span>
                <div className="font-bold text-neutral-100 text-base font-mono tabular-nums mt-0.5">
                  {parsedFields.units !== undefined ? `${parsedFields.units} kWh` : 'Not Detected'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase">
                  {language === 'urdu' ? 'ریفرنس نمبر' : 'Reference Number'}
                </span>
                <div className="font-bold text-neutral-100 text-sm font-mono tabular-nums mt-0.5 truncate">
                  {parsedFields.referenceNumber || 'Not Detected'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase">
                  {language === 'urdu' ? 'ٹیرف کوڈ' : 'Tariff Code'}
                </span>
                <div className="font-bold text-neutral-100 text-sm font-mono mt-0.5">
                  {parsedFields.tariffCode || 'A-1 Domestic'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase">
                  {language === 'urdu' ? 'بل کی کل رقم' : 'Total Payable'}
                </span>
                <div className="font-bold text-emerald-400 text-sm font-mono tabular-nums mt-0.5">
                  {parsedFields.amountPayable ? `Rs. ${parsedFields.amountPayable.toLocaleString()}` : 'Calculated in App'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
