import React, { useState } from 'react';
import { Plus, Trash2, Mic, CheckCircle2, Bookmark, Lightbulb, Stethoscope, Palette, Code, FolderPlus } from 'lucide-react';
import type { ProjectNoteItem } from '../firebase/db';

interface ProjectNotesProps {
  notes: ProjectNoteItem[];
  onAddNote: (note: {
    category: 'design' | 'coding' | 'medical' | 'ideas' | 'free';
    title: string;
    content: string;
    nextSteps: string;
  }) => void;
  onDeleteNote: (noteId: string) => void;
  onOpenVoiceModal?: (callback: (text: string) => void) => void;
}

export const CATEGORIES_CONFIG = [
  { id: 'medical', label: 'مشروعي الطبي', color: 'bg-[#E8473F] text-white', icon: Stethoscope },
  { id: 'design', label: 'التصميم والتايبوجرافي', color: 'bg-[#F26B38] text-white', icon: Palette },
  { id: 'coding', label: 'البرمجة والتعلّم', color: 'bg-[#2455D6] text-white', icon: Code },
  { id: 'ideas', label: 'أفكار وتجارب', color: 'bg-[#F5C542] text-[#182B49]', icon: Lightbulb },
  { id: 'free', label: 'مساحة حرة', color: 'bg-[#48A868] text-white', icon: Bookmark },
] as const;

export const ProjectNotes: React.FC<ProjectNotesProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onOpenVoiceModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'design' | 'coding' | 'medical' | 'ideas' | 'free'>('medical');
  const [content, setContent] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  const filteredNotes = activeCategory === 'all'
    ? notes
    : notes.filter((n) => n.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddNote({
      category,
      title: title.trim(),
      content: content.trim(),
      nextSteps: nextSteps.trim(),
    });

    setTitle('');
    setContent('');
    setNextSteps('');
    setIsAdding(false);
  };

  const handleVoiceNote = () => {
    if (onOpenVoiceModal) {
      onOpenVoiceModal((text) => {
        setContent((prev) => (prev ? prev + '\n' + text : text));
      });
    }
  };

  return (
    <div className="relative w-full bg-white border-4 border-[#182B49] paper-shadow-lg p-5 sm:p-7 mb-8">
      {/* Tape */}
      <div className="absolute -top-3.5 right-8 w-44 h-7 washi-tape-orange flex items-center justify-center text-xs font-black text-white">
        مشاريعي وأفكاري وبصمتي
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#182B49]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#182B49] font-display">
            دفتر الملاحظات والمشاريع
          </h2>
          <p className="text-xs text-[#182B49]/70 font-semibold">
            مساحة مخصصة لمشروعك الطبي، أفكار التصميم، البرمجة، والخطوات القادمة.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-[#2455D6] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'إغلاق النموذج' : 'كتابة فكرة أو ملاحظة'}
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 text-xs font-black border-2 border-[#182B49] transition-all ${
            activeCategory === 'all'
              ? 'bg-[#182B49] text-white paper-shadow-sm'
              : 'bg-[#FFF4E4] text-[#182B49] hover:bg-white'
          }`}
        >
          كل الأفكار ({notes.length})
        </button>

        {CATEGORIES_CONFIG.map((cat) => {
          const Icon = cat.icon;
          const count = notes.filter((n) => n.category === cat.id).length;
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black border-2 border-[#182B49] transition-all ${
                isSelected
                  ? `${cat.color} paper-shadow-sm`
                  : 'bg-[#FFF4E4] text-[#182B49] hover:bg-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Add Note Card */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-[#FFF4E4] border-3 border-[#182B49] paper-shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#182B49] font-display">
              تدوين فكرة أو ملاحظة جديدة
            </h3>
            {onOpenVoiceModal && (
              <button
                type="button"
                onClick={handleVoiceNote}
                className="flex items-center gap-1.5 px-3 py-1 bg-white text-[#2455D6] text-xs font-bold border border-[#182B49] hover:bg-[#F5C542] transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                إملاء المحتوى بالصوت
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#182B49] mb-1">
                عنوان الفكرة / الملاحظة:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: فكرة تطبيق سريري لتشخيص الحالات، أو دراسة لونية..."
                className="w-full p-2.5 bg-white border-2 border-[#182B49] text-xs font-bold outline-hidden"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182B49] mb-1">
                القسم:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-white border-2 border-[#182B49] text-xs font-bold"
              >
                {CATEGORIES_CONFIG.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182B49] mb-1">
              المحتوى والتفاصيل:
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتبي ما يخطر ببالك، المراجع، الملاحظات الإكلينيكية، أو التجارب..."
              className="w-full p-3 bg-white border-2 border-[#182B49] text-xs font-medium outline-hidden"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182B49] mb-1">
              الخطوات القادمة (Next Steps):
            </label>
            <input
              type="text"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="مثال: مراجعة المقال العلمي غداً، وتجهيز رسم توضيحي..."
              className="w-full p-2 bg-white border-2 border-[#182B49] text-xs font-bold"
              dir="rtl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-bold text-[#182B49]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#48A868] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-105"
            >
              حفظ في الدفتر
            </button>
          </div>
        </form>
      )}

      {/* Notes Masonry / Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-10 bg-[#FFF4E4]/40 border-2 border-dashed border-[#182B49]/30 p-6">
          <p className="text-sm font-bold text-[#182B49]/60">
            لا توجد ملاحظات أو أفكار محفوظة في هذا القسم بعد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const config = CATEGORIES_CONFIG.find((c) => c.id === note.category) || CATEGORIES_CONFIG[3];

            return (
              <div
                key={note.id}
                className="relative bg-[#FFF4E4] border-3 border-[#182B49] paper-shadow-sm p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-black border border-[#182B49] ${config.color}`}>
                      {config.label}
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      aria-label="حذف الملاحظة"
                      className="text-[#182B49]/50 hover:text-[#E8473F] transition-colors p-1"
                      title="حذف الملاحظة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-black text-[#182B49] mb-2 font-display">
                    {note.title}
                  </h3>

                  <p className="text-xs text-[#182B49]/80 font-medium leading-relaxed whitespace-pre-line mb-3">
                    {note.content}
                  </p>
                </div>

                {note.nextSteps && (
                  <div className="mt-3 pt-2 border-t border-[#182B49]/20 bg-white/70 p-2 text-xs font-bold text-[#182B49]">
                    <div className="text-[10px] text-[#2455D6] font-black uppercase mb-0.5">
                      الخطوة القادمة:
                    </div>
                    <div>{note.nextSteps}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
