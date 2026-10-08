import test from 'node:test';
import assert from 'node:assert/strict';
import { NepraRagRetriever } from '../src/rag/retriever.ts';
import { CustomerRagChatService } from '../src/rag/customerChat.ts';

test('RAG Retriever: Valid query for FPA returns Section 31(7) chunk', () => {
  const retriever = new NepraRagRetriever();
  const results = retriever.retrieve('What is FPA on electricity bill?');

  assert.ok(results.length > 0);
  assert.equal(results[0].chunk.id, 'kc-fpa-mechanics');
  assert.ok(results[0].chunk.sroCitation.includes('Section 31(7)'));
});

test('RAG Retriever: Out-of-scope queries return zero results', () => {
  const retriever = new NepraRagRetriever();
  
  // Unrelated questions
  const res1 = retriever.retrieve('What is the capital of France?');
  assert.equal(res1.length, 0);

  const res2 = retriever.retrieve('How to cook chicken biryani?');
  assert.equal(res2.length, 0);

  const res3 = retriever.retrieve('Tell me a funny joke');
  assert.equal(res3.length, 0);
});

test('Customer Chat: Refuses out-of-scope question and provides helpful guidance in English', () => {
  const chat = new CustomerRagChatService();
  const response = chat.answer('Who won the world cup in 1992?', null, 'english');

  assert.equal(response.sender, 'assistant');
  assert.equal(response.isOutOfScope, true);
  assert.ok(response.text.includes('outside the scope of verified NEPRA electricity regulations'));
  assert.ok(response.text.includes('Protected vs. Unprotected'));
});

test('Customer Chat: Refuses out-of-scope question in Roman Urdu', () => {
  const chat = new CustomerRagChatService();
  const response = chat.answer('Mausam kaisa hai aaj?', null, 'roman_urdu');

  assert.equal(response.sender, 'assistant');
  assert.equal(response.isOutOfScope, true);
  assert.ok(response.text.includes('Mazrat!'));
  assert.ok(response.text.includes('Pakistani bijli ke bill aur NEPRA rules'));
});

test('Customer Chat: Refuses out-of-scope question in Urdu', () => {
  const chat = new CustomerRagChatService();
  const response = chat.answer('فرانس کا دارالحکومت کیا ہے؟', null, 'urdu');

  assert.equal(response.sender, 'assistant');
  assert.equal(response.isOutOfScope, true);
  assert.ok(response.text.includes('معذرت'));
  assert.ok(response.text.includes('نیپرا'));
});

test('Customer Chat: Returns authentic Urdu Nastaliq text for valid query', () => {
  const chat = new CustomerRagChatService();
  const response = chat.answer('FPA کیا ہوتا ہے؟', null, 'urdu');

  assert.equal(response.sender, 'assistant');
  assert.equal(response.isOutOfScope, false);
  assert.ok(response.text.includes('فیول پرائس ایڈجسٹمنٹ'));
  assert.ok(response.citations && response.citations.length > 0);
});

test('Customer Chat: Returns authentic Roman Urdu for valid query', () => {
  const chat = new CustomerRagChatService();
  const response = chat.answer('200 units se ooper mehnga bill kyun hota hai?', null, 'roman_urdu');

  assert.equal(response.sender, 'assistant');
  assert.equal(response.isOutOfScope, false);
  assert.ok(response.text.includes('SRO 575'));
  assert.ok(response.text.includes('Protected'));
});

test('Customer Chat: Dynamically calculates 2-part unit cost (base price vs total bill / units)', () => {
  const chat = new CustomerRagChatService();
  const mockBill = {
    discoId: 'lesco',
    discoName: 'LESCO',
    connectionType: 'domestic_single_phase_protected' as const,
    totalUnits: 100,
    baseElectricityCost: 774,
    slabs: [{ name: '1 - 100 Units', units: 100, rate: 7.74, cost: 774 }],
    taxes: {
      fcSurcharge: 323,
      fpa: 174,
      qta: 125,
      electricityDuty: 11.61,
      gst: 253.25,
      tvFee: 35,
      totalTaxesAndSurcharges: 921.86,
    },
    netPayableWithinDueDate: 1695.86,
    isProtectedEligible: true,
  };

  const response = chat.answer('How much does it cost me for a unit?', mockBill, 'english');

  assert.equal(response.sender, 'assistant');
  assert.equal(response.isOutOfScope, false);
  // Part 1: Without taxes
  assert.ok(response.text.includes('WITHOUT TAXES'));
  assert.ok(response.text.includes('7.74'));
  // Part 2: Total bill including all taxes / total units
  assert.ok(response.text.includes('TOTAL BILL INCLUDING ALL TAXES'));
  assert.ok(response.text.includes('16.96'));
  assert.ok(response.citations && response.citations.length > 0);
});

test('Customer Chat: Answers why consumer has to pay with solar power (5 reasons)', () => {
  const chat = new CustomerRagChatService();
  const response = chat.answer('Why do I have to pay if I already own solar power?', null, 'english');

  assert.equal(response.sender, 'assistant');
  assert.equal(response.isOutOfScope, false);
  assert.ok(response.text.includes('Peak Hours'));
  assert.ok(response.text.includes('Sanctioned Load') || response.text.includes('Fixed Charges'));
  assert.ok(response.citations && response.citations.length > 0);
});

test('Customer Chat: Answers connection type and solar meter questions using bill context', () => {
  const chat = new CustomerRagChatService();
  const solarBill = {
    discoId: 'mepco',
    discoName: 'MEPCO',
    connectionType: 'solar_net_metering' as const,
    totalUnits: 273,
    baseElectricityCost: 6500,
    slabs: [],
    taxes: {
      fcSurcharge: 881,
      fpa: 471,
      qta: 341,
      electricityDuty: 97,
      gst: 875,
      tvFee: 35,
      totalTaxesAndSurcharges: 2700,
    },
    netPayableWithinDueDate: -59369,
    isProtectedEligible: false,
  };

  const response = chat.answer('what type of connection is my?', solarBill, 'english');
  assert.equal(response.isOutOfScope, false);
  assert.ok(response.text.includes('Solar Net-Metering') || response.text.includes('A-1b(03)T'));

  const responseSolar = chat.answer('is my meter solar or not?', solarBill, 'roman_urdu');
  assert.equal(responseSolar.isOutOfScope, false);
  assert.ok(responseSolar.text.includes('Solar Net-Metering'));
});

test('Customer Chat: Correctly explains Credit Balance (CR) when user asks why to pay with credit', () => {
  const chat = new CustomerRagChatService();
  const creditBill = {
    discoId: 'mepco',
    discoName: 'MEPCO',
    connectionType: 'solar_net_metering' as const,
    totalUnits: 273,
    baseElectricityCost: 6500,
    slabs: [],
    taxes: {
      fcSurcharge: 881,
      fpa: 471,
      qta: 341,
      electricityDuty: 97,
      gst: 875,
      tvFee: 35,
      totalTaxesAndSurcharges: 2700,
    },
    netPayableWithinDueDate: -59369,
    isProtectedEligible: false,
  };

  const response = chat.answer('why do i have to pay? aint my amount credited to mepco?', creditBill, 'english');
  assert.equal(response.isOutOfScope, false);
  assert.ok(response.text.includes('NOT have to pay'));
  assert.ok(response.text.includes('59,369') || response.text.includes('CREDIT'));
  assert.ok(response.text.includes('NOT TO BE PAID'));
});


