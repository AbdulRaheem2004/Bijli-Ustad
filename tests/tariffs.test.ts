import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBill } from '../src/engine/calculator.ts';
import tariffsData from '../src/engine/tariffs.json' with { type: 'json' };

test('Tariff Engine: Single Phase Lifeline (<=50 units)', () => {
  const result = calculateBill({
    discoId: 'lesco',
    connectionType: 'domestic_single_phase_protected',
    units: 45,
  });

  assert.equal(result.isProtectedEligible, true);
  assert.equal(result.slabs.length, 1);
  assert.equal(result.slabs[0].rate, 3.95);
  assert.equal(result.baseElectricityCost, Math.round(45 * 3.95 * 100) / 100);
});

test('Tariff Engine: Single Phase Protected (150 units)', () => {
  const result = calculateBill({
    discoId: 'lesco',
    connectionType: 'domestic_single_phase_protected',
    units: 150,
  });

  assert.equal(result.isProtectedEligible, true);
  assert.equal(result.slabs.length, 2);
  // Slab 1: 100 units @ 7.74 = 774
  assert.equal(result.slabs[0].units, 100);
  assert.equal(result.slabs[0].rate, 7.74);
  // Slab 2: 50 units @ 10.06 = 503
  assert.equal(result.slabs[1].units, 50);
  assert.equal(result.slabs[1].rate, 10.06);

  const expectedBase = 100 * 7.74 + 50 * 10.06;
  assert.equal(result.baseElectricityCost, Math.round(expectedBase * 100) / 100);
  assert.ok(result.netPayableWithinDueDate > expectedBase);
});

test('Tariff Engine: Single Phase Exceeding Protected Threshold (205 units)', () => {
  const result = calculateBill({
    discoId: 'lesco',
    connectionType: 'domestic_single_phase_protected',
    units: 205,
  });

  // Automatically recalculates under unprotected slabs
  assert.equal(result.connectionType, 'domestic_single_phase_unprotected');
  assert.equal(result.slabs.length, 3);
  // Slab 1: 100 @ 16.48
  assert.equal(result.slabs[0].rate, 16.48);
  // Slab 2: 100 @ 22.95
  assert.equal(result.slabs[1].rate, 22.95);
  // Slab 3: 5 @ 27.14
  assert.equal(result.slabs[2].rate, 27.14);
});

test('Tariff Engine: Three Phase TOU (200 Peak + 300 Off-Peak)', () => {
  const result = calculateBill({
    discoId: 'lesco',
    connectionType: 'domestic_three_phase_tou',
    units: 500,
    peakUnits: 200,
    offPeakUnits: 300,
    sanctionedLoadKw: 5,
  });

  assert.equal(result.slabs[0].units, 200);
  assert.equal(result.slabs[0].rate, 41.89);
  assert.equal(result.slabs[1].units, 300);
  assert.equal(result.slabs[1].rate, 35.57);
  // Fixed charges 5 kW * 200 = 1000
  assert.equal(result.slabs[2].cost, 1000);
});

test('Tariff Engine: Solar Net-Metering with Surplus Export', () => {
  const result = calculateBill({
    discoId: 'lesco',
    connectionType: 'solar_net_metering',
    units: 0,
    solarImportUnits: 300,
    solarExportUnits: 450,
  });

  assert.equal(result.totalUnits, 0);
  assert.equal(result.baseElectricityCost, 0);
  assert.ok(result.notes.some((n) => n.includes('banked/carried forward')));
});
