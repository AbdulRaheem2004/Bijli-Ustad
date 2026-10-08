import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import type { ConnectionType, BillCalculationResult } from '../engine/types.ts';
import { calculateBill } from '../engine/calculator.ts';

interface BillExplainerViewProps {
  selectedDisco: string;
  language: 'english' | 'roman_urdu' | 'urdu';
  initialUnits?: number;
  initialRefNo?: string;
  onOpenSroModal: () => void;
  onSendToChat: (calculation: BillCalculationResult) => void;
  onSwitchToFetch: () => void;
}

export const BillExplainerView: React.FC<BillExplainerViewProps> = ({
  selectedDisco,
  language,
  initialUnits = 195,
  initialRefNo,
  onOpenSroModal,
  onSendToChat,
  onSwitchToFetch,
}) => {
  const [units, setUnits] = useState<number>(initialUnits);
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    initialUnits <= 200 ? 'domestic_single_phase_protected' : 'domestic_single_phase_unprotected'
  );

  const bill = calculateBill({
    discoId: selectedDisco,
    connectionType,
    units,
  });

  const isProtected = bill.isProtectedEligible && units <= 200;
  const isRtl = language === 'urdu';

  const electricityPercent = Math.round(
    (bill.baseElectricityCost / bill.netPayableWithinDueDate) * 100
  );
  const taxesPercent = 100 - electricityPercent;

  return (
    <div className={`space-y-6 ${isRtl ? 'font-nastaliq text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>{language === 'urdu' ? 'بجلی بل ایکسپلینر' : 'Bill Explainer & Breakdown'}</span>
            {initialRefNo && (
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-neutral-800 text-emerald-400 border border-neutral-700">
                Ref: {initialRefNo}
              </span>
            )}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {language === 'urdu'
              ? 'اپنے بجلی کے بل کے یونٹس اور چارجز کی مکمل شفاف تفصیل، سلیبز اور ٹیکسز کا حساب جانیں۔'
              : language === 'roman_urdu'
              ? 'Apne bill ke units aur hidden surcharges (FPA, QTA, GST) ka mukammal hisaab samjhein.'
              : 'Demystify your electricity bill: see exact slab costs, fuel adjustments, and taxes grounded in NEPRA rules.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToFetch}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
          >
            {language === 'urdu' ? 'ریفرنس نمبر سے بل لائیں' : 'Fetch By Reference No'}
          </button>
          <button
            onClick={onOpenSroModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs font-medium text-emerald-300 hover:bg-emerald-900/60 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            {language === 'urdu' ? 'قانونی ایس آر او دیکھیں' : 'Inspect SROs'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bill Inputs & Status (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Bill Input Box */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              {language === 'urdu' ? 'بل کے یونٹس اور کیٹیگری' : 'Bill Details to Explain'}
            </h3>

            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">
                {language === 'urdu' ? 'ماہانہ استعمال شدہ یونٹس:' : 'Units Consumed on Bill:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={units}
                  onChange={(e) => {
                    const u = parseInt(e.target.value, 10) || 0;
                    setUnits(u);
                    if (u > 200) {
                      setConnectionType('domestic_single_phase_unprotected');
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-base font-bold font-mono text-emerald-400 outline-none focus:border-emerald-500 tabular-nums"
                />
                <span className="text-xs text-neutral-500 font-mono">kWh</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">
                {language === 'urdu' ? 'کنکشن کی قسم:' : 'Tariff Category:'}
              </label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-200 outline-none focus:border-emerald-500"
              >
                <option value="domestic_single_phase_protected">
                  Domestic Single Phase (Protected &le; 200 Units)
                </option>
                <option value="domestic_single_phase_unprotected">
                  Domestic Single Phase (Unprotected)
                </option>
                <option value="domestic_three_phase_tou">
                  Domestic 3-Phase Time of Use (TOU)
                </option>
                <option value="commercial_three_phase">Commercial (A-2)</option>
              </select>
            </div>
          </div>

          {/* Protected / Unprotected Status Card */}
          <div
            className={`p-5 rounded-xl border space-y-3 ${
              isProtected
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {isProtected ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>
                    {language === 'urdu'
                      ? 'پروٹیکٹڈ صارف کیٹیگری فعال ہے'
                      : 'Protected Consumer Status Active'}
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>
                    {language === 'urdu'
                      ? 'غیر محفوظ (ان پروٹیکٹڈ) سلیب چارج ہو رہی ہے'
                      : 'Unprotected Consumer Slabs Charged'}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs leading-relaxed text-neutral-300">
              {isProtected
                ? language === 'urdu'
                  ? 'آپ کے یونٹس 200 یا اس سے کم ہیں۔ وزارت توانائی کے ایس آر او 575 کے تحت آپ کو سبسڈی والے پروٹیکٹڈ نرخ مل رہے ہیں۔ اس حیثیت کو برقرار رکھنے کے لیے اگلے 6 ماہ تک استعمال 200 سے کم رکھیں۔'
                  : language === 'roman_urdu'
                  ? 'Aap ke units 200 se kam hain. SRO 575 ke tehat aap ko sasti protected slabs mil rahi hain. Aglay 6 maheene 200 se kam rakh kar ye status barqarar rakhein.'
                  : 'Your consumption is under 200 units. You qualify for subsidized protected slabs under SRO 575(I)/2024. Keep monthly units <= 200 to retain this subsidized tier.'
                : language === 'urdu'
                ? '200 یونٹ سے زائد استعمال یا گزشتہ 6 ماہ میں حد عبور کرنے کی وجہ سے آپ کا بل غیر محفوظ سلیب پر بنا ہے۔'
                : language === 'roman_urdu'
                ? '200 units se ooper hone ki wajah se aap Unprotected category mein hain jahan per-unit rate barh jata hai.'
                : 'Your bill is calculated on progressive Unprotected slabs. Exceeding 200 units triggers higher baseline tariffs across all units.'}
            </p>
          </div>

          {/* Ratio Bar: Electricity vs Taxes */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <h4 className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>{language === 'urdu' ? 'بجلی کی اصل قیمت بمقابلہ ٹیکسز' : 'Cost of Power vs. Govt Taxes'}</span>
              <span className="text-[11px] font-mono text-neutral-400">
                {electricityPercent}% / {taxesPercent}%
              </span>
            </h4>

            {/* Split Bar */}
            <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${electricityPercent}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Base Power: ${electricityPercent}%`}
              ></div>
              <div
                style={{ width: `${taxesPercent}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Govt Taxes & Surcharges: ${taxesPercent}%`}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Base Electricity: Rs. {bill.baseElectricityCost.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Taxes/Surcharges: Rs. {bill.taxes.totalTaxesAndSurcharges.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Breakdown & Explanations (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Summary Total Card */}
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-baseline justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs text-neutral-400 uppercase font-semibold">
                  {language === 'urdu' ? 'کل قابلِ ادائیگی رقم' : 'Total Amount Payable'}
                </span>
                <div className="text-3xl font-extrabold text-neutral-100 font-mono tabular-nums mt-0.5">
                  Rs. {bill.netPayableWithinDueDate.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-semibold font-mono">
                  {bill.discoName}
                </span>
                <div className="text-xs text-neutral-400 font-mono">
                  {bill.totalUnits} Units
                </div>
              </div>
            </div>

            {/* Slab by Slab List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-300">
                {language === 'urdu' ? 'سلیب کے مطابق تفصیل:' : '1. Per-Slab Electricity Cost:'}
              </span>
              <div className="space-y-1.5">
                {bill.slabs.map((slab, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-medium text-neutral-200">{slab.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {slab.units} units &times; Rs. {slab.rate}/unit
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-neutral-300">
                      Rs. {slab.cost.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Surcharges & Taxes List */}
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              <span className="text-xs font-semibold text-neutral-300">
                {language === 'urdu' ? 'سرکاری ٹیکسز اور سرچارجز:' : '2. Government Taxes & Surcharges:'}
              </span>
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Financing Cost Surcharge (SRO 342 - Rs. 3.23/unit):</span>
                  <span className="font-mono font-semibold">
                    Rs. {bill.taxes.fcSurcharge.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Fuel Price Adjustment (FPA - Sec 31(7)):</span>
                  <span className="font-mono font-semibold">
                    Rs. {bill.taxes.fpa.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Quarterly Tariff Adjustment (QTA):</span>
                  <span className="font-mono font-semibold">
                    Rs. {bill.taxes.qta.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Electricity Duty (Provincial 1.5%):</span>
                  <span className="font-mono font-semibold">
                    Rs. {bill.taxes.electricityDuty.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>General Sales Tax (GST 18%):</span>
                  <span className="font-mono font-semibold">
                    Rs. {bill.taxes.gst.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>TV License Fee:</span>
                  <span className="font-mono font-semibold">
                    Rs. {bill.taxes.tvFee}
                  </span>
                </div>
              </div>
            </div>

            {/* Button to open RAG Chat */}
            <button
              onClick={() => onSendToChat(bill)}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>
                {language === 'urdu'
                  ? 'اس بل کے متعلق بجلی سہولت چیٹ سے سوال پوچھیں'
                  : 'Ask Bijli Sahulat RAG Chat About This Bill'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
