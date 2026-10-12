import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnhancedStatusCode, StatusCode } from '../src/core.js';

// --- happy path -----------------------------------------------------------

test('parses a typical success response line', () => {
  const r = parseEnhancedStatusCode('250 2.1.5 recipient ok');
  assert.equal(r.ok, true);
  assert.equal(r.code, 215);
  assert.equal(r.text, '2.1.5');
  assert.equal(r.index, 4);
  assert.equal(r.classDigit, 2);
  assert.equal(r.subjectDigit, 1);
  assert.equal(r.detailDigit, 5);
});

test('parses a persistent failure response line', () => {
  const r = parseEnhancedStatusCode('550 5.7.1 relay denied');
  assert.equal(r.ok, true);
  assert.equal(r.code, 571);
  assert.equal(r.text, '5.7.1');
  assert.equal(r.classDigit, 5);
  assert.equal(r.subjectDigit, 7);
  assert.equal(r.detailDigit, 1);
});

test('parses a transient failure response line', () => {
  const r = parseEnhancedStatusCode('451 4.4.7 delivery expired');
  assert.equal(r.ok, true);
  assert.equal(r.code, 447);
});

// --- edge cases -----------------------------------------------------------

test('parses when code appears with no leading numeric reply', () => {
  const r = parseEnhancedStatusCode('2.0.0 OK');
  assert.equal(r.ok, true);
  assert.equal(r.code, 200);
  assert.equal(r.index, 0);
});

test('returns ok false when no D.D.D sequence is present', () => {
  const r = parseEnhancedStatusCode('550 relay denied');
  assert.equal(r.ok, false);
  assert.equal(r.code, null);
  assert.equal(r.text, null);
  assert.equal(r.index, null);
});

test('parses first match when multiple codes appear in the line', () => {
  // The first subsequence wins; we do not attempt to pick the most likely.
  const r = parseEnhancedStatusCode('450 4.0.0 see also 5.1.1');
  assert.equal(r.ok, true);
  assert.equal(r.code, 400);
  assert.equal(r.text, '4.0.0');
});

// --- input guards ---------------------------------------------------------

test('empty string is a valid input and yields ok false', () => {
  const r = parseEnhancedStatusCode('');
  assert.equal(r.ok, false);
});

test('line with only a numeric reply and no enhanced code is not a match', () => {
  const r = parseEnhancedStatusCode('250 OK');
  assert.equal(r.ok, false);
});

// --- StatusCode class -----------------------------------------------------

test('StatusCode builds the three-digit code from components', () => {
  const sc = new StatusCode(5, 7, 1);
  assert.equal(sc.code, 571);
  assert.equal(sc.toString(), '5.7.1');
});
