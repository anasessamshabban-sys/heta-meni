import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, AlertCircle, Sparkles, Filter, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import {
  ScheduledEventItem,
  calculateDayFreeTime,
  formatMinutesToEgyptianArabic,
  timeStringToMinutes,
  minutesToTimeString,
} from '../utils/timeCalculator';

interface WeeklyPlannerProps {
  events: ScheduledEventItem[];
  onAddEvent: (event: Omit<ScheduledEventItem, 'id'>) => void;
  onDeleteEvent: (eventId: string) => void;
  wakeHour?: number;
  sleepHour?: number;
  onUpdateWindow?: (wake: number, sleep: number) => void;
  dailyTasksTotalMinutes?: number;
}

export const DAYS_ARABIC = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
  wakeHour = 8,
  sleepHour = 23,
  onUpdateWindow,
  dailyTasksTotalMinutes = 0,
}) => {
  const todayDayIndex = new Date().getDay(); // 0 is Sunday in JS
  const [selectedDay, setSelectedDay] = useState<number>(todayDayIndex);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDay, setNewEventDay] = useState<number>(selectedDay);
  const [newEventStartTime, setNewEventStartTime] = useState('10:00');
  const [newEventDuration, setNewEventDuration] = useState(60);
  const [newEventSubject, setNewEventSubject] = useState('');
  const [newEventIsFixed, setNewEventIsFixed] = useState(true);

  // Editable Window
  const [tempWake, setTempWake] = useState(wakeHour);
  const [tempSleep, setTempSleep] = useState(sleepHour);
  const [showSettings, setShowSettings] = useState(false);

  // Today's Free Time Calculation
  const todayAnalysis = calculateDayFreeTime(
    events,
    selectedDay,
    selectedDay === todayDayIndex ? dailyTasksTotalMinutes : 0,
    wakeHour,
    sleepHour
  );

  // Find next upcoming commitment from right now
  const now = new Date();
  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  const allSortedEvents = [...events].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) {
      // Calculate day distance relative to today
      const distA = (a.dayOfWeek - todayDayIndex + 7) % 7;
      const distB = (b.dayOfWeek - todayDayIndex + 7) % 7;
      return distA - distB;
    }
    return timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime);
  });

  const upcomingEvent = allSortedEvents.find((e) => {
    const dayDist = (e.dayOfWeek - todayDayIndex + 7) % 7;
    if (dayDist > 0) return true;
    return timeStringToMinutes(e.startTime) > currentMinutesFromMidnight;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddEvent({
      title: newEventTitle.trim(),
      dayOfWeek: newEventDay,
      startTime: newEventStartTime,
      durationMinutes: Number(newEventDuration),
      subject: newEventSubject.trim() || 'دراسة',
      isFixed: newEventIsFixed,
    });

    setNewEventTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. AUTOMATIC FREE-TIME CALCULATOR CARD */}
      <div className="relative bg-[#FFF4E4] border-4 border-[#182B49] paper-shadow-lg p-5 sm:p-7">
        <div className="absolute -top-3.5 right-8 w-44 h-7 washi-tape-yellow flex items-center justify-center text-xs font-black text-[#182B49]">
          حاسبة الوقت الفاضي الحقيقي
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#182B49]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#182B49] font-display">
              تحليل ساعات يوم «{DAYS_ARABIC[selectedDay]}»
            </h2>
            <p className="text-xs text-[#182B49]/70 font-semibold">
              حساب دقيق يستبعد التداخلات، ويفرّق بين الالتزام الإلزامي والمذاكرة المرنة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs font-black px-3 py-1.5 bg-white border-2 border-[#182B49] paper-shadow-sm hover:bg-[#F5C542] transition-colors"
            >
              نافذة اليوم ({wakeHour}:00 ص إلى {sleepHour}:00 م)
            </button>
          </div>
        </div>

        {/* Awake Window Config Drawer */}
        {showSettings && (
          <div className="mb-6 p-4 bg-white border-2 border-[#182B49] flex flex-wrap items-center gap-4 text-xs font-bold">
            <div>
              ساعة الاستيقاظ:
              <input
                type="number"
                min="4"
                max="12"
                value={tempWake}
                onChange={(e) => setTempWake(Number(e.target.value))}
                className="w-16 p-1 border border-[#182B49] text-center ml-2"
              />
            </div>
            <div>
              ساعة النوم:
              <input
                type="number"
                min="18"
                max="24"
                value={tempSleep}
                onChange={(e) => setTempSleep(Number(e.target.value))}
                className="w-16 p-1 border border-[#182B49] text-center ml-2"
              />
            </div>
            <button
              onClick={() => {
                if (onUpdateWindow) onUpdateWindow(tempWake, tempSleep);
                setShowSettings(false);
              }}
              className="px-4 py-1.5 bg-[#48A868] text-white font-black border border-[#182B49] hover:brightness-105"
            >
              حفظ الساعات
            </button>
          </div>
        )}

        {/* Visual Time Allocation Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-black text-[#182B49] mb-1.5">
            <span>إجمالي نافذة اليوم: {Math.round(todayAnalysis.totalAvailableMinutes / 60)} ساعة ({todayAnalysis.totalAvailableMinutes} دقيقة)</span>
            <span className="text-[#2455D6]">
              متبقي فاضي: {formatMinutesToEgyptianArabic(todayAnalysis.remainingFreeMinutes)}
            </span>
          </div>

          <div className="w-full h-8 bg-white border-3 border-[#182B49] flex overflow-hidden paper-shadow-sm relative">
            {/* Fixed occupied */}
            {todayAnalysis.fixedOccupiedMinutes > 0 && (
              <div
                className="h-full bg-[#E8473F] text-white text-[10px] font-black flex items-center justify-center overflow-hidden border-l border-white"
                style={{
                  width: `${(todayAnalysis.fixedOccupiedMinutes / todayAnalysis.totalAvailableMinutes) * 100}%`,
                }}
                title={`التزامات ثابتة: ${todayAnalysis.fixedOccupiedMinutes} د`}
              >
                ثابت {todayAnalysis.fixedOccupiedMinutes}د
              </div>
            )}

            {/* Planned Study */}
            {todayAnalysis.plannedStudyMinutes > 0 && (
              <div
                className="h-full bg-[#F26B38] text-white text-[10px] font-black flex items-center justify-center overflow-hidden border-l border-white"
                style={{
                  width: `${(todayAnalysis.plannedStudyMinutes / todayAnalysis.totalAvailableMinutes) * 100}%`,
                }}
                title={`مذاكرة ومراجعة: ${todayAnalysis.plannedStudyMinutes} د`}
              >
                مذاكرة {todayAnalysis.plannedStudyMinutes}د
              </div>
            )}

            {/* Free Unallocated Time */}
            {todayAnalysis.remainingFreeMinutes > 0 && (
              <div
                className="h-full bg-[#48A868] text-white text-[10px] font-black flex items-center justify-center overflow-hidden"
                style={{
                  width: `${(todayAnalysis.remainingFreeMinutes / todayAnalysis.totalAvailableMinutes) * 100}%`,
                }}
                title={`وقت فاضي حقيقي: ${todayAnalysis.remainingFreeMinutes} د`}
              >
                فاضي {formatMinutesToEgyptianArabic(todayAnalysis.remainingFreeMinutes)}
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold mt-2 text-[#182B49]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#E8473F] border border-[#182B49]" />
              <span>التزامات ثابتة ({todayAnalysis.fixedOccupiedMinutes} د)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#F26B38] border border-[#182B49]" />
              <span>مذاكرة ومهام ({todayAnalysis.plannedStudyMinutes} د)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#48A868] border border-[#182B49]" />
              <span>وقتك الحر ({todayAnalysis.remainingFreeMinutes} د)</span>
            </div>
          </div>
        </div>

        {/* Warm Egyptian Colloquial Summary Banner */}
        <div className="p-4 bg-white border-2 border-[#182B49] paper-shadow-sm flex items-center gap-3">
          <div className="p-2 bg-[#F5C542] border-2 border-[#182B49] text-[#182B49]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-black text-[#182B49] font-display">
              {todayAnalysis.egyptianSummary}
            </div>
            <div className="text-[11px] text-[#182B49]/70 font-semibold">
              الوقت الفاضي محسوب بعد خصم مواعيدك ومذاكرتك المخططة. استغليه بهدوء وبلا ذنب.
            </div>
          </div>
        </div>
      </div>

      {/* 2. NEXT UPCOMING COMMITMENT BANNER */}
      {upcomingEvent && (
        <div className="bg-[#2455D6] text-white border-4 border-[#182B49] paper-shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-[#2455D6] border-2 border-[#182B49]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black bg-[#F5C542] text-[#182B49] px-2 py-0.5 border border-[#182B49] inline-block mb-1">
                الالتزام القادم في الجدول
              </span>
              <div className="text-base font-black font-display">
                {upcomingEvent.title} ({DAYS_ARABIC[upcomingEvent.dayOfWeek]}، الساعة {upcomingEvent.startTime})
              </div>
              <div className="text-xs text-white/80 font-medium">
                المدة: {upcomingEvent.durationMinutes} دقيقة • {upcomingEvent.subject}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedDay(upcomingEvent.dayOfWeek)}
            className="px-4 py-2 bg-white text-[#182B49] text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:bg-[#F5C542] transition-colors"
          >
            عرض يوم {DAYS_ARABIC[upcomingEvent.dayOfWeek]}
          </button>
        </div>
      )}

      {/* 3. SEVEN-DAY PLANNER TIMELINE / GRID */}
      <div className="bg-white border-4 border-[#182B49] paper-shadow-lg p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#182B49]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#182B49] font-display">
              الجدول الدراسي الأسبوعي
            </h2>
            <p className="text-xs text-[#182B49]/70 font-semibold">
              سجلي مواعيد المحاضرات والسكاشن والمذاكرة على مدار الأسبوع.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex bg-[#FFF4E4] border-2 border-[#182B49] p-1 text-xs font-black">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 transition-all ${
                  viewMode === 'week' ? 'bg-[#2455D6] text-white paper-shadow-sm' : 'text-[#182B49]'
                }`}
              >
                عرض الأسبوع كاملاً
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 transition-all ${
                  viewMode === 'day' ? 'bg-[#2455D6] text-white paper-shadow-sm' : 'text-[#182B49]'
                }`}
              >
                عرض يوم بيوم
              </button>
            </div>

            <button
              onClick={() => {
                setNewEventDay(selectedDay);
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-[#F26B38] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              إضافة ميعاد
            </button>
          </div>
        </div>

        {/* 7 Days Tabs */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
          {DAYS_ARABIC.map((dayName, idx) => {
            const dayEventsCount = events.filter((e) => e.dayOfWeek === idx).length;
            const isToday = idx === todayDayIndex;
            const isSelected = idx === selectedDay;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`p-2 sm:p-3 text-center border-2 border-[#182B49] transition-all relative ${
                  isSelected
                    ? 'bg-[#2455D6] text-white paper-shadow font-black'
                    : isToday
                    ? 'bg-[#F5C542] text-[#182B49] font-extrabold'
                    : 'bg-[#FFF4E4] text-[#182B49] hover:bg-white font-bold'
                }`}
              >
                {isToday && (
                  <span className="hidden sm:block text-[9px] font-black uppercase text-[#E8473F]">
                    اليوم
                  </span>
                )}
                <div className="text-xs sm:text-sm">{dayName}</div>
                <div className="text-[10px] mt-0.5 opacity-80">
                  {dayEventsCount} {dayEventsCount === 1 ? 'ميعاد' : 'مواعيد'}
                </div>
              </button>
            );
          })}
        </div>

        {/* View Mode: Week Overview Grid */}
        {viewMode === 'week' ? (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {DAYS_ARABIC.map((dayName, dayIdx) => {
              const dayEvs = events
                .filter((e) => e.dayOfWeek === dayIdx)
                .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

              return (
                <div
                  key={dayIdx}
                  className={`p-3 border-2 border-[#182B49] paper-shadow-sm min-h-[160px] flex flex-col ${
                    dayIdx === selectedDay ? 'bg-white ring-2 ring-[#2455D6]' : 'bg-[#FFF4E4]/40'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#182B49]/20 font-black text-xs text-[#182B49]">
                    <span>{dayName}</span>
                    <button
                      onClick={() => {
                        setNewEventDay(dayIdx);
                        setShowAddModal(true);
                      }}
                      className="text-[#2455D6] hover:scale-110"
                      title="إضافة ميعاد لهذا اليوم"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayEvs.length === 0 ? (
                      <div className="text-[11px] text-[#182B49]/40 text-center py-4">
                        فاضي تماماً
                      </div>
                    ) : (
                      dayEvs.map((ev) => (
                        <div
                          key={ev.id}
                          className={`p-2 border border-[#182B49] text-xs font-bold relative group ${
                            ev.isFixed ? 'bg-white border-r-4 border-r-[#E8473F]' : 'bg-[#FFF4E4] border-r-4 border-r-[#F26B38]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#182B49]/70 mb-0.5">
                            <span className="font-mono font-black">{ev.startTime}</span>
                            <span>{ev.durationMinutes}د</span>
                          </div>
                          <div className="font-black text-[#182B49] truncate">{ev.title}</div>
                          <div className="text-[10px] text-[#182B49]/60 truncate">{ev.subject}</div>

                          <button
                            onClick={() => onDeleteEvent(ev.id)}
                            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 p-0.5 text-[#E8473F] transition-opacity"
                            title="حذف الميعاد"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode: Day Detailed Timeline View */
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#182B49] text-white p-3 border-2 border-[#182B49]">
              <span className="text-sm font-black font-display">
                مواعيد يوم {DAYS_ARABIC[selectedDay]} التفصيلية
              </span>
              <button
                onClick={() => {
                  setNewEventDay(selectedDay);
                  setShowAddModal(true);
                }}
                className="px-3 py-1 bg-[#F5C542] text-[#182B49] text-xs font-black border border-white hover:brightness-105"
              >
                + إضافة ميعاد لهذا اليوم
              </button>
            </div>

            {events.filter((e) => e.dayOfWeek === selectedDay).length === 0 ? (
              <div className="text-center py-10 bg-[#FFF4E4]/30 border-2 border-dashed border-[#182B49]/30">
                <p className="text-sm font-bold text-[#182B49]/60">
                  لا توجد مواعيد مسجلة في هذا اليوم.. يمكنك الاستمتاع بوقت فراغ كامل!
                </p>
              </div>
            ) : (
              events
                .filter((e) => e.dayOfWeek === selectedDay)
                .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime))
                .map((ev) => (
                  <div
                    key={ev.id}
                    className={`flex items-center justify-between p-4 border-2 border-[#182B49] paper-shadow-sm ${
                      ev.isFixed ? 'bg-white border-r-8 border-r-[#E8473F]' : 'bg-[#FFF4E4] border-r-8 border-r-[#F26B38]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center bg-[#182B49] text-white px-3 py-1.5 border border-[#182B49]">
                        <span className="font-mono text-sm font-black">{ev.startTime}</span>
                        <div className="text-[10px] text-[#F5C542]">{ev.durationMinutes} دقيقة</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#182B49]">{ev.title}</h4>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 border border-[#182B49] ${
                              ev.isFixed ? 'bg-[#E8473F] text-white' : 'bg-[#F26B38] text-white'
                            }`}
                          >
                            {ev.isFixed ? 'التزام ثابت' : 'مذاكرة مرنة'}
                          </span>
                        </div>
                        <div className="text-xs text-[#182B49]/70 font-semibold mt-0.5">
                          المادة/المجال: {ev.subject}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-2 text-[#182B49]/50 hover:text-[#E8473F] transition-colors"
                      title="حذف الميعاد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182B49]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FFF4E4] border-4 border-[#182B49] paper-shadow-lg p-6">
            <div className="absolute -top-3.5 right-8 w-32 h-6 washi-tape-orange flex items-center justify-center text-[11px] font-black text-white">
              ميعاد دراسي جديد
            </div>

            <h3 className="text-lg font-black text-[#182B49] mb-4 font-display">
              إضافة محاضرة أو جلسة مذاكرة
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#182B49] mb-1">
                  اسم الميعاد / المحاضرة:
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="مثال: محاضرة فارماكولوجي، أو مراجعة جبر..."
                  className="w-full p-2.5 bg-white border-2 border-[#182B49] text-xs font-bold outline-hidden"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#182B49] mb-1">
                    اليوم:
                  </label>
                  <select
                    value={newEventDay}
                    onChange={(e) => setNewEventDay(Number(e.target.value))}
                    className="w-full p-2 bg-white border-2 border-[#182B49] text-xs font-bold"
                  >
                    {DAYS_ARABIC.map((d, i) => (
                      <option key={i} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182B49] mb-1">
                    وقت البدء:
                  </label>
                  <input
                    type="time"
                    required
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full p-2 bg-white border-2 border-[#182B49] text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#182B49] mb-1">
                    المدة بالدقائق:
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="360"
                    step="15"
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(Number(e.target.value))}
                    className="w-full p-2 bg-white border-2 border-[#182B49] text-xs font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182B49] mb-1">
                    المادة / المجال:
                  </label>
                  <input
                    type="text"
                    value={newEventSubject}
                    onChange={(e) => setNewEventSubject(e.target.value)}
                    placeholder="مثال: طب، برمجة، تصميم..."
                    className="w-full p-2 bg-white border-2 border-[#182B49] text-xs font-bold"
                  />
                </div>
              </div>

              {/* Fixed Commitment vs Flexible Study Radio */}
              <div className="pt-2">
                <span className="block text-xs font-bold text-[#182B49] mb-1.5">
                  نوع الميعاد:
                </span>
                <div className="flex gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="commitmentType"
                      checked={newEventIsFixed}
                      onChange={() => setNewEventIsFixed(true)}
                    />
                    <span>التزام ثابت (محاضرة/سكشن إلزامي)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="commitmentType"
                      checked={!newEventIsFixed}
                      onChange={() => setNewEventIsFixed(false)}
                    />
                    <span>مذاكرة مرنة (قابلة للتعديل)</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#182B49]/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#182B49] hover:bg-black/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2455D6] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-110"
                >
                  تأكيد الإضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
