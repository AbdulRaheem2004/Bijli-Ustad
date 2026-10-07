import { calculateBill } from './calculator.ts';
import type { BillInput, BillCalculationResult, EstimationComparison, ConnectionType } from './types.ts';

export function estimateBill(input: BillInput): BillCalculationResult {
  return calculateBill(input);
}

export function compareScenarios(
  baseInput: BillInput,
  alternativeUnits: number
): EstimationComparison {
  const currentResult = calculateBill(baseInput);

  const altInput: BillInput = {
    ...baseInput,
    units: alternativeUnits,
  };
  const altResult = calculateBill(altInput);

  const differenceRupees =
    Math.round((altResult.netPayableWithinDueDate - currentResult.netPayableWithinDueDate) * 100) / 100;

  let cliffWarning: string | undefined;

  // Check if crossing the 200-unit protected boundary
  if (baseInput.connectionType === 'domestic_single_phase_protected') {
    if (baseInput.units <= 200 && alternativeUnits > 200) {
      cliffWarning = `WARNING: Increasing from ${baseInput.units} to ${alternativeUnits} units exceeds the 200-unit threshold. This revokes Protected Category status across all units (Ministry SRO 575), increasing your bill by Rs. ${Math.abs(differenceRupees).toLocaleString()}!`;
    } else if (baseInput.units > 200 && alternativeUnits <= 200) {
      cliffWarning = `SAVINGS OPPORTUNITY: Reducing consumption from ${baseInput.units} to ${alternativeUnits} units re-enters Protected status, saving you Rs. ${Math.abs(differenceRupees).toLocaleString()}!`;
    }
  }

  return {
    currentUnits: baseInput.units,
    currentBill: currentResult.netPayableWithinDueDate,
    alternativeUnits,
    alternativeBill: altResult.netPayableWithinDueDate,
    differenceRupees,
    cliffWarning,
  };
}

export function getThresholdAlert(units: number, connectionType: ConnectionType): {
  type: 'info' | 'warning' | 'danger';
  message: string;
} | null {
  if (connectionType.includes('protected') || connectionType === 'domestic_single_phase_unprotected') {
    if (units <= 50) {
      return {
        type: 'info',
        message: 'Lifeline Tier Active: Highly subsidized rate (Rs. 3.95/unit) applies for consumption <= 50 units.',
      };
    }
    if (units >= 180 && units <= 200) {
      return {
        type: 'warning',
        message: `Caution: At ${units} units, you are within ${200 - units} units of the 200-unit Protected Category limit. Using even 1 unit above 200 will disqualify you from protected rates!`,
      };
    }
    if (units > 200 && units <= 220) {
      return {
        type: 'danger',
        message: `High Cost Alert: You consumed ${units} units, exceeding the 200-unit threshold. You are billed at Unprotected rates across all slabs!`,
      };
    }
  }
  return null;
}
