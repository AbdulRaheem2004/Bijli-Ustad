import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';
import { BillFetcherService, type FetchedBillData } from '../services/billFetcher.ts';
import tariffsData from '../engine/tariffs.json';

interface DuplicateBillViewProps {
  selectedDisco: string;
  onSelectDisco: (discoId: string) => void;
  language: 'english' | 'roman_urdu' | 'urdu';
  onLoadIntoExplainer: (units: number, refNo: string) => void;
}

export const DuplicateBillView: React.FC<DuplicateBillViewProps> = ({
  selectedDisco,
  onSelectDisco,
  language,
  onLoadIntoExplainer,
}) => {
  const [referenceNumber, setReferenceNumber] = useState<string>('08112345678901');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [billData, setBillData] = useState<FetchedBillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await BillFetcherService.fetchDuplicateBill(selectedDisco, referenceNumber);
    setIsLoading(false);

    if (res.success && res.data) {
      setBillData(res.data);
    } else {
      setError(res.error || 'Failed to fetch bill. Please check your reference number.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intro Form Header */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>Get & Print Official Duplicate Bill</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          {language === 'roman_urdu'
            ? 'Apna 14-digit Reference Number darj karein taake apna bijli ka duplicate bill download ya print kar sakein.'
            : 'Enter your 14-digit Reference Number (or 13-digit KE Account Number) to retrieve, view, and print your official duplicate bill.'}
        </p>

        {/* Input Form */}
        <form onSubmit={handleFetch} className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="sm:w-48">
            <select
              value={selectedDisco}
              onChange={(e) => onSelectDisco(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-medium text-neutral-200 outline-none focus:border-emerald-500"
            >
              {tariffsData.discos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="e.g. 08112345678901 (14 digits)"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-sm font-mono text-neutral-100 outline-none focus:border-emerald-500 tracking-wider placeholder:text-neutral-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Retrieving Bill...' : 'Fetch Bill'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Bill Preview & Print Document */}
      {billData && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 no-print">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Duplicate bill ready for Reference No:{' '}
                <strong className="font-mono text-white">{billData.referenceNumber}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save as PDF</span>
              </button>

              <button
                onClick={() => onLoadIntoExplainer(billData.unitsConsumed, billData.referenceNumber)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>{language === 'urdu' ? 'بل ایکسپلینر میں کھولیں' : 'Explain in Bill Explainer'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={billData.officialDuplicateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Open Direct DISCO Portal"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Printable Official Bill Template */}
          <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 shadow-2xl font-mono text-xs space-y-6">
            {/* Bill Header */}
            <div className="border-b-2 border-neutral-700 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-neutral-100 tracking-tight">
                  {billData.discoName} ELECTRICITY DUPLICATE BILL
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Power Information Technology Company (PITC) Official Portal
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Billing Month:{' '}
                  <span className="font-bold text-neutral-200">{billData.billingMonth}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-800 border border-neutral-700 text-emerald-400">
                  OFFICIAL DUPLICATE
                </span>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Due Date: <span className="font-bold text-rose-400">{billData.dueDate}</span>
                </p>
              </div>
            </div>

            {/* Consumer Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-neutral-900 border border-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase">Reference No:</span>
                <div className="font-bold text-neutral-100 text-sm mt-0.5">
                  {billData.referenceNumber}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase">Tariff Category:</span>
                <div className="font-semibold text-emerald-400 mt-0.5">
                  {billData.tariffCategory}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase">Units Consumed:</span>
                <div className="font-bold text-neutral-100 text-sm mt-0.5 tabular-nums">
                  {billData.unitsConsumed} kWh
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase">Meter Reading:</span>
                <div className="font-mono text-neutral-300 mt-0.5 tabular-nums">
                  {billData.meterReadingPrevious} &rarr; {billData.meterReadingCurrent}
                </div>
              </div>
            </div>

            {/* Charges Table */}
            <div className="border border-neutral-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="p-3 font-semibold">Billing Component</th>
                    <th className="p-3 font-semibold text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  <tr>
                    <td className="p-3">Cost of Electricity (Base Slabs)</td>
                    <td className="p-3 text-right font-mono tabular-nums">
                      Rs. {billData.costOfElectricity.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">Fuel Price Adjustment (FPA)</td>
                    <td className="p-3 text-right font-mono tabular-nums">
                      Rs. {billData.fpaCharges.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">Government Taxes & Surcharges (FC, ED, GST, TV)</td>
                    <td className="p-3 text-right font-mono tabular-nums">
                      Rs. {billData.taxesTotal.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-neutral-900/80 font-bold text-neutral-100 text-sm">
                    <td className="p-3">Total Payable Within Due Date</td>
                    <td className="p-3 text-right font-mono text-emerald-400 tabular-nums">
                      Rs. {billData.amountPayableWithinDueDate.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bill Footer Notice */}
            <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800 flex justify-between items-center">
              <span>Verified against official DISCO billing schedule.</span>
              <span>100% Client-Side Privacy — Zero Data Retention.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
