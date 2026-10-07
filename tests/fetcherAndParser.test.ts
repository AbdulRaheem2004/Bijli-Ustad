import test from 'node:test';
import assert from 'node:assert/strict';
import { BillFetcherService } from '../src/services/billFetcher.ts';
import { BillParserService } from '../src/services/billParser.ts';

test('Bill Fetcher: Sanitize and validate reference number', () => {
  const raw = '01 11223 1234567 U';
  const clean = BillFetcherService.sanitizeReferenceNumber(raw);
  assert.equal(clean, '01112231234567');
  assert.equal(BillFetcherService.validateReferenceNumber(clean), true);

  const invalid = '12345';
  assert.equal(BillFetcherService.validateReferenceNumber(invalid), false);
});

test('Bill Fetcher: Official portal URL generation', () => {
  const urlLesco = BillFetcherService.getOfficialPortalUrl('lesco', '01112231234567');
  assert.ok(urlLesco.includes('bill.pitc.com.pk/lescobill'));

  const urlKe = BillFetcherService.getOfficialPortalUrl('ke', '1300000000000');
  assert.ok(urlKe.includes('ke.com.pk'));
});

test('Bill Parser: Regex extracts units and reference number from bill text', () => {
  const sampleBillText = `
    LAHORE ELECTRIC SUPPLY COMPANY (LESCO)
    Consumer Name: MUHAMMAD ALI
    Reference No: 08 11234 5678901 U
    Tariff: A-1a(01) DOMESTIC
    Units Consumed: 195
    Payable Within Due Date: Rs. 4,850
    F.P.A: Rs. 339.30
  `;

  const parsed = BillParserService.parseBillText(sampleBillText);
  assert.equal(parsed.referenceNumber, '08112345678901');
  assert.equal(parsed.units, 195);
  assert.equal(parsed.tariffCode, 'A-1A(01)');
  assert.equal(parsed.amountPayable, 4850);
  assert.equal(parsed.fpa, 339.3);
});
