export type ConnectionType = 
  | 'domestic_single_phase_protected'
  | 'domestic_single_phase_unprotected'
  | 'domestic_three_phase_tou'
  | 'commercial_three_phase'
  | 'solar_net_metering';

export interface SlabBreakdown {
  name: string;
  units: number;
  rate: number;
  cost: number;
}

export interface BillInput {
  discoId: string;
  connectionType: ConnectionType;
  units: number;
  peakUnits?: number;
  offPeakUnits?: number;
  solarExportUnits?: number;
  solarImportUnits?: number;
  sanctionedLoadKw?: number;
  isFiler?: boolean;
  customFpaRate?: number;
}

export interface TaxBreakdown {
  fcSurcharge: number;
  fpa: number;
  qta: number;
  electricityDuty: number;
  gst: number;
  tvFee: number;
  advanceIncomeTax: number;
  totalTaxesAndSurcharges: number;
}

export interface BillCalculationResult {
  connectionType: ConnectionType;
  discoName: string;
  totalUnits: number;
  baseElectricityCost: number;
  slabs: SlabBreakdown[];
  taxes: TaxBreakdown;
  netPayableWithinDueDate: number;
  isProtectedEligible: boolean;
  exceededProtectedThreshold: boolean;
  notes: string[];
}

export interface EstimationComparison {
  currentUnits: number;
  currentBill: number;
  alternativeUnits: number;
  alternativeBill: number;
  differenceRupees: number;
  cliffWarning?: string;
}
