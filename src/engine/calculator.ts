import tariffsData from './tariffs.json' with { type: 'json' };
import type { BillInput, BillCalculationResult, SlabBreakdown, TaxBreakdown } from './types.ts';

export function calculateBill(input: BillInput): BillCalculationResult {
  const {
    discoId,
    connectionType,
    units: rawUnits,
    peakUnits: rawPeakUnits = 0,
    offPeakUnits: rawOffPeakUnits = 0,
    solarExportUnits: rawSolarExportUnits = 0,
    solarImportUnits: rawSolarImportUnits = 0,
    sanctionedLoadKw: rawSanctionedLoadKw = 5,
    isFiler = true,
    customFpaRate,
  } = input;

  const notes: string[] = [];

  // Edge-case handling: Normalize and clamp inputs against negative values
  if (rawUnits < 0) {
    notes.push('Input units normalized: negative electricity consumption is impossible and clamped to 0.');
  }

  const units = Math.max(0, isNaN(Number(rawUnits)) ? 0 : Number(rawUnits));
  const peakUnits = Math.max(0, isNaN(Number(rawPeakUnits)) ? 0 : Number(rawPeakUnits));
  const offPeakUnits = Math.max(0, isNaN(Number(rawOffPeakUnits)) ? 0 : Number(rawOffPeakUnits));
  const solarExportUnits = Math.max(0, isNaN(Number(rawSolarExportUnits)) ? 0 : Number(rawSolarExportUnits));
  const solarImportUnits = Math.max(0, isNaN(Number(rawSolarImportUnits)) ? 0 : Number(rawSolarImportUnits));
  const sanctionedLoadKw = Math.max(0, isNaN(Number(rawSanctionedLoadKw)) ? 5 : Number(rawSanctionedLoadKw));

  const disco = tariffsData.discos.find((d) => d.id === discoId) || tariffsData.discos[0];
  const taxesConfig = tariffsData.surcharges_and_taxes;
  const domesticConfig = tariffsData.tariffs.domestic_single_phase;
  const touConfig = tariffsData.tariffs.domestic_three_phase_tou;
  const commConfig = tariffsData.tariffs.commercial_three_phase;

  let baseElectricityCost = 0;
  const slabs: SlabBreakdown[] = [];
  let isProtectedEligible = false;
  let exceededProtectedThreshold = false;
  let effectiveUnits = units;

  // 1. Single Phase Protected
  if (connectionType === 'domestic_single_phase_protected') {
    if (units <= domesticConfig.lifeline_threshold) {
      // Lifeline
      const cost = units * domesticConfig.lifeline_rate;
      baseElectricityCost += cost;
      slabs.push({
        name: `Lifeline (1 - ${units} Units)`,
        units,
        rate: domesticConfig.lifeline_rate,
        cost: Math.round(cost * 100) / 100,
      });
      isProtectedEligible = true;
      notes.push('Qualifies for Lifeline subsidized tariff (<= 50 units).');
    } else if (units <= domesticConfig.protected_qualifying_threshold) {
      // Protected Slabs (1-100, 101-200)
      isProtectedEligible = true;
      let remaining = units;

      const slab1Units = Math.min(remaining, 100);
      const slab1Cost = slab1Units * domesticConfig.protected_slabs[0].rate;
      slabs.push({
        name: domesticConfig.protected_slabs[0].name,
        units: slab1Units,
        rate: domesticConfig.protected_slabs[0].rate,
        cost: Math.round(slab1Cost * 100) / 100,
      });
      baseElectricityCost += slab1Cost;
      remaining -= slab1Units;

      if (remaining > 0) {
        const slab2Units = remaining;
        const slab2Cost = slab2Units * domesticConfig.protected_slabs[1].rate;
        slabs.push({
          name: domesticConfig.protected_slabs[1].name,
          units: slab2Units,
          rate: domesticConfig.protected_slabs[1].rate,
          cost: Math.round(slab2Cost * 100) / 100,
        });
        baseElectricityCost += slab2Cost;
      }
      notes.push('Protected consumer status active (<= 200 units consecutive 6 months).');
    } else {
      // Exceeded 200 units -> automatically falls back to Unprotected calculation!
      const fallbackResult = calculateBill({
        ...input,
        connectionType: 'domestic_single_phase_unprotected',
      });
      return {
        ...fallbackResult,
        exceededProtectedThreshold: true,
        notes: [
          'Exceeded 200 units threshold! Automatically calculated under Unprotected Slabs per Ministry SRO 575.',
          ...fallbackResult.notes,
        ],
      };
    }
  }

  // 2. Single Phase Unprotected
  else if (connectionType === 'domestic_single_phase_unprotected') {
    let remaining = units;
    const unprotectedSlabs = domesticConfig.unprotected_slabs;

    for (const slab of unprotectedSlabs) {
      if (remaining <= 0) break;
      const slabCapacity = slab.max === 999999 ? remaining : slab.max - slab.min + 1;
      const unitsInSlab = Math.min(remaining, slabCapacity);
      const cost = unitsInSlab * slab.rate;

      slabs.push({
        name: slab.name,
        units: unitsInSlab,
        rate: slab.rate,
        cost: Math.round(cost * 100) / 100,
      });

      baseElectricityCost += cost;
      remaining -= unitsInSlab;
    }
    notes.push('Calculated under progressive Unprotected Domestic slabs.');
  }

  // 3. Three Phase Domestic TOU
  else if (connectionType === 'domestic_three_phase_tou') {
    const totalTouUnits = peakUnits + offPeakUnits;
    effectiveUnits = totalTouUnits > 0 ? totalTouUnits : units;

    const pUnits = peakUnits;
    const opUnits = offPeakUnits > 0 ? offPeakUnits : Math.max(0, effectiveUnits - pUnits);

    const peakCost = pUnits * touConfig.peak_rate;
    const offPeakCost = opUnits * touConfig.off_peak_rate;
    const fixedCost = sanctionedLoadKw * touConfig.fixed_charge_per_kw;

    slabs.push({
      name: 'Peak Hours Consumption',
      units: pUnits,
      rate: touConfig.peak_rate,
      cost: Math.round(peakCost * 100) / 100,
    });
    slabs.push({
      name: 'Off-Peak Hours Consumption',
      units: opUnits,
      rate: touConfig.off_peak_rate,
      cost: Math.round(offPeakCost * 100) / 100,
    });
    slabs.push({
      name: `Fixed Charges (${sanctionedLoadKw} kW load)`,
      units: sanctionedLoadKw,
      rate: touConfig.fixed_charge_per_kw,
      cost: fixedCost,
    });

    baseElectricityCost = peakCost + offPeakCost + fixedCost;
    notes.push(`Time of Use rates applied. Peak window: ${touConfig.peak_hours_schedule.summer}.`);
  }

  // 4. Commercial 3-Phase
  else if (connectionType === 'commercial_three_phase') {
    const pUnits = peakUnits;
    const opUnits = offPeakUnits > 0 ? offPeakUnits : Math.max(0, units - pUnits);

    const peakCost = pUnits * commConfig.peak_rate;
    const offPeakCost = opUnits * commConfig.off_peak_rate;
    const fixedCost = sanctionedLoadKw * commConfig.fixed_charge_per_kw;

    slabs.push({
      name: 'Commercial Peak Hours',
      units: pUnits,
      rate: commConfig.peak_rate,
      cost: Math.round(peakCost * 100) / 100,
    });
    slabs.push({
      name: 'Commercial Off-Peak Hours',
      units: opUnits,
      rate: commConfig.off_peak_rate,
      cost: Math.round(offPeakCost * 100) / 100,
    });
    slabs.push({
      name: `Commercial Fixed Charges (${sanctionedLoadKw} kW)`,
      units: sanctionedLoadKw,
      rate: commConfig.fixed_charge_per_kw,
      cost: fixedCost,
    });

    baseElectricityCost = peakCost + offPeakCost + fixedCost;
    effectiveUnits = pUnits + opUnits;
    notes.push('Commercial tariff schedule applied.');
  }

  // 5. Solar Net-Metering
  else if (connectionType === 'solar_net_metering') {
    const imp = solarImportUnits > 0 ? solarImportUnits : units;
    const exp = solarExportUnits;

    if (exp >= imp) {
      const netCreditUnits = exp - imp;
      effectiveUnits = 0;
      baseElectricityCost = 0;
      slabs.push({
        name: `Net Generation Surplus (Export ${exp} > Import ${imp})`,
        units: netCreditUnits,
        rate: tariffsData.tariffs.solar_net_metering.export_credit_rate,
        cost: 0,
      });
      notes.push(
        `Surplus of ${netCreditUnits} units banked/carried forward to subsequent quarter at Rs. ${tariffsData.tariffs.solar_net_metering.export_credit_rate}/unit.`
      );
    } else {
      const netBilledUnits = imp - exp;
      effectiveUnits = netBilledUnits;
      // Calculate net billed units under domestic off-peak / progressive slab
      const unitRate = touConfig.off_peak_rate;
      const cost = netBilledUnits * unitRate;
      slabs.push({
        name: `Net Import Billed (Import ${imp} - Export ${exp})`,
        units: netBilledUnits,
        rate: unitRate,
        cost: Math.round(cost * 100) / 100,
      });
      baseElectricityCost = cost;
      notes.push(`Net billed consumption: ${netBilledUnits} units after deducting ${exp} solar export units.`);
    }
  }

  // Calculate Surcharges & Taxes
  const fpaRate = customFpaRate !== undefined ? customFpaRate : taxesConfig.fpa_default_per_unit;
  const fcSurcharge = Math.round(effectiveUnits * taxesConfig.fc_surcharge_per_unit * 100) / 100;
  const fpa = Math.round(effectiveUnits * fpaRate * 100) / 100;
  const qta = Math.round(effectiveUnits * taxesConfig.qta_default_per_unit * 100) / 100;

  // Electricity Duty (ED) calculated on base electricity cost + surcharges
  const edBase = Math.max(0, baseElectricityCost + fcSurcharge + fpa + qta);
  const edRate = disco.ed_rate || taxesConfig.electricity_duty_percent;
  const electricityDuty = Math.round(((edBase * edRate) / 100) * 100) / 100;

  // GST (18%) on (base + surcharges + ED)
  const gstBase = Math.max(0, edBase + electricityDuty);
  const gst = Math.round(((gstBase * taxesConfig.gst_percent) / 100) * 100) / 100;

  // TV Fee
  const isCommercial = connectionType === 'commercial_three_phase';
  const tvFee = isCommercial ? taxesConfig.tv_fee_commercial : taxesConfig.tv_fee_domestic;

  // Advance Income Tax (Section 235)
  let advanceIncomeTax = 0;
  const preTaxSubtotal = baseElectricityCost + fcSurcharge + fpa + qta + electricityDuty + gst + tvFee;
  if (!isFiler && preTaxSubtotal > taxesConfig.income_tax_threshold) {
    advanceIncomeTax = Math.round(((preTaxSubtotal * taxesConfig.income_tax_percent_non_filer) / 100) * 100) / 100;
    notes.push('7.5% Advance Income Tax (Section 235) applied for non-filer status (> Rs. 25,000).');
  }

  const totalTaxesAndSurcharges =
    Math.round((fcSurcharge + fpa + qta + electricityDuty + gst + tvFee + advanceIncomeTax) * 100) / 100;

  const netPayableWithinDueDate = Math.round((baseElectricityCost + totalTaxesAndSurcharges) * 100) / 100;

  const taxes: TaxBreakdown = {
    fcSurcharge,
    fpa,
    qta,
    electricityDuty,
    gst,
    tvFee,
    advanceIncomeTax,
    totalTaxesAndSurcharges,
  };

  return {
    connectionType,
    discoName: disco.name,
    totalUnits: effectiveUnits,
    baseElectricityCost: Math.round(baseElectricityCost * 100) / 100,
    slabs,
    taxes,
    netPayableWithinDueDate,
    isProtectedEligible,
    exceededProtectedThreshold,
    notes,
  };
}
