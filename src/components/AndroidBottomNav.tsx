import React, { useState } from 'react';
import { Flame, Calendar, BookOpen, Compass, Share2, Check } from 'lucide-react';

interface AndroidBottomNavProps {
  currentTab: 'home' | 'planner' | 'projects' | 'discovery';
  onTabChange: (tab: 'home' | 'planner' | 'projects' | 'discovery') => void;
  onOpenInstallModal?: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentTab,
  onTabChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleTabClick = (tab: 'home' | 'planner' | 'projects' | 'discovery') => {
    // Haptic feedback for tactile feel
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onTabChange(tab);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <nav
      aria-label="شريط التنقل السفلي للهاتف"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-[#182B49] paper-shadow-lg px-2 py-1.5 flex items-center justify-around safe-bottom"
    >
      <button
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-none transition-all ${
          currentTab === 'home'
            ? 'text-[#2455D6] font-black scale-105'
            : 'text-[#182B49]/70 font-bold'
        }`}
      >
        <div
          className={`p-1.5 border border-[#182B49] paper-shadow-sm mb-0.5 ${
            currentTab === 'home' ? 'bg-[#2455D6] text-white' : 'bg-[#FFF4E4]'
          }`}
        >
          <Flame className="w-4 h-4" />
        </div>
        <span className="text-[10px]">التركيز</span>
      </button>

      <button
        onClick={() => handleTabClick('planner')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-none transition-all ${
          currentTab === 'planner'
            ? 'text-[#F26B38] font-black scale-105'
            : 'text-[#182B49]/70 font-bold'
        }`}
      >
        <div
          className={`p-1.5 border border-[#182B49] paper-shadow-sm mb-0.5 ${
            currentTab === 'planner' ? 'bg-[#F26B38] text-white' : 'bg-[#FFF4E4]'
          }`}
        >
          <Calendar className="w-4 h-4" />
        </div>
        <span className="text-[10px]">الجدول</span>
      </button>

      <button
        onClick={() => handleTabClick('projects')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-none transition-all ${
          currentTab === 'projects'
            ? 'text-[#48A868] font-black scale-105'
            : 'text-[#182B49]/70 font-bold'
        }`}
      >
        <div
          className={`p-1.5 border border-[#182B49] paper-shadow-sm mb-0.5 ${
            currentTab === 'projects' ? 'bg-[#48A868] text-white' : 'bg-[#FFF4E4]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="text-[10px]">أفكاري</span>
      </button>

      <button
        onClick={() => handleTabClick('discovery')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-none transition-all ${
          currentTab === 'discovery'
            ? 'text-[#182B49] font-black scale-105'
            : 'text-[#182B49]/70 font-bold'
        }`}
      >
        <div
          className={`p-1.5 border border-[#182B49] paper-shadow-sm mb-0.5 ${
            currentTab === 'discovery' ? 'bg-[#F5C542] text-[#182B49]' : 'bg-[#FFF4E4]'
          }`}
        >
          <Compass className="w-4 h-4" />
        </div>
        <span className="text-[10px]">وقت ليا</span>
      </button>

      <button
        onClick={handleShare}
        className="flex flex-col items-center justify-center py-1 px-2 text-[#E8473F] font-black"
        title="مشاركة رابط الموقع"
      >
        <div className={`p-1.5 text-white border border-[#182B49] paper-shadow-sm mb-0.5 ${copied ? 'bg-[#48A868]' : 'bg-[#E8473F]'}`}>
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        </div>
        <span className="text-[10px]">{copied ? 'تم النسخ!' : 'مشاركة'}</span>
      </button>
    </nav>
  );
};
