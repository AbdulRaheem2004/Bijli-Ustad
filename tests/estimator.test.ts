import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateBill, compareScenarios, getThresholdAlert } from '../src/engine/estimator.ts';

test('Estimator: Basic estimation matches calculator output', () => {
  const result = estimateBill({
    discoId: 'lesco',
    connectionType: 'domestic_single_phase_protected',
    units: 180,
  });

  assert.equal(result.totalUnits, 180);
  assert.ok(result.netPayableWithinDueDate > 0);
});

test('Estimator: Cliff comparison 200 vs 205 units triggers warning', () => {
  const comparison = compareScenarios(
    {
      discoId: 'lesco',
      connectionType: 'domestic_single_phase_protected',
      units: 200,
    },
    205
  );

  assert.equal(comparison.currentUnits, 200);
  assert.equal(comparison.alternativeUnits, 205);
  assert.ok(comparison.differenceRupees > 0);
  assert.ok(comparison.cliffWarning?.includes('exceeds the 200-unit threshold'));
});

test('Estimator: Threshold alerts for boundaries', () => {
  const lifelineAlert = getThresholdAlert(40, 'domestic_single_phase_protected');
  assert.equal(lifelineAlert?.type, 'info');

  const nearCliffAlert = getThresholdAlert(195, 'domestic_single_phase_protected');
  assert.equal(nearCliffAlert?.type, 'warning');

  const exceededAlert = getThresholdAlert(205, 'domestic_single_phase_protected');
  assert.equal(exceededAlert?.type, 'danger');
});
