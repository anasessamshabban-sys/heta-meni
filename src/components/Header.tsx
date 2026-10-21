import React, { useState, useEffect } from 'react';
import { User, LogIn, LogOut, Clock, Calendar, RefreshCw, Mic, Brain, CloudCheck, CloudOff, Smartphone, Share2 } from 'lucide-react';
import { ROTATING_MOTIVATIONS } from '../data/discoveries';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentTab: 'home' | 'planner' | 'projects' | 'discovery';
  onTabChange: (tab: 'home' | 'planner' | 'projects' | 'discovery') => void;
  onOpenVoiceModal: () => void;
  onOpenThinkingModal: () => void;
  onOpenInstallModal?: () => void;
  isCloudSynced: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenVoiceModal,
  onOpenThinkingModal,
  onOpenInstallModal,
  isCloudSynced,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [motivationIndex, setMotivationIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Track live clock and Arabic date reliably without glyph issues
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const h12 = h % 12 || 12;
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'م' : 'ص';
      setCurrentTime(`${h12}:${m}:${s} ${ampm}`);

      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDate(`${dayName}، ${dayNum} ${monthName} ${year}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const cycleMotivation = () => {
    setMotivationIndex((prev) => (prev + 1) % ROTATING_MOTIVATIONS.length);
  };

  // Egyptian greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الفل والنشاط!' : hour < 17 ? 'نهارك سعيد وبصمتك حاضرة!' : 'مساء الورد والهدوء!';

  return (
    <header className="relative w-full mb-8 pt-2">
      {/* Top Bar: Auth, Time, Date */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3 border-b-2 border-[#182B49]/20">
        {/* Right (RTL start): Live Clock & Date */}
        <div className="flex items-center gap-4 text-xs font-bold text-[#182B49]">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-[#182B49] paper-shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#2455D6]" />
            <span className="font-mono text-sm font-black">{currentTime || '--:--'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white px-3 py-1.5 border border-[#182B49] paper-shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-[#F26B38]" />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Left (RTL end): Actions, Cloud Sync & User Profile */}
        <div className="flex items-center gap-2">
          {/* Audio recording button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2455D6] text-white text-xs font-bold border-2 border-[#182B49] paper-shadow-sm hover:brightness-110 active:translate-y-0.5 transition-all"
            title="تسجيل صوتي وتفريغ ذكي"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تسجيل صوتي</span>
          </button>

          {/* High Thinking Advisor button */}
          <button
            onClick={onOpenThinkingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5C542] text-[#182B49] text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-105 active:translate-y-0.5 transition-all"
            title="مستشار التفكير المعمق"
          >
            <Brain className="w-3.5 h-3.5 text-[#182B49]" />
            <span className="hidden sm:inline">مستشار التخطيط</span>
          </button>

          {/* Share & Publish Web Link Button */}
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(url);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8473F] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-110 active:translate-y-0.5 transition-all"
            title="نسخ رابط الموقع المباشر للنشر والمشاركة"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'تم نسخ الرابط!' : 'مشاركة الرابط'}</span>
          </button>

          {/* Cloud Sync Status */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-black border border-[#182B49] ${
              isCloudSynced ? 'bg-[#48A868]/15 text-[#48A868]' : 'bg-[#F26B38]/15 text-[#F26B38]'
            }`}
            title={isCloudSynced ? 'متصل بقاعدة فايربيس السحابية' : 'جاري الحفظ المحلي'}
          >
            {isCloudSynced ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#48A868] animate-pulse" />
                <span className="hidden sm:inline">سحابي متصل</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#F26B38]" />
                <span className="hidden sm:inline">غير متصل</span>
              </>
            )}
          </div>

          {/* User Sign-In */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-white px-2 py-1 border border-[#182B49] paper-shadow-sm">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-[#182B49]"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#2455D6] text-white flex items-center justify-center text-xs font-black">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <span className="text-xs font-bold text-[#182B49] hidden md:inline max-w-[100px] truncate">
                {currentUser.displayName || 'أهلاً بكِ'}
              </span>
              <button
                onClick={handleSignOut}
                aria-label="تسجيل الخروج"
                className="p-1 text-[#182B49] hover:text-[#E8473F]"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#48A868] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-110 active:translate-y-0.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isSigningIn ? 'جاري الاتصال...' : 'تسجيل الدخول لجوجل'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Brand Hero Collage Section */}
      <div className="relative bg-white border-4 border-[#182B49] paper-shadow-lg p-6 md:p-8 my-5">
        {/* Layered Background Decorative Color Paper Blocks */}
        <div className="absolute top-0 right-0 w-28 h-12 bg-[#2455D6] -rotate-2 -translate-y-2 translate-x-2 -z-1 opacity-90" />
        <div className="absolute bottom-0 left-0 w-32 h-14 bg-[#F5C542] rotate-3 translate-y-2 -translate-x-2 -z-1 opacity-80" />

        {/* Vintage Postal Stamp inside Hero Banner */}
        <div className="hidden sm:flex absolute -top-3.5 left-10 -rotate-3 bg-[#E8473F] text-white px-3 py-1 border-2 border-[#182B49] paper-shadow-sm items-center gap-1 text-[11px] font-black z-10">
          <span>مكتبة الجمهورية • مصر ١٩٩٤</span>
        </div>

        {/* Paper Tape Accents */}
        <div className="absolute -top-3.5 right-10 w-28 h-7 washi-tape-yellow flex items-center justify-center text-[11px] font-black text-[#182B49] z-10">
          النسخة الأصلية
        </div>
        <div className="absolute -bottom-3 left-16 w-36 h-6 washi-tape-orange z-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Main Title & Editorial Headline */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#182B49] text-white text-xs font-black mb-3 paper-shadow-sm">
              <span>{greeting}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#182B49] font-display">
                حِتّة منّي
              </h1>
              <span className="text-sm sm:text-base font-extrabold text-[#2455D6] bg-[#2455D6]/10 px-3 py-1 border-b-4 border-[#2455D6]">
                مساحتي، أفكاري، وبصمتي
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#182B49]/80 max-w-xl font-medium leading-relaxed">
              دفتر دراسي وتنظيمي شخصي بتصميم الكولاج الورقي وطاقة المطبوعات المصرية المعاصرة؛ يجمع بين جلسات التركيز، تخطيط الأسبوع، وحساب الوقت الفاضي الحقيقي.
            </p>
          </div>

          {/* Gentle Rotating Motivation Box */}
          <div className="w-full md:w-80 bg-[#FFF4E4] border-2 border-[#182B49] p-3 paper-shadow-sm relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black text-[#E8473F] flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-[#E8473F] rounded-full" />
                كلمة رقيقة في وقتها:
              </span>
              <button
                onClick={cycleMotivation}
                aria-label="تغيير رسالة التشجيع"
                className="text-[#182B49] hover:text-[#2455D6] p-1 transition-transform active:rotate-180"
                title="رسالة تانية"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-bold text-[#182B49] leading-normal font-display">
              "{ROTATING_MOTIVATIONS[motivationIndex]}"
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs (Horizontal scroll on mobile, wrap on tablet/desktop) */}
      <nav aria-label="أقسام الدفتر" className="flex flex-nowrap overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap gap-2 sm:gap-3 border-b-4 border-[#182B49]">
        <button
          onClick={() => onTabChange('home')}
          className={`whitespace-nowrap shrink-0 px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm border-t-2 border-r-2 border-l-2 border-[#182B49] transition-all relative ${
            currentTab === 'home'
              ? 'bg-[#2455D6] text-white -mb-1 pb-3.5 paper-shadow-sm z-10'
              : 'bg-white text-[#182B49] hover:bg-[#F5C542]/40'
          }`}
        >
          محطة التركيز واليوم
        </button>

        <button
          onClick={() => onTabChange('planner')}
          className={`whitespace-nowrap shrink-0 px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm border-t-2 border-r-2 border-l-2 border-[#182B49] transition-all relative ${
            currentTab === 'planner'
              ? 'bg-[#F26B38] text-white -mb-1 pb-3.5 paper-shadow-sm z-10'
              : 'bg-white text-[#182B49] hover:bg-[#F5C542]/40'
          }`}
        >
          الجدول الأسبوعي والوقت الفاضي
        </button>

        <button
          onClick={() => onTabChange('projects')}
          className={`whitespace-nowrap shrink-0 px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm border-t-2 border-r-2 border-l-2 border-[#182B49] transition-all relative ${
            currentTab === 'projects'
              ? 'bg-[#48A868] text-white -mb-1 pb-3.5 paper-shadow-sm z-10'
              : 'bg-white text-[#182B49] hover:bg-[#F5C542]/40'
          }`}
        >
          مشاريعي وأفكاري (الطب، التصميم، البرمجة)
        </button>

        <button
          onClick={() => onTabChange('discovery')}
          className={`whitespace-nowrap shrink-0 px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm border-t-2 border-r-2 border-l-2 border-[#182B49] transition-all relative ${
            currentTab === 'discovery'
              ? 'bg-[#F5C542] text-[#182B49] -mb-1 pb-3.5 paper-shadow-sm z-10'
              : 'bg-white text-[#182B49] hover:bg-[#F5C542]/40'
          }`}
        >
          وقت ليا • حِتّة جديدة
        </button>
      </nav>
    </header>
  );
};
