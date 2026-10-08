import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBill } from '../src/engine/calculator.ts';

test('Bill Explainer: Lifeline slab applied for <= 50 units', () => {
  const result = testLifeline(45);
  assert.equal(result.totalUnits, 45);
  assert.equal(result.isProtectedEligible, true);
  assert.equal(result.slabs.length, 1);
  assert.match(result.slabs[0].name, /Lifeline/i);
  assert.equal(result.slabs[0].rate, 3.95);
  assert.equal(result.baseElectricityCost, Math.round(45 * 3.95 * 100) / 100);
});

test('Bill Explainer: Exactly 50 units receives Lifeline rate', () => {
  const result = testLifeline(50);
  assert.equal(result.totalUnits, 50);
  assert.equal(result.slabs[0].rate, 3.95);
  assert.equal(result.baseElectricityCost, 197.5);
  assert.ok(result.notes.some((n) => n.includes('Lifeline subsidized tariff')));
});

test('Bill Explainer: 150 units correctly uses 2 protected progressive slabs', () => {
  const result = calculateBill({
    discoId: 'lesco',
    connectionType: 'domestic_single_phase_protected',
    units: 150,
  });

  assert.equal(result.totalUnits, 150);
  assert.equal(result.isProtectedEligible, true);
  assert.equal(result.slabs.length, 2);
  assert.equal(result.slabs[0].units, 100);
  assert.equal(result.slabs[0].rate, 7.74);
  assert.equal(result.slabs[1].units, 50);
  assert.equal(result.slabs[1].rate, 10.06);
});

test('Bill Explainer: Exceeding 200 units falls back to Unprotected schedule', () => {
  const result = calculateBill({
    discoId: 'lesco',
    connectionType: 'domestic_single_phase_protected',
    units: 205,
  });

  assert.equal(result.exceededProtectedThreshold, true);
  assert.equal(result.connectionType, 'domestic_single_phase_unprotected');
  assert.ok(result.slabs.length >= 3);
  // Slabs: 1-100 @ 16.48, 101-200 @ 22.95, 201-300 @ 27.14
  assert.equal(result.slabs[0].rate, 16.48);
  assert.equal(result.slabs[1].rate, 22.95);
  assert.equal(result.slabs[2].rate, 27.14);
});

test('Bill Explainer: Taxes accurately computed with FC Surcharge and GST', () => {
  const result = calculateBill({
    discoId: 'lesco',
    connectionType: 'domestic_single_phase_protected',
    units: 100,
  });

  // Base electricity = 100 * 7.74 = 774
  assert.equal(result.baseElectricityCost, 774);
  // FC Surcharge = 100 * 3.23 = 323
  assert.equal(result.taxes.fcSurcharge, 323);
  // TV fee domestic = 35
  assert.equal(result.taxes.tvFee, 35);
  assert.ok(result.taxes.gst > 0);
  assert.ok(result.netPayableWithinDueDate > result.baseElectricityCost);
});

function testLifeline(units: number) {
  return calculateBill({
    discoId: 'lesco',
    connectionType: 'domestic_single_phase_protected',
    units,
  });
}
