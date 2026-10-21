import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Coffee, Flame, Settings2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  formatTimeMMSS,
  calculateProgressPercentage,
  getNextMode,
  getDurationForMode,
  TimerMode,
} from '../utils/timerLogic';
import { playSessionEndChime } from '../utils/audioChime';
import type { UserTask } from '../firebase/db';

interface FocusStationProps {
  tasks: UserTask[];
  onCompleteSession?: (durationMinutes: number, taskTitle: string, type: 'focus' | 'break') => void;
  onMarkTaskCompleted?: (taskId: string) => void;
}

export const FocusStation: React.FC<FocusStationProps> = ({
  tasks,
  onCompleteSession,
  onMarkTaskCompleted,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [customIntention, setCustomIntention] = useState<string>('');
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const totalDuration = getDurationForMode(mode, focusMinutes, breakMinutes);
  const progressPercent = calculateProgressPercentage(timeLeft, totalDuration);
  const timerRef = useRef<number | null>(null);

  // Active selected task
  const activeTask = tasks.find((t) => t.id === selectedTaskId);
  const activeTaskTitle = activeTask ? activeTask.title : customIntention;

  // Countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, mode, focusMinutes, breakMinutes, selectedTaskId, customIntention]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    playSessionEndChime();

    // Trigger celebratory confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2455D6', '#F26B38', '#E8473F', '#48A868', '#F5C542'],
    });

    if (mode === 'focus') {
      setCompletedSessionsCount((c) => c + 1);
      if (onCompleteSession) {
        onCompleteSession(focusMinutes, activeTaskTitle || 'جلسة تركيز عامة', 'focus');
      }
      // If a specific task was selected, optionally mark it complete or ask
      if (selectedTaskId && onMarkTaskCompleted) {
        onMarkTaskCompleted(selectedTaskId);
      }
      // Switch to break
      setMode('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      if (onCompleteSession) {
        onCompleteSession(breakMinutes, 'استراحة', 'break');
      }
      // Switch back to focus
      setMode('focus');
      setTimeLeft(focusMinutes * 60);
    }
  };

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode, focusMinutes, breakMinutes));
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode, focusMinutes, breakMinutes));
  };

  const handleSaveSettings = (newFocus: number, newBreak: number) => {
    const validFocus = Math.max(1, Math.min(120, newFocus));
    const validBreak = Math.max(1, Math.min(60, newBreak));
    setFocusMinutes(validFocus);
    setBreakMinutes(validBreak);
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode, validFocus, validBreak));
    setShowSettings(false);
  };

  return (
    <div className="relative w-full bg-[#FFF4E4] border-4 border-[#182B49] paper-shadow-lg p-5 sm:p-7 pt-8 mb-8 my-4">
      {/* Decorative Washi Tape on top edge */}
      <div className="absolute -top-3.5 left-6 w-32 h-7 washi-tape-orange flex items-center justify-center text-xs font-black text-white z-10">
        محطة التركيز
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side (Timer graphic composition) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Mode Switcher Tabs */}
          <div className="flex gap-2 mb-4 bg-[#182B49]/10 p-1 border-2 border-[#182B49]">
            <button
              onClick={() => handleModeSwitch('focus')}
              className={`px-5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 ${
                mode === 'focus'
                  ? 'bg-[#2455D6] text-white paper-shadow-sm'
                  : 'bg-transparent text-[#182B49] hover:bg-white/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#F5C542]" />
              وقت التركيز ({focusMinutes} د)
            </button>
            <button
              onClick={() => handleModeSwitch('break')}
              className={`px-5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 ${
                mode === 'break'
                  ? 'bg-[#48A868] text-white paper-shadow-sm'
                  : 'bg-transparent text-[#182B49] hover:bg-white/60'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-white" />
              استراحة ({breakMinutes} د)
            </button>
          </div>

          {/* Large Editorial Countdown Card */}
          <div className="relative w-full max-w-md bg-white border-4 border-[#182B49] paper-shadow p-6 sm:p-8 flex flex-col items-center justify-center">
            {/* Stamp Badge */}
            <div className="absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 border border-[#182B49] bg-[#F5C542]">
              {mode === 'focus' ? 'تركيز عميق' : 'استراحة مستحقة'}
            </div>

            {/* Live Big Time Display */}
            <div className="font-mono text-6xl sm:text-7xl md:text-8xl font-black text-[#182B49] tracking-tighter my-2 selection:bg-[#F26B38]">
              {formatTimeMMSS(timeLeft)}
            </div>

            {/* Progress Bar styled like colored tape */}
            <div className="w-full h-4 bg-[#182B49]/15 border-2 border-[#182B49] overflow-hidden my-3 relative">
              <div
                className={`h-full transition-all duration-300 ${
                  mode === 'focus' ? 'bg-[#2455D6]' : 'bg-[#48A868]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="w-full flex justify-between text-[11px] font-bold text-[#182B49]/70">
              <span>نسبة الإنجاز: {progressPercent}%</span>
              <span>{isRunning ? 'عداد حي يعمل' : 'متوقف مؤقتاً'}</span>
            </div>

            {/* Touch Controls */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={handleStartPause}
                aria-label={isRunning ? 'إيقاف مؤقت' : 'بدء التركيز'}
                className={`px-7 py-3 text-white text-base font-black border-3 border-[#182B49] paper-shadow-sm flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all ${
                  isRunning ? 'bg-[#E8473F]' : 'bg-[#2455D6]'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    إيقاف مؤقت
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    {timeLeft < totalDuration ? 'استئناف' : 'ابدئي التركيز'}
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                aria-label="إعادة ضبط العداد"
                className="p-3 bg-white text-[#182B49] border-3 border-[#182B49] paper-shadow-sm hover:bg-[#FFF4E4] active:scale-95 transition-all"
                title="إعادة ضبط العداد"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                aria-label="تعديل مدة العداد"
                className="p-3 bg-white text-[#182B49] border-3 border-[#182B49] paper-shadow-sm hover:bg-[#FFF4E4] active:scale-95 transition-all"
                title="تعديل المدة"
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side (Active Intent / Task binding & Daily Sessions completed) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Intent / Task Card */}
          <div className="bg-white border-3 border-[#182B49] p-4 paper-shadow-sm">
            <h2 className="text-xs font-black text-[#182B49] mb-2 flex items-center gap-1.5 font-display">
              <Flame className="w-4 h-4 text-[#F26B38]" />
              المهمة المرتبطة بجلسة التركيز:
            </h2>

            {/* Task selector from daily tasks */}
            {tasks.length > 0 && (
              <div className="mb-2.5">
                <select
                  value={selectedTaskId}
                  onChange={(e) => {
                    setSelectedTaskId(e.target.value);
                    if (e.target.value) setCustomIntention('');
                  }}
                  className="w-full p-2 bg-[#FFF4E4] border-2 border-[#182B49] text-xs font-bold text-[#182B49] outline-hidden focus:ring-2 focus:ring-[#2455D6]"
                >
                  <option value="">-- اختاري مهمة من مهام اليوم --</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.isPriority ? '★ ' : ''}
                      {t.title} ({t.estimatedMinutes} د)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Intent fallback input */}
            <div>
              <input
                type="text"
                value={customIntention}
                onChange={(e) => {
                  setCustomIntention(e.target.value);
                  if (e.target.value) setSelectedTaskId('');
                }}
                placeholder="أو اكتبي نيتك لهذه الجلسة (مثال: قراءة 5 صفحات)..."
                className="w-full p-2 bg-white border border-[#182B49] text-xs font-semibold text-[#182B49] outline-hidden focus:border-[#2455D6]"
              />
            </div>

            {activeTaskTitle && (
              <div className="mt-3 p-2 bg-[#F5C542]/20 border border-[#F5C542] text-xs font-black text-[#182B49]">
                تركيزك الآن على: «{activeTaskTitle}»
              </div>
            )}
          </div>

          {/* Sessions Completed Today Counter Box */}
          <div className="bg-[#182B49] text-white p-4 border-3 border-[#182B49] paper-shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#F5C542] uppercase tracking-wider">
                حصيلة اليوم
              </div>
              <div className="text-sm font-black mt-0.5 font-display">
                أنجزتِ {completedSessionsCount} جلسات تركيز
              </div>
              <div className="text-[11px] text-white/70">
                أي ما يعادل {completedSessionsCount * focusMinutes} دقيقة مذاكرة حقيقية
              </div>
            </div>
            <div className="w-12 h-12 bg-[#F5C542] text-[#182B49] border-2 border-white rounded-none flex items-center justify-center text-xl font-black font-mono">
              {completedSessionsCount}
            </div>
          </div>

          {/* Duration Customization Drawer (if opened) */}
          {showSettings && (
            <div className="bg-[#FFF4E4] border-2 border-[#182B49] p-3 text-xs font-bold text-[#182B49]">
              <div className="font-black mb-2 text-[#E8473F]">تعديل أوقات الجلسات:</div>
              <div className="flex items-center gap-3 mb-2">
                <label className="flex-1">
                  دقائق التركيز:
                  <input
                    type="number"
                    min="5"
                    max="120"
                    defaultValue={focusMinutes}
                    id="input-focus-mins"
                    className="w-full mt-1 p-1 bg-white border border-[#182B49] font-bold text-center"
                  />
                </label>
                <label className="flex-1">
                  دقائق الاستراحة:
                  <input
                    type="number"
                    min="1"
                    max="30"
                    defaultValue={breakMinutes}
                    id="input-break-mins"
                    className="w-full mt-1 p-1 bg-white border border-[#182B49] font-bold text-center"
                  />
                </label>
              </div>
              <button
                onClick={() => {
                  const f = parseInt((document.getElementById('input-focus-mins') as HTMLInputElement)?.value, 10) || 25;
                  const b = parseInt((document.getElementById('input-break-mins') as HTMLInputElement)?.value, 10) || 5;
                  handleSaveSettings(f, b);
                }}
                className="w-full py-1.5 bg-[#48A868] text-white font-black text-xs border border-[#182B49] hover:brightness-105"
              >
                تحديث المدد
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
