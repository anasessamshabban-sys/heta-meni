/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FocusStation } from './components/FocusStation';
import { DailyTasks } from './components/DailyTasks';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { FreeTimeDiscovery } from './components/FreeTimeDiscovery';
import { ProjectNotes } from './components/ProjectNotes';
import { AudioVoiceModal } from './components/AudioVoiceModal';
import { ThinkingAdvisorModal } from './components/ThinkingAdvisorModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import {
  auth,
  testConnection,
} from './firebase/config';
import {
  subscribeUserTasks,
  addUserTask,
  toggleUserTask,
  deleteUserTask,
  subscribeUserEvents,
  addUserEvent,
  deleteUserEvent,
  subscribeUserNotes,
  addUserNote,
  deleteUserNote,
  logFocusSession,
  seedStarterDataIfEmpty,
  type UserTask,
  type ProjectNoteItem,
} from './firebase/db';
import { ScheduledEventItem } from './utils/timeCalculator';
import { onAuthStateChanged, User } from 'firebase/auth';

// Starter default data for instant offline/unauthenticated experience
const INITIAL_DEMO_TASKS: UserTask[] = [
  {
    id: 'demo-task-1',
    userId: 'demo',
    title: 'مراجعة تشريح الجهاز العصبي الطرفي (Cranial Nerves)',
    subject: 'مشروعي الطبي',
    estimatedMinutes: 45,
    completed: false,
    isPriority: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-task-2',
    userId: 'demo',
    title: 'تصميم الغلاف التحريري لدفتر الملاحظات الورقي',
    subject: 'التصميم',
    estimatedMinutes: 30,
    completed: false,
    isPriority: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-task-3',
    userId: 'demo',
    title: 'تطبيق تجربة تفريغ الصوت وتحليل الخطة الدراسية',
    subject: 'البرمجة والتعلّم',
    estimatedMinutes: 25,
    completed: true,
    isPriority: false,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_DEMO_EVENTS: ScheduledEventItem[] = [
  {
    id: 'demo-ev-1',
    title: 'محاضرة باثولوجي وفيزيولوجي',
    dayOfWeek: 0, // Sunday
    startTime: '09:00',
    durationMinutes: 120,
    subject: 'مشروعي الطبي',
    isFixed: true,
  },
  {
    id: 'demo-ev-2',
    title: 'مذاكرة مركزة: مراجعة ملخص الأسبوع',
    dayOfWeek: 0,
    startTime: '16:00',
    durationMinutes: 90,
    subject: 'مذاكرة مرنة',
    isFixed: false,
  },
  {
    id: 'demo-ev-3',
    title: 'ورشة التايبوجرافي العربي المعاصر',
    dayOfWeek: 2, // Tuesday
    startTime: '17:00',
    durationMinutes: 90,
    subject: 'التصميم',
    isFixed: true,
  },
  {
    id: 'demo-ev-4',
    title: 'سكشن تحليلي ومختبر التجارب',
    dayOfWeek: 3, // Wednesday
    startTime: '11:00',
    durationMinutes: 120,
    subject: 'مشروعي الطبي',
    isFixed: true,
  },
];

const INITIAL_DEMO_NOTES: ProjectNoteItem[] = [
  {
    id: 'demo-note-1',
    userId: 'demo',
    category: 'medical',
    title: 'مشروعي الطبي: ملاحظات حول تدفق الدم في الشعيرات الدقيقة',
    content: 'دراسة تأثير الإجهاد الذهني وساعات السهر على ضغط الدم ومعدل التركيز اليومي. نحتاج لتوثيق أوقات الراحة المناسبة.',
    nextSteps: 'مراجعة أطلس التشريح وتجهيز 3 رسومات يدوية للمصطلحات.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-note-2',
    userId: 'demo',
    category: 'design',
    title: 'هوية "حِتّة منّي" البصرية وحواف الورق الممزق',
    content: 'الاعتماد على الأزرق الكوبالت والبرتقالي الحار مع نسيج الورق العاجي الطبيعي ليعطي إحساس المجلة المطبوعة الدافئة.',
    nextSteps: 'إضافة ملصقات طوابع بريدية مصرية للأقسام.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'planner' | 'projects' | 'discovery'>('home');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // App data state
  const [tasks, setTasks] = useState<UserTask[]>(INITIAL_DEMO_TASKS);
  const [events, setEvents] = useState<ScheduledEventItem[]>(INITIAL_DEMO_EVENTS);
  const [notes, setNotes] = useState<ProjectNoteItem[]>(INITIAL_DEMO_NOTES);

  // Daily window state (wake/sleep)
  const [wakeHour, setWakeHour] = useState(8);
  const [sleepHour, setSleepHour] = useState(23);

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceTargetCallback, setVoiceTargetCallback] = useState<((text: string) => void) | null>(null);
  const [isThinkingModalOpen, setIsThinkingModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Initial connection test
  useEffect(() => {
    testConnection().then((connected) => {
      if (connected) setIsCloudSynced(true);
    });
  }, []);

  // Sync with Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsCloudSynced(true);

        // Subscribe to user Firestore collections
        const unsubTasks = subscribeUserTasks(
          user.uid,
          (userTasks) => {
            if (userTasks.length > 0) {
              setTasks(userTasks);
            } else {
              // Seed starter data if user is brand new
              seedStarterDataIfEmpty(user.uid, 0, events.length);
            }
          },
          (err) => console.warn('Tasks subscription note:', err)
        );

        const unsubEvents = subscribeUserEvents(
          user.uid,
          (userEvents) => {
            if (userEvents.length > 0) {
              setEvents(userEvents);
            }
          },
          (err) => console.warn('Events subscription note:', err)
        );

        const unsubNotes = subscribeUserNotes(
          user.uid,
          (userNotes) => {
            if (userNotes.length > 0) {
              setNotes(userNotes);
            }
          },
          (err) => console.warn('Notes subscription note:', err)
        );

        return () => {
          unsubTasks();
          unsubEvents();
          unsubNotes();
        };
      } else {
        // Fallback to local state if logged out
        setIsCloudSynced(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Task Operations
  const handleAddTask = async (task: {
    title: string;
    subject: string;
    estimatedMinutes: number;
    isPriority: boolean;
  }) => {
    if (currentUser) {
      await addUserTask(currentUser.uid, task);
    } else {
      const newTask: UserTask = {
        id: 'task_' + Date.now(),
        userId: 'local',
        title: task.title,
        subject: task.subject,
        estimatedMinutes: task.estimatedMinutes,
        completed: false,
        isPriority: task.isPriority,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (currentUser) {
      await toggleUserTask(currentUser.uid, taskId, !currentCompleted);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t))
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (currentUser) {
      await deleteUserTask(currentUser.uid, taskId);
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Event Operations
  const handleAddEvent = async (event: Omit<ScheduledEventItem, 'id'>) => {
    if (currentUser) {
      await addUserEvent(currentUser.uid, event);
    } else {
      const newEv: ScheduledEventItem = {
        id: 'ev_' + Date.now(),
        ...event,
      };
      setEvents((prev) => [...prev, newEv]);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (currentUser) {
      await deleteUserEvent(currentUser.uid, eventId);
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  // Note Operations
  const handleAddNote = async (note: {
    category: 'design' | 'coding' | 'medical' | 'ideas' | 'free';
    title: string;
    content: string;
    nextSteps: string;
  }) => {
    if (currentUser) {
      await addUserNote(currentUser.uid, note);
    } else {
      const newNote: ProjectNoteItem = {
        id: 'note_' + Date.now(),
        userId: 'local',
        ...note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (currentUser) {
      await deleteUserNote(currentUser.uid, noteId);
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  // Focus Session Log
  const handleCompleteSession = async (
    durationMinutes: number,
    taskTitle: string,
    type: 'focus' | 'break'
  ) => {
    if (currentUser) {
      await logFocusSession(currentUser.uid, {
        durationMinutes,
        taskTitle,
        type,
      });
    }
  };

  // Audio Voice trigger helper
  const openVoiceForTask = () => {
    setVoiceTargetCallback(() => (text: string) => {
      handleAddTask({
        title: text,
        subject: 'صوتي',
        estimatedMinutes: 25,
        isPriority: false,
      });
    });
    setIsVoiceModalOpen(true);
  };

  const openVoiceForCustom = (callback: (text: string) => void) => {
    setVoiceTargetCallback(() => callback);
    setIsVoiceModalOpen(true);
  };

  // Calculate planned study tasks minutes for today
  const dailyTasksTotalMinutes = tasks
    .filter((t) => !t.completed)
    .reduce((acc, t) => acc + (t.estimatedMinutes || 25), 0);

  // Context summary for High Thinking Study Advisor
  const advisorContext = `
المهام المتبقية اليوم: ${tasks.filter((t) => !t.completed).map((t) => t.title).join('، ') || 'لا توجد مهام'}
عدد المواعيد في جدول الأسبوع: ${events.length}
نافذة الاستيقاظ: من ${wakeHour}:00 إلى ${sleepHour}:00
`.trim();

  return (
    <div className="min-h-screen bg-[#FFF4E4] bg-paper-grid text-[#182B49] pb-24 md:pb-16 selection:bg-[#F5C542]">
      {/* Top Graphic Framing Line */}
      <div className="h-2 w-full bg-linear-to-r from-[#2455D6] via-[#F26B38] to-[#48A868]" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-2">
        {/* App Header */}
        <Header
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenVoiceModal={openVoiceForTask}
          onOpenThinkingModal={() => setIsThinkingModalOpen(true)}
          onOpenInstallModal={() => setIsAndroidModalOpen(true)}
          isCloudSynced={isCloudSynced}
        />

        {/* View Switcher Container */}
        {currentTab === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 1. Large Focus Station */}
            <FocusStation
              tasks={tasks.filter((t) => !t.completed)}
              onCompleteSession={handleCompleteSession}
              onMarkTaskCompleted={(taskId) => handleToggleTask(taskId, false)}
            />

            {/* 2. Daily Tasks Checklist */}
            <DailyTasks
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenVoiceModal={openVoiceForTask}
            />

            {/* 3. Quick Teaser for Free Time & Discovery */}
            <div className="relative bg-[#F5C542]/20 border-4 border-[#182B49] p-6 paper-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#F26B38] text-white border border-[#182B49] inline-block mb-1">
                  استراحة وتجديد طاقة
                </span>
                <h3 className="text-lg font-black text-[#182B49] font-display">
                  فاضلك وقت وعايزة تجربي فكرة ممتعة خارج الروتين؟
                </h3>
                <p className="text-xs text-[#182B49]/80 font-semibold">
                  اكتشفي قسم «وقت ليا» لتجارب التايبوجرافي، الرصد العلمي، والألغاز السريعة.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('discovery')}
                className="px-6 py-2.5 bg-[#2455D6] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-110 shrink-0"
              >
                افتحي قسم «وقت ليا»
              </button>
            </div>
          </div>
        )}

        {currentTab === 'planner' && (
          <div className="animate-fadeIn">
            <WeeklyPlanner
              events={events}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
              wakeHour={wakeHour}
              sleepHour={sleepHour}
              onUpdateWindow={(wake, sleep) => {
                setWakeHour(wake);
                setSleepHour(sleep);
              }}
              dailyTasksTotalMinutes={dailyTasksTotalMinutes}
            />
          </div>
        )}

        {currentTab === 'projects' && (
          <div className="animate-fadeIn">
            <ProjectNotes
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onOpenVoiceModal={openVoiceForCustom}
            />
          </div>
        )}

        {currentTab === 'discovery' && (
          <div className="animate-fadeIn">
            <FreeTimeDiscovery
              onSaveToProjectNotes={(category, title, content) => {
                handleAddNote({
                  category,
                  title,
                  content,
                  nextSteps: 'البدء في الخطوة الأولى للتجربة',
                });
              }}
            />
          </div>
        )}
      </main>

      {/* Footer Editorial Branding */}
      <footer className="mt-16 border-t-4 border-[#182B49] bg-white py-8 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[#182B49]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black font-display text-[#2455D6]">حِتّة منّي</span>
            <span className="text-[#182B49]/40">•</span>
            <span>مساحتي، أفكاري، وبصمتي</span>
          </div>
          <div className="text-[#182B49]/70 text-[11px]">
            تصميم تحريري عربي أصيل • كولاج ورقي • ألوان 1990 المعاصرة • مصر
          </div>
        </div>
      </footer>

      {/* Audio Voice Dictation Modal (gemini-3.5-transcribe) */}
      <AudioVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => {
          setIsVoiceModalOpen(false);
          setVoiceTargetCallback(null);
        }}
        onTranscriptReady={(text) => {
          if (voiceTargetCallback) {
            voiceTargetCallback(text);
          }
        }}
      />

      {/* High Thinking Study Advisor Modal (gemini-4-argon with thinkingLevel: HIGH) */}
      <ThinkingAdvisorModal
        isOpen={isThinkingModalOpen}
        onClose={() => setIsThinkingModalOpen(false)}
        contextSummary={advisorContext}
        onSaveAdviceToNotes={(title, advice) => {
          handleAddNote({
            category: 'ideas',
            title,
            content: advice,
            nextSteps: 'مراجعة الخطة الاستراتيجية المقترحة',
          });
        }}
      />

      {/* Android Native Install Prompt Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Android Mobile Bottom Navigation Bar */}
      <AndroidBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenInstallModal={() => setIsAndroidModalOpen(true)}
      />
    </div>
  );
}
