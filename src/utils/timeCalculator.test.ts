import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeStringToMinutes,
  minutesToTimeString,
  mergeIntervals,
  formatMinutesToEgyptianArabic,
  calculateDayFreeTime,
  type ScheduledEventItem,
} from './timeCalculator';

test('timeStringToMinutes converts HH:MM correctly', () => {
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('08:30'), 510);
  assert.equal(timeStringToMinutes('23:59'), 1439);
  assert.equal(timeStringToMinutes('invalid'), 0);
});

test('minutesToTimeString converts minutes to HH:MM format', () => {
  assert.equal(minutesToTimeString(0), '00:00');
  assert.equal(minutesToTimeString(510), '08:30');
  assert.equal(minutesToTimeString(720), '12:00');
});

test('mergeIntervals merges overlapping time intervals without double-counting', () => {
  const intervals = [
    { startMinutes: 600, endMinutes: 720 }, // 10:00 - 12:00 (120 min)
    { startMinutes: 660, endMinutes: 780 }, // 11:00 - 13:00 (120 min)
  ];
  const merged = mergeIntervals(intervals);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].startMinutes, 600);
  assert.equal(merged[0].endMinutes, 780); // 10:00 - 13:00 = 180 min total, not 240
});

test('formatMinutesToEgyptianArabic formats classic colloquial times', () => {
  assert.equal(formatMinutesToEgyptianArabic(30), 'نص ساعة');
  assert.equal(formatMinutesToEgyptianArabic(60), 'ساعة');
  assert.equal(formatMinutesToEgyptianArabic(90), 'ساعة ونص');
  assert.equal(formatMinutesToEgyptianArabic(120), 'ساعتين');
  assert.equal(formatMinutesToEgyptianArabic(150), 'ساعتين ونص');
});

test('calculateDayFreeTime accurately calculates free time and generates Egyptian summary', () => {
  const events: ScheduledEventItem[] = [
    {
      id: 'e1',
      title: 'محاضرة باثولوجي',
      dayOfWeek: 0, // Sunday
      startTime: '09:00',
      durationMinutes: 120, // 2 hours
      isFixed: true,
    },
    {
      id: 'e2',
      title: 'سكشن كيمياء',
      dayOfWeek: 0,
      startTime: '10:00', // Overlaps with lecture (10:00 to 11:30)
      durationMinutes: 90,
      isFixed: true,
    },
  ];

  // Wake 8 (480 min) to 23 (1380 min) = 900 minutes total (15 hours)
  // Merged fixed events: 9:00 to 11:30 = 150 minutes
  // Task planned minutes: 60 minutes
  const analysis = calculateDayFreeTime(events, 0, 60, 8, 23);

  assert.equal(analysis.totalAvailableMinutes, 900);
  assert.equal(analysis.fixedOccupiedMinutes, 150);
  assert.equal(analysis.plannedStudyMinutes, 60);
  assert.equal(analysis.totalOccupiedMinutes, 210);
  assert.equal(analysis.remainingFreeMinutes, 690); // 11.5 hours remaining
  assert.ok(analysis.egyptianSummary.includes('فاضلك النهارده'));
});
