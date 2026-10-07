import test from 'node:test';
import assert from 'node:assert/strict';
import { NepraRagRetriever } from '../src/rag/retriever.ts';
import { CustomerRagChatService } from '../src/rag/customerChat.ts';

test('RAG Retriever: Query for FPA returns Section 31(7) chunk', () => {
  const retriever = new NepraRagRetriever();
  const results = retriever.retrieve('What is FPA on my electricity bill?');

  assert.ok(results.length > 0);
  assert.equal(results[0].chunk.id, 'kc-fpa-mechanics');
  assert.ok(results[0].chunk.sroCitation.includes('Section 31(7)'));
});

test('RAG Retriever: Roman Urdu query for protected slabs returns SRO 575', () => {
  const retriever = new NepraRagRetriever();
  const results = retriever.retrieve('mera bill 201 units par mehnga kyun aya protected status');

  assert.ok(results.length > 0);
  assert.equal(results[0].chunk.id, 'kc-protected-criteria');
  assert.ok(results[0].chunk.sroCitation.includes('S.R.O. 575'));
});

test('RAG Retriever: Detection bill query returns CSM Chapter 5', () => {
  const retriever = new NepraRagRetriever();
  const results = retriever.retrieve('kya meter slow hone par detection bill dal sakte hain?');

  assert.ok(results.length > 0);
  assert.equal(results[0].chunk.id, 'kc-csm-detection-bills');
  assert.ok(results[0].chunk.sroCitation.includes('Chapter 5'));
});

test('Customer Chat: Answers in Roman Urdu with citations and bill context', () => {
  const chatService = new CustomerRagChatService();
  const response = chatService.answer(
    'FPA kya hota hai?',
    {
      connectionType: 'domestic_single_phase_protected',
      discoName: 'LESCO (Lahore)',
      totalUnits: 150,
      baseElectricityCost: 1200,
      slabs: [],
      taxes: {
        fcSurcharge: 484,
        fpa: 261,
        qta: 187,
        electricityDuty: 30,
        gst: 390,
        tvFee: 35,
        advanceIncomeTax: 0,
        totalTaxesAndSurcharges: 1387,
      },
      netPayableWithinDueDate: 2587,
      isProtectedEligible: true,
      exceededProtectedThreshold: false,
      notes: [],
    },
    'roman_urdu'
  );

  assert.equal(response.sender, 'assistant');
  assert.ok(response.text.includes('150 units'));
  assert.ok(response.text.includes('FPA (Fuel Price Adjustment)'));
  assert.ok(response.citations && response.citations.length > 0);
  assert.ok(response.citations[0].sro.includes('Section 31(7)'));
});
