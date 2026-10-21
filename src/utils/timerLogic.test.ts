import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimeMMSS,
  calculateProgressPercentage,
  getNextMode,
  getDurationForMode,
} from './timerLogic';

test('formatTimeMMSS formats seconds to MM:SS string', () => {
  assert.equal(formatTimeMMSS(1500), '25:00');
  assert.equal(formatTimeMMSS(300), '05:00');
  assert.equal(formatTimeMMSS(5), '00:05');
  assert.equal(formatTimeMMSS(0), '00:00');
  assert.equal(formatTimeMMSS(-10), '00:00');
});

test('calculateProgressPercentage returns accurate percentage 0 to 100', () => {
  assert.equal(calculateProgressPercentage(1500, 1500), 0);
  assert.equal(calculateProgressPercentage(750, 1500), 50);
  assert.equal(calculateProgressPercentage(0, 1500), 100);
  assert.equal(calculateProgressPercentage(0, 0), 0);
});

test('getNextMode alternates between focus and break', () => {
  assert.equal(getNextMode('focus'), 'break');
  assert.equal(getNextMode('break'), 'focus');
});

test('getDurationForMode returns seconds based on minutes', () => {
  assert.equal(getDurationForMode('focus', 25, 5), 1500);
  assert.equal(getDurationForMode('break', 25, 5), 300);
  assert.equal(getDurationForMode('focus', 45, 10), 2700);
});
