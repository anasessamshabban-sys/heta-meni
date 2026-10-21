import React from 'react';
import { Smartphone, Download, X, CheckCircle2, Share2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182B49]/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FFF4E4] border-4 border-[#182B49] paper-shadow-lg p-6">
        {/* Top Tape */}
        <div className="absolute -top-3.5 right-1/2 translate-x-1/2 w-44 h-7 washi-tape-orange flex items-center justify-center text-xs font-black text-white">
          تطبيق أندرويد • Android App
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق نافذة التثبيت"
          className="absolute top-4 left-4 p-1.5 bg-[#182B49] text-white hover:bg-[#E8473F] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mt-3 mb-5">
          <div className="w-16 h-16 mx-auto mb-3 bg-[#2455D6] border-3 border-[#182B49] paper-shadow-sm flex items-center justify-center">
            <Smartphone className="w-9 h-9 text-[#F5C542]" />
          </div>
          <h2 className="text-xl font-black text-[#182B49] font-display">
            تثبيت «حِتّة منّي» على أندرويد
          </h2>
          <p className="text-xs text-[#182B49]/70 font-semibold mt-1">
            يعمل كتطبيق كامل ومستقل (PWA) بشاشة كاملة وبدون شريط المتصفح، مع حفظ البيانات محلياً وسحابياً.
          </p>
        </div>

        {isInstalled ? (
          <div className="p-4 bg-[#48A868]/15 border-2 border-[#48A868] text-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#48A868] mx-auto mb-1" />
            <div className="text-sm font-black text-[#48A868]">
              التطبيق مثبت بالفعل على جهازك!
            </div>
            <div className="text-xs text-[#182B49]/80 font-bold mt-1">
              يمكنك تشغيله مباشرة من الشاشة الرئيسية في أي وقت وبدون إنترنت.
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {/* Direct 1-click install button if browser prompted */}
            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-[#48A868] text-white font-black text-sm border-2 border-[#182B49] paper-shadow hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                تثبيت التطبيق على جهازك الآن
              </button>
            ) : null}

            {/* Step-by-step instructions */}
            <div className="bg-white border-2 border-[#182B49] p-4 text-xs font-bold text-[#182B49] space-y-2.5">
              <div className="font-black text-[#2455D6] flex items-center gap-1.5 mb-1 text-sm font-display">
                <Sparkles className="w-4 h-4 text-[#F5C542]" />
                خطوات التثبيت السريعة في متصفح كروم (أندرويد):
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#182B49] text-white flex items-center justify-center text-xs shrink-0 font-bold font-mono">1</span>
                <span>اضغطي على قائمة الخيارات (الثلاث نقاط في أعلى المتصفح).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#2455D6] text-white flex items-center justify-center text-xs shrink-0 font-bold font-mono">2</span>
                <span>اختاري <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«الإضافة إلى الشاشة الرئيسية»</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#F26B38] text-white flex items-center justify-center text-xs shrink-0 font-bold font-mono">3</span>
                <span>ستظهر أيقونة «حِتّة منّي» الأصلية على شاشتك الرئيسية، وتفتح كتطبيق هاتف حقيقي مستقل.</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#182B49]/20">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#182B49] text-white text-xs font-bold hover:bg-[#182B49]/90"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
