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
test('does not reinterpret account-only flows as Cloud registration', () => {
  assert.deepEqual(parseSignupEvent({ origin: 'https://www.facebook.com', data: { ...finish, event: 'FINISH_ONLY_WABA' } }), { kind: 'unsupported' });
});
test('accepts a coexistence finish with only the account, leaving the phone to the backend', () => {
  const event = 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING';
  assert.deepEqual(parseSignupEvent({ origin: 'https://business.facebook.com', data: { type: 'WA_EMBEDDED_SIGNUP', event, data: { waba_id: '11' } } }), { kind: 'selection', selection: { event, wabaId: '11' } });
  assert.equal(parseSignupEvent({ origin: 'https://www.facebook.com', data: { type: 'WA_EMBEDDED_SIGNUP', event, data: {} } }), null);
});
test('reports cancellation without surfacing provider error details', () => {
  assert.deepEqual(parseSignupEvent({ origin: 'https://www.facebook.com', data: { ...finish, event: 'CANCEL', data: { error_message: 'private data' } } }), { kind: 'cancel' });
});
