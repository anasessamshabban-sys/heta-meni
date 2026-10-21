import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import type { ScheduledEventItem } from '../utils/timeCalculator';

export interface UserTask {
  id: string;
  userId: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  completed: boolean;
  isPriority: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  wakeHour: number;
  sleepHour: number;
  focusDuration: number;
  breakDuration: number;
}

export interface ProjectNoteItem {
  id: string;
  userId: string;
  category: 'design' | 'coding' | 'medical' | 'ideas' | 'free';
  title: string;
  content: string;
  nextSteps: string;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSessionRecord {
  id: string;
  userId: string;
  durationMinutes: number;
  taskTitle: string;
  type: 'focus' | 'break';
  completedAt: string;
}

// Subscribe to tasks
export function subscribeUserTasks(
  userId: string,
  onUpdate: (tasks: UserTask[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: UserTask[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          userId: data.userId || userId,
          title: data.title || '',
          subject: data.subject || '',
          estimatedMinutes: data.estimatedMinutes || 25,
          completed: !!data.completed,
          isPriority: !!data.isPriority,
          createdAt: data.createdAt || new Date().toISOString(),
          completedAt: data.completedAt,
        });
      });
      onUpdate(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, `users/${userId}/tasks`);
    }
  );
}

// Add task
export async function addUserTask(
  userId: string,
  task: Omit<UserTask, 'id' | 'userId' | 'createdAt' | 'completed'>
): Promise<string> {
  const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  const now = new Date().toISOString();

  try {
    await setDoc(taskRef, {
      id: taskId,
      userId,
      title: task.title,
      subject: task.subject || '',
      estimatedMinutes: Number(task.estimatedMinutes) || 25,
      completed: false,
      isPriority: !!task.isPriority,
      createdAt: now,
    });
    return taskId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/tasks/${taskId}`);
  }
}

// Toggle task completed
export async function toggleUserTask(userId: string, taskId: string, completed: boolean): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  try {
    await updateDoc(taskRef, {
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/tasks/${taskId}`);
  }
}

// Delete task
export async function deleteUserTask(userId: string, taskId: string): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  try {
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/tasks/${taskId}`);
  }
}

// Subscribe to weekly schedule events
export function subscribeUserEvents(
  userId: string,
  onUpdate: (events: ScheduledEventItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const eventsRef = collection(db, 'users', userId, 'events');
  const q = query(eventsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ScheduledEventItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || '',
          dayOfWeek: Number(data.dayOfWeek) ?? 0,
          startTime: data.startTime || '09:00',
          durationMinutes: Number(data.durationMinutes) || 60,
          subject: data.subject || '',
          isFixed: data.isFixed !== false,
        });
      });
      onUpdate(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, `users/${userId}/events`);
    }
  );
}

// Add event
export async function addUserEvent(
  userId: string,
  event: Omit<ScheduledEventItem, 'id'>
): Promise<string> {
  const eventId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const eventRef = doc(db, 'users', userId, 'events', eventId);

  try {
    await setDoc(eventRef, {
      id: eventId,
      userId,
      title: event.title,
      dayOfWeek: Number(event.dayOfWeek),
      startTime: event.startTime,
      durationMinutes: Number(event.durationMinutes),
      subject: event.subject || '',
      isFixed: !!event.isFixed,
      createdAt: new Date().toISOString(),
    });
    return eventId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/events/${eventId}`);
  }
}

// Delete event
export async function deleteUserEvent(userId: string, eventId: string): Promise<void> {
  const eventRef = doc(db, 'users', userId, 'events', eventId);
  try {
    await deleteDoc(eventRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/events/${eventId}`);
  }
}

// Subscribe to project notes
export function subscribeUserNotes(
  userId: string,
  onUpdate: (notes: ProjectNoteItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const notesRef = collection(db, 'users', userId, 'notes');
  const q = query(notesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ProjectNoteItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          userId,
          category: data.category || 'ideas',
          title: data.title || '',
          content: data.content || '',
          nextSteps: data.nextSteps || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      onUpdate(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, `users/${userId}/notes`);
    }
  );
}

// Add note
export async function addUserNote(
  userId: string,
  note: Omit<ProjectNoteItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const noteId = 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const now = new Date().toISOString();

  try {
    await setDoc(noteRef, {
      id: noteId,
      userId,
      category: note.category,
      title: note.title,
      content: note.content,
      nextSteps: note.nextSteps || '',
      createdAt: now,
      updatedAt: now,
    });
    return noteId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/notes/${noteId}`);
  }
}

// Delete note
export async function deleteUserNote(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  try {
    await deleteDoc(noteRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/notes/${noteId}`);
  }
}

// Log focus session
export async function logFocusSession(
  userId: string,
  session: Omit<FocusSessionRecord, 'id' | 'userId' | 'completedAt'>
): Promise<void> {
  const sessId = 'sess_' + Date.now();
  const sessRef = doc(db, 'users', userId, 'sessions', sessId);
  try {
    await setDoc(sessRef, {
      id: sessId,
      userId,
      durationMinutes: session.durationMinutes,
      taskTitle: session.taskTitle || '',
      type: session.type,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/sessions/${sessId}`);
  }
}

// Seed default starter data for new users
export async function seedStarterDataIfEmpty(
  userId: string,
  currentTasksCount: number,
  currentEventsCount: number
): Promise<void> {
  if (currentTasksCount === 0) {
    const starterTasks = [
      {
        title: 'مراجعة تشريح الجهاز العصبي الطرفي (Cranial Nerves)',
        subject: 'مشروعي الطبي',
        estimatedMinutes: 45,
        isPriority: true,
      },
      {
        title: 'تصميم الغلاف التحريري لدفتر الملاحظات الورقي',
        subject: 'التصميم',
        estimatedMinutes: 30,
        isPriority: false,
      },
      {
        title: 'تطبيق تجربة تفريغ الصوت وتحليل الخطة الدراسية',
        subject: 'البرمجة والتعلّم',
        estimatedMinutes: 25,
        isPriority: false,
      },
    ];

    for (const t of starterTasks) {
      await addUserTask(userId, t);
    }
  }

  if (currentEventsCount === 0) {
    const starterEvents: Omit<ScheduledEventItem, 'id'>[] = [
      {
        title: 'محاضرة باثولوجي وفيزيولوجي',
        dayOfWeek: 0, // Sunday
        startTime: '09:00',
        durationMinutes: 120,
        subject: 'طب وبحث',
        isFixed: true,
      },
      {
        title: 'مذاكرة مركزة: مراجعة ملخص الأسبوع',
        dayOfWeek: 0,
        startTime: '16:00',
        durationMinutes: 90,
        subject: 'دراسة مرنة',
        isFixed: false,
      },
      {
        title: 'ورشة التايبوجرافي العربي المعاصر',
        dayOfWeek: 2, // Tuesday
        startTime: '17:00',
        durationMinutes: 90,
        subject: 'تصميم',
        isFixed: true,
      },
      {
        title: 'سكشن تحليلي ومختبر التجارب',
        dayOfWeek: 3, // Wednesday
        startTime: '11:00',
        durationMinutes: 120,
        subject: 'بحث علمي',
        isFixed: true,
      },
    ];

    for (const ev of starterEvents) {
      await addUserEvent(userId, ev);
    }
  }
}
