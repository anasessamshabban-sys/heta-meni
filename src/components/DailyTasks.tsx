import React, { useState } from 'react';
import { Plus, Check, Trash2, Star, Clock, Tag, Mic, AlertCircle } from 'lucide-react';
import type { UserTask } from '../firebase/db';

interface DailyTasksProps {
  tasks: UserTask[];
  onAddTask: (task: { title: string; subject: string; estimatedMinutes: number; isPriority: boolean }) => void;
  onToggleTask: (taskId: string, currentCompleted: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenVoiceModal?: () => void;
}

export const DailyTasks: React.FC<DailyTasksProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onOpenVoiceModal,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [isPriority, setIsPriority] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const subjects = ['مشروعي الطبي', 'التصميم', 'البرمجة والتعلّم', 'مذاكرة ومراجعة', 'عام'];
  const durations = [15, 25, 45, 60];

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Single main priority of the day
  const priorityTask = tasks.find((t) => t.isPriority && !t.completed) || tasks.find((t) => t.isPriority);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      subject: subject || 'عام',
      estimatedMinutes,
      isPriority,
    });

    setTitle('');
    setIsPriority(false);
  };

  return (
    <div className="relative w-full bg-white border-4 border-[#182B49] paper-shadow-lg p-5 sm:p-7 mb-8">
      {/* Tape on top right */}
      <div className="absolute -top-3.5 right-8 w-36 h-7 washi-tape-yellow flex items-center justify-center text-xs font-black text-[#182B49]">
        مهام وبصمات اليوم
      </div>

      {/* Header and Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-[#182B49]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#182B49] font-display">
            قائمة إنجازات اليوم
          </h2>
          <p className="text-xs text-[#182B49]/70 font-semibold">
            أضيفي مهامك بسرعة، حددي الأولوية الأساسية، وعلّمي على ما تم إنجازه.
          </p>
        </div>

        {/* Completion Progress Badge */}
        <div className="flex items-center gap-3 bg-[#FFF4E4] border-2 border-[#182B49] px-4 py-2 paper-shadow-sm">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase text-[#2455D6]">
              نسبة إنجاز اليوم
            </div>
            <div className="text-xs font-extrabold text-[#182B49]">
              {completedCount} من {totalCount} مهام ({progressPercent}%)
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#182B49] bg-white flex items-center justify-center font-mono font-black text-xs text-[#2455D6]">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Main Priority of the Day Spotlight Box (if any priority task exists) */}
      {priorityTask && (
        <div className="mb-6 p-4 bg-[#F5C542]/20 border-3 border-[#182B49] paper-shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#F5C542] text-[#182B49] border-2 border-[#182B49]">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-black text-[#E8473F] uppercase tracking-wide">
                الأولوية الأولى لليوم:
              </span>
              <div
                className={`text-sm sm:text-base font-black ${
                  priorityTask.completed ? 'line-through text-[#182B49]/50' : 'text-[#182B49]'
                }`}
              >
                {priorityTask.title}
              </div>
              <div className="text-[11px] text-[#182B49]/70 font-bold mt-0.5">
                تصنيف: {priorityTask.subject} • تقدير الوقت: {priorityTask.estimatedMinutes} دقيقة
              </div>
            </div>
          </div>
          <button
            onClick={() => onToggleTask(priorityTask.id, priorityTask.completed)}
            className={`px-3 py-1.5 text-xs font-black border-2 border-[#182B49] paper-shadow-sm transition-all ${
              priorityTask.completed ? 'bg-[#48A868] text-white' : 'bg-white text-[#182B49] hover:bg-[#48A868] hover:text-white'
            }`}
          >
            {priorityTask.completed ? 'تمت بنجاح' : 'تعليم كمكتملة'}
          </button>
        </div>
      )}

      {/* Fast Task Input Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-[#FFF4E4] border-3 border-[#182B49] p-4 paper-shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="اكتبي مهمة جديدة هنا (مثلاً: تلخيص فصل المناعة)..."
            className="flex-1 bg-white border-2 border-[#182B49] p-3 text-sm font-semibold outline-hidden focus:ring-2 focus:ring-[#2455D6]"
            dir="rtl"
          />

          {/* Voice Input Button */}
          {onOpenVoiceModal && (
            <button
              type="button"
              onClick={onOpenVoiceModal}
              title="إملاء المهمة بصوتك"
              className="p-3 bg-white text-[#182B49] border-2 border-[#182B49] hover:bg-[#F5C542] paper-shadow-sm transition-all"
            >
              <Mic className="w-5 h-5 text-[#2455D6]" />
            </button>
          )}

          <button
            type="submit"
            className="px-5 py-3 bg-[#2455D6] text-white text-sm font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة</span>
          </button>
        </div>

        {/* Quick Options: Subject, Estimated Duration, Priority */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold pt-2 border-t border-[#182B49]/15">
          {/* Subjects Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#182B49]/70 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              المجال:
            </span>
            {subjects.map((sub) => (
              <button
                type="button"
                key={sub}
                onClick={() => setSubject(sub === subject ? '' : sub)}
                className={`px-2.5 py-1 border transition-all ${
                  subject === sub
                    ? 'bg-[#182B49] text-white border-[#182B49]'
                    : 'bg-white text-[#182B49] border-[#182B49]/40 hover:border-[#182B49]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Durations & Priority */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#182B49]/70" />
              {durations.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setEstimatedMinutes(d)}
                  className={`px-2 py-0.5 border text-[11px] ${
                    estimatedMinutes === d
                      ? 'bg-[#F26B38] text-white border-[#182B49]'
                      : 'bg-white text-[#182B49] border-[#182B49]/40'
                  }`}
                >
                  {d}د
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPriority(!isPriority)}
              className={`flex items-center gap-1 px-2.5 py-1 border-2 border-[#182B49] text-xs font-black transition-all ${
                isPriority ? 'bg-[#F5C542] text-[#182B49]' : 'bg-white text-[#182B49]/70'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isPriority ? 'fill-current' : ''}`} />
              أولوية رئيسية
            </button>
          </div>
        </div>
      </form>

      {/* Task Checklist Items */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 bg-[#FFF4E4]/40 border-2 border-dashed border-[#182B49]/30 p-6">
            <p className="text-sm font-bold text-[#182B49]/60">
              لا توجد مهام مضافة بعد.. ابدئي بإضافة أول مهمة لليوم!
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-3.5 border-2 border-[#182B49] paper-shadow-sm transition-all ${
                task.completed
                  ? 'bg-black/5 opacity-60'
                  : task.isPriority
                  ? 'bg-[#FFF4E4] border-r-8 border-r-[#F5C542]'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Custom Checkbox button */}
                <button
                  onClick={() => onToggleTask(task.id, task.completed)}
                  aria-label={task.completed ? 'إلغاء إكمال المهمة' : 'إكمال المهمة'}
                  className={`w-6 h-6 border-2 border-[#182B49] flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-[#48A868] text-white'
                      : 'bg-white hover:bg-[#48A868]/20'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-black truncate ${
                        task.completed ? 'line-through text-[#182B49]/50' : 'text-[#182B49]'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.isPriority && (
                      <span className="text-[10px] font-black bg-[#F5C542] text-[#182B49] px-2 py-0.5 border border-[#182B49]">
                        أولوية اليوم
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-[#182B49]/60 mt-1">
                    {task.subject && (
                      <span className="bg-[#182B49]/10 px-2 py-0.5 text-[#182B49]">
                        {task.subject}
                      </span>
                    )}
                    <span>{task.estimatedMinutes} دقيقة</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDeleteTask(task.id)}
                  aria-label={`حذف المهمة ${task.title}`}
                  className="p-1.5 text-[#182B49]/60 hover:text-[#E8473F] transition-colors"
                  title="حذف المهمة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
