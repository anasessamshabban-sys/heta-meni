import React, { useState } from 'react';
import { Sparkles, RefreshCw, BookmarkPlus, Check, ArrowRight, Play, Compass, Lightbulb } from 'lucide-react';
import { DISCOVERY_BANK, DiscoveryItem } from '../data/discoveries';

interface FreeTimeDiscoveryProps {
  onSaveToProjectNotes: (category: 'design' | 'coding' | 'medical' | 'ideas' | 'free', title: string, content: string) => void;
}

export const FreeTimeDiscovery: React.FC<FreeTimeDiscoveryProps> = ({ onSaveToProjectNotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentItem: DiscoveryItem = DISCOVERY_BANK[currentIndex % DISCOVERY_BANK.length];

  const handleNextSuggestion = () => {
    setIsGuideOpen(false);
    setSavedSuccess(false);
    setCurrentIndex((prev) => (prev + 1) % DISCOVERY_BANK.length);
  };

  const handleSaveToProjects = () => {
    // Map discovery field to notes category
    let noteCategory: 'design' | 'coding' | 'medical' | 'ideas' | 'free' = 'ideas';
    if (currentItem.field === 'design') noteCategory = 'design';
    else if (currentItem.field === 'coding') noteCategory = 'coding';
    else if (currentItem.field === 'science') noteCategory = 'medical';

    onSaveToProjectNotes(
      noteCategory,
      `تجربة: ${currentItem.title}`,
      `${currentItem.description}\n\nخطوات التجربة:\n${currentItem.guideSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="relative w-full bg-[#FFF4E4] border-4 border-[#182B49] paper-shadow-lg p-6 sm:p-8 overflow-hidden mb-8">
      {/* Decorative Washi Tape */}
      <div className="absolute -top-3.5 right-10 w-40 h-7 washi-tape-yellow flex items-center justify-center text-xs font-black text-[#182B49]">
        وقت ليا • حِتّة جديدة
      </div>

      {/* Decorative Ripped Edge Background Piece */}
      <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-[#2455D6]/15 rotate-45 -z-1" />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#182B49] text-white text-xs font-black mb-2 paper-shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#F5C542]" />
            <span>مساحة استكشاف واسترخاء خالية من قيود المذاكرة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#182B49] font-display">
            جرّبي فكرة جديدة في وقت فراغك
          </h2>
          <p className="text-xs text-[#182B49]/70 font-semibold mt-1">
            ليس كل وقت الفراغ لإنتاج المزيد من المهام.. هنا تجربة صغيرة وممتعة لتجديد شغفك.
          </p>
        </div>

        {/* The Discovery Card (Styled as a prominent Torn Paper Cutout) */}
        <div className="relative bg-white border-4 border-[#182B49] paper-shadow-lg p-6 sm:p-8">
          {/* Badge & Duration */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`px-3 py-1 text-xs font-black border border-[#182B49] paper-shadow-sm ${currentItem.badgeColor}`}>
              {currentItem.fieldLabel}
            </span>
            <span className="text-xs font-black bg-[#FFF4E4] border border-[#182B49] px-2.5 py-1 text-[#182B49]">
              المدة المقترحة: {currentItem.durationMinutes} دقيقة
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black text-[#182B49] mb-3 font-display">
            {currentItem.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#182B49]/80 font-medium leading-relaxed mb-6">
            {currentItem.description}
          </p>

          {/* Interactive Step-by-step Guide Drawer */}
          {isGuideOpen && (
            <div className="mb-6 p-4 bg-[#FFF4E4] border-2 border-dashed border-[#182B49] text-xs font-bold text-[#182B49] space-y-2">
              <div className="font-black text-[#2455D6] mb-2 flex items-center gap-1.5 text-sm">
                <Lightbulb className="w-4 h-4 text-[#F5C542]" />
                خطوات التجربة الممتعة:
              </div>
              <ol className="list-decimal list-inside space-y-1.5 leading-normal">
                {currentItem.guideSteps.map((step, idx) => (
                  <li key={idx} className="font-semibold">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#182B49]/15">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className="px-5 py-2.5 bg-[#2455D6] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                {isGuideOpen ? 'إخفاء الخطوات' : currentItem.actionText}
              </button>

              <button
                onClick={handleSaveToProjects}
                className="px-4 py-2.5 bg-[#F5C542] text-[#182B49] text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
                title="حفظ الفكرة في مشاريعي وأفكاري"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#48A868]" />
                    تم الحفظ في أفكارك!
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    حفظ في أفكاري
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleNextSuggestion}
              className="px-4 py-2 bg-white text-[#182B49] text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:bg-[#FFF4E4] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              اقتراح تجربة تانية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
