/**
 * Pure timer logic and session calculation for Hetta Menny
 */

export type TimerMode = 'focus' | 'break';

export interface TimerState {
  mode: TimerMode;
  timeLeftSeconds: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  selectedTaskId: string | null;
  completedCyclesToday: number;
}

export function formatTimeMMSS(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateProgressPercentage(timeLeftSeconds: number, totalDurationSeconds: number): number {
  if (totalDurationSeconds <= 0) return 0;
  const elapsed = totalDurationSeconds - timeLeftSeconds;
  const rawPct = (elapsed / totalDurationSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(rawPct)));
}

export function getNextMode(currentMode: TimerMode): TimerMode {
  return currentMode === 'focus' ? 'break' : 'focus';
}

export function getDurationForMode(mode: TimerMode, focusMinutes: number, breakMinutes: number): number {
  const mins = mode === 'focus' ? focusMinutes : breakMinutes;
  return Math.max(1, mins) * 60;
}
