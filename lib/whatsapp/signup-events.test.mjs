import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSignupEvent } from './signup-events.ts';
const finish = { type: 'WA_EMBEDDED_SIGNUP', event: 'FINISH', data: { waba_id: '11', phone_number_id: '22' } };
test('rejects deceptive domains and malformed events', () => {
  assert.equal(parseSignupEvent({ origin: 'https://notfacebook.com', data: JSON.stringify(finish) }), null);
  assert.equal(parseSignupEvent({ origin: 'https://www.facebook.com.evil.test', data: finish }), null);
  assert.equal(parseSignupEvent({ origin: 'https://www.facebook.com', data: 'invalid' }), null);
  assert.equal(parseSignupEvent({ origin: 'https://www.facebook.com', data: { ...finish, data: { waba_id: '11' } } }), null);
});
test('extracts only the explicit selected account and sender', () => {
  assert.deepEqual(parseSignupEvent({ origin: 'https://www.facebook.com', data: JSON.stringify(finish) }), { kind: 'selection', selection: { event: 'FINISH', wabaId: '11', phoneNumberId: '22' } });
});
test('does not reinterpret coexistence or account-only flows as Cloud registration', () => {
  for (const event of ['FINISH_ONLY_WABA', 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING']) {
    assert.deepEqual(parseSignupEvent({ origin: 'https://www.facebook.com', data: { ...finish, event } }), { kind: 'unsupported' });
  }
});
test('reports cancellation without surfacing provider error details', () => {
  assert.deepEqual(parseSignupEvent({ origin: 'https://www.facebook.com', data: { ...finish, event: 'CANCEL', data: { error_message: 'private data' } } }), { kind: 'cancel' });
});
