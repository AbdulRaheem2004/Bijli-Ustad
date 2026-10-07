import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Split, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import type { ConnectionType, BillCalculationResult, EstimationComparison } from '../engine/types.ts';
import { estimateBill, compareScenarios, getThresholdAlert } from '../engine/estimator.ts';

interface BillEstimatorViewProps {
  selectedDisco: string;
  language: 'english' | 'roman_urdu' | 'urdu';
  initialUnits?: number;
  onOpenSroModal: () => void;
  onSendToChat: (calculation: BillCalculationResult) => void;
}

export const BillEstimatorView: React.FC<BillEstimatorViewProps> = ({
  selectedDisco,
  language,
  initialUnits = 180,
  onOpenSroModal,
  onSendToChat,
}) => {
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    'domestic_single_phase_protected'
  );
  const [units, setUnits] = useState<number>(initialUnits);

  useEffect(() => {
    if (initialUnits !== undefined) {
      setUnits(initialUnits);
    }
  }, [initialUnits]);
  const [peakUnits, setPeakUnits] = useState<number>(60);
  const [offPeakUnits, setOffPeakUnits] = useState<number>(240);
  const [solarExport, setSolarExport] = useState<number>(450);
  const [solarImport, setSolarImport] = useState<number>(300);
  const [isFiler, setIsFiler] = useState<boolean>(true);
  const [showComparator, setShowComparator] = useState<boolean>(false);
  const [compareUnits, setCompareUnits] = useState<number>(205);

  const isTou =
    connectionType === 'domestic_three_phase_tou' ||
    connectionType === 'commercial_three_phase';
  const isSolar = connectionType === 'solar_net_metering';

  // Calculate primary scenario
  const calculationResult = estimateBill({
    discoId: selectedDisco,
    connectionType,
    units,
    peakUnits: isTou ? peakUnits : undefined,
    offPeakUnits: isTou ? offPeakUnits : undefined,
    solarExportUnits: isSolar ? solarExport : undefined,
    solarImportUnits: isSolar ? solarImport : undefined,
    isFiler,
  });

  // Calculate threshold alert
  const thresholdAlert = getThresholdAlert(units, connectionType);

  // Calculate comparison if open
  let comparison: EstimationComparison | null = null;
  if (showComparator) {
    comparison = compareScenarios(
      {
        discoId: selectedDisco,
        connectionType,
        units,
        peakUnits: isTou ? peakUnits : undefined,
        offPeakUnits: isTou ? offPeakUnits : undefined,
        isFiler,
      },
      compareUnits
    );
  }

  const handleUnitSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnits(Math.max(0, parseInt(e.target.value, 10) || 0));
  };

  const handleUnitDirectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setUnits(isNaN(val) ? 0 : Math.max(0, val));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer Intro */}
      <div className="p-4 sm:p-5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <span>Bill Estimator & Slab Simulator</span>
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
              Interactive What-If
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {language === 'roman_urdu'
              ? 'Apna tariff chunein aur estimated units darj karein taake exact slabs aur bills ka andaza lagaya ja sakay.'
              : 'Select your tariff category and input estimated units to simulate exact slabs, surcharges, and taxes.'}
          </p>
        </div>

        <button
          onClick={onOpenSroModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs font-medium text-emerald-300 hover:bg-emerald-900/60 transition-colors shrink-0"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Inspect Gazette SRO Rates</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Tariff Category Selector */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              1. Select Tariff Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConnectionType('domestic_single_phase_protected')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  connectionType === 'domestic_single_phase_protected'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <div className="font-semibold text-xs text-emerald-400 flex items-center justify-between">
                  <span>Domestic Single Phase</span>
                  <span className="text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-700/40">
                    Protected
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Consecutive consumption &le; 200 units (subsidized slabs).
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConnectionType('domestic_single_phase_unprotected')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  connectionType === 'domestic_single_phase_unprotected'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <div className="font-semibold text-xs text-neutral-200 flex items-center justify-between">
                  <span>Domestic Single Phase</span>
                  <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-700">
                    Unprotected
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Exceeded 200 units in past 6 months (higher progressive slabs).
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConnectionType('domestic_three_phase_tou')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  connectionType === 'domestic_three_phase_tou'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <div className="font-semibold text-xs text-neutral-200">
                  Domestic 3-Phase TOU
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Peak hours (Rs. 41.89) vs. Off-Peak (Rs. 35.57) rates.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConnectionType('solar_net_metering')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  connectionType === 'solar_net_metering'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <div className="font-semibold text-xs text-amber-400">
                  Solar Net-Metering
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Export vs Import unit offsets and quarterly rollover.
                </div>
              </button>
            </div>
          </div>

          {/* 2. Direct Number Input & Fluid Slider */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                2. Estimated Units
              </label>
              <span className="text-xs text-neutral-400">
                {language === 'roman_urdu'
                  ? 'Number likhein ya slider hilayein'
                  : 'Type number directly or use slider'}
              </span>
            </div>

            {/* Direct Number Input + Slider Box */}
            <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-neutral-300">
                  Total Monthly Units:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    value={units}
                    onChange={handleUnitDirectInputChange}
                    className="w-28 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-right font-mono text-base font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 tabular-nums"
                  />
                  <span className="text-xs text-neutral-400 font-mono">kWh</span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="5"
                  value={units}
                  onChange={handleUnitSliderChange}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>0 Units (Lifeline)</span>
                  <span className="text-amber-400 font-bold">200 (Protected Cliff)</span>
                  <span>500</span>
                  <span>1000+</span>
                </div>
              </div>
            </div>

            {/* 3-Phase TOU Specific Inputs */}
            {isTou && (
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-semibold text-neutral-300">
                  Peak vs. Off-Peak Breakdown (TOU)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Peak Units (Evening):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={peakUnits}
                      onChange={(e) => setPeakUnits(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-sm font-mono text-amber-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Off-Peak Units (Day/Night):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={offPeakUnits}
                      onChange={(e) => setOffPeakUnits(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-sm font-mono text-emerald-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Solar Specific Inputs */}
            {isSolar && (
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-semibold text-amber-400">
                  Solar Net Metering Units
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Grid Import Units:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={solarImport}
                      onChange={(e) => setSolarImport(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-sm font-mono text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Solar Export Units:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={solarExport}
                      onChange={(e) => setSolarExport(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-sm font-mono text-emerald-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Filer Status Toggle */}
            <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
              <span>FBR Active Taxpayer Status (Non-filers pay 7.5% tax on &gt; Rs. 25k):</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFiler}
                  onChange={(e) => setIsFiler(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-medium text-neutral-300">
                  {isFiler ? 'Filer' : 'Non-Filer'}
                </span>
              </label>
            </div>
          </div>

          {/* Threshold Policy Alert */}
          {thresholdAlert && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                thresholdAlert.type === 'danger'
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  : thresholdAlert.type === 'warning'
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-medium">
                {thresholdAlert.message}
              </div>
            </div>
          )}

          {/* Scenario What-If Comparator Toggle */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-neutral-200">
                  Compare Alternative Consumption Scenario
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowComparator(!showComparator)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                {showComparator ? 'Hide Comparator' : 'Open What-If'}
              </button>
            </div>

            {showComparator && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">Compare with:</span>
                  <input
                    type="number"
                    value={compareUnits}
                    onChange={(e) => setCompareUnits(parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-sm font-mono text-amber-300 text-right"
                  />
                  <span className="text-xs text-neutral-400">units</span>
                </div>

                {comparison && (
                  <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-neutral-300">
                      <span>Scenario A ({comparison.currentUnits} units):</span>
                      <span className="font-mono font-bold">
                        Rs. {comparison.currentBill.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-300">
                      <span>Scenario B ({comparison.alternativeUnits} units):</span>
                      <span className="font-mono font-bold text-amber-400">
                        Rs. {comparison.alternativeBill.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-800 flex justify-between items-center font-bold">
                      <span className="text-neutral-400">Net Difference:</span>
                      <span
                        className={
                          comparison.differenceRupees > 0
                            ? 'text-rose-400 font-mono'
                            : 'text-emerald-400 font-mono'
                        }
                      >
                        {comparison.differenceRupees > 0 ? '+' : ''}
                        Rs. {comparison.differenceRupees.toLocaleString()}
                      </span>
                    </div>
                    {comparison.cliffWarning && (
                      <div className="mt-2 p-2.5 rounded bg-rose-950/60 border border-rose-800 text-[11px] text-rose-200">
                        {comparison.cliffWarning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-Time Results & Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Total Bill Card */}
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
            <div>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Estimated Net Payable
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-neutral-100 font-mono tabular-nums">
                  Rs. {calculationResult.netPayableWithinDueDate.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Within due date for {calculationResult.totalUnits} units ({calculationResult.discoName})
              </p>
            </div>

            {/* Slab Waterfall */}
            <div className="space-y-2.5 pt-3 border-t border-neutral-800">
              <span className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Slab Waterfall (Energy Cost)</span>
                <span className="font-mono text-neutral-400">
                  Rs. {calculationResult.baseElectricityCost.toLocaleString()}
                </span>
              </span>

              <div className="space-y-1.5">
                {calculationResult.slabs.map((slab, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs"
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

            {/* Surcharges & Taxes Stack */}
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              <span className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Government Taxes & Surcharges</span>
                <span className="font-mono text-neutral-400">
                  Rs. {calculationResult.taxes.totalTaxesAndSurcharges.toLocaleString()}
                </span>
              </span>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>FC Surcharge (Rs. 3.23/unit):</span>
                  <span className="font-mono text-neutral-300">
                    Rs. {calculationResult.taxes.fcSurcharge.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>FPA (Fuel Adjustment):</span>
                  <span className="font-mono text-neutral-300">
                    Rs. {calculationResult.taxes.fpa.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>QTA (Quarterly Tariff):</span>
                  <span className="font-mono text-neutral-300">
                    Rs. {calculationResult.taxes.qta.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Electricity Duty (1.5%):</span>
                  <span className="font-mono text-neutral-300">
                    Rs. {calculationResult.taxes.electricityDuty.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>General Sales Tax (GST 18%):</span>
                  <span className="font-mono text-neutral-300">
                    Rs. {calculationResult.taxes.gst.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>TV License Fee:</span>
                  <span className="font-mono text-neutral-300">
                    Rs. {calculationResult.taxes.tvFee}
                  </span>
                </div>
                {calculationResult.taxes.advanceIncomeTax > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>Non-Filer Advance Tax:</span>
                    <span className="font-mono">
                      Rs. {calculationResult.taxes.advanceIncomeTax.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Send to RAG Chat Action */}
            <button
              type="button"
              onClick={() => onSendToChat(calculationResult)}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/50"
            >
              <span>Ask Customer RAG Chat About This Bill</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
