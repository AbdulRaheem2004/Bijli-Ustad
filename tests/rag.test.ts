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
