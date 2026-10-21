import React, { useState } from 'react';
import { Sparkles, Brain, X, Loader2, Send, BookmarkPlus, Check } from 'lucide-react';

interface ThinkingAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextSummary?: string;
  onSaveAdviceToNotes?: (title: string, advice: string) => void;
}

export const ThinkingAdvisorModal: React.FC<ThinkingAdvisorModalProps> = ({
  isOpen,
  onClose,
  contextSummary = '',
  onSaveAdviceToNotes,
}) => {
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const quickPrompts = [
    'عندي ضغط كبير بين المحاضرات الطبية والمذاكرة.. كيف أقسم طاقتي بدون احتراق؟',
    'ساعدني أرتب الساعات الفاضية المتبقية النهارده بأعلى تركيز وأقل إجهاد.',
    'عندي فكرة تصميم وبرمجة عايزة أبدأ فيها من غير ما أعطل دراستي الأساسية.',
  ];

  const handleAsk = async (textToAsk = query) => {
    if (!textToAsk.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/study-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToAsk,
          contextSummary,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'تعذر استدعاء مستشار التفكير');
      }

      const data = await res.json();
      setAdvice(data.advice || '');
    } catch (err: unknown) {
      console.error('Advisor error:', err);
      const msg = err instanceof Error ? err.message : 'حدث خطأ في معالجة طلب الاستشارة الذكية';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToNotes = () => {
    if (onSaveAdviceToNotes && advice) {
      const title = query.slice(0, 45) + (query.length > 45 ? '...' : '');
      onSaveAdviceToNotes(`استشارة تفكير: ${title}`, advice);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182B49]/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#FFF4E4] border-4 border-[#182B49] paper-shadow-lg p-6 max-h-[90vh] flex flex-col">
        {/* Top Decorative Tape */}
        <div className="absolute -top-3.5 right-10 w-44 h-7 washi-tape-blue flex items-center justify-center text-xs font-black text-white tracking-wide">
          تفكير عالي المستوى
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق مستشار التخطيط"
          className="absolute top-4 left-4 p-1.5 bg-[#182B49] text-white hover:bg-[#E8473F] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3 border-b-2 border-[#182B49] pb-3">
          <div className="p-2.5 bg-[#2455D6] text-white border-2 border-[#182B49] paper-shadow-sm">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#182B49] font-display">
              مستشار التخطيط والتفكير الاستراتيجي
            </h2>
            <p className="text-xs text-[#182B49]/70 font-semibold">
              تحليل استراتيجي معمّق للجداول المعقدة وتخفيف الضغط بنموذج <bdi dir="ltr" className="font-mono font-bold text-[#2455D6]">gemini-4-argon</bdi>
            </p>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p);
                handleAsk(p);
              }}
              className="text-right text-[11px] bg-white border border-[#182B49] px-2.5 py-1.5 font-bold text-[#182B49] hover:bg-[#F5C542] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAsk();
            }}
            placeholder="اكتبي معضلتك الدراسية أو ما يشغل تفكيرك في جدولك..."
            className="flex-1 bg-white border-2 border-[#182B49] p-3 text-sm font-semibold outline-hidden focus:ring-2 focus:ring-[#2455D6]"
            dir="rtl"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !query.trim()}
            className="px-5 py-3 bg-[#E8473F] text-white font-black text-sm border-2 border-[#182B49] paper-shadow-sm disabled:opacity-50 hover:brightness-110 flex items-center gap-1.5"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            حلّل وفكّر
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mb-3 bg-[#E8473F]/15 border-2 border-[#E8473F] text-xs font-bold text-[#E8473F]">
            {errorMessage}
          </div>
        )}

        {/* Advice Content Area */}
        <div className="flex-1 overflow-y-auto bg-white border-2 border-[#182B49] p-4 text-sm leading-relaxed text-[#182B49] whitespace-pre-line font-medium min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-10 gap-3 text-center">
              <Sparkles className="w-8 h-8 text-[#2455D6] animate-pulse" />
              <div className="font-black text-sm text-[#182B49]">
                جاري التفكير المعمّق في الخطة وتفكيك الأولويات...
              </div>
              <p className="text-xs text-[#182B49]/60 max-w-sm">
                النموذج يوازن بين ساعات طاقتك، التزاماتك الإلزامية، وفترات الراحة النفسية.
              </p>
            </div>
          ) : advice ? (
            <div className="space-y-2">
              <div className="inline-block px-2 py-0.5 bg-[#48A868] text-white text-[11px] font-black mb-2">
                الرؤية الاستراتيجية المقترحة
              </div>
              <div>{advice}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 text-[#182B49]/50">
              <Brain className="w-12 h-12 mb-2 text-[#182B49]/30" />
              <p className="text-sm font-bold">
                اطرحي سؤالاً أو اختاري من الاقتراحات أعلاه لتحليل جدولك بعمق.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {advice && (
          <div className="mt-4 flex items-center justify-between border-t border-[#182B49]/20 pt-3">
            <span className="text-[11px] text-[#182B49]/70 font-semibold">
              مبني بنموذج الذكاء التفكيري (gemini-4-argon)
            </span>
            <div className="flex gap-2">
              {onSaveAdviceToNotes && (
                <button
                  onClick={handleSaveToNotes}
                  className="px-4 py-2 bg-[#F5C542] text-[#182B49] text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-105 flex items-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-[#48A868]" />
                      تم الحفظ في أفكاري!
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      حفظ الخطة في «أفكاري»
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#182B49] text-white text-xs font-bold hover:bg-[#182B49]/90"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
