/**
 * Time calculation and schedule analysis for Hetta Menny
 */

export interface TimeSlot {
  startMinutes: number;
  endMinutes: number;
}

export interface ScheduledEventItem {
  id: string;
  title: string;
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  startTime: string; // "HH:MM"
  durationMinutes: number;
  subject?: string;
  isFixed: boolean;
}

export interface DayTimeAnalysis {
  wakeHour: number;
  sleepHour: number;
  totalAvailableMinutes: number;
  fixedOccupiedMinutes: number;
  plannedStudyMinutes: number;
  totalOccupiedMinutes: number;
  remainingFreeMinutes: number;
  egyptianSummary: string;
}

/**
 * Converts "HH:MM" 24h format to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return Math.min(Math.max(0, h * 60 + m), 24 * 60);
}

/**
 * Converts minutes from midnight to "HH:MM"
 */
export function minutesToTimeString(minutes: number): string {
  const norm = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Merges overlapping intervals to prevent double-counting occupied time
 */
export function mergeIntervals(intervals: TimeSlot[]): TimeSlot[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.startMinutes - b.startMinutes);
  const merged: TimeSlot[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = merged[merged.length - 1];

    if (current.startMinutes <= prev.endMinutes) {
      prev.endMinutes = Math.max(prev.endMinutes, current.endMinutes);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Formats duration in minutes into a friendly Egyptian Arabic phrase
 */
export function formatMinutesToEgyptianArabic(minutes: number): string {
  if (minutes <= 0) return 'صفر دقيقة';
  if (minutes < 15) return `${minutes} دقائق`;
  if (minutes === 15) return 'ربع ساعة';
  if (minutes === 30) return 'نص ساعة';
  if (minutes === 45) return 'ساعة إلا ربع';
  if (minutes === 60) return 'ساعة';
  if (minutes === 75) return 'ساعة وربع';
  if (minutes === 90) return 'ساعة ونص';
  if (minutes === 105) return 'ساعتين إلا ربع';
  if (minutes === 120) return 'ساعتين';
  if (minutes === 150) return 'ساعتين ونص';

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;

  let hourPhrase = '';
  if (hours === 1) hourPhrase = 'ساعة';
  else if (hours === 2) hourPhrase = 'ساعتين';
  else if (hours >= 3 && hours <= 10) hourPhrase = `${hours} ساعات`;
  else hourPhrase = `${hours} ساعة`;

  if (remMinutes === 0) return hourPhrase;
  if (remMinutes === 15) return `${hourPhrase} وربع`;
  if (remMinutes === 30) return `${hourPhrase} ونص`;
  if (remMinutes === 45) return `${hourPhrase} وتلاتة أرباع`;

  return `${hourPhrase} و${remMinutes} دقيقة`;
}

/**
 * Computes full analysis for a specific day
 */
export function calculateDayFreeTime(
  events: ScheduledEventItem[],
  dayOfWeek: number,
  taskMinutes = 0,
  wakeHour = 8,
  sleepHour = 23
): DayTimeAnalysis {
  // Available window
  const startDayMinutes = wakeHour * 60;
  const endDayMinutes = sleepHour * 60;
  const totalAvailableMinutes = Math.max(0, endDayMinutes - startDayMinutes);

  // Day events
  const dayEvents = events.filter((e) => e.dayOfWeek === dayOfWeek);

  // Fixed events intervals clamped to the available window
  const fixedIntervals: TimeSlot[] = [];
  let flexibleStudyMinutes = 0;

  for (const ev of dayEvents) {
    const evStart = timeStringToMinutes(ev.startTime);
    const evEnd = evStart + ev.durationMinutes;

    if (ev.isFixed) {
      // Clamp to awake window
      const clampedStart = Math.max(startDayMinutes, Math.min(endDayMinutes, evStart));
      const clampedEnd = Math.max(startDayMinutes, Math.min(endDayMinutes, evEnd));
      if (clampedEnd > clampedStart) {
        fixedIntervals.push({ startMinutes: clampedStart, endMinutes: clampedEnd });
      }
    } else {
      flexibleStudyMinutes += ev.durationMinutes;
    }
  }

  // Merge intervals to avoid double counting overlaps
  const mergedFixed = mergeIntervals(fixedIntervals);
  const fixedOccupiedMinutes = mergedFixed.reduce(
    (acc, slot) => acc + (slot.endMinutes - slot.startMinutes),
    0
  );

  const plannedStudyMinutes = flexibleStudyMinutes + taskMinutes;
  const totalOccupiedMinutes = Math.min(
    totalAvailableMinutes,
    fixedOccupiedMinutes + plannedStudyMinutes
  );
  const remainingFreeMinutes = Math.max(0, totalAvailableMinutes - totalOccupiedMinutes);

  let egyptianSummary = '';
  if (remainingFreeMinutes >= 60) {
    const phr = formatMinutesToEgyptianArabic(remainingFreeMinutes);
    egyptianSummary = `فاضلك النهارده ${phr} تقدري تقسّميهم براحتك.`;
  } else if (remainingFreeMinutes > 0) {
    const phr = formatMinutesToEgyptianArabic(remainingFreeMinutes);
    egyptianSummary = `فاضلك وقت سريع (${phr}) مناسب للراحة أو تصفية ذهنك.`;
  } else {
    egyptianSummary = 'يومك مليان على آخره.. متنسيش تاخدي استراحة قصيرة تتنفسي فيها!';
  }

  return {
    wakeHour,
    sleepHour,
    totalAvailableMinutes,
    fixedOccupiedMinutes,
    plannedStudyMinutes,
    totalOccupiedMinutes,
    remainingFreeMinutes,
    egyptianSummary,
  };
}
